import { createFileRoute, Link } from "@tanstack/react-router";
import {
  Store, Package, ShoppingCart, TrendingUp, AlertTriangle,
  Plus, ArrowRight, Flag, CreditCard, UserPlus,
} from "lucide-react";
import {
  AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer, CartesianGrid,
} from "recharts";
import {
  AdminPageHeader, AdminCard, AdminMetric, AdminBadge, rupee, rupeeShort,
} from "@/components/admin/ui";
import {
  ORDERS_BY_DAY, platformGMVThisMonth, ordersToday, pendingApprovalsCount,
  topSellingProducts, topEarningVendors, FAILED_PAYMENTS,
} from "@/lib/admin-data";
import { useAdminVendors, useApprovals } from "@/lib/admin-store";
import { PRODUCTS } from "@/lib/products";

export const Route = createFileRoute("/admin/")({
  head: () => ({ meta: [{ title: "Dashboard — Super Admin" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const vendors = useAdminVendors();
  const approvals = useApprovals();
  const pending = pendingApprovalsCount();
  const pendingVendors = vendors.filter((v) => v.status === "Pending");
  const flaggedIds = Object.entries(approvals).filter(([, s]) => s === "Pending").map(([id]) => id);
  const flaggedProducts = PRODUCTS.filter((p) => flaggedIds.includes(p.id)).slice(0, 3);

  const top = topSellingProducts(5);
  const earners = topEarningVendors(5);
  const gmv = platformGMVThisMonth();

  const chartData = ORDERS_BY_DAY.map((d) => ({
    date: d.date.slice(5), // MM-DD
    orders: d.orders,
  }));

  return (
    <>
      <AdminPageHeader
        title="Platform overview"
        subtitle="Live snapshot of vendors, products and orders across Thayilam."
        actions={
          <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-[#C4541A] hover:bg-[#a8470e] text-white text-sm font-medium">
            <Plus size={14} /> Invite vendor
          </button>
        }
      />

      {/* Metrics */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3 mb-6">
        <AdminMetric label="Total vendors" value={vendors.length} hint={`${vendors.filter(v => v.status === "Active").length} active`} tone="olive" />
        <AdminMetric label="Total products" value={PRODUCTS.length} hint="across 7 categories" />
        <AdminMetric label="Orders today" value={ordersToday()} hint="last 24h" tone="rust" />
        <AdminMetric label="Platform GMV (mo)" value={rupeeShort(gmv)} hint="this month" tone="olive" />
        <AdminMetric
          label="Pending approvals"
          value={pending}
          hint="vendors + products"
          tone="amber"
          badge={pending > 0 && (
            <span className="text-[10px] font-semibold uppercase tracking-wider text-amber-700 bg-amber-50 px-1.5 py-0.5 rounded">
              Action
            </span>
          )}
        />
      </div>

      {/* Chart */}
      <AdminCard className="mb-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-base font-semibold text-slate-900">Orders per day</h2>
            <p className="text-xs text-slate-500 mt-0.5">Last 30 days · platform-wide</p>
          </div>
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <TrendingUp size={14} className="text-emerald-600" />
            <span className="text-emerald-600 font-medium">+18.4%</span> vs prev 30d
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

      {/* Two tables */}
      <div className="grid lg:grid-cols-2 gap-4 mb-6">
        <AdminCard padding={false}>
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Top selling products</h3>
              <p className="text-xs text-slate-500 mt-0.5">By units sold this month</p>
            </div>
            <Link to="/admin/products" className="text-xs text-[#C4541A] hover:underline inline-flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <ul>
            {top.map((p, i) => (
              <li key={p.id} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0">
                <div className="text-xs font-mono text-slate-400 w-5">{i + 1}</div>
                <div className="h-9 w-9 rounded-md bg-slate-100 grid place-items-center overflow-hidden">
                  <img src={p.img} alt={p.name} className="h-7 w-7 object-contain" />
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{p.name}</div>
                  <div className="text-xs text-slate-500 truncate">{p.vendor}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 tabular-nums">{p.sales}</div>
                  <div className="text-[11px] text-slate-500 tabular-nums">{rupee(p.revenue)}</div>
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard padding={false}>
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div>
              <h3 className="text-sm font-semibold text-slate-900">Top earning vendors</h3>
              <p className="text-xs text-slate-500 mt-0.5">By revenue last month</p>
            </div>
            <Link to="/admin/vendors" className="text-xs text-[#C4541A] hover:underline inline-flex items-center gap-1">
              View all <ArrowRight size={12} />
            </Link>
          </div>
          <ul>
            {earners.map((v, i) => (
              <li key={v.name} className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 last:border-0">
                <div className="text-xs font-mono text-slate-400 w-5">{i + 1}</div>
                <div className="h-9 w-9 rounded-full bg-[#6B7C4A]/10 text-[#6B7C4A] grid place-items-center text-xs font-semibold">
                  {v.name.slice(0, 1)}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-slate-900 truncate">{v.name}</div>
                  <div className="text-xs text-slate-500 truncate">{v.city} · ★ {v.rating}</div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-slate-900 tabular-nums">{rupee(v.monthlyRevenue)}</div>
                  <div className="text-[11px] text-slate-500">{v.commissionPct}% comm.</div>
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>

      {/* Alerts */}
      <AdminCard padding={false}>
        <div className="flex items-center justify-between p-4 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <AlertTriangle size={16} className="text-amber-500" />
            <h3 className="text-sm font-semibold text-slate-900">Needs your attention</h3>
          </div>
          <span className="text-[11px] text-slate-500">
            {pendingVendors.length + flaggedProducts.length + FAILED_PAYMENTS.length} items
          </span>
        </div>
        <div className="grid md:grid-cols-3 divide-y md:divide-y-0 md:divide-x divide-slate-100">
          <AlertColumn
            icon={<UserPlus size={14} className="text-amber-600" />}
            title="New vendor approvals"
            count={pendingVendors.length}
            items={pendingVendors.map((v) => ({
              primary: v.name,
              secondary: `${v.city} · joined ${new Date(v.joinedAt).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}`,
              status: "Pending",
            }))}
            cta={{ to: "/admin/vendors", label: "Review vendors" }}
          />
          <AlertColumn
            icon={<Flag size={14} className="text-rose-500" />}
            title="Flagged products"
            count={flaggedProducts.length}
            items={flaggedProducts.map((p) => ({
              primary: p.name,
              secondary: `${p.vendor} · awaiting moderation`,
              status: "Pending",
            }))}
            cta={{ to: "/admin/products", label: "Moderate products" }}
          />
          <AlertColumn
            icon={<CreditCard size={14} className="text-rose-500" />}
            title="Failed payments"
            count={FAILED_PAYMENTS.length}
            items={FAILED_PAYMENTS.map((f) => ({
              primary: `${f.orderId} · ${rupee(f.amount)}`,
              secondary: `${f.customer} · ${f.reason}`,
              status: "Cancelled",
            }))}
            cta={{ to: "/admin/orders", label: "Open orders" }}
          />
        </div>
      </AdminCard>
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
        to={cta.to as "/admin/vendors"}
        className="text-xs text-[#C4541A] hover:underline inline-flex items-center gap-1"
      >
        {cta.label} <ArrowRight size={11} />
      </Link>
    </div>
  );
}
