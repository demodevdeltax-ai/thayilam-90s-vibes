import { createFileRoute } from "@tanstack/react-router";
import { TrendingUp, Wallet, Download, ArrowUpRight } from "lucide-react";
import { PageHeader, VendorCard, rupee } from "@/components/vendor/ui";
import { Button } from "@/components/ui/button";
import { MONTHLY_REVENUE } from "@/lib/vendor-data";
import { useOrders } from "@/lib/vendor-store";

export const Route = createFileRoute("/vendor/earnings")({
  head: () => ({ meta: [{ title: "Earnings — Vendor Panel" }] }),
  component: EarningsPage,
});

function EarningsPage() {
  const orders = useOrders();
  const lifetime = MONTHLY_REVENUE.reduce((s, m) => s + m.revenue, 0);
  const thisMonth = MONTHLY_REVENUE[MONTHLY_REVENUE.length - 1].revenue;
  const pendingPayout = orders
    .filter((o) => o.status === "Delivered")
    .reduce((s, o) => s + o.amount, 0);
  const max = Math.max(...MONTHLY_REVENUE.map((m) => m.revenue));

  return (
    <>
      <PageHeader
        title="Earnings"
        subtitle="Your kitchen's monthly takings."
        actions={
          <Button variant="outline" className="rounded-full">
            <Download size={14} className="mr-1.5" /> Export CSV
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        <VendorCard className="lg:col-span-1">
          <div className="text-[10px] uppercase tracking-[0.22em] text-[#9b9789]">This month</div>
          <div className="mt-2 text-3xl font-semibold tracking-tight text-[#1f1d1a]">{rupee(thisMonth)}</div>
          <div className="text-xs text-[#206B44] mt-1 inline-flex items-center gap-1">
            <TrendingUp size={12} /> +18% vs last month
          </div>
          <div className="border-t border-[#E8E6DF] my-4" />
          <dl className="space-y-2 text-sm">
            <Row label="Lifetime sales" value={rupee(lifetime)} />
            <Row label="Pending payout" value={rupee(pendingPayout)} accent />
            <Row label="Next payout" value="Mon, 28 Apr" />
            <Row label="Bank account" value="HDFC ••• 4421" />
          </dl>
          <Button className="w-full mt-5 rounded-full bg-[#C4541A] hover:bg-[#a8470e] text-white">
            Withdraw {rupee(pendingPayout)}
          </Button>
        </VendorCard>

        <VendorCard className="lg:col-span-2">
          <div className="flex items-center justify-between">
            <div>
              <div className="text-[10px] uppercase tracking-[0.22em] text-[#9b9789]">Last 6 months</div>
              <h2 className="text-base font-semibold text-[#1f1d1a]">Revenue trend</h2>
            </div>
            <span className="text-xs text-[#7a766c] inline-flex items-center gap-1">
              <Wallet size={13} /> {rupee(lifetime)} lifetime
            </span>
          </div>
          <div className="mt-6 grid grid-cols-6 gap-2 items-end h-56">
            {MONTHLY_REVENUE.map((m, i) => {
              const h = (m.revenue / max) * 100;
              const isLast = i === MONTHLY_REVENUE.length - 1;
              return (
                <div key={m.month} className="flex flex-col items-center gap-2 h-full justify-end">
                  <div className="text-[10px] text-[#7a766c] font-medium">{rupee(m.revenue / 1000)}k</div>
                  <div
                    className={`w-full rounded-t-md transition-all ${isLast ? "bg-[#C4541A]" : "bg-[#6B7C4A]/70 hover:bg-[#6B7C4A]"}`}
                    style={{ height: `${h}%` }}
                  />
                  <div className="text-xs text-[#4a463e]">{m.month}</div>
                </div>
              );
            })}
          </div>
        </VendorCard>
      </div>

      <VendorCard className="mt-5" padding={false}>
        <div className="p-5 border-b border-[#E8E6DF] flex items-center justify-between">
          <div>
            <h2 className="text-base font-semibold text-[#1f1d1a]">Recent payouts</h2>
            <p className="text-xs text-[#7a766c] mt-0.5">Settled to your bank every Monday.</p>
          </div>
          <a className="text-xs uppercase tracking-wider text-[#C4541A] hover:underline inline-flex items-center gap-1">
            All payouts <ArrowUpRight size={13} />
          </a>
        </div>
        <table className="w-full text-sm">
          <thead>
            <tr className="text-left text-[11px] uppercase tracking-wider text-[#9b9789] border-b border-[#E8E6DF]">
              <th className="font-medium px-5 py-3">Date</th>
              <th className="font-medium px-3 py-3">Reference</th>
              <th className="font-medium px-3 py-3">Method</th>
              <th className="font-medium px-3 py-3 text-right pr-5">Amount</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: "21 Apr 2025", ref: "PYO-9128", method: "NEFT · HDFC", amt: 28140 },
              { date: "14 Apr 2025", ref: "PYO-9098", method: "NEFT · HDFC", amt: 19620 },
              { date: "07 Apr 2025", ref: "PYO-9075", method: "NEFT · HDFC", amt: 13690 },
            ].map((p) => (
              <tr key={p.ref} className="border-b border-[#F1EFE7] last:border-0 hover:bg-[#FAFAF7]">
                <td className="px-5 py-3.5 text-[#4a463e]">{p.date}</td>
                <td className="px-3 py-3.5 font-mono text-xs">{p.ref}</td>
                <td className="px-3 py-3.5 text-[#4a463e]">{p.method}</td>
                <td className="px-3 py-3.5 font-medium text-right pr-5">{rupee(p.amt)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </VendorCard>
    </>
  );
}

function Row({ label, value, accent }: { label: string; value: string; accent?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <dt className="text-[#7a766c]">{label}</dt>
      <dd className={`font-medium ${accent ? "text-[#C4541A]" : "text-[#1f1d1a]"}`}>{value}</dd>
    </div>
  );
}
