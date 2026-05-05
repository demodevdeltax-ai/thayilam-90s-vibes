import { Plus } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { rupee } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function ProductCard({ p }: { p: Product }) {
  const cart = useCart();

  const discount = p.mrp
    ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
    : 0;

  const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;

  /* ---------------- IMAGE ---------------- */

  let image = "/placeholder.jpeg";

  if (p.image_url) {
    if (p.image_url.startsWith("http")) {
      image = p.image_url;
    } else {
      image = `${SUPABASE_URL}/storage/v1/object/public/product-images/${p.image_url}`;
    }
  }

  /* ---------------- CATEGORY (SINGLE SOURCE OF TRUTH) ---------------- */

  function formatSlug(slug?: string) {
    if (!slug) return "General";
    return slug
      .replace(/-/g, " ")
      .replace(/\b\w/g, (c) => c.toUpperCase());
  }

  const categorySlug = p.category_slug || "general";

  const categoryLabel =
    p.category_name?.trim() || formatSlug(categorySlug);

  /* ---------------- OTHER FIELDS ---------------- */

  const weight =
    p.default_weight?.trim() || (p as any).weight || "";

  const telugu =
    p.name_telugu?.trim() || (p as any).telugu || "";

  /* ---------------- UI ---------------- */

  return (
    <article className="paper ink-border-thin rounded-2xl p-4 md:p-5 flex flex-col group hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--brown)] transition-all duration-300 relative">
      
      {/* CATEGORY BADGE (CONNECTED TO FILTER) */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5 items-start">
        <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-olive text-cream font-semibold">
          {categoryLabel}
        </span>

        {p.badge && (
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rust text-cream font-semibold">
            {p.badge}
          </span>
        )}
      </div>

      {/* WEIGHT */}
      {weight && (
        <span className="absolute bottom-2 right-2 z-10 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ink-border-thin paper text-brown">
          {weight}
        </span>
      )}

      {/* IMAGE */}
      <img
        src={image}
        alt={p.name}
        className="w-[200px] h-[200px] object-cover mx-auto"
      />

      {/* TITLE */}
      <h3 className="font-display text-lg md:text-xl text-brown leading-tight mt-2">
        {p.name}
      </h3>

      {/* TELUGU */}
      {telugu && (
        <div className="text-xs text-brown/55 mt-0.5 mb-3 truncate">
          {telugu}
        </div>
      )}

      <div className="dashed-rule mb-3" />

      {/* PRICE + CTA */}
      <div className="flex items-end justify-between gap-2 mt-auto">
        
        <div>
          <div className="flex items-baseline gap-2">
            <span className="font-script text-2xl text-rust">
              {rupee(p.price)}
            </span>

            {p.mrp && (
              <span className="text-xs text-brown/45 line-through">
                {rupee(p.mrp)}
              </span>
            )}
          </div>
        </div>

        {/* ADD TO CART */}
        <button
          onClick={(e) => {
            e.preventDefault();
            e.stopPropagation();
            cart.add(p.id);
          }}
          className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-rust text-cream text-[11px] font-semibold uppercase tracking-wider px-3 py-2 hover:bg-rust/90 transition-colors"
        >
          <Plus size={14} strokeWidth={2.2} />
          <span className="hidden sm:inline">Add</span>
        </button>
      </div>
    </article>
  );
}