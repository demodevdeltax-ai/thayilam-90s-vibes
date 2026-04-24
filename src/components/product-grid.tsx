import { Plus } from "lucide-react";
import ladoo from "@/assets/snack-ladoo.png";
import murukku from "@/assets/snack-murukku.png";
import chakli from "@/assets/snack-chakli.png";
import mysorepak from "@/assets/snack-mysorepak.png";
import jalebi from "@/assets/snack-jalebi.png";
import thattai from "@/assets/snack-thattai.png";
import mixture from "@/assets/snack-mixture.png";
import pickle from "@/assets/snack-pickle.png";

type Product = {
  name: string;
  native: string;
  price: number;
  weight: string;
  vendor: string;
  img: string;
  badge?: string;
};

const PRODUCTS: Product[] = [
  { name: "Boondi Ladoo", native: "బూంది లడ్డు", price: 220, weight: "250g", vendor: "Lakshmi Akka's Kitchen", img: ladoo, badge: "Best seller" },
  { name: "Hand-rolled Murukku", native: "முறுக்கு", price: 180, weight: "200g", vendor: "Paati's Pantry, Mylapore", img: murukku },
  { name: "Spiced Chakli", native: "చక్లి", price: 160, weight: "200g", vendor: "Sundari Mami, Triplicane", img: chakli },
  { name: "Madras Mixture", native: "మిక్చర్", price: 190, weight: "250g", vendor: "Komala Stores, T. Nagar", img: mixture, badge: "New" },
  { name: "Mysore Pak", native: "మైసూర్‌ పాక్", price: 260, weight: "300g", vendor: "Krishna Sweets, Mylapore", img: mysorepak, badge: "Limited" },
  { name: "Avakaya Pickle", native: "ఆవకాయ", price: 320, weight: "400g jar", vendor: "Andhra Amma's Larder", img: pickle },
  { name: "Jangri", native: "జాంగ్రి", price: 240, weight: "250g", vendor: "Sri Ganesh Sweets", img: jalebi },
  { name: "Curry Leaf Thattai", native: "தட்டை", price: 150, weight: "200g", vendor: "Paati's Pantry, Mylapore", img: thattai },
];

function rupee(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

export function ProductGrid() {
  return (
    <section id="shop" className="paper py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-olive mb-2">— Today's tray —</div>
            <h2 className="font-display text-3xl md:text-5xl text-brown leading-tight">
              Featured <span className="italic">snacks &amp; sweets</span>
            </h2>
          </div>
          <p className="md:max-w-sm text-brown/75">
            Small batches from kitchens we know by name. Tied with thread, packed in brown paper.
          </p>
        </div>

        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
          {PRODUCTS.map((p) => (
            <article
              key={p.name}
              className="paper-sand ink-border-thin rounded-2xl p-4 md:p-5 flex flex-col group hover:-translate-y-1 hover:shadow-[6px_6px_0_var(--brown)] transition-all duration-300"
            >
              <div className="relative aspect-square mb-3 rounded-xl overflow-hidden paper grid place-items-center">
                <div className="absolute inset-3 rounded-full border border-dashed border-brown/25" />
                {p.badge && (
                  <span className="absolute top-2 left-2 z-10 text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-rust text-cream font-semibold">
                    {p.badge}
                  </span>
                )}
                <img
                  src={p.img}
                  alt={p.name}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="relative w-full h-full object-contain p-4 line-art group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <h3 className="font-display text-lg md:text-xl text-brown leading-tight">
                {p.name}
              </h3>
              <div className="text-[11px] text-brown/55 mt-0.5 mb-2 truncate">
                {p.native} · {p.weight}
              </div>

              <div className="dashed-rule mb-3" />

              <div className="flex items-center justify-between gap-2 mt-auto">
                <div>
                  <div className="font-script text-2xl text-rust leading-none">{rupee(p.price)}</div>
                  <div className="text-[10px] text-brown/55 mt-1 truncate max-w-[110px]">
                    by {p.vendor}
                  </div>
                </div>
                <button
                  aria-label={`Add ${p.name} to cart`}
                  className="shrink-0 inline-flex items-center gap-1.5 rounded-full bg-rust text-cream text-[11px] font-semibold uppercase tracking-wider px-3 py-2 hover:bg-rust/90 transition-colors"
                >
                  <Plus size={14} strokeWidth={2.2} />
                  <span className="hidden sm:inline">Add</span>
                </button>
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
