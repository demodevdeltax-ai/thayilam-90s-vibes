import { Heart, Plus } from "lucide-react";
import { useState } from "react";
import type { Product } from "@/lib/products";
import { rupee } from "@/lib/products";
import { useCart } from "@/lib/cart";

export function ProductCard({ p }: { p: Product }) {
  const [wish, setWish] = useState(false);
  const cart = useCart();

  const discount = p.mrp
    ? Math.round(((p.mrp - p.price) / p.mrp) * 100)
    : 0;

  // 🔥 SAFE FIELD MAPPING (handles both old + DB)
  const image = p.image_url || (p as any).img;
  const category = p.category_name || (p as any).category;
  const weight = p.default_weight || (p as any).weight;
  const telugu = p.name_telugu || (p as any).telugu;

  return (
    <article className="paper ink-border-thin rounded-2xl p-4 md:p-5 flex flex-col group hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--brown)] transition-all duration-300 relative">

      <button
        onClick={() => setWish((v) => !v)}
        aria-label="Wishlist"
        className={`absolute top-3 right-3 z-10 h-9 w-9 rounded-full grid place-items-center ink-border-thin transition-colors ${
          wish ? "bg-rust text-cream" : "paper-sand text-brown hover:text-rust"
        }`}
      >
        <Heart size={16} fill={wish ? "currentColor" : "none"} strokeWidth={1.6} />
      </button>

      <div className="relative aspect-square mb-3 rounded-xl overflow-hidden paper-sand grid place-items-center">

        <div className="absolute inset-3 rounded-full border border-dashed border-brown/25" />

        <div className="absolute top-2 left-2 z-10 flex flex-col gap-1.5 items-start">
          <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-olive text-cream font-semibold">
            {category}
          </span>

          {p.badge && (
            <span className="text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rust text-cream font-semibold">
              {p.badge}
            </span>
          )}
        </div>

        <span className="absolute bottom-2 right-2 z-10 text-[10px] uppercase tracking-wider px-2 py-0.5 rounded-full ink-border-thin paper text-brown">
          {weight}
        </span>

        {image && (
          <img
            src={image}
            alt={p.name}
            loading="lazy"
            width={512}
            height={512}
            className="relative w-full h-full object-contain p-5 line-art group-hover:scale-105 transition-transform duration-500"
          />
        )}
        console.log("IMAGE URL:", p.image_url);

      </div>

      <h3 className="font-display text-lg md:text-xl text-brown leading-tight">
        {p.name}
      </h3>

      <div className="text-xs text-brown/55 mt-0.5 mb-3 truncate">
        {telugu}
      </div>

      <div className="dashed-rule mb-3" />

      <div className="flex items-end justify-between gap-2 mt-auto">

        <div className="min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="font-script text-2xl text-rust leading-none">
              {rupee(p.price)}
            </span>

            {p.mrp && (
              <span className="text-xs text-brown/45 line-through">
                {rupee(p.mrp)}
              </span>
            )}

            {/* {discount > 0 && (
              <span className="text-[10px] uppercase tracking-wider text-olive font-semibold">
                -{discount}%
              </span>
            )} */}
          </div>
        </div>

        <button
          aria-label={`Add ${p.name} to cart`}
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