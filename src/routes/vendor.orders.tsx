import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { ChevronDown, ChevronUp, Truck, Search } from "lucide-react";
import { z } from "zod";
import { PageHeader, StatusBadge, VendorCard, rupee } from "@/components/vendor/ui";
import { Button } from "@/components/ui/button";
import { type OrderStatus } from "@/lib/vendor-data";
import { setOrderStatus, shipOrder, useOrders } from "@/lib/vendor-store";

export const Route = createFileRoute("/vendor/orders")({
  head: () => ({ meta: [{ title: "Orders — Vendor Panel" }] }),
  component: OrdersPage,
});

const TABS: ("All" | OrderStatus)[] = ["All", "Pending", "Packed", "Shipped", "Delivered", "Cancelled"];

function OrdersPage() {
  const orders = useOrders();
  const [tab, setTab] = useState<(typeof TABS)[number]>("All");
  const [q, setQ] = useState("");
  const [open, setOpen] = useState<Set<string>>(new Set());

  const counts = useMemo(() => {
    const c: Record<string, number> = { All: orders.length };
    for (const o of orders) c[o.status] = (c[o.status] ?? 0) + 1;
    return c;
  }, [orders]);

  const filtered = useMemo(() => {
    const s = q.trim().toLowerCase();
    return orders
      .filter((o) => tab === "All" || o.status === tab)
      .filter((o) =>
        !s ||
        o.id.toLowerCase().includes(s) ||
        o.customer.name.toLowerCase().includes(s) ||
        o.address.city.toLowerCase().includes(s),
      )
      .sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt));
  }, [orders, tab, q]);

  const toggleOpen = (id: string) =>
    setOpen((p) => {
      const n = new Set(p);
      n.has(id) ? n.delete(id) : n.add(id);
      return n;
    });

  return (
    <>
      <PageHeader title="Orders" subtitle="Manage every dabba leaving your kitchen." />

      {/* Tabs + search */}
      <VendorCard padding={false}>
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-3 p-4 border-b border-[#E8E6DF]">
          <div className="flex flex-wrap gap-1.5 -mx-1">
            {TABS.map((t) => {
              const active = tab === t;
              return (
                <button
                  key={t}
                  onClick={() => setTab(t)}
                  className={`px-3.5 h-9 rounded-full text-xs uppercase tracking-wider font-medium transition-colors inline-flex items-center gap-1.5 ${
                    active
                      ? "bg-[#6B7C4A] text-white"
                      : "bg-[#F1EFE7] text-[#4a463e] hover:bg-[#E5E2D6]"
                  }`}
                >
                  {t}
                  <span className={`text-[10px] px-1.5 rounded-full ${active ? "bg-white/20" : "bg-white text-[#7a766c]"}`}>
                    {counts[t] ?? 0}
                  </span>
                </button>
              );
            })}
          </div>
          <div className="relative w-full lg:w-72">
            <Search size={15} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#9b9789]" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Search by ID, customer, city…"
              className="w-full h-10 pl-9 pr-3 text-sm rounded-lg border border-[#E8E6DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B7C4A]/30 focus:border-[#6B7C4A]"
            />
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="text-left text-[11px] uppercase tracking-wider text-[#9b9789] border-b border-[#E8E6DF]">
                <th className="font-medium px-5 py-3 w-10"></th>
                <th className="font-medium px-3 py-3">Order</th>
                <th className="font-medium px-3 py-3">Customer</th>
                <th className="font-medium px-3 py-3">Items</th>
                <th className="font-medium px-3 py-3">Amount</th>
                <th className="font-medium px-3 py-3">Status</th>
                <th className="font-medium px-3 py-3 text-right pr-5">Action</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((o) => {
                const isOpen = open.has(o.id);
                return (
                  <OrderRow
                    key={o.id}
                    open={isOpen}
                    toggleOpen={() => toggleOpen(o.id)}
                    order={o}
                  />
                );
              })}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-5 py-16 text-center text-[#9b9789]">
                    No orders in this view.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </VendorCard>
    </>
  );
}

const shipSchema = z.object({
  courier: z.string().trim().min(2, "Courier required").max(40),
  tracking: z.string().trim().min(4, "Tracking number required").max(40),
});

function OrderRow({
  order,
  open,
  toggleOpen,
}: {
  order: ReturnType<typeof useOrders>[number];
  open: boolean;
  toggleOpen: () => void;
}) {
  const [courier, setCourier] = useState(order.courier ?? "");
  const [tracking, setTracking] = useState(order.tracking ?? "");
  const [err, setErr] = useState<Record<string, string>>({});

  const ship = () => {
    const parsed = shipSchema.safeParse({ courier, tracking });
    if (!parsed.success) {
      const errs: Record<string, string> = {};
      for (const i of parsed.error.issues) errs[i.path[0] as string] = i.message;
      setErr(errs);
      return;
    }
    setErr({});
    shipOrder(order.id, parsed.data.courier, parsed.data.tracking);
  };

  return (
    <>
      <tr
        className={`border-b border-[#F1EFE7] hover:bg-[#FAFAF7] cursor-pointer ${open ? "bg-[#FAFAF7]" : ""}`}
        onClick={toggleOpen}
      >
        <td className="px-5 py-3">
          <button
            aria-label={open ? "Collapse" : "Expand"}
            className="h-7 w-7 rounded-md hover:bg-[#F1EFE7] grid place-items-center text-[#4a463e]"
          >
            {open ? <ChevronUp size={15} /> : <ChevronDown size={15} />}
          </button>
        </td>
        <td className="px-3 py-3">
          <div className="font-mono text-xs text-[#4a463e]">{order.id}</div>
          <div className="text-[10px] text-[#9b9789] mt-0.5">
            {new Date(order.placedAt).toLocaleString("en-IN", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit" })}
          </div>
        </td>
        <td className="px-3 py-3">
          <div className="font-medium text-[#1f1d1a]">{order.customer.name}</div>
          <div className="text-[11px] text-[#9b9789]">{order.address.city}, {order.address.state}</div>
        </td>
        <td className="px-3 py-3 text-[#4a463e]">
          {order.items.length} item{order.items.length === 1 ? "" : "s"}
        </td>
        <td className="px-3 py-3 font-medium">{rupee(order.amount)}</td>
        <td className="px-3 py-3"><StatusBadge status={order.status} /></td>
        <td className="px-3 py-3 text-right pr-5" onClick={(e) => e.stopPropagation()}>
          {order.status === "Pending" && (
            <Button size="sm" className="rounded-full bg-[#C4541A] hover:bg-[#a8470e] text-white" onClick={() => setOrderStatus(order.id, "Packed")}>
              Mark packed
            </Button>
          )}
          {order.status === "Packed" && (
            <Button size="sm" variant="outline" className="rounded-full" onClick={toggleOpen}>
              <Truck size={13} className="mr-1" /> Ship
            </Button>
          )}
          {(order.status === "Shipped" || order.status === "Delivered") && (
            <span className="text-xs text-[#9b9789] font-mono">{order.tracking}</span>
          )}
        </td>
      </tr>
      {open && (
        <tr className="bg-[#FAFAF7] border-b border-[#F1EFE7]">
          <td colSpan={7} className="px-5 py-5">
            <div className="grid lg:grid-cols-3 gap-5">
              {/* items */}
              <div className="lg:col-span-2">
                <div className="text-[10px] uppercase tracking-[0.22em] text-[#9b9789] mb-2">Items</div>
                <div className="bg-white rounded-lg border border-[#E8E6DF] overflow-hidden">
                  <table className="w-full text-sm">
                    <tbody>
                      {order.items.map((it) => (
                        <tr key={it.productId + it.weight} className="border-b border-[#F1EFE7] last:border-0">
                          <td className="px-4 py-2.5 text-[#1f1d1a]">{it.name}</td>
                          <td className="px-4 py-2.5 text-[11px] text-[#9b9789]">{it.weight}</td>
                          <td className="px-4 py-2.5 text-[#4a463e]">× {it.qty}</td>
                          <td className="px-4 py-2.5 font-medium text-right">{rupee(it.unitPrice * it.qty)}</td>
                        </tr>
                      ))}
                      <tr className="bg-[#FAF7EE]">
                        <td colSpan={3} className="px-4 py-2.5 text-[#7a766c] uppercase tracking-wider text-[11px]">Total</td>
                        <td className="px-4 py-2.5 font-semibold text-right">{rupee(order.amount)}</td>
                      </tr>
                    </tbody>
                  </table>
                </div>
              </div>

              {/* address + ship */}
              <div className="space-y-4">
                <div>
                  <div className="text-[10px] uppercase tracking-[0.22em] text-[#9b9789] mb-2">Ship to</div>
                  <div className="bg-white rounded-lg border border-[#E8E6DF] p-4 text-sm">
                    <div className="font-medium text-[#1f1d1a]">{order.customer.name}</div>
                    <div className="text-[#4a463e] mt-0.5">📞 {order.customer.phone}</div>
                    <div className="text-[#4a463e] mt-2 leading-relaxed">{order.address.line}</div>
                    <div className="text-[#7a766c] text-[12px] mt-1">
                      {order.address.city}, {order.address.state} — {order.address.pincode}
                    </div>
                  </div>
                </div>

                {(order.status === "Pending" || order.status === "Packed") && (
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-[#9b9789] mb-2">
                      Mark as shipped
                    </div>
                    <div className="bg-white rounded-lg border border-[#E8E6DF] p-4 space-y-2">
                      <input
                        value={courier}
                        onChange={(e) => setCourier(e.target.value)}
                        maxLength={40}
                        placeholder="Courier (DTDC, Bluedart, Delhivery…)"
                        className="w-full h-10 px-3 text-sm rounded-md border border-[#E8E6DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B7C4A]/30 focus:border-[#6B7C4A]"
                      />
                      {err.courier && <div className="text-xs text-[#8C2A2A]">{err.courier}</div>}
                      <input
                        value={tracking}
                        onChange={(e) => setTracking(e.target.value)}
                        maxLength={40}
                        placeholder="Tracking number"
                        className="w-full h-10 px-3 text-sm rounded-md border border-[#E8E6DF] bg-white focus:outline-none focus:ring-2 focus:ring-[#6B7C4A]/30 focus:border-[#6B7C4A]"
                      />
                      {err.tracking && <div className="text-xs text-[#8C2A2A]">{err.tracking}</div>}
                      <Button onClick={ship} className="w-full mt-1 rounded-full bg-[#C4541A] hover:bg-[#a8470e] text-white">
                        <Truck size={13} className="mr-1.5" /> Confirm shipment
                      </Button>
                    </div>
                  </div>
                )}

                {order.status === "Shipped" && (
                  <div>
                    <div className="text-[10px] uppercase tracking-[0.22em] text-[#9b9789] mb-2">Shipping</div>
                    <div className="bg-white rounded-lg border border-[#E8E6DF] p-4 text-sm">
                      <div className="text-[#1f1d1a]"><span className="text-[#7a766c]">Courier:</span> {order.courier}</div>
                      <div className="text-[#1f1d1a] mt-1"><span className="text-[#7a766c]">Tracking:</span> <span className="font-mono">{order.tracking}</span></div>
                      <Button
                        onClick={() => setOrderStatus(order.id, "Delivered")}
                        size="sm"
                        variant="outline"
                        className="rounded-full mt-3 w-full"
                      >
                        Mark as delivered
                      </Button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </td>
        </tr>
      )}
    </>
  );
}
