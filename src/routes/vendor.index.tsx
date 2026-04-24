import { createFileRoute, Link } from "@tanstack/react-router";
import { useMemo } from "react";
import {
  ArrowUpRight,
  PackageCheck,
  Package,
  Wallet,
  Star,
  Plus,
  Eye,
  ShoppingBag,
} from "lucide-react";
import { PageHeader, StatusBadge, VendorCard, rupee } from "@/components/vendor/ui";
import { Button } from "@/components/ui/button";
import { useOrders } from "@/lib/vendor-store";

export const Route = createFileRoute("/vendor/")({
  head: () => ({ meta: [{ title: "Dashboard — Vendor Panel" }] }),
  component: DashboardPage,
});

function DashboardPage() {
  const orders = useOrders();
  const today = new Date().toDateString();

  const stats = useMemo(() => {
    const todays = orders.filter((o) => new Date(o.placedAt).toDateString() === today);
    const pending = orders.filter((o) => o.status === "Pending" || o.status === "Packed");
    const monthRev = orders
      .filter((o) => o.status !== "Cancelled" && new Date(o.placedAt).getMonth() === new Date().getMonth())
      .reduce((s, o) => s + o.amount, 0);
    return {
      today: todays.length,
      todayRevenue: todays.reduce((s, o) => s + o.amount, 0),
      pending: pending.length,
      monthRev,
      avgRating: 4.7,
    };
  }, [orders, today]);

  const recent = useMemo(
    () => [...orders].sort((a, b) => +new Date(b.placedAt) - +new Date(a.placedAt)).slice(0, 6),
    [orders],
  );

  return (
    <>
      <PageHeader
        title="Good morning, Paati 🌿"
        subtitle="Here's how the kitchen is doing today."
        actions={
          <>
            <Button asChild variant="outline" className="rounded-full">
              <Link to="/vendor/orders">
                <Eye size={15} className="mr-1.5" /> Pending orders
              </Link>
            </Button>
            <Button asChild className="rounded-full bg-[#C4541A] hover:bg-[#a8470e] text-white">
              <Link to="/vendor/products">
                <Plus size={15} className="mr-1.5" /> Add product
              </Link>
            </Button>
          </>
        }
      />

      {/* Stat cards */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          label="Today's orders"
          value={String(stats.today)}
          sub={rupee(stats.todayRevenue) + " in sales"}
          icon={<ShoppingBag size={16} />}
          accent="bg-[#FFF1E0] text-[#A4490F]"
          delta="+2 vs yesterday"
        />
        <StatCard
          label="Pending shipments"
          value={String(stats.pending)}
          sub="awaiting pack & ship"
          icon={<PackageCheck size={16} />}
          accent="bg-[#EAF2DB] text-[#4F5F33]"
          delta="2 due today"
        />
        <StatCard
          label="This month revenue"
          value={rupee(stats.monthRev)}
          sub="net of cancellations"
          icon={<Wallet size={16} />}
          accent="bg-[#E2EAF7] text-[#27447A]"
          delta="+18% MoM"
        />
        <StatCard
          label="Average rating"
          value={stats.avgRating.toFixed(1) + " ★"}
          sub="across 192 reviews"
          icon={<Star size={16} />}
          accent="bg-[#F5E8DC] text-[#7A4A1B]"
          delta="+0.1"
        />
      </div>

      {/* Recent orders + quick actions */}
      <div className="grid lg:grid-cols-3 gap-5 mt-6">
        <div className="lg:col-span-2">
          <VendorCard padding={false}>
            <div className="flex items-center justify-between p-5 border-b border-[#E8E6DF]">
              <div>
                <h2 className="text-base font-semibold text-[#1f1d1a]">Recent orders</h2>
                <p className="text-xs text-[#7a766c] mt-0.5">Latest activity from your kitchen.</p>
              </div>
              <Link to="/vendor/orders" className="text-xs uppercase tracking-wider text-[#C4541A] hover:underline inline-flex items-center gap-1">
                View all <ArrowUpRight size={13} />
              </Link>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="text-left text-[11px] uppercase tracking-wider text-[#9b9789] border-b border-[#E8E6DF]">
                    <th className="font-medium px-5 py-3">Order</th>
                    <th className="font-medium px-5 py-3">Customer</th>
                    <th className="font-medium px-5 py-3">Product</th>
                    <th className="font-medium px-5 py-3">Amount</th>
                    <th className="font-medium px-5 py-3">Status</th>
                    <th className="font-medium px-5 py-3 text-right">Action</th>
                  </tr>
                </thead>
                <tbody>
                  {recent.map((o) => (
                    <tr key={o.id} className="border-b border-[#F1EFE7] last:border-0 hover:bg-[#FAFAF7]">
                      <td className="px-5 py-3.5 font-mono text-xs text-[#4a463e]">{o.id}</td>
                      <td className="px-5 py-3.5">
                        <div className="font-medium text-[#1f1d1a]">{o.customer.name}</div>
                        <div className="text-[11px] text-[#9b9789]">{o.address.city}</div>
                      </td>
                      <td className="px-5 py-3.5 text-[#4a463e]">
                        {o.items[0].name}
                        {o.items.length > 1 && (
                          <span className="text-[11px] text-[#9b9789]"> · +{o.items.length - 1} more</span>
                        )}
                      </td>
                      <td className="px-5 py-3.5 font-medium">{rupee(o.amount)}</td>
                      <td className="px-5 py-3.5"><StatusBadge status={o.status} /></td>
                      <td className="px-5 py-3.5 text-right">
                        <Link
                          to="/vendor/orders"
                          className="inline-flex items-center gap-1 text-xs text-[#C4541A] hover:underline"
                        >
                          Manage <ArrowUpRight size={12} />
                        </Link>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </VendorCard>
        </div>

        <div className="space-y-5">
          <VendorCard>
            <div className="text-[10px] uppercase tracking-[0.22em] text-[#9b9789] mb-1">Quick actions</div>
            <h3 className="text-base font-semibold text-[#1f1d1a]">Get things done</h3>
            <div className="mt-4 space-y-2">
              <ActionRow
                to="/vendor/products"
                icon={<Plus size={15} />}
                title="Add new product"
                sub="List a fresh batch in your store"
              />
              <ActionRow
                to="/vendor/orders"
                icon={<PackageCheck size={15} />}
                title="View pending orders"
                sub={`${stats.pending} need your attention`}
              />
              <ActionRow
                to="/vendor/earnings"
                icon={<Wallet size={15} />}
                title="See earnings"
                sub="Payouts & monthly trends"
              />
            </div>
          </VendorCard>

          <VendorCard className="bg-[#FAF7EE]">
            <div className="flex items-center gap-3">
              <div className="h-10 w-10 rounded-full bg-[#6B7C4A] text-white grid place-items-center">
                <Package size={16} />
              </div>
              <div>
                <div className="text-sm font-semibold text-[#1f1d1a]">Festive season tip</div>
                <p className="text-xs text-[#7a766c] leading-relaxed mt-0.5">
                  Add a "Diwali special" tag to push your ladoos to the top of the shop.
                </p>
              </div>
            </div>
          </VendorCard>
        </div>
      </div>
    </>
  );
}

function StatCard({
  label,
  value,
  sub,
  icon,
  accent,
  delta,
}: {
  label: string;
  value: string;
  sub: string;
  icon: React.ReactNode;
  accent: string;
  delta: string;
}) {
  return (
    <VendorCard className="relative overflow-hidden">
      <div className="flex items-start justify-between">
        <div className={`h-9 w-9 rounded-lg grid place-items-center ${accent}`}>{icon}</div>
        <span className="text-[10px] uppercase tracking-wider text-[#7a766c] inline-flex items-center gap-1">
          <ArrowUpRight size={11} /> {delta}
        </span>
      </div>
      <div className="mt-5 text-2xl font-semibold tracking-tight text-[#1f1d1a]">{value}</div>
      <div className="text-xs text-[#9b9789] mt-1">{label}</div>
      <div className="text-[11px] text-[#7a766c] mt-2">{sub}</div>
    </VendorCard>
  );
}

function ActionRow({ to, icon, title, sub }: { to: string; icon: React.ReactNode; title: string; sub: string }) {
  return (
    <Link
      to={to as "/vendor"}
      className="flex items-center gap-3 p-3 rounded-lg hover:bg-[#F1EFE7] transition-colors group"
    >
      <span className="h-9 w-9 rounded-lg bg-[#F1EFE7] text-[#4a463e] grid place-items-center group-hover:bg-[#C4541A] group-hover:text-white transition-colors">
        {icon}
      </span>
      <span className="flex-1 min-w-0">
        <span className="block text-sm font-medium text-[#1f1d1a]">{title}</span>
        <span className="block text-xs text-[#9b9789]">{sub}</span>
      </span>
      <ArrowUpRight size={14} className="text-[#9b9789] group-hover:text-[#C4541A]" />
    </Link>
  );
}
