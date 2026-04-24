import type { ReactNode } from "react";

export function AdminPageHeader({
  title,
  subtitle,
  actions,
}: {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
}) {
  return (
    <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-3 mb-6">
      <div>
        <h1 className="text-[22px] md:text-[26px] font-semibold tracking-tight text-slate-900">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-slate-500 mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function AdminCard({
  children,
  className = "",
  padding = true,
}: {
  children: ReactNode;
  className?: string;
  padding?: boolean;
}) {
  return (
    <div
      className={`bg-white border border-slate-200 rounded-lg ${padding ? "p-5" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function AdminMetric({
  label,
  value,
  hint,
  tone = "default",
  badge,
}: {
  label: string;
  value: string | number;
  hint?: string;
  tone?: "default" | "rust" | "olive" | "amber";
  badge?: ReactNode;
}) {
  const accent = {
    default: "border-l-slate-300",
    rust: "border-l-[#C4541A]",
    olive: "border-l-[#6B7C4A]",
    amber: "border-l-amber-500",
  }[tone];
  return (
    <AdminCard className={`border-l-4 ${accent}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="text-[11px] uppercase tracking-[0.14em] text-slate-500 font-medium">{label}</div>
        {badge}
      </div>
      <div className="mt-2 text-[26px] font-semibold tracking-tight text-slate-900 tabular-nums">{value}</div>
      {hint && <div className="text-xs text-slate-500 mt-1">{hint}</div>}
    </AdminCard>
  );
}

const STATUS_STYLES: Record<string, { bg: string; text: string; dot: string }> = {
  Active:     { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Pending:    { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500" },
  Suspended:  { bg: "bg-rose-50",    text: "text-rose-700",    dot: "bg-rose-500" },
  Approved:   { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Rejected:   { bg: "bg-rose-50",    text: "text-rose-700",    dot: "bg-rose-500" },
  Packed:     { bg: "bg-lime-50",    text: "text-lime-800",    dot: "bg-lime-600" },
  Shipped:    { bg: "bg-sky-50",     text: "text-sky-700",     dot: "bg-sky-500" },
  Delivered:  { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Cancelled:  { bg: "bg-slate-100",  text: "text-slate-600",   dot: "bg-slate-400" },
  Paid:       { bg: "bg-emerald-50", text: "text-emerald-700", dot: "bg-emerald-500" },
  Due:        { bg: "bg-amber-50",   text: "text-amber-700",   dot: "bg-amber-500" },
  Processing: { bg: "bg-sky-50",     text: "text-sky-700",     dot: "bg-sky-500" },
};

export function AdminBadge({ status }: { status: string }) {
  const s = STATUS_STYLES[status] ?? { bg: "bg-slate-100", text: "text-slate-600", dot: "bg-slate-400" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2 h-6 rounded-md text-[11px] font-medium ${s.bg} ${s.text}`}>
      <span className={`h-1.5 w-1.5 rounded-full ${s.dot}`} />
      {status}
    </span>
  );
}

export function rupee(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export function rupeeShort(n: number) {
  if (n >= 10000000) return "₹" + (n / 10000000).toFixed(1) + "Cr";
  if (n >= 100000) return "₹" + (n / 100000).toFixed(1) + "L";
  if (n >= 1000) return "₹" + (n / 1000).toFixed(1) + "K";
  return "₹" + n;
}

export function TableShell({ children }: { children: ReactNode }) {
  return (
    <div className="overflow-x-auto -mx-5 md:mx-0">
      <table className="w-full text-sm border-separate border-spacing-0 min-w-[720px]">
        {children}
      </table>
    </div>
  );
}

export function Th({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <th className={`text-left text-[11px] uppercase tracking-[0.12em] text-slate-500 font-medium px-3 py-2.5 border-b border-slate-200 bg-slate-50 ${className}`}>
      {children}
    </th>
  );
}

export function Td({ children, className = "" }: { children: ReactNode; className?: string }) {
  return (
    <td className={`px-3 py-3 border-b border-slate-100 text-slate-700 ${className}`}>
      {children}
    </td>
  );
}
