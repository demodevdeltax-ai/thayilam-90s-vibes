import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Plus, Search, Trash2, Pencil, Power, X, Image as ImageIcon } from "lucide-react";
import { z } from "zod";
import { PageHeader, VendorCard, rupee } from "@/components/vendor/ui";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  CATEGORIES,
  DIETS,
  WEIGHTS,
  type Category,
  type Diet,
  type Weight,
  type Product,
} from "@/lib/products";
import { ACTIVE_VENDOR } from "@/lib/vendor-data";
import {
  addVendorProduct,
  deleteVendorProduct,
  setStockEnabled,
  toggleStockEnabled,
  useStock,
  useVendorProducts,
} from "@/lib/vendor-store";

export const Route = createFileRoute("/vendor/products")({
  head: () => ({ meta: [{ title: "My Products — Vendor Panel" }] }),
  component: ProductsPage,
});

function ProductsPage() {
  const products = useVendorProducts(ACTIVE_VENDOR);
  const stock = useStock();
  const [q, setQ] = useState("");
  const [selected, setSelected] = useState<Set<string>>(new Set());
  const [openForm, setOpenForm] = useState(false);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    if (!s) return products;
    return products.filter(
      (p) =>
        p.name.toLowerCase().includes(s) ||
        p.telugu.includes(s) ||
        p.category.toLowerCase().includes(s),
    );
  }, [products, q]);

  const allChecked = filtered.length > 0 && filtered.every((p) => selected.has(p.id));
  const toggleAll = () => {
    setSelected((prev) => {
      const next = new Set(prev);
      if (allChecked) filtered.forEach((p) => next.delete(p.id));
      else filtered.forEach((p) => next.add(p.id));
      return next;
    });
  };
  const toggleOne = (id: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      next.has(id) ? next.delete(id) : next.add(id);
      return next;
    });

  const bulkSet = (enabled: boolean) => {
    selected.forEach((id) => setStockEnabled(id, enabled));
    setSelected(new Set());
  };
  const bulkDelete = () => {
    if (!confirm(`Delete ${selected.size} product(s)? This cannot be undone.`)) return;
    selected.forEach(deleteVendorProduct);
    setSelected(new Set());
  };

  return (
    <>
      <PageHeader
        title="My products"
        subtitle={`${products.length} items in your shop`}
        actions={
          <Button
            onClick={() => setOpenForm(true)}
            className="rounded-full bg-[#C4541A] hover:bg-[#a8470e] text-white"
          >
            <Plus size={15} className="mr-1.5" /> Add new product
          </Button>
        }
      />

      <VendorCard padding={false}>
        {/* toolbar */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 p-4 border-b border-[#E8E6DF]">
          <div className="relative w-full md:w-80">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9789]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name, category…"
              className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-[#E8E6DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B7C4A]/30 focus:border-[#6B7C4A]"
            />
          </div>
          {selected.size > 0 ? (
            <div className="flex items-center gap-2 flex-wrap">
              <span className="text-xs text-[#7a766c]">{selected.size} selected</span>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => bulkSet(true)}>
                Enable
              </Button>
              <Button size="sm" variant="outline" className="rounded-full" onClick={() => bulkSet(false)}>
                Disable
              </Button>
              <Button
                size="sm"
                variant="outline"
                className="rounded-full text-[#8C2A2A] border-[#E2C5C5] hover:bg-[#FBEFEF]"
                onClick={bulkDelete}
              >
                <Trash2 size={13} className="mr-1" /> Delete
              </Button>
            </div>
          ) : (
            <span className="text-xs text-[#9b9789]">Tip: select rows for bulk actions</span>
          )}
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[#9b9789] border-b border-[#E8E6DF]">
                <th className="px-5 py-3 w-10">
                  <Checkbox checked={allChecked} onCheckedChange={toggleAll} />
                </th>
                <th className="font-medium px-3 py-3">Product</th>
                <th className="font-medium px-3 py-3">Category</th>
                <th className="font-medium px-3 py-3">Price</th>
                <th className="font-medium px-3 py-3">In stock</th>
                <th className="font-medium px-3 py-3">Sales</th>
                <th className="font-medium px-3 py-3 text-right pr-5">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((p) => {
                const s = stock[p.id];
                const checked = selected.has(p.id);
                return (
                  <tr
                    key={p.id}
                    className={`border-b border-[#F1EFE7] last:border-0 hover:bg-[#FAFAF7] ${checked ? "bg-[#FAF7EE]" : ""}`}
                  >
                    <td className="px-5 py-3">
                      <Checkbox checked={checked} onCheckedChange={() => toggleOne(p.id)} />
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-3">
                        <div className="h-12 w-12 rounded-lg bg-[#FAF7EE] grid place-items-center overflow-hidden border border-[#E8E6DF] shrink-0">
                          <img src={p.img} alt="" className="w-full h-full object-contain p-1.5" />
                        </div>
                        <div className="min-w-0">
                          <div className="font-medium text-[#1f1d1a] truncate">{p.name}</div>
                          <div className="text-[11px] text-[#9b9789] truncate">{p.telugu} · {p.weight}</div>
                        </div>
                      </div>
                    </td>
                    <td className="px-3 py-3">
                      <span className="inline-flex items-center px-2 h-6 rounded-md bg-[#EAF2DB] text-[#4F5F33] text-[11px] font-medium">
                        {p.category}
                      </span>
                    </td>
                    <td className="px-3 py-3 font-medium">
                      {rupee(p.price)}
                      {p.mrp && (
                        <span className="text-[11px] text-[#9b9789] line-through ml-1.5">{rupee(p.mrp)}</span>
                      )}
                    </td>
                    <td className="px-3 py-3">
                      <div className="flex items-center gap-2">
                        <Switch checked={s?.enabled ?? false} onCheckedChange={() => toggleStockEnabled(p.id)} />
                        <span className={`text-xs ${s?.enabled ? "text-[#206B44]" : "text-[#9b9789]"}`}>
                          {s?.enabled ? `${s.qty} left` : "Disabled"}
                        </span>
                      </div>
                    </td>
                    <td className="px-3 py-3 text-[#4a463e]">{s?.sales ?? 0}</td>
                    <td className="px-3 py-3 text-right pr-5">
                      <div className="inline-flex items-center gap-1">
                        <button
                          className="h-8 w-8 rounded-md hover:bg-[#F1EFE7] text-[#4a463e] grid place-items-center"
                          aria-label="Edit"
                          onClick={() => setOpenForm(true)}
                        >
                          <Pencil size={14} />
                        </button>
                        <button
                          className="h-8 w-8 rounded-md hover:bg-[#FBEFEF] text-[#8C2A2A] grid place-items-center"
                          aria-label="Delete"
                          onClick={() => {
                            if (confirm(`Delete ${p.name}?`)) deleteVendorProduct(p.id);
                          }}
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-[#9b9789]">
                    <Power size={20} className="mx-auto mb-2" />
                    No products match "{q}".
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </VendorCard>

      <AddProductDialog open={openForm} onClose={() => setOpenForm(false)} />
    </>
  );
}

/* --------------------------- Add product dialog --------------------------- */

const productSchema = z.object({
  name: z.string().trim().min(2, "Name is too short").max(80),
  telugu: z.string().trim().max(80).optional().or(z.literal("")),
  description: z.string().trim().max(800).optional().or(z.literal("")),
  category: z.enum(CATEGORIES as [Category, ...Category[]]),
  ingredients: z.string().trim().max(400).optional().or(z.literal("")),
  stock: z.coerce.number().int().min(0).max(9999),
});

type Variant = { weight: Weight; price: string };

function AddProductDialog({ open, onClose }: { open: boolean; onClose: () => void }) {
  const [form, setForm] = useState({
    name: "",
    telugu: "",
    description: "",
    category: "Murukku" as Category,
    ingredients: "",
    stock: "20",
    noPreservatives: true,
  });
  const [diets, setDiets] = useState<Diet[]>(["Vegan"]);
  const [variants, setVariants] = useState<Variant[]>([{ weight: "250g", price: "" }]);
  const [photos, setPhotos] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const addVariant = () =>
    setVariants((v) => [...v, { weight: WEIGHTS[Math.min(v.length, WEIGHTS.length - 1)], price: "" }]);
  const removeVariant = (i: number) => setVariants((v) => v.filter((_, idx) => idx !== i));

  const onPhotos = (files: FileList | null) => {
    if (!files) return;
    const remaining = 5 - photos.length;
    const next: string[] = [];
    Array.from(files).slice(0, remaining).forEach((f) => {
      next.push(URL.createObjectURL(f));
    });
    setPhotos((p) => [...p, ...next]);
  };

  const submit = () => {
    const parsed = productSchema.safeParse(form);
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[i.path[0] as string] = i.message;
      setErrors(errs);
      return;
    }
    const firstVariant = variants.find((v) => v.price !== "");
    if (!firstVariant) {
      setErrors({ variants: "Add at least one weight & price" });
      return;
    }
    const id = "v" + Date.now().toString(36);
    const product: Product = {
      id,
      name: parsed.data.name,
      telugu: parsed.data.telugu || parsed.data.name,
      category: parsed.data.category,
      vendor: ACTIVE_VENDOR,
      weight: firstVariant.weight,
      price: Number(firstVariant.price),
      diet: diets,
      popularity: 50,
      createdAt: new Date().toISOString().slice(0, 10),
      img: photos[0] || "/placeholder.svg",
    };
    addVendorProduct(product, { enabled: true, qty: parsed.data.stock, sales: 0 });
    onClose();
    // reset
    setForm({ name: "", telugu: "", description: "", category: "Murukku", ingredients: "", stock: "20", noPreservatives: true });
    setDiets(["Vegan"]);
    setVariants([{ weight: "250g", price: "" }]);
    setPhotos([]);
    setErrors({});
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-white">
        <DialogHeader>
          <DialogTitle className="text-[#1f1d1a]">Add a new product</DialogTitle>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-4 mt-2">
          <Field label="Product name (English)" error={errors.name}>
            <input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              maxLength={80}
              placeholder="Family Pack Murukku"
              className="vinp"
            />
          </Field>
          <Field label="Product name (Telugu)">
            <input
              value={form.telugu}
              onChange={(e) => setForm({ ...form, telugu: e.target.value })}
              maxLength={80}
              placeholder="ఫ్యామిలీ ముఱుక్కు"
              className="vinp"
            />
          </Field>

          <Field label="Category" error={errors.category} className="md:col-span-1">
            <Select
              value={form.category}
              onValueChange={(v) => setForm({ ...form, category: v as Category })}
            >
              <SelectTrigger className="h-10 bg-white border-[#E8E6DF]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {CATEGORIES.map((c) => (
                  <SelectItem key={c} value={c}>{c}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </Field>

          <Field label="Stock quantity" error={errors.stock}>
            <input
              value={form.stock}
              onChange={(e) => setForm({ ...form, stock: e.target.value.replace(/\D/g, "") })}
              inputMode="numeric"
              className="vinp"
            />
          </Field>

          <Field label="Description" className="md:col-span-2">
            <textarea
              value={form.description}
              onChange={(e) => setForm({ ...form, description: e.target.value })}
              rows={3}
              maxLength={800}
              placeholder="Slow-roasted, hand-shaped, finished with a pinch of cardamom…"
              className="vinp"
            />
          </Field>

          <Field label="Ingredients" className="md:col-span-2">
            <input
              value={form.ingredients}
              onChange={(e) => setForm({ ...form, ingredients: e.target.value })}
              maxLength={400}
              placeholder="Rice flour, urad dal, A2 ghee, cardamom, hing, sea salt"
              className="vinp"
            />
          </Field>

          {/* Variants */}
          <Field label="Price per weight variants" error={errors.variants} className="md:col-span-2">
            <div className="space-y-2">
              {variants.map((v, i) => (
                <div key={i} className="flex items-center gap-2">
                  <Select
                    value={v.weight}
                    onValueChange={(val) => {
                      const next = [...variants];
                      next[i] = { ...next[i], weight: val as Weight };
                      setVariants(next);
                    }}
                  >
                    <SelectTrigger className="h-10 w-32 bg-white border-[#E8E6DF]">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {WEIGHTS.map((w) => (
                        <SelectItem key={w} value={w}>{w}</SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <div className="relative flex-1">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9789] text-sm">₹</span>
                    <input
                      value={v.price}
                      onChange={(e) => {
                        const next = [...variants];
                        next[i] = { ...next[i], price: e.target.value.replace(/\D/g, "").slice(0, 6) };
                        setVariants(next);
                      }}
                      inputMode="numeric"
                      placeholder="Price"
                      className="vinp pl-7"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={() => removeVariant(i)}
                    disabled={variants.length === 1}
                    className="h-9 w-9 rounded-md text-[#8C2A2A] hover:bg-[#FBEFEF] grid place-items-center disabled:opacity-30 disabled:hover:bg-transparent"
                    aria-label="Remove variant"
                  >
                    <X size={15} />
                  </button>
                </div>
              ))}
              <button
                type="button"
                onClick={addVariant}
                className="text-xs uppercase tracking-wider text-[#C4541A] hover:underline inline-flex items-center gap-1 mt-1"
              >
                <Plus size={13} /> Add variant
              </button>
            </div>
          </Field>

          {/* Photos */}
          <Field label={`Photos (up to 5) — ${photos.length}/5`} className="md:col-span-2">
            <div className="grid grid-cols-5 gap-2">
              {photos.map((src, i) => (
                <div key={i} className="relative aspect-square rounded-lg overflow-hidden border border-[#E8E6DF] bg-[#FAF7EE]">
                  <img src={src} alt="" className="w-full h-full object-cover" />
                  <button
                    onClick={() => setPhotos((p) => p.filter((_, idx) => idx !== i))}
                    className="absolute top-1 right-1 h-6 w-6 rounded-full bg-white/90 grid place-items-center text-[#8C2A2A] hover:bg-white"
                    aria-label="Remove"
                  >
                    <X size={12} />
                  </button>
                </div>
              ))}
              {photos.length < 5 && (
                <label className="aspect-square rounded-lg border-2 border-dashed border-[#E8E6DF] hover:border-[#6B7C4A] cursor-pointer grid place-items-center text-[#9b9789] hover:text-[#6B7C4A] transition-colors">
                  <input
                    type="file"
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={(e) => onPhotos(e.target.files)}
                  />
                  <ImageIcon size={18} />
                </label>
              )}
            </div>
          </Field>

          {/* Diet tags */}
          <Field label="Dietary tags" className="md:col-span-1">
            <div className="flex flex-wrap gap-2">
              {DIETS.map((d) => {
                const on = diets.includes(d);
                return (
                  <button
                    key={d}
                    type="button"
                    onClick={() => setDiets((p) => (on ? p.filter((x) => x !== d) : [...p, d]))}
                    className={`h-8 px-3 rounded-full text-xs border transition-colors ${
                      on
                        ? "bg-[#6B7C4A] text-white border-[#6B7C4A]"
                        : "bg-white text-[#4a463e] border-[#E8E6DF] hover:border-[#6B7C4A]"
                    }`}
                  >
                    {d}
                  </button>
                );
              })}
            </div>
          </Field>

          <Field label="Quality">
            <div className="flex items-center justify-between bg-[#FAF7EE] rounded-lg px-3 h-10">
              <span className="text-sm text-[#1f1d1a]">No preservatives</span>
              <Switch
                checked={form.noPreservatives}
                onCheckedChange={(v) => setForm({ ...form, noPreservatives: v })}
              />
            </div>
          </Field>
        </div>

        <DialogFooter className="mt-4">
          <Button variant="outline" onClick={onClose} className="rounded-full">Cancel</Button>
          <Button onClick={submit} className="rounded-full bg-[#C4541A] hover:bg-[#a8470e] text-white">
            Save product
          </Button>
        </DialogFooter>

        <style>{`
          .vinp {
            width: 100%;
            background: #fff;
            border: 1px solid #E8E6DF;
            border-radius: 0.5rem;
            padding: 0.5rem 0.75rem;
            font-size: 0.875rem;
            color: #1f1d1a;
            outline: none;
          }
          .vinp:focus { border-color: #6B7C4A; box-shadow: 0 0 0 3px rgba(107,124,74,0.18); }
          .vinp::placeholder { color: #b6b2a6; }
        `}</style>
      </DialogContent>
    </Dialog>
  );
}

function Field({
  label,
  error,
  children,
  className = "",
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[11px] uppercase tracking-wider text-[#7a766c] mb-1.5">{label}</span>
      {children}
      {error && <span className="block text-xs text-[#8C2A2A] mt-1">{error}</span>}
    </label>
  );
}
