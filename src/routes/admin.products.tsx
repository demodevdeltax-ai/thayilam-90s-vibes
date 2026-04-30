import { Helmet } from "react-helmet-async";
import { useMemo, useState, useRef } from "react";
import {
  Search, CheckCircle2, X, Star, Flag, Trash2, Pencil,
  Download, Upload, Plus, Eye, EyeOff,
} from "lucide-react";
import {
  AdminPageHeader, AdminCard, AdminBadge, TableShell, Th, Td, rupee,
} from "@/components/admin/ui";
import {
  useAllProducts, toggleFeatured, toggleFlag, deleteProduct, upsertProduct,
} from "@/lib/products-store";
import { useAdminCategories } from "@/lib/categories-store";
import { PackSizesPill, SkuPill } from "@/components/admin/pack-breakdown";
import { PackSizeEditor } from "@/components/admin/pack-size-editor";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import type { AdminProduct } from "@/lib/admin-data";

// ── CSV columns (must match DB schema) ───────────────────────────────────────
const CSV_COLUMNS = [
  "name", "name_telugu", "slug", "sku", "description",
  "category_id", "category_name", "price", "mrp", "badge",
  "image_url", "highlights", "diet", "pack_sizes",
  "default_weight", "popularity", "is_active",
];

function RouteHead() {
  return (
    <Helmet>
      <title>{"Products — Super Admin"}</title>
    </Helmet>
  );
}

export default ProductsPage;

// ── Main page ─────────────────────────────────────────────────────────────────
function ProductsPage() {
  const products = useAllProducts();
  const categories = useAdminCategories();
  const { toast } = useToast();

  const [q, setQ] = useState("");
  const [cat, setCat] = useState<string>("All");
  const [filter, setFilter] = useState<"All" | "Active" | "Inactive" | "Featured" | "Flagged">("All");
  const [packEditing, setPackEditing] = useState<AdminProduct | null>(null);
  const [addOpen, setAddOpen] = useState(false);
  const [editProduct, setEditProduct] = useState<AdminProduct | null>(null);

  const csvImportRef = useRef<HTMLInputElement>(null);

  const filtered = useMemo(() => {
    return products.filter((p) => {
      if (cat !== "All" && p.category_name !== cat) return false;
      if (q) {
        const lq = q.toLowerCase();
        if (
          !p.name.toLowerCase().includes(lq) &&
          !p.sku.toLowerCase().includes(lq) &&
          !(p.category_name ?? "").toLowerCase().includes(lq)
        ) return false;
      }
      if (filter === "Active" && !p.is_active) return false;
      if (filter === "Inactive" && p.is_active) return false;
      return true;
    });
  }, [products, q, cat, filter]);

  // ── Export CSV ──────────────────────────────────────────────────────────────
  function handleExport() {
    const rows =
      filtered.length > 0
        ? filtered.map((p) => [
            p.name,
            p.name_telugu ?? "",
            p.slug,
            p.sku,
            p.description,
            p.category_id ?? "",
            p.category_name ?? "",
            p.price,
            p.mrp ?? "",
            p.badge ?? "",
            p.image_url ?? "",
            (p.highlights ?? []).join("|"),
            (p.diet ?? []).join("|"),
            (p.pack_sizes ?? []).join("|"),
            p.default_weight,
            p.popularity,
            p.is_active ? "true" : "false",
          ])
        : [];

    const csvContent = [CSV_COLUMNS, ...rows]
      .map((row) =>
        row.map((cell) => `"${String(cell).replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `products-export-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: filtered.length > 0 ? `Exported ${filtered.length} products` : "Exported empty template" });
  }

  // ── Import CSV ──────────────────────────────────────────────────────────────
  function handleImportFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = async (ev) => {
      const text = ev.target?.result as string;
      const lines = text.trim().split("\n");
      if (lines.length < 2) {
        toast({ title: "CSV is empty", variant: "destructive" });
        return;
      }
      const headers = lines[0].split(",").map((h) => h.replace(/"/g, "").trim());
      let imported = 0;
      let failed = 0;
      for (let i = 1; i < lines.length; i++) {
        const values = parseCSVLine(lines[i]);
        const row: Record<string, string> = {};
        headers.forEach((h, idx) => { row[h] = values[idx] ?? ""; });

        if (!row.name?.trim() || !row.sku?.trim()) { failed++; continue; }

        try {
          await upsertProduct({
            name: row.name.trim(),
            name_telugu: row.name_telugu?.trim() || null,
            slug: row.slug?.trim() || row.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
            sku: row.sku.trim(),
            description: row.description ?? "",
            category_id: row.category_id?.trim() || null,
            category_name: row.category_name?.trim() || null,
            price: parseFloat(row.price) || 0,
            mrp: row.mrp ? parseFloat(row.mrp) : null,
            badge: row.badge?.trim() || null,
            image_url: row.image_url?.trim() || null,
            highlights: row.highlights ? row.highlights.split("|").filter(Boolean) : [],
            diet: row.diet ? row.diet.split("|").filter(Boolean) : [],
            pack_sizes: row.pack_sizes ? row.pack_sizes.split("|").map(Number).filter(Boolean) : [100, 250, 500],
            default_weight: row.default_weight?.trim() || "250g",
            popularity: parseInt(row.popularity) || 50,
            is_active: row.is_active !== "false",
          });
          imported++;
        } catch {
          failed++;
        }
      }
      toast({
        title: `Import complete: ${imported} added${failed > 0 ? `, ${failed} failed` : ""}`,
        variant: failed > 0 ? "destructive" : "default",
      });
    };
    reader.readAsText(file);
    e.target.value = "";
  }

  return (
    <>
      <RouteHead />
      <>
        <AdminPageHeader
          title="Products catalog"
          subtitle="Add products manually or via CSV, manage visibility, feature and flag listings."
          actions={
            <div className="flex items-center gap-2">
              <input
                ref={csvImportRef}
                type="file"
                accept=".csv"
                className="hidden"
                onChange={handleImportFile}
              />
              <button
                onClick={() => csvImportRef.current?.click()}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-slate-200 hover:bg-slate-50 text-sm text-slate-700 font-medium"
              >
                <Upload size={14} /> Import CSV
              </button>
              <button
                onClick={handleExport}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md border border-slate-200 hover:bg-slate-50 text-sm text-slate-700 font-medium"
              >
                <Download size={14} /> Export CSV
              </button>
              <button
                onClick={() => { setEditProduct(null); setAddOpen(true); }}
                className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-[#C4541A] hover:bg-[#a8470e] text-white text-sm font-medium"
              >
                <Plus size={14} /> Add product
              </button>
            </div>
          }
        />

        <AdminCard padding={false}>
          {/* Filters */}
          <div className="p-4 border-b border-slate-100 flex flex-col gap-3">
            <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center justify-between">
              <div className="relative max-w-xs w-full">
                <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  value={q}
                  onChange={(e) => setQ(e.target.value)}
                  placeholder="Search name, SKU, category…"
                  className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-slate-400 focus:outline-none"
                />
              </div>
              <select
                value={cat}
                onChange={(e) => setCat(e.target.value)}
                className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white text-slate-700 focus:outline-none focus:border-slate-400"
              >
                <option value="All">All categories</option>
                {categories.map((c) => (
                  <option key={c.id} value={c.name}>{c.name}</option>
                ))}
              </select>
            </div>
            <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md w-fit">
              {(["All", "Active", "Inactive", "Featured", "Flagged"] as const).map((f) => (
                <button
                  key={f}
                  onClick={() => setFilter(f)}
                  className={`text-xs px-3 h-7 rounded whitespace-nowrap ${filter === f ? "bg-white text-slate-900 font-medium shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
                >
                  {f}
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <TableShell>
            <thead>
              <tr>
                <Th>Product</Th>
                <Th>SKU</Th>
                <Th>Category</Th>
                <Th>Pack sizes</Th>
                <Th className="text-right">Price</Th>
                <Th className="text-center">Visible</Th>
                <Th className="text-right">Actions</Th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => (
                <tr key={p.id} className="hover:bg-slate-50">
                  <Td>
                    <div className="flex items-center gap-3">
                      {p.image_url
                        ? <img src={p.image_url} alt={p.name} className="h-9 w-9 object-contain bg-slate-50 rounded" />
                        : <div className="h-9 w-9 rounded bg-slate-100 grid place-items-center text-slate-400 text-xs">IMG</div>
                      }
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900 truncate">{p.name}</div>
                        {p.name_telugu && (
                          <div className="text-[11px] text-slate-400">{p.name_telugu}</div>
                        )}
                        <div className="text-[11px] text-slate-500">{p.default_weight}</div>
                      </div>
                    </div>
                  </Td>
                  <Td><SkuPill sku={p.sku} /></Td>
                  <Td className="text-slate-600 text-sm">{p.category_name ?? "—"}</Td>
                  <Td><PackSizesPill sizes={p.pack_sizes} /></Td>
                  <Td className="text-right tabular-nums font-medium text-sm">
                    {rupee(p.price)}
                    {p.mrp && p.mrp > p.price && (
                      <div className="text-[11px] text-slate-400 line-through">{rupee(p.mrp)}</div>
                    )}
                  </Td>
                  <Td className="text-center">
                    <Switch
                      checked={p.is_active}
                      onCheckedChange={() => toggleProduct(p.id, p.is_active)}
                    />
                  </Td>
                  <Td className="text-right">
                    <div className="inline-flex items-center gap-1">
                      <button
                        onClick={() => toggleFeatured(p.id)}
                        className={`h-7 w-7 grid place-items-center rounded-md hover:bg-amber-50 ${p.is_featured ? "text-amber-500" : "text-slate-300"}`}
                        title={p.is_featured ? "Unfeature" : "Feature"}
                      >
                        <Star size={14} fill={p.is_featured ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => toggleFlag(p.id)}
                        className={`h-7 w-7 grid place-items-center rounded-md hover:bg-rose-50 ${p.is_flagged ? "text-rose-500" : "text-slate-300"}`}
                        title={p.is_flagged ? "Unflag" : "Flag"}
                      >
                        <Flag size={14} fill={p.is_flagged ? "currentColor" : "none"} />
                      </button>
                      <button
                        onClick={() => { setEditProduct(p); setAddOpen(true); }}
                        className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-500"
                        title="Edit"
                      >
                        <Pencil size={13} />
                      </button>
                      <button
                        onClick={() => {
                          if (confirm(`Remove "${p.name}"?`)) void deleteProduct(p.id);
                        }}
                        className="h-7 w-7 grid place-items-center rounded-md hover:bg-rose-50 text-rose-500"
                        title="Delete"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  </Td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <Td colSpan={7} className="text-center text-slate-400 py-12">
                    No products match your filters.
                  </Td>
                </tr>
              )}
            </tbody>
          </TableShell>
        </AdminCard>

        {/* Manual add/edit dialog */}
        <ProductDialog
          open={addOpen}
          onOpenChange={setAddOpen}
          editing={editProduct}
          categories={categories}
        />

        <PackSizeEditor
          product={packEditing}
          open={packEditing !== null}
          onClose={() => setPackEditing(null)}
        />
      </>
    </>
  );
}

// ── Toggle helper (calls store) ───────────────────────────────────────────────
async function toggleProduct(id: string, currentActive: boolean) {
  const { supabase } = await import("@/integrations/supabase/client");
  await supabase.from("products").update({ is_active: !currentActive }).eq("id", id);
  const { loadProducts } = await import("@/lib/products-store");
  await loadProducts(true);
}

// ── Add / Edit product dialog ─────────────────────────────────────────────────
type ProductForm = {
  name: string;
  name_telugu: string;
  slug: string;
  sku: string;
  description: string;
  category_id: string;
  category_name: string;
  price: string;
  mrp: string;
  badge: string;
  image_url: string;
  highlights: string;   // pipe-separated
  diet: string;         // pipe-separated
  pack_sizes: string;   // pipe-separated numbers
  default_weight: string;
  popularity: string;
  is_active: boolean;
};

const BLANK_FORM: ProductForm = {
  name: "", name_telugu: "", slug: "", sku: "", description: "",
  category_id: "", category_name: "", price: "", mrp: "", badge: "",
  image_url: "", highlights: "", diet: "",
  pack_sizes: "100|250|500", default_weight: "250g",
  popularity: "50", is_active: true,
};

function ProductDialog({
  open, onOpenChange, editing, categories,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: AdminProduct | null;
  categories: { id: string; name: string }[];
}) {
  const { toast } = useToast();
  const [saving, setSaving] = useState(false);

  const toForm = (p: AdminProduct): ProductForm => ({
    name: p.name,
    name_telugu: p.name_telugu ?? "",
    slug: p.slug,
    sku: p.sku,
    description: p.description ?? "",
    category_id: p.category_id ?? "",
    category_name: p.category_name ?? "",
    price: String(p.price),
    mrp: String(p.mrp ?? ""),
    badge: p.badge ?? "",
    image_url: p.image_url ?? "",
    highlights: (p.highlights ?? []).join("|"),
    diet: (p.diet ?? []).join("|"),
    pack_sizes: (p.pack_sizes ?? [100, 250, 500]).join("|"),
    default_weight: p.default_weight ?? "250g",
    popularity: String(p.popularity ?? 50),
    is_active: p.is_active,
  });

  const key = editing?.id ?? "new";
  const [stateKey, setStateKey] = useState(key);
  const [form, setForm] = useState<ProductForm>(editing ? toForm(editing) : { ...BLANK_FORM });
  if (stateKey !== key) {
    setStateKey(key);
    setForm(editing ? toForm(editing) : { ...BLANK_FORM });
  }

  const set = (patch: Partial<ProductForm>) => setForm((f) => ({ ...f, ...patch }));

  async function submit() {
    if (!form.name.trim() || !form.sku.trim() || !form.price) {
      toast({ title: "Name, SKU and Price are required", variant: "destructive" });
      return;
    }
    setSaving(true);
    try {
      await upsertProduct({
        id: editing?.id,
        name: form.name.trim(),
        name_telugu: form.name_telugu.trim() || null,
        slug: form.slug.trim() || form.name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-"),
        sku: form.sku.trim(),
        description: form.description.trim(),
        category_id: form.category_id || null,
        category_name: form.category_name || null,
        price: parseFloat(form.price),
        mrp: form.mrp ? parseFloat(form.mrp) : null,
        badge: form.badge.trim() || null,
        image_url: form.image_url.trim() || null,
        highlights: form.highlights.split("|").map((s) => s.trim()).filter(Boolean),
        diet: form.diet.split("|").map((s) => s.trim()).filter(Boolean),
        pack_sizes: form.pack_sizes.split("|").map(Number).filter(Boolean),
        default_weight: form.default_weight.trim() || "250g",
        popularity: parseInt(form.popularity) || 50,
        is_active: form.is_active,
      });
      toast({ title: editing ? "Product updated" : "Product created" });
      onOpenChange(false);
    } catch (err: unknown) {
      toast({ title: "Save failed", description: String(err), variant: "destructive" });
    } finally {
      setSaving(false);
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit product" : "Add product"}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-2 gap-3 py-1">
          {/* Row 1 */}
          <div>
            <Label className="text-xs">Name (English) *</Label>
            <Input
              value={form.name}
              onChange={(e) => {
                const name = e.target.value;
                const slug = name.trim().toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
                set({ name, ...(editing ? {} : { slug }) });
              }}
              placeholder="Murukku"
            />
          </div>
          <div>
            <Label className="text-xs">Name (Telugu)</Label>
            <Input value={form.name_telugu} onChange={(e) => set({ name_telugu: e.target.value })} placeholder="మురుకులు" />
          </div>

          {/* Row 2 */}
          <div>
            <Label className="text-xs">Slug</Label>
            <Input value={form.slug} onChange={(e) => set({ slug: e.target.value })} placeholder="murukku" />
          </div>
          <div>
            <Label className="text-xs">SKU *</Label>
            <Input value={form.sku} onChange={(e) => set({ sku: e.target.value })} placeholder="THY-MRK-001" />
          </div>

          {/* Row 3 */}
          <div>
            <Label className="text-xs">Price (₹) *</Label>
            <Input type="number" value={form.price} onChange={(e) => set({ price: e.target.value })} placeholder="149" />
          </div>
          <div>
            <Label className="text-xs">MRP (₹)</Label>
            <Input type="number" value={form.mrp} onChange={(e) => set({ mrp: e.target.value })} placeholder="199" />
          </div>

          {/* Row 4 */}
          <div>
            <Label className="text-xs">Category</Label>
            <Select
              value={form.category_id || "__none"}
              onValueChange={(v) => {
                if (v === "__none") { set({ category_id: "", category_name: "" }); return; }
                const cat = categories.find((c) => c.id === v);
                set({ category_id: v, category_name: cat?.name ?? "" });
              }}
            >
              <SelectTrigger><SelectValue placeholder="Select category" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">— None —</SelectItem>
                {categories.map((c) => (
                  <SelectItem key={c.id} value={c.id}>{c.name}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Badge</Label>
            <Input value={form.badge} onChange={(e) => set({ badge: e.target.value })} placeholder="New · Bestseller · etc." />
          </div>

          {/* Row 5 */}
          <div className="col-span-2">
            <Label className="text-xs">Image URL</Label>
            <Input value={form.image_url} onChange={(e) => set({ image_url: e.target.value })} placeholder="https://…" />
          </div>

          {/* Row 6 */}
          <div className="col-span-2">
            <Label className="text-xs">Description</Label>
            <Textarea
              value={form.description}
              onChange={(e) => set({ description: e.target.value })}
              rows={3}
              placeholder="Short product description…"
            />
          </div>

          {/* Row 7 */}
          <div>
            <Label className="text-xs">Highlights (pipe-separated)</Label>
            <Input value={form.highlights} onChange={(e) => set({ highlights: e.target.value })} placeholder="Crispy|Fresh|No preservatives" />
          </div>
          <div>
            <Label className="text-xs">Diet tags (pipe-separated)</Label>
            <Input value={form.diet} onChange={(e) => set({ diet: e.target.value })} placeholder="Vegan|Gluten-free" />
          </div>

          {/* Row 8 */}
          <div>
            <Label className="text-xs">Pack sizes in g (pipe-separated)</Label>
            <Input value={form.pack_sizes} onChange={(e) => set({ pack_sizes: e.target.value })} placeholder="100|250|500" />
          </div>
          <div>
            <Label className="text-xs">Default weight</Label>
            <Input value={form.default_weight} onChange={(e) => set({ default_weight: e.target.value })} placeholder="250g" />
          </div>

          {/* Row 9 */}
          <div>
            <Label className="text-xs">Popularity (0–100)</Label>
            <Input type="number" min={0} max={100} value={form.popularity} onChange={(e) => set({ popularity: e.target.value })} />
          </div>
          <div className="flex items-center gap-2 pt-5">
            <Switch checked={form.is_active} onCheckedChange={(v) => set({ is_active: v })} />
            <span className="text-sm text-slate-700">Visible on storefront</span>
          </div>
        </div>

        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="h-9 px-3 rounded-md text-sm text-slate-600 hover:bg-slate-100">
            Cancel
          </button>
          <button
            onClick={submit}
            disabled={saving}
            className="h-9 px-3 rounded-md bg-[#C4541A] hover:bg-[#a8470e] text-white text-sm font-medium disabled:opacity-50"
          >
            {saving ? "Saving…" : editing ? "Save changes" : "Create product"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ── CSV line parser (handles quoted fields) ───────────────────────────────────
function parseCSVLine(line: string): string[] {
  const result: string[] = [];
  let current = "";
  let inQuotes = false;
  for (let i = 0; i < line.length; i++) {
    const ch = line[i];
    if (ch === '"') {
      if (inQuotes && line[i + 1] === '"') { current += '"'; i++; }
      else { inQuotes = !inQuotes; }
    } else if (ch === "," && !inQuotes) {
      result.push(current);
      current = "";
    } else {
      current += ch;
    }
  }
  result.push(current);
  return result;
}
