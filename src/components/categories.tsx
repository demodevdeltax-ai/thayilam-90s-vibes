import { Link } from "@tanstack/react-router";
import { LadooIcon, MurukkuIcon, ChakliIcon, LeafIcon, MangoIcon, FlowerIcon, SparkIcon, RibbonIcon } from "./icons";
import type { ComponentType, SVGProps } from "react";

type Cat = { label: string; Icon: ComponentType<SVGProps<SVGSVGElement> & { size?: number }> };

const CATEGORIES: Cat[] = [
  { label: "Murukku", Icon: MurukkuIcon },
  { label: "Ladoo", Icon: LadooIcon },
  { label: "Chakli", Icon: ChakliIcon },
  { label: "Mixture", Icon: SparkIcon },
  { label: "Pickle", Icon: MangoIcon },
  { label: "Pappad", Icon: RibbonIcon },
  { label: "Sweets", Icon: FlowerIcon },
  { label: "All Products", Icon: LeafIcon },
];

export function Categories() {
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
            {CATEGORIES.map(({ label, Icon }) => (
              <li key={label}>
                <Link to="/shop" className="group flex flex-col items-center gap-3 w-20 md:w-24 focus:outline-none">
                  <span className="h-20 w-20 md:h-24 md:w-24 rounded-full ink-border paper-sand grid place-items-center text-brown transition-all group-hover:bg-rust group-hover:text-cream group-hover:-translate-y-1">
                    <Icon size={38} />
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
