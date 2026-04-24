import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Save } from "lucide-react";
import { PageHeader, VendorCard } from "@/components/vendor/ui";
import { Button } from "@/components/ui/button";
import { Switch } from "@/components/ui/switch";
import { ACTIVE_VENDOR } from "@/lib/vendor-data";

export const Route = createFileRoute("/vendor/settings")({
  head: () => ({ meta: [{ title: "Store Settings — Vendor Panel" }] }),
  component: SettingsPage,
});

function SettingsPage() {
  const [form, setForm] = useState({
    storeName: ACTIVE_VENDOR,
    tagline: "Recipes from a 1992 Madurai kitchen.",
    city: "Chennai",
    state: "Tamil Nadu",
    phone: "+91 98400 11223",
    email: "paati@thayilam.in",
    upi: "paati@okhdfcbank",
    accept: true,
    holiday: false,
  });

  return (
    <>
      <PageHeader title="Store settings" subtitle="The bits a customer sees about your kitchen." />

      <div className="grid lg:grid-cols-3 gap-4">
        <VendorCard className="lg:col-span-2">
          <h2 className="text-base font-semibold text-[#1f1d1a]">Store profile</h2>
          <p className="text-xs text-[#7a766c] mt-0.5">Shown on every product detail page.</p>
          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <Field label="Store name">
              <input value={form.storeName} onChange={(e) => setForm({ ...form, storeName: e.target.value })} maxLength={60} className="vinp" />
            </Field>
            <Field label="Tagline">
              <input value={form.tagline} onChange={(e) => setForm({ ...form, tagline: e.target.value })} maxLength={120} className="vinp" />
            </Field>
            <Field label="City">
              <input value={form.city} onChange={(e) => setForm({ ...form, city: e.target.value })} maxLength={60} className="vinp" />
            </Field>
            <Field label="State">
              <input value={form.state} onChange={(e) => setForm({ ...form, state: e.target.value })} maxLength={60} className="vinp" />
            </Field>
            <Field label="Phone">
              <input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} maxLength={20} className="vinp" />
            </Field>
            <Field label="Email">
              <input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} maxLength={120} className="vinp" />
            </Field>
            <Field label="Payout UPI" className="sm:col-span-2">
              <input value={form.upi} onChange={(e) => setForm({ ...form, upi: e.target.value })} maxLength={60} className="vinp" />
            </Field>
          </div>

          <div className="mt-5 flex justify-end">
            <Button className="rounded-full bg-[#C4541A] hover:bg-[#a8470e] text-white">
              <Save size={14} className="mr-1.5" /> Save changes
            </Button>
          </div>
        </VendorCard>

        <div className="space-y-4">
          <VendorCard>
            <h3 className="text-sm font-semibold text-[#1f1d1a]">Availability</h3>
            <p className="text-xs text-[#7a766c] mt-1">Pause the kitchen when you need a quiet day.</p>
            <Toggle
              label="Accepting orders"
              description="Customers can buy your products"
              value={form.accept}
              onChange={(v) => setForm({ ...form, accept: v })}
            />
            <Toggle
              label="Holiday mode"
              description="Hide store from search until you're back"
              value={form.holiday}
              onChange={(v) => setForm({ ...form, holiday: v })}
            />
          </VendorCard>

          <VendorCard className="bg-[#FAF7EE]">
            <h3 className="text-sm font-semibold text-[#1f1d1a]">Verification</h3>
            <p className="text-xs text-[#7a766c] mt-1">Your FSSAI is verified ✓</p>
            <div className="mt-3 text-[11px] text-[#9b9789] font-mono">FSSAI · 12420019000453</div>
          </VendorCard>
        </div>
      </div>
      <style>{`
        .vinp {
          width: 100%;
          background: #fff;
          border: 1px solid #E8E6DF;
          border-radius: 0.5rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #1f1d1a;
          outline: none;
        }
        .vinp:focus { border-color: #6B7C4A; box-shadow: 0 0 0 3px rgba(107,124,74,0.18); }
      `}</style>
    </>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[11px] uppercase tracking-wider text-[#7a766c] mb-1.5">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="mt-4 flex items-start justify-between gap-4">
      <div className="min-w-0">
        <div className="text-sm font-medium text-[#1f1d1a]">{label}</div>
        <div className="text-xs text-[#7a766c] mt-0.5">{description}</div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}
