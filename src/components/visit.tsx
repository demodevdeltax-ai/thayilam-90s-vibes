import { Button } from "@/components/ui/button";
import { FlowerIcon, LeafIcon, MangoIcon } from "./icons";
import toranImg from "@/assets/border-toran.png";

export function Visit() {
  return (
    <section id="visit" className="relative py-20 md:py-28 paper-sand border-y border-brown/30">
      <img
        src={toranImg}
        alt=""
        aria-hidden
        className="absolute -top-2 left-0 right-0 w-full h-20 object-cover object-top opacity-70 line-art pointer-events-none"
      />
      <div className="mx-auto max-w-5xl px-6 text-center">
        <div className="flex items-center justify-center gap-3 text-olive mb-4 mt-6">
          <FlowerIcon size={22} />
          <span className="text-xs tracking-[0.25em] uppercase">Come over</span>
          <FlowerIcon size={22} />
        </div>
        <h2 className="font-display text-4xl md:text-6xl text-brown leading-tight">
          The kitchen door is always
          <span className="font-script text-rust block text-6xl md:text-7xl mt-2">
            half open.
          </span>
        </h2>
        <p className="mt-6 text-brown/80 max-w-xl mx-auto">
          Walk in for filter coffee and a piece of mysore pak on the house. Saturdays
          we host a small <em>kollu</em> tasting at 4pm.
        </p>

        <div className="mt-10 grid sm:grid-cols-3 gap-4 max-w-3xl mx-auto">
          {[
            { icon: LeafIcon, label: "Address", value: "12, Burkit Road,\nT. Nagar, Chennai" },
            { icon: MangoIcon, label: "Open", value: "Tue – Sun\n10am till the dabba is empty" },
            { icon: FlowerIcon, label: "Call paati", value: "+91 98 4044 1994" },
          ].map(({ icon: Icon, label, value }) => (
            <div key={label} className="paper ink-border-thin rounded-2xl p-5 text-left">
              <Icon size={26} className="text-olive mb-2" />
              <div className="text-[10px] uppercase tracking-widest text-brown/60">{label}</div>
              <div className="font-display text-lg text-brown whitespace-pre-line mt-1 leading-snug">
                {value}
              </div>
            </div>
          ))}
        </div>

        <div className="mt-12 flex justify-center">
          <Button size="lg" variant="olive">Reserve a tasting</Button>
        </div>
      </div>
    </section>
  );
}
