import type { ReactNode } from "react";

export function PageHeader({
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
        <h1 className="text-2xl md:text-[28px] font-semibold tracking-tight text-[#1f1d1a]">
          {title}
        </h1>
        {subtitle && <p className="text-sm text-[#7a766c] mt-1">{subtitle}</p>}
      </div>
      {actions && <div className="flex items-center gap-2 flex-wrap">{actions}</div>}
    </div>
  );
}

export function StatusBadge({ status }: { status: string }) {
  const map: Record<string, { bg: string; text: string }> = {
    Pending: { bg: "bg-[#FFF1E0]", text: "text-[#A4490F]" },
    Packed: { bg: "bg-[#EAF2DB]", text: "text-[#4F5F33]" },
    Shipped: { bg: "bg-[#E2EAF7]", text: "text-[#27447A]" },
    Delivered: { bg: "bg-[#E5F2EB]", text: "text-[#206B44]" },
    Cancelled: { bg: "bg-[#F4DCDC]", text: "text-[#8C2A2A]" },
  };
  const c = map[status] ?? { bg: "bg-[#F1EFE7]", text: "text-[#4a463e]" };
  return (
    <span className={`inline-flex items-center gap-1.5 px-2.5 h-6 rounded-full text-[11px] font-medium ${c.bg} ${c.text}`}>
      <span className="h-1.5 w-1.5 rounded-full bg-current" />
      {status}
    </span>
  );
}

export function VendorCard({
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
      className={`bg-white border border-[#E8E6DF] rounded-xl ${padding ? "p-5 md:p-6" : ""} ${className}`}
    >
      {children}
    </div>
  );
}

export function rupee(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}
