import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, CheckCircle2, Ban, Eye, X, Star, Building2, CreditCard } from "lucide-react";
import {
  AdminPageHeader, AdminCard, AdminBadge, TableShell, Th, Td, rupee,
} from "@/components/admin/ui";
import { useAdminVendors, setVendorStatus } from "@/lib/admin-store";
import { PRODUCTS } from "@/lib/products";
import { ORDERS } from "@/lib/vendor-data";
import type { AdminVendor, VendorStatus } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/vendors")({
  head: () => ({ meta: [{ title: "Vendors — Super Admin" }] }),
  component: VendorsPage,
});

function VendorsPage() {
  const vendors = useAdminVendors();
  const [q, setQ] = useState("");
  const [filter, setFilter] = useState<"All" | VendorStatus>("All");
  const [openVendor, setOpenVendor] = useState<AdminVendor | null>(null);

  const filtered = useMemo(() => {
    return vendors.filter((v) => {
      if (filter !== "All" && v.status !== filter) return false;
      if (q && !v.name.toLowerCase().includes(q.toLowerCase()) && !v.city.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [vendors, q, filter]);

  return (
    <>
      <AdminPageHeader
        title="Vendors"
        subtitle="Manage all kitchens, approvals and standing on the platform."
        actions={
          <div className="flex items-center gap-2">
            <span className="text-xs text-slate-500">{filtered.length} of {vendors.length}</span>
          </div>
        }
      />

      <AdminCard padding={false}>
        <div className="p-4 border-b border-slate-100 flex flex-col sm:flex-row sm:items-center gap-3 justify-between">
          <div className="relative max-w-xs w-full">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by name or city…"
              className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:border-slate-400 focus:outline-none"
            />
          </div>
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
            {(["All", "Pending", "Active", "Suspended"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 h-7 rounded ${filter === f ? "bg-white text-slate-900 font-medium shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {f}
              </button>
            ))}
          </div>
        </div>

        <TableShell>
          <thead>
            <tr>
              <Th>Vendor</Th>
              <Th>City</Th>
              <Th className="text-right">Products</Th>
              <Th className="text-right">Monthly revenue</Th>
              <Th>Status</Th>
              <Th className="text-right">Actions</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((v) => {
              const productCount = PRODUCTS.filter((p) => p.vendor === v.name).length;
              return (
                <tr key={v.name} className="hover:bg-slate-50">
                  <Td>
                    <div className="flex items-center gap-3">
                      <div className="h-8 w-8 rounded-full bg-[#6B7C4A]/10 text-[#6B7C4A] grid place-items-center text-xs font-semibold">
                        {v.name.slice(0, 1)}
                      </div>
                      <div className="min-w-0">
                        <div className="text-sm font-medium text-slate-900">{v.name}</div>
                        <div className="text-[11px] text-slate-500">★ {v.rating} · {v.commissionPct}% commission</div>
                      </div>
                    </div>
                  </Td>
                  <Td className="text-slate-600">{v.city}, {v.state}</Td>
                  <Td className="text-right tabular-nums">{productCount}</Td>
                  <Td className="text-right tabular-nums font-medium text-slate-900">{rupee(v.monthlyRevenue)}</Td>
                  <Td><AdminBadge status={v.status} /></Td>
                  <Td className="text-right">
                    <div className="inline-flex items-center gap-1">
                      {v.status === "Pending" && (
                        <button
                          onClick={() => setVendorStatus(v.name, "Active")}
                          className="inline-flex items-center gap-1 h-7 px-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                        >
                          <CheckCircle2 size={12} /> Approve
                        </button>
                      )}
                      {v.status === "Active" && (
                        <button
                          onClick={() => setVendorStatus(v.name, "Suspended")}
                          className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-slate-200 hover:border-rose-300 hover:bg-rose-50 text-rose-600 text-xs font-medium"
                        >
                          <Ban size={12} /> Suspend
                        </button>
                      )}
                      {v.status === "Suspended" && (
                        <button
                          onClick={() => setVendorStatus(v.name, "Active")}
                          className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                        >
                          Reinstate
                        </button>
                      )}
                      <button
                        onClick={() => setOpenVendor(v)}
                        className="inline-flex items-center gap-1 h-7 px-2 rounded-md border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-medium"
                      >
                        <Eye size={12} /> View
                      </button>
                    </div>
                  </Td>
                </tr>
              );
            })}
            {filtered.length === 0 && (
              <tr><Td className="text-center text-slate-400 py-10" >No vendors match your filters.</Td></tr>
            )}
          </tbody>
        </TableShell>
      </AdminCard>

      {openVendor && <VendorDetail vendor={openVendor} onClose={() => setOpenVendor(null)} />}
    </>
  );
}

function VendorDetail({ vendor, onClose }: { vendor: AdminVendor; onClose: () => void }) {
  const products = PRODUCTS.filter((p) => p.vendor === vendor.name);
  const orders = ORDERS.filter((o) => o.items.some((i) => products.find((p) => p.id === i.productId)));

  return (
    <div className="fixed inset-0 z-50 flex items-stretch justify-end">
      <button aria-label="Close" onClick={onClose} className="absolute inset-0 bg-slate-900/40" />
      <div className="relative w-full max-w-2xl bg-white border-l border-slate-200 overflow-y-auto">
        <div className="sticky top-0 bg-white border-b border-slate-200 px-6 py-4 flex items-center justify-between z-10">
          <div className="flex items-center gap-3">
            <div className="h-10 w-10 rounded-full bg-[#6B7C4A]/10 text-[#6B7C4A] grid place-items-center font-semibold">
              {vendor.name.slice(0, 1)}
            </div>
            <div>
              <h2 className="text-base font-semibold text-slate-900">{vendor.name}</h2>
              <div className="text-xs text-slate-500 flex items-center gap-2 mt-0.5">
                <AdminBadge status={vendor.status} />
                <span>· joined {new Date(vendor.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}</span>
              </div>
            </div>
          </div>
          <button onClick={onClose} className="h-9 w-9 rounded-md hover:bg-slate-100 grid place-items-center">
            <X size={18} />
          </button>
        </div>

        <div className="p-6 space-y-6">
          <section>
            <SectionTitle icon={<Building2 size={14} />}>Business details</SectionTitle>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="City" value={`${vendor.city}, ${vendor.state}`} />
              <Field label="FSSAI" value={vendor.fssai} mono />
              <Field label="Commission" value={`${vendor.commissionPct}%`} />
              <Field label="Average rating" value={`★ ${vendor.rating}`} />
            </div>
          </section>

          <section>
            <SectionTitle icon={<CreditCard size={14} />}>Bank for payouts</SectionTitle>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <Field label="Account holder" value={vendor.bank.holder} />
              <Field label="Account" value={vendor.bank.account} mono />
              <Field label="IFSC" value={vendor.bank.ifsc} mono />
              <Field label="Last month revenue" value={rupee(vendor.monthlyRevenue)} />
            </div>
          </section>

          <section>
            <SectionTitle icon={<Star size={14} />}>Rating summary</SectionTitle>
            <div className="flex items-end gap-4">
              <div>
                <div className="text-3xl font-semibold text-slate-900 tabular-nums">{vendor.rating}</div>
                <div className="text-xs text-slate-500">average rating</div>
              </div>
              <div className="flex-1 space-y-1.5">
                {[5, 4, 3, 2, 1].map((s) => {
                  const pct = s === 5 ? 72 : s === 4 ? 18 : s === 3 ? 6 : s === 2 ? 3 : 1;
                  return (
                    <div key={s} className="flex items-center gap-2 text-xs text-slate-600">
                      <span className="w-3 tabular-nums">{s}★</span>
                      <div className="flex-1 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                        <div className="h-full bg-amber-400" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-8 text-right tabular-nums">{pct}%</span>
                    </div>
                  );
                })}
              </div>
            </div>
          </section>

          <section>
            <SectionTitle>Products ({products.length})</SectionTitle>
            <div className="border border-slate-200 rounded-md divide-y divide-slate-100 max-h-64 overflow-y-auto">
              {products.map((p) => (
                <div key={p.id} className="flex items-center gap-3 px-3 py-2">
                  <img src={p.img} alt={p.name} className="h-9 w-9 object-contain bg-slate-50 rounded" />
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium text-slate-900 truncate">{p.name}</div>
                    <div className="text-xs text-slate-500 truncate">{p.category} · {p.weight}</div>
                  </div>
                  <div className="text-sm font-medium tabular-nums">{rupee(p.price)}</div>
                </div>
              ))}
              {products.length === 0 && <div className="px-3 py-6 text-center text-xs text-slate-400">No products listed yet.</div>}
            </div>
          </section>

          <section>
            <SectionTitle>Recent orders ({orders.length})</SectionTitle>
            <div className="border border-slate-200 rounded-md divide-y divide-slate-100">
              {orders.slice(0, 6).map((o) => (
                <div key={o.id} className="flex items-center gap-3 px-3 py-2 text-sm">
                  <span className="font-mono text-xs text-slate-500">{o.id}</span>
                  <span className="flex-1 text-slate-700 truncate">{o.customer.name}</span>
                  <AdminBadge status={o.status} />
                  <span className="font-medium tabular-nums w-20 text-right">{rupee(o.amount)}</span>
                </div>
              ))}
              {orders.length === 0 && <div className="px-3 py-6 text-center text-xs text-slate-400">No orders yet.</div>}
            </div>
          </section>
        </div>
      </div>
    </div>
  );
}

function SectionTitle({ children, icon }: { children: React.ReactNode; icon?: React.ReactNode }) {
  return (
    <h3 className="flex items-center gap-2 text-[11px] font-semibold text-slate-500 uppercase tracking-[0.14em] mb-3">
      {icon}{children}
    </h3>
  );
}
function Field({ label, value, mono = false }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-[11px] uppercase tracking-wider text-slate-500">{label}</div>
      <div className={`text-sm text-slate-900 mt-0.5 ${mono ? "font-mono" : ""}`}>{value}</div>
    </div>
  );
}
