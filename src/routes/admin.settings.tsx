import {  } from "@/lib/router-compat";
import { Helmet } from "react-helmet-async";
import { useState } from "react";
import { Save, Shield, KeyRound, Mail } from "lucide-react";
import { AdminPageHeader, AdminCard } from "@/components/admin/ui";
import { Switch } from "@/components/ui/switch";


function RouteHead() {
  return (
    <Helmet>
      <title>{"Settings — Super Admin"}</title>
    </Helmet>
  );
}

export default SettingsPage;


function SettingsPage() {
  const [form, setForm] = useState({
    platformName: "Thayilam",
    supportEmail: "support@thayilam.in",
    defaultCommission: 12,
    minPayout: 1000,
    freeShipThreshold: 999,
    twoFactor: true,
    autoApproveVendors: false,
    publicCatalog: true,
  });

  return (
    <>
      <RouteHead />
      <>
      <AdminPageHeader
        title="Platform settings"
        subtitle="The knobs that govern how Thayilam runs end to end."
      />

      <div className="grid lg:grid-cols-3 gap-4">
        <AdminCard className="lg:col-span-2">
          <h2 className="text-base font-semibold text-slate-900">General</h2>
          <p className="text-xs text-slate-500 mt-0.5">Names, defaults and thresholds.</p>
          <div className="grid sm:grid-cols-2 gap-4 mt-5">
            <Field label="Platform name">
              <input value={form.platformName} onChange={(e) => setForm({ ...form, platformName: e.target.value })} className="ainp" />
            </Field>
            <Field label="Support email">
              <input type="email" value={form.supportEmail} onChange={(e) => setForm({ ...form, supportEmail: e.target.value })} className="ainp" />
            </Field>
            <Field label="Default commission %">
              <input type="number" min={1} max={50} value={form.defaultCommission} onChange={(e) => setForm({ ...form, defaultCommission: Number(e.target.value) })} className="ainp" />
            </Field>
            <Field label="Min payout (INR)">
              <input type="number" min={0} value={form.minPayout} onChange={(e) => setForm({ ...form, minPayout: Number(e.target.value) })} className="ainp" />
            </Field>
            <Field label="Free shipping over (INR)" className="sm:col-span-2">
              <input type="number" min={0} value={form.freeShipThreshold} onChange={(e) => setForm({ ...form, freeShipThreshold: Number(e.target.value) })} className="ainp" />
            </Field>
          </div>

          <div className="mt-6">
            <h3 className="text-sm font-semibold text-slate-900 mb-3">Behaviour</h3>
            <div className="space-y-1 border border-slate-200 rounded-md divide-y divide-slate-100">
              <Toggle
                label="Auto-approve new vendors"
                description="Skip manual review for vendors with verified FSSAI"
                value={form.autoApproveVendors}
                onChange={(v) => setForm({ ...form, autoApproveVendors: v })}
              />
              <Toggle
                label="Public catalog"
                description="Allow non-logged-in shoppers to browse products"
                value={form.publicCatalog}
                onChange={(v) => setForm({ ...form, publicCatalog: v })}
              />
            </div>
          </div>

          <div className="mt-6 flex justify-end">
            <button className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-md bg-[#C4541A] hover:bg-[#a8470e] text-white text-sm font-medium">
              <Save size={14} /> Save changes
            </button>
          </div>
        </AdminCard>

        <div className="space-y-4">
          <AdminCard>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Shield size={14} /> Security</h3>
            <div className="space-y-1 mt-3 border border-slate-200 rounded-md divide-y divide-slate-100">
              <Toggle
                label="Two-factor on admin logins"
                description="Required for super admin role"
                value={form.twoFactor}
                onChange={(v) => setForm({ ...form, twoFactor: v })}
              />
            </div>
          </AdminCard>

          <AdminCard>
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><KeyRound size={14} /> API keys</h3>
            <p className="text-xs text-slate-500 mt-1">For payments, SMS and shipping integrations.</p>
            <div className="mt-3 space-y-2">
              <KeyRow name="Razorpay" mask="rzp_live_••••3F2A" />
              <KeyRow name="Delhivery" mask="dl_••••8201" />
              <KeyRow name="MSG91 (SMS)" mask="msg_••••AA12" />
            </div>
          </AdminCard>

          <AdminCard className="bg-slate-50">
            <h3 className="text-sm font-semibold text-slate-900 flex items-center gap-2"><Mail size={14} /> Notifications</h3>
            <p className="text-xs text-slate-500 mt-1">Daily ops digest goes to {form.supportEmail}</p>
          </AdminCard>
        </div>
      </div>

      <style>{`
        .ainp {
          width: 100%;
          background: #fff;
          border: 1px solid #E2E8F0;
          border-radius: 0.375rem;
          padding: 0.5rem 0.75rem;
          font-size: 0.875rem;
          color: #0F172A;
          outline: none;
        }
        .ainp:focus { border-color: #475569; box-shadow: 0 0 0 3px rgba(71,85,105,0.12); }
      `}</style>
    </>
    </>
  );
}

function Field({ label, className = "", children }: { label: string; className?: string; children: React.ReactNode }) {
  return (
    <label className={`block ${className}`}>
      <span className="block text-[11px] uppercase tracking-wider text-slate-500 mb-1.5 font-medium">{label}</span>
      {children}
    </label>
  );
}

function Toggle({ label, description, value, onChange }: { label: string; description: string; value: boolean; onChange: (v: boolean) => void }) {
  return (
    <div className="flex items-center justify-between gap-4 px-3 py-2.5">
      <div className="min-w-0">
        <div className="text-sm font-medium text-slate-900">{label}</div>
        <div className="text-xs text-slate-500 mt-0.5">{description}</div>
      </div>
      <Switch checked={value} onCheckedChange={onChange} />
    </div>
  );
}

function KeyRow({ name, mask }: { name: string; mask: string }) {
  return (
    <div className="flex items-center justify-between border border-slate-200 rounded px-3 py-2">
      <div className="text-sm text-slate-700">{name}</div>
      <code className="text-xs font-mono text-slate-500">{mask}</code>
    </div>
  );
}
