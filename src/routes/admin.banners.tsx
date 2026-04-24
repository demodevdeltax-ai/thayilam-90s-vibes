import { createFileRoute } from "@tanstack/react-router";
import { Plus, Megaphone, Tag } from "lucide-react";
import { AdminPageHeader, AdminCard, AdminBadge } from "@/components/admin/ui";
import { useBanners, useOffers, toggleBanner, toggleOffer } from "@/lib/admin-store";
import { Switch } from "@/components/ui/switch";

export const Route = createFileRoute("/admin/banners")({
  head: () => ({ meta: [{ title: "Banners & Offers — Super Admin" }] }),
  component: BannersPage,
});

function BannersPage() {
  const banners = useBanners();
  const offers = useOffers();

  return (
    <>
      <AdminPageHeader
        title="Banners & offers"
        subtitle="Run promotions across the homepage, categories and cart."
        actions={
          <button className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-[#C4541A] hover:bg-[#a8470e] text-white text-sm font-medium">
            <Plus size={14} /> New campaign
          </button>
        }
      />

      <div className="grid lg:grid-cols-2 gap-4">
        <AdminCard padding={false}>
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Megaphone size={15} className="text-[#C4541A]" />
              <h3 className="text-sm font-semibold text-slate-900">Banners</h3>
            </div>
            <span className="text-xs text-slate-500">{banners.filter((b) => b.active).length} live</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {banners.map((b) => (
              <li key={b.id} className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <h4 className="text-sm font-semibold text-slate-900">{b.title}</h4>
                    <span className="text-[10px] uppercase font-semibold tracking-wider bg-slate-100 text-slate-700 px-1.5 py-0.5 rounded">{b.placement}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-0.5">{b.subtitle}</p>
                  <div className="text-[11px] text-slate-400 mt-2">
                    {b.startsAt} → {b.endsAt} · CTA: <span className="text-slate-600 font-medium">{b.cta}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <AdminBadge status={b.active ? "Active" : "Suspended"} />
                  <Switch checked={b.active} onCheckedChange={() => toggleBanner(b.id)} />
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>

        <AdminCard padding={false}>
          <div className="flex items-center justify-between p-4 border-b border-slate-100">
            <div className="flex items-center gap-2">
              <Tag size={15} className="text-[#6B7C4A]" />
              <h3 className="text-sm font-semibold text-slate-900">Promo codes</h3>
            </div>
            <span className="text-xs text-slate-500">{offers.filter((o) => o.active).length} live</span>
          </div>
          <ul className="divide-y divide-slate-100">
            {offers.map((o) => (
              <li key={o.id} className="p-4 flex items-start gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="font-mono text-sm font-semibold bg-slate-900 text-white px-2 py-0.5 rounded">{o.code}</span>
                    <span className="text-sm font-semibold text-slate-900">{o.discount}</span>
                  </div>
                  <p className="text-xs text-slate-600 mt-1">{o.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-slate-100 rounded-full overflow-hidden">
                      <div className="h-full bg-[#C4541A]" style={{ width: `${Math.min(100, (o.used / o.cap) * 100)}%` }} />
                    </div>
                    <span className="text-[11px] text-slate-500 tabular-nums whitespace-nowrap">{o.used} / {o.cap}</span>
                  </div>
                </div>
                <div className="flex flex-col items-end gap-2">
                  <AdminBadge status={o.active ? "Active" : "Suspended"} />
                  <Switch checked={o.active} onCheckedChange={() => toggleOffer(o.id)} />
                </div>
              </li>
            ))}
          </ul>
        </AdminCard>
      </div>
    </>
  );
}
