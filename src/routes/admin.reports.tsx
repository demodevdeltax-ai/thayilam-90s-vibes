import {  } from "@/lib/router-compat";
import { Helmet } from "react-helmet-async";
import { Download, FileText, BarChart3, TrendingUp, Users, Package } from "lucide-react";
import {
  BarChart, Bar, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
  PieChart, Pie, Cell, Legend,
} from "recharts";
import { AdminPageHeader, AdminCard, rupee, rupeeShort } from "@/components/admin/ui";
import { ORDERS_BY_DAY, topSellingProducts } from "@/lib/admin-data";
import { PRODUCTS, CATEGORIES } from "@/lib/products";


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
  const top = topSellingProducts(8);
  const last14 = ORDERS_BY_DAY.slice(-14).map((d) => ({
    date: d.date.slice(8),
    gmv: Math.round(d.gmv / 100) / 10, // ₹k
  }));

  const catData = CATEGORIES.map((c) => ({
    name: c,
    value: PRODUCTS.filter((p) => p.category === c).length,
  }));

  const reports = [
    { name: "GMV report — April 2025", type: "PDF", size: "246 KB" },
    { name: "Customer retention — March 2025", type: "PDF", size: "318 KB" },
    { name: "Inventory snapshot — 23 Apr 2025", type: "XLSX", size: "194 KB" },
    { name: "Failed payments audit — April 2025", type: "CSV", size: "12 KB" },
  ];

  return (
    <>
      <RouteHead />
      <>
      <AdminPageHeader
        title="Reports"
        subtitle="Analytics, breakdowns and downloadable exports."
        actions={
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium">
            <Download size={14} /> New export
          </button>
        }
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-5">
        <AdminCard className="border-l-4 border-l-[#C4541A]">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium flex items-center gap-1.5"><TrendingUp size={11} /> 30-day GMV</div>
          <div className="text-[24px] font-semibold mt-1 tabular-nums">{rupeeShort(ORDERS_BY_DAY.reduce((s, d) => s + d.gmv, 0))}</div>
        </AdminCard>
        <AdminCard className="border-l-4 border-l-[#6B7C4A]">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium flex items-center gap-1.5"><Users size={11} /> AOV</div>
          <div className="text-[24px] font-semibold mt-1 tabular-nums">{rupee(Math.round(ORDERS_BY_DAY.reduce((s, d) => s + d.gmv, 0) / ORDERS_BY_DAY.reduce((s, d) => s + d.orders, 0)))}</div>
        </AdminCard>
        <AdminCard className="border-l-4 border-l-slate-300">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium flex items-center gap-1.5"><Package size={11} /> Active SKUs</div>
          <div className="text-[24px] font-semibold mt-1 tabular-nums">{PRODUCTS.length}</div>
        </AdminCard>
        <AdminCard className="border-l-4 border-l-amber-500">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium flex items-center gap-1.5"><BarChart3 size={11} /> Categories</div>
          <div className="text-[24px] font-semibold mt-1 tabular-nums">{CATEGORIES.length}</div>
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
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={catData} dataKey="value" nameKey="name" innerRadius={42} outerRadius={70} paddingAngle={2}>
                  {catData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i % PIE_COLORS.length]} />)}
                </Pie>
                <Legend wrapperStyle={{ fontSize: 11 }} iconSize={8} />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>
      </div>

      <div className="grid lg:grid-cols-2 gap-4">
        <AdminCard>
          <h3 className="text-sm font-semibold text-slate-900 mb-4">Top products (last month)</h3>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={top} layout="vertical" margin={{ top: 0, right: 16, left: 0, bottom: 0 }}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" horizontal={false} />
                <XAxis type="number" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} />
                <YAxis dataKey="name" type="category" tick={{ fontSize: 11, fill: "#475569" }} axisLine={false} tickLine={false} width={130} />
                <Tooltip
                  contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 12 }}
                  formatter={(v: number) => rupee(v as number)}
                />
                <Bar dataKey="revenue" fill="#C4541A" radius={[0, 3, 3, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </AdminCard>

        <AdminCard padding={false}>
          <div className="p-4 border-b border-slate-100">
            <h3 className="text-sm font-semibold text-slate-900">Recent exports</h3>
            <p className="text-xs text-slate-500 mt-0.5">Generated reports ready to download.</p>
          </div>
          <ul className="divide-y divide-slate-100">
            {reports.map((r, i) => (
              <li key={i} className="px-4 py-3 flex items-center gap-3">
                <div className="h-8 w-8 grid place-items-center rounded bg-slate-100 text-slate-500"><FileText size={14} /></div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{r.name}</div>
                  <div className="text-[11px] text-slate-500">{r.type} · {r.size}</div>
                </div>
                <button className="h-8 w-8 grid place-items-center rounded-md hover:bg-slate-100 text-slate-500">
                  <Download size={14} />
                </button>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </>
    </>
  );
}
