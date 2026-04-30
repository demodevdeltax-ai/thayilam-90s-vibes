import { Link } from "@/lib/router-compat";
import { LadooIcon, MurukkuIcon, ChakliIcon, LeafIcon, MangoIcon, FlowerIcon, SparkIcon, RibbonIcon } from "./icons";
import { useAdminCategories } from "@/lib/categories-store";
import type { ComponentType, SVGProps } from "react";

type IconC = ComponentType<SVGProps<SVGSVGElement> & { size?: number }>;

const ICON_MAP: Record<string, IconC> = {
  Murukku: MurukkuIcon,
  Ladoo: LadooIcon,
  Chakli: ChakliIcon,
  Mixture: SparkIcon,
  Pickle: MangoIcon,
  Pappad: RibbonIcon,
  Sweets: FlowerIcon,
};

export function Categories() {
  const cats = useAdminCategories().filter((c) => c.active && c.parentId === null);

  // Always include "All Products" at the end
  const items: { label: string; Icon: IconC; emoji?: string; slug: string }[] = cats.map((c) => ({
    label: c.name,
    Icon: ICON_MAP[c.name] ?? LeafIcon,
    emoji: !ICON_MAP[c.name] ? c.icon : undefined,
    slug: c.slug,
  }));
  items.push({ label: "All Products", Icon: LeafIcon, slug: "" });

  return (
    <section className="paper py-10 md:py-14 border-b border-brown/20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-olive mb-1">— Browse by —</div>
            <h2 className="font-display text-2xl md:text-3xl text-brown">Shop by category</h2>
          </div>
          <Link to="/shop" className="hidden sm:inline text-xs uppercase tracking-widest text-rust hover:underline">
            View all →
          </Link>
        </div>

        <div className="-mx-5 md:-mx-8 px-5 md:px-8 overflow-x-auto scrollbar-none">
          <ul className="flex gap-5 md:gap-7 min-w-max pb-2">
            {items.map(({ label, Icon, emoji }) => (
              <li key={label}>
                <Link to="/shop" className="group flex flex-col items-center gap-3 w-20 md:w-24 focus:outline-none">
                  <span className="h-20 w-20 md:h-24 md:w-24 rounded-full ink-border paper-sand grid place-items-center text-brown transition-all group-hover:bg-rust group-hover:text-cream group-hover:-translate-y-1">
                    {emoji ? <span className="text-3xl">{emoji}</span> : <Icon size={38} />}
                  </span>
                  <span className="text-[11px] md:text-xs tracking-wide uppercase text-brown text-center leading-tight">
                    {label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}
