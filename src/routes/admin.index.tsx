import { Link } from "@/lib/router-compat";
import { Helmet } from "react-helmet-async";
import {
  ShoppingCart, TrendingUp, AlertTriangle,
  ArrowRight, Flag,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  AdminPageHeader, AdminCard, AdminMetric, AdminBadge, rupee, rupeeShort,
} from "@/components/admin/ui";
import { useAllProducts, useApprovals, useFlagged } from "@/lib/products-store";
import { useAnalytics } from "@/lib/analytics-store";

function RouteHead() {
  return (
    <Helmet>
      <title>{"Dashboard — Super Admin"}</title>
    </Helmet>
  );
}

export default DashboardPage;

function DashboardPage() {
  const products = useAllProducts();
  const approvals = useApprovals();
  const flagged = useFlagged();
  const analytics = useAnalytics();

  const pending = Object.values(approvals).filter((s) => s === "Pending").length;
  const flaggedProducts = products.filter((p) => flagged.has(p.id)).slice(0, 4);
  const pendingProducts = products
    .filter((p) => approvals[p.id] === "Pending")
    .slice(0, 4);

  const chartData = analytics.ordersByDay.map((d) => ({
    date: d.date.slice(5),
    orders: d.orders,
  }));

  return (
    <>
      <RouteHead />
      <AdminPageHeader
        title="Platform overview"
        subtitle="Live snapshot of products and orders across Thayilam."
      />

      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
        <AdminMetric label="Total products" value={products.length} hint="in catalog" />
        <AdminMetric label="Orders today" value={analytics.ordersToday} hint="last 24h" tone="rust" />
        <AdminMetric label="GMV (this month)" value={rupeeShort(analytics.gmvThisMonth)} hint="month to date" tone="olive" />
        <AdminMetric
          label="Pending approvals"
          value={pending}
          hint="products awaiting moderation"
          tone="amber"
          badge={pending > 0 && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              Action
            </span>
          )}
        />
      </div>

      <AdminCard className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Orders per day</h2>
            <p className="text-xs text-slate-500 mt-0.5">Last 30 days · {analytics.totalOrders30d} orders</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-emerald-600 font-medium">{rupeeShort(analytics.totalGmv30d)}</span> GMV
          </div>
        </div>
        <div className="h-64 -ml-2">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={chartData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="orderFill" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#C4541A" stopOpacity={0.25} />
                  <stop offset="100%" stopColor="#C4541A" stopOpacity={0} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
              <XAxis dataKey="date" tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} interval={3} />
              <YAxis tick={{ fontSize: 11, fill: "#64748B" }} axisLine={false} tickLine={false} width={32} />
              <Tooltip
                contentStyle={{ background: "#fff", border: "1px solid #E2E8F0", borderRadius: 6, fontSize: 12 }}
                labelStyle={{ color: "#0F172A", fontWeight: 600 }}
              />
              <Area type="monotone" dataKey="orders" stroke="#C4541A" strokeWidth={2} fill="url(#orderFill)" />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </AdminCard>

      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <AdminCard padding={false}>
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Top selling products</h3>
              <p className="text-xs text-slate-500 mt-0.5">By revenue, last 30 days</p>
            </div>
            <Link to="/admin/products" className="text-xs text-[#C4541A] hover:underline inline-flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          {analytics.topProducts.length === 0 ? (
            <div className="p-8 text-center text-sm text-slate-400 flex flex-col items-center gap-2">
              <ShoppingCart size={20} className="text-slate-300" />
              No sales recorded yet.
            </div>
          ) : (
            <ul>
              {analytics.topProducts.map((p, i) => {
                const prod = products.find((pp) => pp.id === p.productId);
                return (
                  <li key={p.productId || p.name} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0">
                    <div className="text-xs font-mono text-slate-400 w-5">{i + 1}</div>
                    <div className="h-9 w-9 rounded-md bg-slate-100 grid place-items-center overflow-hidden">
                      {prod?.img && <img src={prod.img} alt={p.name} className="h-7 w-7 object-contain" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-slate-900 truncate">{p.name}</div>
                      <div className="text-xs text-slate-500 truncate">{prod?.category ?? "—"}</div>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-semibold text-slate-900 tabular-nums">{p.units}</div>
                      <div className="text-[11px] text-slate-500 tabular-nums">{rupee(p.revenue)}</div>
                    </div>
                  </li>
                );
              })}
            </ul>
          )}
        </AdminCard>

        <AdminCard padding={false}>
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <AlertTriangle size={16} className="text-amber-500" />
              <h3 className="text-sm font-semibold text-slate-900">Needs your attention</h3>
            </div>
            <span className="text-[11px] text-slate-500">
              {flaggedProducts.length + pendingProducts.length} items
            </span>
          </div>
          <div className="grid sm:grid-cols-2 divide-y sm:divide-y-0 sm:divide-x divide-slate-100">
            <AlertColumn
              icon={<Flag size={14} className="text-rose-500" />}
              title="Flagged products"
              count={flaggedProducts.length}
              items={flaggedProducts.map((p) => ({
                primary: p.name,
                secondary: `${p.category} · awaiting review`,
                status: "Pending",
              }))}
              cta={{ to: "/admin/products", label: "Moderate products" }}
            />
            <AlertColumn
              icon={<AlertTriangle size={14} className="text-amber-500" />}
              title="Pending approvals"
              count={pendingProducts.length}
              items={pendingProducts.map((p) => ({
                primary: p.name,
                secondary: `${p.category} · ${rupee(p.price)}`,
                status: "Pending",
              }))}
              cta={{ to: "/admin/products", label: "Review now" }}
            />
          </div>
        </AdminCard>
      </div>
    </>
  );
}

function AlertColumn({
  icon, title, count, items, cta,
}: {
  icon: React.ReactNode;
  title: string;
  count: number;
  items: { primary: string; secondary: string; status: string }[];
  cta: { to: string; label: string };
}) {
  return (
    <div className="p-4">
      <div className="flex items-center justify-between mb-3">
        <div className="flex items-center gap-2">
          {icon}
          <span className="text-xs font-semibold text-slate-700 uppercase tracking-wider">{title}</span>
        </div>
        <span className="text-[11px] font-semibold text-slate-900 bg-slate-100 px-1.5 py-0.5 rounded">{count}</span>
      </div>
      {items.length === 0 ? (
        <div className="text-xs text-slate-400 italic py-4 text-center">All clear</div>
      ) : (
        <ul className="space-y-2 mb-3">
          {items.map((i, idx) => (
            <li key={idx} className="flex items-start justify-between gap-2 text-xs">
              <div className="min-w-0 flex-1">
                <div className="text-slate-900 font-medium truncate">{i.primary}</div>
                <div className="text-slate-500 truncate">{i.secondary}</div>
              </div>
              <AdminBadge status={i.status} />
            </li>
          ))}
        </ul>
      )}
      <Link
        to={cta.to as "/admin/products"}
        className="text-xs text-[#C4541A] hover:underline inline-flex items-center gap-1"
      >
        {cta.label} <ArrowRight size={11} />
      </Link>
    </div>
  );
}
