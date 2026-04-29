import { createFileRoute } from "@/lib/router-compat";
import { useState } from "react";
import { Plus, Pencil, Trash2, Eye, ArrowUp, ArrowDown, ImageIcon } from "lucide-react";
import { AdminPageHeader, AdminCard, AdminBadge } from "@/components/admin/ui";
import { useBanners, toggleBanner, upsertBanner, deleteBanner } from "@/lib/admin-store";
import type { Banner } from "@/lib/admin-data";
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

export const Route = createFileRoute("/admin/banners")({
  head: () => ({ meta: [{ title: "Homepage banners — Super Admin" }] }),
  component: BannersPage,
});

function BannersPage() {
  const banners = useBanners();
  const [editing, setEditing] = useState<Banner | null>(null);
  const [open, setOpen] = useState(false);
  const [previewId, setPreviewId] = useState<string | null>(banners[0]?.id ?? null);

  const sorted = [...banners].sort((a, b) => a.sortOrder - b.sortOrder);
  const previewBanner = sorted.find((b) => b.id === previewId) ?? sorted[0];

  function startNew() {
    setEditing(null);
    setOpen(true);
  }
  function startEdit(b: Banner) {
    setEditing(b);
    setOpen(true);
  }
  function move(b: Banner, dir: -1 | 1) {
    const idx = sorted.findIndex((x) => x.id === b.id);
    const swap = sorted[idx + dir];
    if (!swap) return;
    upsertBanner({ ...b, sortOrder: swap.sortOrder });
    upsertBanner({ ...swap, sortOrder: b.sortOrder });
  }

  return (
    <>
      <AdminPageHeader
        title="Homepage banners"
        subtitle="Promote festivals, vendors and seasonal drops above the fold."
        actions={
          <button
            onClick={startNew}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-[#C4541A] hover:bg-[#a8470e] text-white text-sm font-medium"
          >
            <Plus size={14} /> New banner
          </button>
        }
      />

      <div className="grid lg:grid-cols-[1.2fr_1fr] gap-4">
        {/* List */}
        <AdminCard padding={false}>
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">All banners</h3>
            <span className="text-xs text-slate-500">{banners.filter((b) => b.active).length} live</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {sorted.map((b, i) => (
              <li
                key={b.id}
                className={`p-3 flex items-center gap-3 cursor-pointer hover:bg-slate-50 ${previewId === b.id ? "bg-amber-50/40" : ""}`}
                onClick={() => setPreviewId(b.id)}
              >
                <div className="h-12 w-20 rounded-md overflow-hidden bg-slate-100 flex-shrink-0 grid place-items-center">
                  {b.imageUrl ? (
                    <img src={b.imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon size={16} className="text-slate-400" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-slate-900 truncate">{b.title}</h4>
                    <span className="text-[10px] uppercase font-semibold tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{b.placement}</span>
                  </div>
                  <p className="text-xs text-slate-500 mt-0.5 truncate">{b.subtitle}</p>
                  <div className="text-[11px] text-slate-400 mt-0.5">
                    {b.startsAt} → {b.endsAt} · sort #{b.sortOrder}
                  </div>
                </div>
                <div className="flex flex-col items-end gap-1.5">
                  <AdminBadge status={b.active ? "Active" : "Suspended"} />
                  <div className="flex items-center gap-0.5">
                    <button
                      onClick={(e) => { e.stopPropagation(); move(b, -1); }}
                      disabled={i === 0}
                      className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                      title="Move up"
                    >
                      <ArrowUp size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); move(b, 1); }}
                      disabled={i === sorted.length - 1}
                      className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-500 disabled:opacity-30"
                      title="Move down"
                    >
                      <ArrowDown size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); toggleBanner(b.id); }}
                      className="ml-1"
                      title="Toggle"
                    >
                      <Switch checked={b.active} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); startEdit(b); }}
                      className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-500"
                      title="Edit"
                    >
                      <Pencil size={13} />
                    </button>
                    <button
                      onClick={(e) => { e.stopPropagation(); if (confirm(`Delete "${b.title}"?`)) deleteBanner(b.id); }}
                      className="h-7 w-7 grid place-items-center rounded-md hover:bg-rose-50 text-rose-500"
                      title="Delete"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>

        {/* Preview */}
        <div className="space-y-3">
          <div className="flex items-center gap-2 text-xs uppercase tracking-[0.14em] text-slate-500 font-medium">
            <Eye size={13} /> Live preview · homepage hero
          </div>
          <AdminCard padding={false} className="overflow-hidden">
            <div className="bg-[#FAF6EE] p-6">
              <div className="text-[10px] uppercase tracking-wider text-slate-400 mb-2">thayilam.com</div>
              {previewBanner ? (
                <div className="relative rounded-xl overflow-hidden h-64 bg-slate-200">
                  {previewBanner.imageUrl && (
                    <img src={previewBanner.imageUrl} alt="" className="absolute inset-0 h-full w-full object-cover" />
                  )}
                  <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
                  <div className="absolute inset-0 p-6 flex flex-col justify-end text-white">
                    <h2 style={{ fontFamily: "Caveat, cursive" }} className="text-4xl leading-none">
                      {previewBanner.title}
                    </h2>
                    <p className="mt-2 text-sm max-w-xs">{previewBanner.subtitle}</p>
                    <button className="self-start mt-4 inline-flex h-9 items-center px-4 rounded-md bg-[#C4541A] text-white text-sm font-medium">
                      {previewBanner.cta}
                    </button>
                  </div>
                </div>
              ) : (
                <div className="h-64 grid place-items-center text-slate-400 text-sm">No banner selected</div>
              )}
            </div>
            {previewBanner && (
              <div className="p-4 text-xs text-slate-500 border-t border-slate-100 space-y-1">
                <div><span className="font-medium text-slate-700">Links to:</span> <span className="font-mono">{previewBanner.linkUrl}</span></div>
                <div><span className="font-medium text-slate-700">Active window:</span> {previewBanner.startsAt} — {previewBanner.endsAt}</div>
              </div>
            )}
          </AdminCard>
        </div>
      </div>

      <BannerDialog
        open={open}
        onOpenChange={setOpen}
        editing={editing}
      />
    </>
  );
}

function BannerDialog({
  open, onOpenChange, editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Banner | null;
}) {
  const [form, setForm] = useState<Omit<Banner, "id">>(() =>
    editing
      ? { ...editing }
      : {
          title: "", subtitle: "", cta: "Shop now",
          imageUrl: "", linkUrl: "/shop",
          placement: "Homepage Hero",
          active: true,
          startsAt: new Date().toISOString().slice(0, 10),
          endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
          sortOrder: 99,
        }
  );

  // re-init when editing changes
  const key = editing?.id ?? "new";
  const [stateKey, setStateKey] = useState(key);
  if (stateKey !== key) {
    setStateKey(key);
    setForm(editing ? { ...editing } : {
      title: "", subtitle: "", cta: "Shop now",
      imageUrl: "", linkUrl: "/shop",
      placement: "Homepage Hero", active: true,
      startsAt: new Date().toISOString().slice(0, 10),
      endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
      sortOrder: 99,
    });
  }

  function submit() {
    if (!form.title.trim()) return;
    upsertBanner(editing ? { id: editing.id, ...form } : { ...form });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-xl">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit banner" : "New banner"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <Label className="text-xs">Image URL</Label>
            <Input value={form.imageUrl} onChange={(e) => setForm({ ...form, imageUrl: e.target.value })} placeholder="https://…" />
            {form.imageUrl && (
              <div className="mt-2 h-24 rounded-md overflow-hidden bg-slate-100">
                <img src={form.imageUrl} alt="" className="h-full w-full object-cover" />
              </div>
            )}
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Title</Label>
            <Input value={form.title} onChange={(e) => setForm({ ...form, title: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Subtitle</Label>
            <Textarea rows={2} value={form.subtitle} onChange={(e) => setForm({ ...form, subtitle: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">CTA label</Label>
            <Input value={form.cta} onChange={(e) => setForm({ ...form, cta: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Link URL</Label>
            <Input value={form.linkUrl} onChange={(e) => setForm({ ...form, linkUrl: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Placement</Label>
            <Select value={form.placement} onValueChange={(v) => setForm({ ...form, placement: v as Banner["placement"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="Homepage Hero">Homepage Hero</SelectItem>
                <SelectItem value="Category Strip">Category Strip</SelectItem>
                <SelectItem value="Cart Page">Cart Page</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <Label className="text-xs">Sort order</Label>
            <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: Number(e.target.value) })} />
          </div>
          <div>
            <Label className="text-xs">Starts</Label>
            <Input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Ends</Label>
            <Input type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
          </div>
          <div className="col-span-2 flex items-center gap-2">
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            <span className="text-sm text-slate-700">Active on storefront</span>
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="h-9 px-3 rounded-md text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onClick={submit} className="h-9 px-3 rounded-md bg-[#C4541A] hover:bg-[#a8470e] text-white text-sm font-medium">
            {editing ? "Save changes" : "Create banner"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
