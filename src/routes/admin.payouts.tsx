import { createFileRoute } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import { CheckCircle2, Download, FileText, Pencil } from "lucide-react";
import {
  AdminPageHeader, AdminCard, AdminBadge, TableShell, Th, Td, rupee, rupeeShort,
} from "@/components/admin/ui";
import {
  usePayouts, setPayoutStatus, useAdminVendors, setVendorCommission,
} from "@/lib/admin-store";
import type { PayoutStatus } from "@/lib/admin-data";

export const Route = createFileRoute("/admin/payouts")({
  head: () => ({ meta: [{ title: "Payouts — Super Admin" }] }),
  component: PayoutsPage,
});

function PayoutsPage() {
  const payouts = usePayouts();
  const vendors = useAdminVendors();
  const [filter, setFilter] = useState<"All" | PayoutStatus>("All");
  const [editVendor, setEditVendor] = useState<string | null>(null);
  const [pctDraft, setPctDraft] = useState<number>(12);

  const filtered = useMemo(
    () => payouts.filter((p) => filter === "All" || p.status === filter),
    [payouts, filter],
  );

  const dueTotal = payouts.filter((p) => p.status === "Due").reduce((s, p) => s + p.net, 0);
  const processingTotal = payouts.filter((p) => p.status === "Processing").reduce((s, p) => s + p.net, 0);
  const paidTotal = payouts.filter((p) => p.status === "Paid").reduce((s, p) => s + p.net, 0);

  function exportPdf() {
    // Mock PDF export — opens print dialog with filtered payouts
    const html = `<!doctype html><html><head><title>Payout report</title>
      <style>body{font-family:system-ui;padding:32px;color:#111}h1{margin:0 0 4px}
      table{width:100%;border-collapse:collapse;margin-top:16px;font-size:13px}
      th,td{text-align:left;padding:8px 10px;border-bottom:1px solid #e5e7eb}
      th{background:#f8fafc;font-size:11px;text-transform:uppercase;letter-spacing:.06em;color:#64748b}
      .right{text-align:right}.muted{color:#64748b;font-size:12px}</style></head>
      <body><h1>Thayilam — Payout report</h1>
      <div class="muted">Generated ${new Date().toLocaleString("en-IN")} · ${filtered.length} payouts · Net ${rupee(filtered.reduce((s, p) => s + p.net, 0))}</div>
      <table><thead><tr><th>Payout ID</th><th>Vendor</th><th>Cycle</th><th class="right">Gross</th>
      <th class="right">Commission</th><th class="right">Net</th><th>Status</th><th>UTR</th></tr></thead>
      <tbody>${filtered.map((p) => `<tr><td>${p.id}</td><td>${p.vendor}</td><td>${p.cycle}</td>
      <td class="right">${rupee(p.gross)}</td><td class="right">${rupee(p.commission)} (${p.commissionPct}%)</td>
      <td class="right"><b>${rupee(p.net)}</b></td><td>${p.status}</td><td>${p.utr ?? "—"}</td></tr>`).join("")}
      </tbody></table></body></html>`;
    const w = window.open("", "_blank");
    if (w) {
      w.document.write(html);
      w.document.close();
      setTimeout(() => w.print(), 250);
    }
  }

  return (
    <>
      <AdminPageHeader
        title="Vendor payouts"
        subtitle="Compute commission, settle bi-weekly cycles, and export reports."
        actions={
          <button onClick={exportPdf} className="inline-flex items-center gap-1.5 h-9 px-3 rounded-md bg-slate-900 hover:bg-slate-800 text-white text-sm font-medium">
            <Download size={14} /> Export PDF
          </button>
        }
      />

      <div className="grid grid-cols-3 gap-3 mb-5">
        <AdminCard className="border-l-4 border-l-amber-500">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Due now</div>
          <div className="text-[24px] font-semibold mt-1 tabular-nums">{rupeeShort(dueTotal)}</div>
          <div className="text-xs text-slate-500 mt-1">{payouts.filter((p) => p.status === "Due").length} cycles</div>
        </AdminCard>
        <AdminCard className="border-l-4 border-l-sky-500">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Processing</div>
          <div className="text-[24px] font-semibold mt-1 tabular-nums">{rupeeShort(processingTotal)}</div>
          <div className="text-xs text-slate-500 mt-1">{payouts.filter((p) => p.status === "Processing").length} cycles</div>
        </AdminCard>
        <AdminCard className="border-l-4 border-l-emerald-500">
          <div className="text-[11px] uppercase tracking-wider text-slate-500 font-medium">Paid this month</div>
          <div className="text-[24px] font-semibold mt-1 tabular-nums">{rupeeShort(paidTotal)}</div>
          <div className="text-xs text-slate-500 mt-1">{payouts.filter((p) => p.status === "Paid").length} cycles</div>
        </AdminCard>
      </div>

      {/* Commission editor */}
      <AdminCard className="mb-5">
        <div className="flex items-start justify-between gap-4 flex-wrap">
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Commission per vendor</h3>
            <p className="text-xs text-slate-500 mt-0.5">Tap pencil to edit. Changes recalc all due payouts immediately.</p>
          </div>
        </div>
        <div className="mt-4 grid sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {vendors.map((v) => (
            <div key={v.name} className="flex items-center justify-between border border-slate-200 rounded-md px-3 py-2">
              <div className="min-w-0">
                <div className="text-sm font-medium text-slate-900 truncate">{v.name}</div>
                <div className="text-[11px] text-slate-500">{v.city}</div>
              </div>
              {editVendor === v.name ? (
                <div className="flex items-center gap-1">
                  <input
                    type="number"
                    min={1} max={50}
                    value={pctDraft}
                    onChange={(e) => setPctDraft(Number(e.target.value))}
                    className="w-14 h-7 px-2 text-sm border border-slate-300 rounded-md text-right tabular-nums focus:outline-none focus:border-slate-500"
                  />
                  <span className="text-xs text-slate-500">%</span>
                  <button
                    onClick={() => { setVendorCommission(v.name, pctDraft); setEditVendor(null); }}
                    className="h-7 px-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                  >
                    Save
                  </button>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span className="text-sm tabular-nums font-semibold text-slate-900">{v.commissionPct}%</span>
                  <button
                    onClick={() => { setEditVendor(v.name); setPctDraft(v.commissionPct); }}
                    className="h-7 w-7 grid place-items-center rounded-md hover:bg-slate-100 text-slate-500"
                  >
                    <Pencil size={12} />
                  </button>
                </div>
              )}
            </div>
          ))}
        </div>
      </AdminCard>

      <AdminCard padding={false}>
        <div className="p-4 border-b border-slate-100 flex items-center justify-between">
          <div className="flex items-center gap-1 bg-slate-100 p-0.5 rounded-md">
            {(["All", "Due", "Processing", "Paid"] as const).map((f) => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`text-xs px-3 h-7 rounded ${filter === f ? "bg-white text-slate-900 font-medium shadow-sm" : "text-slate-500 hover:text-slate-700"}`}
              >
                {f}
              </button>
            ))}
          </div>
          <div className="text-xs text-slate-500 inline-flex items-center gap-1.5">
            <FileText size={12} /> {filtered.length} cycles · Net {rupee(filtered.reduce((s, p) => s + p.net, 0))}
          </div>
        </div>

        <TableShell>
          <thead>
            <tr>
              <Th>Payout ID</Th>
              <Th>Vendor</Th>
              <Th>Cycle</Th>
              <Th className="text-right">Gross</Th>
              <Th className="text-right">Commission</Th>
              <Th className="text-right">Net payout</Th>
              <Th>Status</Th>
              <Th className="text-right">Action</Th>
            </tr>
          </thead>
          <tbody>
            {filtered.map((p) => (
              <tr key={p.id} className="hover:bg-slate-50">
                <Td className="font-mono text-xs text-slate-600">{p.id}</Td>
                <Td className="text-sm font-medium text-slate-900">{p.vendor}</Td>
                <Td className="text-slate-600 text-sm">{p.cycle}</Td>
                <Td className="text-right tabular-nums">{rupee(p.gross)}</Td>
                <Td className="text-right tabular-nums text-slate-600">−{rupee(p.commission)} <span className="text-[11px] text-slate-400">({p.commissionPct}%)</span></Td>
                <Td className="text-right tabular-nums font-semibold text-slate-900">{rupee(p.net)}</Td>
                <Td>
                  <AdminBadge status={p.status} />
                  {p.utr && <div className="text-[11px] text-slate-500 font-mono mt-1">{p.utr}</div>}
                </Td>
                <Td className="text-right">
                  {p.status === "Due" && (
                    <button
                      onClick={() => setPayoutStatus(p.id, "Processing")}
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-md bg-sky-600 hover:bg-sky-700 text-white text-xs font-medium"
                    >
                      Initiate
                    </button>
                  )}
                  {p.status === "Processing" && (
                    <button
                      onClick={() => setPayoutStatus(p.id, "Paid", "UTR" + Math.floor(Math.random() * 9000000 + 1000000))}
                      className="inline-flex items-center gap-1 h-7 px-2 rounded-md bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-medium"
                    >
                      <CheckCircle2 size={12} /> Mark paid
                    </button>
                  )}
                  {p.status === "Paid" && (
                    <span className="text-[11px] text-slate-500">{p.paidAt}</span>
                  )}
                </Td>
              </tr>
            ))}
          </tbody>
        </TableShell>
      </AdminCard>
    </>
  );
}
