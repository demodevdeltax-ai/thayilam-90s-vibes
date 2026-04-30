import { Helmet } from "react-helmet-async";
import { useMemo } from "react";
import { Download, FileText, BarChart3, TrendingUp, Users, Package } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { AdminPageHeader, AdminCard, rupee, rupeeShort } from "@/components/admin/ui";
import { useAllProducts } from "@/lib/products-store";
import { useAnalytics } from "@/lib/analytics-store";
import { CATEGORIES } from "@/lib/products";

function RouteHead() {
  return (
    <Helmet>
      <title>{"Reports — Super Admin"}</title>
    </Helmet>
  );
}

export default ReportsPage;

const PIE_COLORS = ["#C4541A", "#6B7C4A", "#3D2310", "#A87341", "#8B9A6B", "#D17F4D", "#5B6B3F"];

function ReportsPage() {
  const products = useAllProducts();
  const analytics = useAnalytics();

  const last14 = analytics.ordersByDay.slice(-14).map((d) => ({
    date: d.date.slice(8),
    gmv: Math.round(d.gmv / 100) / 10,
  }));

  const catData = useMemo(
    () => CATEGORIES.map((c) => ({
      name: c,
      value: products.filter((p) => p.category === c).length,
    })).filter((c) => c.value > 0),
    [products],
  );

  const aov = analytics.totalOrders30d > 0
    ? Math.round(analytics.totalGmv30d / analytics.totalOrders30d)
    : 0;

  const exportCsv = () => {
    const rows = [
      ["Date", "Orders", "GMV"],
      ...analytics.ordersByDay.map((d) => [d.date, String(d.orders), String(d.gmv)]),
    ];
    const csv = rows.map((r) => r.join(",")).join("\n");
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = `gmv-30d-${new Date().toISOString().slice(0, 10)}.csv`;
    a.click();
  };

  return (
    <>
      <RouteHead />
      <AdminPageHeader
        title="Reports"
        subtitle="Live analytics from your orders, products, and customers."
        actions={
          <button
            onClick={exportCsv}
            className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium"
          >
            <Download size={14} /> Export GMV (CSV)
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <AdminCard className="border-l-4 border-l-[#C4541A]">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium flex items-center gap-1.5"><TrendingUp size={11} /> 30-day GMV</div>
          <div className="text-[24px] font-semibold mt-1 tabular-nums">{rupeeShort(analytics.totalGmv30d)}</div>
        </AdminCard>
        <AdminCard className="border-l-4 border-l-[#6B7C4A]">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium flex items-center gap-1.5"><Users size={11} /> AOV</div>
          <div className="text-[24px] font-semibold mt-1 tabular-nums">{rupee(aov)}</div>
        </AdminCard>
        <AdminCard className="border-l-4 border-l-slate-300">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium flex items-center gap-1.5"><Package size={11} /> Active SKUs</div>
          <div className="text-[24px] font-semibold mt-1 tabular-nums">{products.length}</div>
        </AdminCard>
        <AdminCard className="border-l-4 border-l-amber-500">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium flex items-center gap-1.5"><BarChart3 size={11} /> Categories</div>
          <div className="text-[24px] font-semibold mt-1 tabular-nums">{catData.length}</div>
        </AdminCard>
      </div>

      <div className="grid lg:grid-cols-3 gap-4 mb-5">
        <AdminCard className="lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-sm font-semibold text-slate-900">GMV — last 14 days (₹k)</h3>
          </div>
          <div className="h-56">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={last14} margin={{ top: 5, right: 10, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={32} />
                <Tooltip contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 12 }} />
                <Bar dataKey="gmv" fill="#6B7C4A" radius={[3, 3, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard>
          <h3 className="text-sm font-semibold text-slate-900 mb-2">Catalog mix</h3>
          <div className="h-56">
            {catData.length === 0 ? (
              <div className="h-full grid place-items-center text-sm text-slate-400">No products yet</div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie data={catData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                    {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                  </Pie>
                  <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
                </PieChart>
              </ResponsiveContainer>
            )}
          </div>
        </AdminCard>
      </div>

      <AdminCard padding={false}>
        <div className="p-4 border-b border-slate-100">
          <h3 className="text-sm font-semibold text-slate-900">Top products (last 30 days)</h3>
        </div>
        {analytics.topProducts.length === 0 ? (
          <div className="p-8 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
            <FileText size={20} className="text-slate-300" />
            No sales recorded in the last 30 days.
          </div>
        ) : (
          <ul className="divide-y divide-slate-100">
            {analytics.topProducts.map((p, i) => (
              <li key={p.productId || p.name} className="px-4 py-3 flex items-center gap-3">
                <div className="text-xs font-mono text-slate-400 w-5">{i + 1}</div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{p.name}</div>
                  <div className="text-[11px] text-slate-500">{p.units} units</div>
                </div>
                <div className="text-sm font-semibold tabular-nums">{rupee(p.revenue)}</div>
              </li>
            ))}
          </ul>
        )}
      </AdminCard>
    </>
  );
}
