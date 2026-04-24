import ladoo from "@/assets/snack-ladoo.png";
import murukku from "@/assets/snack-murukku.png";
import chakli from "@/assets/snack-chakli.png";
import mysorepak from "@/assets/snack-mysorepak.png";
import jalebi from "@/assets/snack-jalebi.png";
import thattai from "@/assets/snack-thattai.png";
import { LeafIcon, SparkIcon } from "./icons";
import { Button } from "@/components/ui/button";

type Snack = {
  name: string;
  tamil: string;
  desc: string;
  price: string;
  weight: string;
  img: string;
  badge?: string;
};

const SNACKS: Snack[] = [
  { name: "Boondi Ladoo", tamil: "லட்டு", desc: "Saffron, ghee, a hum of cardamom.", price: "₹220", weight: "250g · 6 pcs", img: ladoo, badge: "Best seller" },
  { name: "Hand-rolled Murukku", tamil: "முறுக்கு", desc: "Slow-fried rice & urad spirals.", price: "₹180", weight: "200g", img: murukku },
  { name: "Chakli", tamil: "சக்லி", desc: "Crisp pinwheels, ajwain warmth.", price: "₹160", weight: "200g", img: chakli },
  { name: "Mysore Pak", tamil: "மைசூர்பாக்", desc: "Buttery, porous, melts in a breath.", price: "₹260", weight: "300g", img: mysorepak, badge: "Limited" },
  { name: "Jangri", tamil: "ஜாங்கிரி", desc: "Saffron syrup, urad dal coils.", price: "₹240", weight: "250g", img: jalebi },
  { name: "Thattai", tamil: "தட்டை", desc: "Curry leaf, channa dal, crackle.", price: "₹150", weight: "200g", img: thattai },
];

export function Shop() {
  return (
    <section id="shop" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-7xl px-6">
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-6 mb-12">
          <div>
            <div className="flex items-center gap-2 text-olive mb-3">
              <SparkIcon size={18} />
              <span className="text-xs tracking-[0.25em] uppercase">From the dabba</span>
            </div>
            <h2 className="font-display text-4xl md:text-6xl text-brown leading-none">
              Today's <span className="italic">snack tray.</span>
            </h2>
          </div>
          <p className="md:max-w-sm text-brown/75 text-base">
            Six small batches, packed in brown paper and tied with thread. Whatever
            doesn't sell today, we eat — so we keep it small.
          </p>
        </div>

        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6">
          {SNACKS.map((s, i) => (
            <article
              key={s.name}
              className="paper-sand ink-border rounded-2xl p-6 flex flex-col group hover:-translate-y-1 transition-transform duration-300"
            >
              <div className="flex items-start justify-between gap-4 mb-2">
                <span className="text-[10px] uppercase tracking-[0.2em] text-brown/60">
                  No. {String(i + 1).padStart(2, "0")}
                </span>
                {s.badge && (
                  <span className="text-[10px] uppercase tracking-wider px-2 py-1 rounded-full ink-border-thin text-rust bg-cream">
                    {s.badge}
                  </span>
                )}
              </div>

              <div className="relative aspect-square mb-4 flex items-center justify-center">
                <div className="absolute inset-4 rounded-full border border-dashed border-brown/30" />
                <img
                  src={s.img}
                  alt={s.name}
                  loading="lazy"
                  width={512}
                  height={512}
                  className="relative w-full h-full object-contain p-6 line-art group-hover:scale-105 transition-transform duration-500"
                />
              </div>

              <div className="dashed-rule mb-4" />

              <div className="flex items-baseline justify-between gap-3">
                <h3 className="font-display text-2xl text-brown leading-tight">
                  {s.name}
                </h3>
                <span className="font-script text-2xl text-rust">{s.price}</span>
              </div>
              <div className="text-xs text-brown/60 mt-1 mb-3">
                {s.tamil} · {s.weight}
              </div>
              <p className="text-sm text-brown/80 leading-relaxed flex-1">{s.desc}</p>

              <div className="mt-5 flex items-center justify-between">
                <Button size="sm">Add to dabba</Button>
                <LeafIcon size={20} className="text-olive -rotate-12" />
              </div>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
