import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { Search, RotateCcw, ChevronDown, ChevronRight, Download } from "lucide-react";
import * as XLSX from "xlsx";
import {
  AdminPageHeader, AdminCard, AdminBadge, TableShell, Th, Td, rupee,
} from "@/components/admin/ui";
import { type OrderStatus } from "@/lib/vendor-data";
import { useOrders, setOrderStatus } from "@/lib/orders-store";
import { useAllProducts } from "@/lib/products-store";
import { OrderItemBreakdown, SkuPill } from "@/components/admin/pack-breakdown";


function RouteHead() {
  return (
    <Helmet>
      <title>{"Orders — Super Admin"}</title>
    </Helmet>
  );
}

export default OrdersPage;


const STATUSES: OrderStatus[] = ["Pending", "Packed", "Shipped", "Delivered", "Cancelled"];
const PAYMENTS = ["UPI", "Card", "Net Banking", "COD"] as const;

type TimeFilter = "All time" | "Last 24 hours" | "Last 7 days" | "Last 30 days";
const TIME_FILTERS: TimeFilter[] = ["All time", "Last 24 hours", "Last 7 days", "Last 30 days"];

function getTimeThreshold(filter: TimeFilter): Date | null {
  const now = new Date();
  if (filter === "Last 24 hours") return new Date(now.getTime() - 24 * 60 * 60 * 1000);
  if (filter === "Last 7 days")   return new Date(now.getTime() - 7  * 24 * 60 * 60 * 1000);
  if (filter === "Last 30 days")  return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
  return null;
}

function buildPackBreakdown(items: any[], products: any[]): string {
  return items
    .map((i) => {
      const product = products.find((p) => p.id === i.productId);
      const sku = product?.sku ? `[${product.sku}]` : "";
      const lineTotal = `₹${(i.unitPrice * i.qty).toLocaleString("en-IN")}`;
      return `${i.name} ${sku} | ${i.weight} × ${i.qty} | ${lineTotal}`;
    })
    .join("\n");
}

function downloadOrdersExcel(orders: any[], products: any[]) {
  // Sheet 1: one row per order
  const orderRows = orders.map((o) => ({
    "Order ID": o.id,
    "Items & Pack Breakdown": buildPackBreakdown(o.items, products),
    "Customer Name": o.customer.name,
    "Phone": o.customer.phone ?? "",
    "Address Line": o.address.line,
    "City": o.address.city,
    "State": o.address.state,
    "Pincode": o.address.pincode,
    "Items Count": o.items.length,
    "Amount (₹)": o.amount,
    "Status": o.status,
    "Payment Method": o.paymentMethod ?? "",
    "Courier": o.courier ?? "",
    "Tracking Number": o.tracking ?? "",
    "Placed At": new Date(o.placedAt).toLocaleString("en-IN", {
      day: "numeric", month: "short", year: "numeric",
      hour: "2-digit", minute: "2-digit",
    }),
  }));

  // Sheet 2: one row per order item (flat)
  const itemRows = orders.flatMap((o) =>
    o.items.map((i: any) => {
      const product = products.find((p) => p.id === i.productId);
      return {
        "Order ID": o.id,
        "Customer Name": o.customer.name,
        "Order Status": o.status,
        "Placed At": new Date(o.placedAt).toLocaleString("en-IN", {
          day: "numeric", month: "short", year: "numeric",
          hour: "2-digit", minute: "2-digit",
        }),
        "Product Name": i.name,
        "SKU": product?.sku ?? "",
        "Product ID": i.productId,
        "Weight": i.weight,
        "Qty": i.qty,
        "Unit Price (₹)": i.unitPrice,
        "Line Total (₹)": i.unitPrice * i.qty,
        "Courier": o.courier ?? "",
        "Tracking": o.tracking ?? "",
      };
    })
  );

  // Sheet 3: aggregate quantity per product + weight combination
  const summaryMap = new Map<string, {
    productName: string;
    sku: string;
    weight: string;
    totalQty: number;
    totalRevenue: number;
    orderCount: number;
  }>();

  for (const o of orders) {
    for (const i of o.items) {
      const product = products.find((p) => p.id === i.productId);
      const key = `${i.productId}__${i.weight}`;
      if (!summaryMap.has(key)) {
        summaryMap.set(key, {
          productName: i.name,
          sku: product?.sku ?? "",
          weight: i.weight,
          totalQty: 0,
          totalRevenue: 0,
          orderCount: 0,
        });
      }
      const entry = summaryMap.get(key)!;
      entry.totalQty += i.qty;
      entry.totalRevenue += i.unitPrice * i.qty;
      entry.orderCount += 1;
    }
  }

  const summaryData = [...summaryMap.values()].sort((a, b) => b.totalQty - a.totalQty);

  const summaryRows: Record<string, any>[] = summaryData.map((s) => ({
    "Product Name": s.productName,
    "SKU": s.sku,
    "Weight": s.weight,
    "Total Qty Ordered": s.totalQty,
    "No. of Orders": s.orderCount,
    "Total Revenue (₹)": s.totalRevenue,
  }));

  // Totals row
  summaryRows.push({
    "Product Name": "TOTAL",
    "SKU": "",
    "Weight": "",
    "Total Qty Ordered": summaryData.reduce((acc, r) => acc + r.totalQty, 0),
    "No. of Orders": summaryData.reduce((acc, r) => acc + r.orderCount, 0),
    "Total Revenue (₹)": summaryData.reduce((acc, r) => acc + r.totalRevenue, 0),
  });

  const wb = XLSX.utils.book_new();

  // Write Sheet 1
  const ws1 = XLSX.utils.json_to_sheet(orderRows);
  ws1["!cols"] = Object.keys(orderRows[0] ?? {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...orderRows.map((r: any) => {
        const lines = String(r[key] ?? "").split("\n");
        return Math.max(...lines.map((l) => l.length));
      })
    ) + 2,
  }));
  orderRows.forEach((_, rowIdx) => {
    const cellRef = `B${rowIdx + 2}`;
    if (ws1[cellRef]) {
      ws1[cellRef].s = { alignment: { wrapText: true, vertical: "top" } };
    }
  });
  XLSX.utils.book_append_sheet(wb, ws1, "Orders");

  // Write Sheet 2
  const ws2 = XLSX.utils.json_to_sheet(itemRows);
  ws2["!cols"] = Object.keys(itemRows[0] ?? {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...itemRows.map((r: any) => String(r[key] ?? "").length)
    ) + 2,
  }));
  XLSX.utils.book_append_sheet(wb, ws2, "Order Items");

  // Write Sheet 3
  const ws3 = XLSX.utils.json_to_sheet(summaryRows);
  ws3["!cols"] = Object.keys(summaryRows[0] ?? {}).map((key) => ({
    wch: Math.max(
      key.length,
      ...summaryRows.map((r: any) => String(r[key] ?? "").length)
    ) + 2,
  }));
  // Bold the TOTAL row
  const totalRowIndex = summaryRows.length + 1; // +1 for header row (1-based)
  Object.keys(summaryRows[0] ?? {}).forEach((_, colIdx) => {
    const col = String.fromCharCode(65 + colIdx);
    const cellRef = `${col}${totalRowIndex}`;
    if (ws3[cellRef]) ws3[cellRef].s = { font: { bold: true } };
  });
  XLSX.utils.book_append_sheet(wb, ws3, "Product Summary");

  const timestamp = new Date().toISOString().slice(0, 10);
  XLSX.writeFile(wb, `thayilam-orders-${timestamp}.xlsx`);
}

function OrdersPage() {
  const ordersList = useOrders();
  const products = useAllProducts();
  const [q, setQ] = useState("");
  const [status, setStatus] = useState<"All" | OrderStatus>("All");
  const [payment, setPayment] = useState<string>("All");
  const [timeFilter, setTimeFilter] = useState<TimeFilter>("All time");
  const [openId, setOpenId] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const threshold = getTimeThreshold(timeFilter);
    return ordersList.filter((o) => {
      if (status !== "All" && o.status !== status) return false;
      if (q && !o.id.toLowerCase().includes(q.toLowerCase()) && !o.customer.name.toLowerCase().includes(q.toLowerCase())) return false;
      if (threshold && new Date(o.placedAt) < threshold) return false;
      return true;
    });
  }, [ordersList, q, status, payment, timeFilter]);

  const isTimeFiltered = timeFilter !== "All time";

  return (
    <>
      <RouteHead />
      <>
      <AdminPageHeader
        title="Orders"
        subtitle="Every order across the store — filter, override, refund."
        actions={
          <div className="flex items-center gap-3">
            <span className="text-xs text-slate-500">{filtered.length} orders</span>
            <button
              onClick={() => downloadOrdersExcel(filtered, products)}
              disabled={filtered.length === 0}
              className="inline-flex items-center gap-1.5 h-8 px-3 rounded-md border border-slate-200 bg-white hover:bg-slate-50 text-xs font-medium text-slate-700 disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
            >
              <Download size={13} />
              {isTimeFiltered ? `Export (${filtered.length})` : "Export Excel"}
            </button>
          </div>
        }
      />

      <AdminCard padding={false}>
        <div className="p-4 border-b border-slate-100 grid sm:grid-cols-4 gap-3">
          <div className="relative">
            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400" />
            <input
              value={q}
              onChange={(e) => setQ(e.target.value)}
              placeholder="Order ID or customer…"
              className="w-full h-9 pl-9 pr-3 rounded-md border border-slate-200 text-sm bg-slate-50 focus:bg-white focus:outline-none"
            />
          </div>
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value as "All" | OrderStatus)}
            className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white focus:outline-none"
          >
            <option>All</option>
            {STATUSES.map((s) => <option key={s}>{s}</option>)}
          </select>
          <select
            value={payment}
            onChange={(e) => setPayment(e.target.value)}
            className="h-9 px-3 rounded-md border border-slate-200 text-sm bg-white focus:outline-none"
          >
            <option value="All">All payments</option>
            {PAYMENTS.map((p) => <option key={p}>{p}</option>)}
          </select>
          <select
            value={timeFilter}
            onChange={(e) => setTimeFilter(e.target.value as TimeFilter)}
            className={`h-9 px-3 rounded-md border text-sm focus:outline-none transition-colors ${
              isTimeFiltered
                ? "border-amber-400 bg-amber-50 text-amber-800 font-medium"
                : "border-slate-200 bg-white text-slate-700"
            }`}
          >
            {TIME_FILTERS.map((t) => <option key={t}>{t}</option>)}
          </select>
        </div>

        {isTimeFiltered && (
          <div className="px-4 py-2 bg-amber-50 border-b border-amber-100 flex items-center justify-between">
            <span className="text-xs text-amber-700">
              Showing <span className="font-semibold">{filtered.length}</span> orders from{" "}
              <span className="font-semibold">{timeFilter.toLowerCase()}</span>
            </span>
            <button
              onClick={() => setTimeFilter("All time")}
              className="text-xs text-amber-600 hover:text-amber-900 underline underline-offset-2"
            >
              Clear
            </button>
          </div>
        )}

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
                              {o.items.map((i: any, idx: number) => {
                                const product = products.find((p) => p.id === i.productId);
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
              <tr><Td className="text-center text-slate-400 py-10">No orders match your filters.</Td></tr>
            )}
          </tbody>
        </TableShell>
      </AdminCard>
    </>
    </>
  );
}