import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Plus, Pencil, Trash2, GripVertical } from "lucide-react";
import { AdminPageHeader, AdminCard, AdminBadge } from "@/components/admin/ui";
import {
  useAdminCategories, toggleCategory, reorderCategories,
  upsertCategory, deleteCategory,
} from "@/lib/categories-store";
import type { AdminCategory } from "@/lib/admin-data";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";

// AdminCategory type lives in src/lib/admin-data.ts and matches DB columns exactly.

function RouteHead() {
  return (
    <Helmet>
      <title>{"Categories — Super Admin"}</title>
    </Helmet>
  );
}

export default CategoriesPage;

function CategoriesPage() {
  const cats = useAdminCategories();
  const [editing, setEditing] = useState<AdminCategory | null>(null);
  const [open, setOpen] = useState(false);
  const [dragId, setDragId] = useState<string | null>(null);

  const sorted = [...cats].sort((a, b) => a.sort_order - b.sort_order);

  function onDrop(targetId: string) {
    if (!dragId || dragId === targetId) return;
    const ids = sorted.map((c) => c.id);
    const from = ids.indexOf(dragId);
    const to = ids.indexOf(targetId);
    ids.splice(to, 0, ids.splice(from, 1)[0]);
    reorderCategories(ids);
    setDragId(null);
  }

  return (
    <>
      <RouteHead />
      <>
        <AdminPageHeader
          title="Categories"
          subtitle="The taxonomy customers shop by. Drag to reorder, nest as subcategories, toggle visibility."
          actions={
            <button
              onClick={() => { setEditing(null); setOpen(true); }}
              className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-[#C4541A] hover:bg-[#a8470e] text-white text-sm font-medium"
            >
              <Plus size={14} /> New category
            </button>
          }
        />

        <AdminCard padding={false}>
          <div className="grid grid-cols-[36px_1.4fr_1fr_1fr_90px_72px_92px] text-[11px] uppercase tracking-[0.12em] text-slate-500 font-medium px-3 py-2.5 border-b border-slate-200 bg-slate-50">
            <div></div>
            <div>Category</div>
            <div>Telugu</div>
            <div>Slug · parent</div>
            <div className="text-right">Products</div>
            <div className="text-center">Visible</div>
            <div className="text-right">Actions</div>
          </div>
          <ul>
            {sorted.map((c) => {
              const parent = c.parent_id ? cats.find((x) => x.id === c.parent_id) : null;
              // Prefer icon_url (SVG) over emoji icon; fallback to placeholder
              const iconDisplay = c.icon_url
                ? <img src={c.icon_url} alt="" className="h-5 w-5 object-contain" />
                : <span className="text-base">{c.icon ?? "📦"}</span>;

              return (
                <li
                  key={c.id}
                  draggable
                  onDragStart={() => setDragId(c.id)}
                  onDragOver={(e) => e.preventDefault()}
                  onDrop={() => onDrop(c.id)}
                  className={`grid grid-cols-[36px_1.4fr_1fr_1fr_90px_72px_92px] items-center px-3 py-2.5 border-b border-slate-100 hover:bg-slate-50 ${dragId === c.id ? "opacity-40" : ""}`}
                >
                  <div className="text-slate-400 cursor-grab active:cursor-grabbing">
                    <GripVertical size={15} />
                  </div>
                  <div className="flex items-center gap-2.5 min-w-0">
                    <div className="h-8 w-8 rounded-md bg-amber-50 border border-amber-100 grid place-items-center flex-shrink-0">
                      {iconDisplay}
                    </div>
                    <div className="min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate flex items-center gap-1.5">
                        {parent && <span className="text-slate-400 text-xs">↳</span>}
                        {c.name}
                      </div>
                    </div>
                  </div>
                  <div className="text-sm text-slate-700 truncate">{c.name_telugu}</div>
                  <div className="text-xs text-slate-500 min-w-0">
                    <div className="font-mono truncate">/{c.slug}</div>
                    {parent && <div className="text-[11px] text-slate-400">parent: {parent.name}</div>}
                  </div>
                  <div className="text-right tabular-nums text-sm text-slate-700">{c.productCount ?? 0}</div>
                  <div className="grid place-items-center">
                    <Switch checked={c.is_visible} onCheckedChange={() => toggleCategory(c.id)} />
                  </div>
                  <div className="flex items-center justify-end gap-0.5">
                    <AdminBadge status={c.is_visible ? "Active" : "Suspended"} />
                    <button
                      onClick={() => { setEditing(c); setOpen(true); }}
                      className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-500" title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={() => { if (confirm(`Delete "${c.name}"? Subcategories will move to root.`)) deleteCategory(c.id); }}
                      className="h-7 w-7 grid place-items-center rounded-md hover:bg-rose-50 text-rose-500" title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        </AdminCard>

        <CategoryDialog
          open={open}
          onOpenChange={setOpen}
          editing={editing}
          allCategories={cats}
        />
      </>
    </>
  );
}

function CategoryDialog({
  open, onOpenChange, editing, allCategories,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: AdminCategory | null;
  allCategories: AdminCategory[];
}) {
  const blank = {
    name: "",
    name_telugu: "",
    slug: "",
    icon: "🥨",
    icon_url: null as string | null,
    parent_id: null as string | null,
    is_visible: true,
  };

  const [form, setForm] = useState(editing ? { ...editing } : { ...blank });
  const key = editing?.id ?? "new";
  const [stateKey, setStateKey] = useState(key);
  if (stateKey !== key) {
    setStateKey(key);
    setForm(editing ? { ...editing } : { ...blank });
  }

  function submit() {
    if (!form.name.trim() || !form.slug.trim()) return;
    upsertCategory({
      id: editing?.id,
      name: form.name.trim(),
      name_telugu: form.name_telugu?.trim() || null,
      slug: form.slug.trim().toLowerCase().replace(/\s+/g, "-"),
      icon: form.icon || null,
      icon_url: form.icon_url || null,
      parent_id: form.parent_id,
      is_visible: form.is_visible,
    });
    onOpenChange(false);
  }

  // Only top-level categories as parent options (no deeper than 1 level); exclude self
  const parentOptions = allCategories.filter(
    (c) => c.parent_id === null && c.id !== editing?.id
  );

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit category" : "New category"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Name (English)</Label>
            <Input
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="Murukku"
            />
          </div>
          <div>
            <Label className="text-xs">Name (Telugu)</Label>
            <Input
              value={form.name_telugu ?? ""}
              onChange={(e) => setForm({ ...form, name_telugu: e.target.value })}
              placeholder="మురుకులు"
            />
          </div>
          <div>
            <Label className="text-xs">Icon (emoji or upload)</Label>
            <div className="flex gap-2">
              <Input
                value={form.icon ?? ""}
                onChange={(e) => setForm({ ...form, icon: e.target.value })}
                className="w-16 text-center text-lg"
                maxLength={2}
              />
              <button
                type="button"
                className="flex-1 h-9 rounded-md border border-dashed border-slate-300 text-xs text-slate-500 hover:bg-slate-50"
                onClick={() => alert("Single-stroke SVG upload — coming soon")}
              >
                Upload SVG
              </button>
            </div>
          </div>
          <div>
            <Label className="text-xs">Slug</Label>
            <Input
              value={form.slug}
              onChange={(e) => setForm({ ...form, slug: e.target.value })}
              placeholder="murukku"
            />
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Parent category</Label>
            <Select
              value={form.parent_id ?? "__none"}
              onValueChange={(v) => setForm({ ...form, parent_id: v === "__none" ? null : v })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__none">— Top-level —</SelectItem>
                {parentOptions.map((p) => (
                  <SelectItem key={p.id} value={p.id}>
                    {p.icon ?? "📦"} {p.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <Switch
              checked={form.is_visible}
              onCheckedChange={(v) => setForm({ ...form, is_visible: v })}
            />
            <span className="text-sm text-slate-700">Visible on storefront</span>
          </div>
        </div>
        <DialogFooter>
          <button
            onClick={() => onOpenChange(false)}
            className="h-9 px-3 rounded-md text-sm text-slate-600 hover:bg-slate-100"
          >
            Cancel
          </button>
          <button
            onClick={submit}
            className="h-9 px-3 rounded-md bg-[#C4541A] hover:bg-[#a8470e] text-white text-sm font-medium"
          >
            {editing ? "Save" : "Create"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
