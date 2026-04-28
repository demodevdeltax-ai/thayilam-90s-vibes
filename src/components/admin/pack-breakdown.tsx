import { Package2 } from "lucide-react";
import { computeBreakdown, formatGrams, weightToGrams } from "@/lib/pack-breakdown";
import { PRODUCTS } from "@/lib/products";

export function OrderItemBreakdown({
  productId,
  weight,
  qty,
}: {
  productId: string;
  weight: string;
  qty: number;
}) {
  const product = PRODUCTS.find((p) => p.id === productId);
  const packSizes = product?.packSizes ?? [];
  const totalGrams = weightToGrams(weight) * qty;
  const breakdown = computeBreakdown(totalGrams, packSizes);

  return (
    <div className="mt-1 flex items-start gap-1.5 text-[11px] text-slate-500">
      <Package2 size={12} className="mt-0.5 text-[#6B7C4A] shrink-0" />
      <div className="leading-snug">
        <span className="text-slate-600">Pack from store:</span>{" "}
        {breakdown.lines.length === 0 ? (
          <span className="italic text-slate-400">no pack sizes set</span>
        ) : (
          <span className="font-medium text-slate-700">
            {breakdown.lines.map((l, i) => (
              <span key={i}>
                {i > 0 && <span className="text-slate-300"> + </span>}
                {l.count} × {formatGrams(l.size)} pack
                {l.padded && <span className="text-amber-600"> (padded)</span>}
              </span>
            ))}
          </span>
        )}
        {breakdown.totalPacked > 0 && (
          <span className="text-slate-400">
            {" "}· total {formatGrams(breakdown.totalPacked)}
          </span>
        )}
      </div>
    </div>
  );
}

export function PackSizesPill({ sizes }: { sizes: number[] }) {
  if (!sizes || sizes.length === 0) {
    return <span className="text-[10px] italic text-slate-400">no packs</span>;
  }
  return (
    <div className="inline-flex items-center gap-1 flex-wrap">
      {sizes.map((s) => (
        <span
          key={s}
          className="inline-flex items-center text-[10px] font-medium px-1.5 h-5 rounded bg-[#6B7C4A]/10 text-[#4a5733] border border-[#6B7C4A]/20"
        >
          {formatGrams(s)}
        </span>
      ))}
    </div>
  );
}

export function SkuPill({ sku }: { sku: string }) {
  return (
    <span className="inline-flex items-center text-[10px] font-mono font-semibold px-1.5 h-5 rounded bg-slate-900 text-white tracking-wider">
      {sku}
    </span>
  );
}
