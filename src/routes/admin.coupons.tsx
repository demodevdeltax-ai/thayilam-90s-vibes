import { createFileRoute } from "@/lib/router-compat";
import { useState } from "react";
import { Plus, Pencil, Trash2, Ticket, Copy } from "lucide-react";
import {
  AdminPageHeader, AdminCard, AdminBadge, TableShell, Th, Td, rupee,
} from "@/components/admin/ui";
import {
  useOffers, toggleOffer, upsertOffer, deleteOffer,
} from "@/lib/admin-store";
import { VENDORS } from "@/lib/products";
import { ADMIN_CATEGORIES, type Offer } from "@/lib/admin-data";
import { Switch } from "@/components/ui/switch";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/admin/coupons")({
  head: () => ({ meta: [{ title: "Coupons & offers — Super Admin" }] }),
  component: CouponsPage,
});

function CouponsPage() {
  const offers = useOffers();
  const [editing, setEditing] = useState<Offer | null>(null);
  const [open, setOpen] = useState(false);

  const live = offers.filter((o) => o.active).length;
  const totalUsed = offers.reduce((s, o) => s + o.used, 0);

  return (
    <>
      <AdminPageHeader
        title="Coupons & offers"
        subtitle="Discount codes, free shipping, vendor and category-scoped promos."
        actions={
          <button
            onClick={() => { setEditing(null); setOpen(true); }}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-[#C4541A] hover:bg-[#a8470e] text-white text-sm font-medium"
          >
            <Plus size={14} /> New coupon
          </button>
        }
      />

      <div className="grid sm:grid-cols-3 gap-3 mb-4">
        <AdminCard className="border-l-4 border-l-[#C4541A]">
          <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">Active codes</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{live}</div>
        </AdminCard>
        <AdminCard className="border-l-4 border-l-[#6B7C4A]">
          <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">Total redemptions</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">{totalUsed.toLocaleString("en-IN")}</div>
        </AdminCard>
        <AdminCard className="border-l-4 border-l-amber-500">
          <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">Codes near cap</div>
          <div className="mt-1 text-2xl font-semibold tabular-nums">
            {offers.filter((o) => o.used / o.cap > 0.8).length}
          </div>
        </AdminCard>
      </div>

      <AdminCard padding={false}>
        <TableShell>
          <thead>
            <tr>
              <Th>Code</Th>
              <Th>Discount</Th>
              <Th>Scope</Th>
              <Th>Window</Th>
              <Th className="text-right">Usage</Th>
              <Th>Status</Th>
              <Th className="text-center">Active</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {offers.map((o) => (
              <tr key={o.id} className="hover:bg-slate-50">
                <Td>
                  <div className="flex items-center gap-2">
                    <Ticket size={14} className="text-[#C4541A]" />
                    <span className="font-mono text-sm font-semibold bg-slate-900 text-white px-2 py-0.5 rounded">{o.code}</span>
                    <button onClick={() => navigator.clipboard?.writeText(o.code)} className="text-slate-400 hover:text-slate-700" title="Copy">
                      <Copy size={12} />
                    </button>
                  </div>
                  <div className="text-xs text-slate-500 mt-1">{o.description}</div>
                </Td>
                <Td>
                  <div className="text-sm font-medium text-slate-900">
                    {o.type === "flat" ? rupee(o.value) + " off" : o.value + "% off"}
                  </div>
                  <div className="text-[11px] text-slate-500">
                    Min {rupee(o.minOrder)}{o.maxDiscount ? ` · cap ${rupee(o.maxDiscount)}` : ""}
                  </div>
                </Td>
                <Td className="text-xs text-slate-600">
                  {o.scope === "all" && <span className="text-slate-500">All products</span>}
                  {o.scope === "vendors" && <span>Vendors: <span className="font-medium text-slate-900">{o.scopeTargets.join(", ")}</span></span>}
                  {o.scope === "categories" && <span>Categories: <span className="font-medium text-slate-900">{o.scopeTargets.join(", ")}</span></span>}
                </Td>
                <Td className="text-xs text-slate-500 whitespace-nowrap">{o.startsAt}<br />→ {o.endsAt}</Td>
                <Td>
                  <div className="flex items-center gap-2 justify-end min-w-[120px]">
                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#C4541A]" style={{ width: `${Math.min(100, (o.used / o.cap) * 100)}%` }} />
                    </div>
                    <span className="text-[11px] text-slate-500 tabular-nums whitespace-nowrap">{o.used}/{o.cap}</span>
                  </div>
                </Td>
                <Td><AdminBadge status={o.active ? "Active" : "Suspended"} /></Td>
                <Td className="text-center">
                  <Switch checked={o.active} onCheckedChange={() => toggleOffer(o.id)} />
                </Td>
                <Td className="text-right">
                  <button
                    onClick={() => { setEditing(o); setOpen(true); }}
                    className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-500 inline-grid" title="Edit"
                  >
                    <Pencil size={13} />
                  </button>
                  <button
                    onClick={() => { if (confirm(`Delete coupon ${o.code}?`)) deleteOffer(o.id); }}
                    className="h-7 w-7 grid place-items-center rounded-md hover:bg-rose-50 text-rose-500 inline-grid" title="Delete"
                  >
                    <Trash2 size={13} />
                  </button>
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </AdminCard>

      <CouponDialog open={open} onOpenChange={setOpen} editing={editing} />
    </>
  );
}

function CouponDialog({
  open, onOpenChange, editing,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  editing: Offer | null;
}) {
  const blank: Omit<Offer, "id" | "used"> = {
    code: "", description: "", type: "flat", value: 50, minOrder: 0,
    maxDiscount: 0, startsAt: new Date().toISOString().slice(0, 10),
    endsAt: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30).toISOString().slice(0, 10),
    cap: 500, scope: "all", scopeTargets: [], active: true,
  };
  const [form, setForm] = useState(editing ? { ...editing } : { ...blank });
  const key = editing?.id ?? "new";
  const [stateKey, setStateKey] = useState(key);
  if (stateKey !== key) {
    setStateKey(key);
    setForm(editing ? { ...editing } : { ...blank });
  }

  function toggleTarget(t: string) {
    setForm({
      ...form,
      scopeTargets: form.scopeTargets.includes(t)
        ? form.scopeTargets.filter((x) => x !== t)
        : [...form.scopeTargets, t],
    });
  }

  function submit() {
    if (!form.code.trim()) return;
    upsertOffer({
      ...form,
      id: editing?.id,
      code: form.code.trim().toUpperCase(),
    });
    onOpenChange(false);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{editing ? "Edit coupon" : "New coupon"}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs">Code</Label>
            <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="THAYI50" className="font-mono" />
          </div>
          <div>
            <Label className="text-xs">Type</Label>
            <Select value={form.type} onValueChange={(v) => setForm({ ...form, type: v as Offer["type"] })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="flat">Flat ₹ off</SelectItem>
                <SelectItem value="percent">Percentage off</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Description (shown to customer)</Label>
            <Input value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} placeholder="Flat ₹50 off above ₹599" />
          </div>
          <div>
            <Label className="text-xs">{form.type === "flat" ? "Discount (₹)" : "Discount (%)"}</Label>
            <Input type="number" value={form.value} onChange={(e) => setForm({ ...form, value: Number(e.target.value) })} />
          </div>
          <div>
            <Label className="text-xs">Min order (₹)</Label>
            <Input type="number" value={form.minOrder} onChange={(e) => setForm({ ...form, minOrder: Number(e.target.value) })} />
          </div>
          <div>
            <Label className="text-xs">Max discount cap (₹) {form.type === "flat" && <span className="text-slate-400">— n/a</span>}</Label>
            <Input
              type="number"
              value={form.maxDiscount}
              onChange={(e) => setForm({ ...form, maxDiscount: Number(e.target.value) })}
              disabled={form.type === "flat"}
            />
          </div>
          <div>
            <Label className="text-xs">Total usage limit</Label>
            <Input type="number" value={form.cap} onChange={(e) => setForm({ ...form, cap: Number(e.target.value) })} />
          </div>
          <div>
            <Label className="text-xs">Valid from</Label>
            <Input type="date" value={form.startsAt} onChange={(e) => setForm({ ...form, startsAt: e.target.value })} />
          </div>
          <div>
            <Label className="text-xs">Valid until</Label>
            <Input type="date" value={form.endsAt} onChange={(e) => setForm({ ...form, endsAt: e.target.value })} />
          </div>
          <div className="col-span-2">
            <Label className="text-xs">Apply to</Label>
            <Select
              value={form.scope}
              onValueChange={(v) => setForm({ ...form, scope: v as Offer["scope"], scopeTargets: [] })}
            >
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All products</SelectItem>
                <SelectItem value="vendors">Specific vendors</SelectItem>
                <SelectItem value="categories">Specific categories</SelectItem>
              </SelectContent>
            </Select>
          </div>
          {form.scope === "vendors" && (
            <div className="col-span-2 border border-slate-200 rounded-md p-3 max-h-44 overflow-y-auto space-y-2">
              {VENDORS.map((v) => (
                <label key={v} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={form.scopeTargets.includes(v)} onCheckedChange={() => toggleTarget(v)} />
                  {v}
                </label>
              ))}
            </div>
          )}
          {form.scope === "categories" && (
            <div className="col-span-2 border border-slate-200 rounded-md p-3 max-h-44 overflow-y-auto space-y-2">
              {ADMIN_CATEGORIES.map((c) => (
                <label key={c.id} className="flex items-center gap-2 text-sm cursor-pointer">
                  <Checkbox checked={form.scopeTargets.includes(c.slug)} onCheckedChange={() => toggleTarget(c.slug)} />
                  <span>{c.icon}</span> {c.name}
                </label>
              ))}
            </div>
          )}
          <div className="col-span-2 flex items-center gap-2">
            <Switch checked={form.active} onCheckedChange={(v) => setForm({ ...form, active: v })} />
            <span className="text-sm text-slate-700">Active</span>
          </div>
        </div>
        <DialogFooter>
          <button onClick={() => onOpenChange(false)} className="h-9 px-3 rounded-md text-sm text-slate-600 hover:bg-slate-100">Cancel</button>
          <button onClick={submit} className="h-9 px-3 rounded-md bg-[#C4541A] hover:bg-[#a8470e] text-white text-sm font-medium">
            {editing ? "Save coupon" : "Create coupon"}
          </button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
