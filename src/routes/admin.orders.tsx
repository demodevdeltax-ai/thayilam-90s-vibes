import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { Search, RotateCcw, ChevronDown, ChevronRight } from "lucide-react";
import {
  AdminPageHeader, AdminCard, AdminBadge, TableShell, Th, Td, rupee,
} from "@/components/admin/ui";
import { ORDERS, type OrderStatus } from "@/lib/vendor-data";
import { VENDORS, PRODUCTS } from "@/lib/products";
import { setOrderStatus } from "@/lib/vendor-store";
import { OrderItemBreakdown, SkuPill } from "@/components/admin/pack-breakdown";

export const Route = createFileRoute("/admin/orders")({
  head: () => ({ meta: [{ title: "Orders — Super Admin" }] }),
  component: OrdersPage,
});

const STATUSES: OrderStatus[] = ["Pending", "Packed", "Shipped", "Delivered", "Cancelled"];
const PAYMENTS = ["UPI", "Card", "Net Banking", "COD"] as const;

function OrdersPage() {
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | OrderStatus>("All");
  const [vendor, setVendor] = useState<string>("All");
  const [payment, setPayment] = useState<string>("All");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    return ORDERS.filter((o) => {
      if (status !== "All" && o.status !== status) return false;
      if (vendor !== "All" && !o.items.some((i) => {
        return true;
      }) && vendor !== "All") return false;
      if (q && !o.id.toLowerCase().includes(q.toLowerCase()) && !o.customer.name.toLowerCase().includes(q.toLowerCase())) return false;
      return true;
    });
  }, [q, status, vendor, payment]);

  return (
    <>
      <AdminPageHeader
        title="Platform orders"
        subtitle="Every order across every vendor — filter, override, refund."
        actions={<span className="text-xs text-slate-500">{filtered.length} orders</span>}
      />

      <AdminCard padding={false}>
        <div className="p-4 border-b border-slate-100 grid sm:grid-cols-2 lg:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Order ID or customer…"
              className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>
          <select value={status} onChange={(e) => setStatus(e.target.value as "All" | OrderStatus)} className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white focus:outline-none">
            <option>All</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select value={vendor} onChange={(e) => setVendor(e.target.value)} className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white focus:outline-none">
            <option value="All">All vendors</option>
            {VENDORS.map((v) => <option key={v} value={v}>{v}</option>)}
          </select>
          <select value={payment} onChange={(e) => setPayment(e.target.value)} className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white focus:outline-none">
            <option value="All">All payments</option>
            {PAYMENTS.map((p) => <option key={p}>{p}</option>)}
          </select>
        </div>

        <TableShell>
          <thead>
            <tr>
              <Th><span className="sr-only">Expand</span></Th>
              <Th>Order</Th>
              <Th>Customer</Th>
              <Th>Items</Th>
              <Th>Placed</Th>
              <Th className="text-right">Amount</Th>
              <Th>Status</Th>
              <Th className="text-right">Override</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((o) => {
              const open = openId === o.id;
              return (
                <>
                  <tr key={o.id} className="hover:bg-slate-50">
                    <Td>
                      <button onClick={() => setOpenId(open ? null : o.id)} className="h-6 w-6 grid place-items-center rounded hover:bg-slate-100 text-slate-500">
                        {open ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
                      </button>
                    </Td>
                    <Td className="font-mono text-xs text-slate-600">{o.id}</Td>
                    <Td>
                      <div className="text-sm font-medium text-slate-900">{o.customer.name}</div>
                      <div className="text-xs text-slate-500">{o.address.city}</div>
                    </Td>
                    <Td className="text-slate-600 text-xs">{o.items.length} item{o.items.length === 1 ? "" : "s"}</Td>
                    <Td className="text-xs text-slate-600">
                      {new Date(o.placedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
                    </Td>
                    <Td className="text-right tabular-nums font-medium">{rupee(o.amount)}</Td>
                    <Td><AdminBadge status={o.status} /></Td>
                    <Td className="text-right">
                      <div className="inline-flex items-center gap-1">
                        <select
                          value={o.status}
                          onChange={(e) => setOrderStatus(o.id, e.target.value as OrderStatus)}
                          className="h-7 px-2 text-xs rounded-md border border-slate-200 bg-white text-slate-700 focus:outline-none focus:border-slate-400"
                        >
                          {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                        <button
                          className="h-7 px-2 inline-flex items-center gap-1 rounded-md border border-slate-200 hover:bg-rose-50 hover:border-rose-200 text-rose-600 text-xs font-medium"
                          title="Initiate refund"
                        >
                          <RotateCcw size={12} /> Refund
                        </button>
                      </div>
                    </Td>
                  </tr>
                  {open && (
                    <tr key={o.id + "-detail"} className="bg-slate-50/70">
                      <td colSpan={8} className="px-6 py-4 border-b border-slate-200">
                        <div className="grid md:grid-cols-3 gap-6">
                          <div>
                            <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2 font-medium">Items &amp; pack breakdown</div>
                            <ul className="space-y-3">
                              {o.items.map((i, idx) => {
                                const product = PRODUCTS.find((p) => p.id === i.productId);
                                return (
                                  <li key={idx} className="text-sm border-l-2 border-[#6B7C4A]/30 pl-3">
                                    <div className="flex items-center justify-between gap-2">
                                      <div className="flex items-center gap-2 min-w-0">
                                        <span className="text-slate-800 font-medium truncate">{i.name}</span>
                                        {product && <SkuPill sku={product.sku} />}
                                      </div>
                                      <span className="tabular-nums font-medium shrink-0">{rupee(i.unitPrice * i.qty)}</span>
                                    </div>
                                    <div className="text-xs text-slate-500 mt-0.5">
                                      Customer ordered: <span className="text-slate-700 font-medium">{i.weight} × {i.qty}</span>
                                    </div>
                                    <OrderItemBreakdown productId={i.productId} weight={i.weight} qty={i.qty} />
                                  </li>
                                );
                              })}
                            </ul>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2 font-medium">Shipping address</div>
                            <div className="text-sm text-slate-700">
                              <div className="font-medium">{o.customer.name}</div>
                              <div>{o.customer.phone}</div>
                              <div className="text-slate-600 mt-1">{o.address.line}</div>
                              <div className="text-slate-600">{o.address.city}, {o.address.state} {o.address.pincode}</div>
                            </div>
                          </div>
                          <div>
                            <div className="text-[11px] uppercase tracking-wider text-slate-500 mb-2 font-medium">Logistics</div>
                            {o.courier ? (
                              <div className="text-sm text-slate-700">
                                <div>{o.courier}</div>
                                <div className="font-mono text-xs text-slate-500 mt-1">{o.tracking}</div>
                              </div>
                            ) : (
                              <div className="text-sm text-slate-400 italic">Not yet shipped</div>
                            )}
                          </div>
                        </div>
                      </td>
                    </tr>
                  )}
                </>
              );
            })}
            {filtered.length === 0 && (
              <tr><Td className="text-center text-slate-400 py-10" >No orders match your filters.</Td></tr>
            )}
          </tbody>
        </TableShell>
      </AdminCard>
    </>
  );
}
