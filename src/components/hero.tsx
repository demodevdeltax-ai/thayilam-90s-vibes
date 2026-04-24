import { Button } from "@/components/ui/button";
import { FlowerIcon, LeafIcon, SparkIcon } from "./icons";
import potImg from "@/assets/illustration-pot.png";
import toranImg from "@/assets/border-toran.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden">
      {/* Toran garland at top */}
      <img
        src={toranImg}
        alt=""
        aria-hidden
        className="absolute -top-2 left-0 right-0 w-full h-24 object-cover object-top opacity-80 line-art pointer-events-none"
      />

      <div className="mx-auto max-w-7xl px-6 pt-20 pb-16 md:pt-28 md:pb-24 grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7 relative">
          <div className="flex items-center gap-3 mb-6 text-olive">
            <SparkIcon size={20} />
            <span className="text-xs tracking-[0.25em] uppercase">Est. — Tasted in 1994</span>
          </div>

          <h1 className="font-display text-5xl md:text-7xl lg:text-8xl leading-[0.95] text-brown">
            Sweets from
            <span className="block italic font-medium">amma's </span>
            <span className="font-script text-rust text-6xl md:text-8xl lg:text-9xl block -mt-2">
              steel dabba.
            </span>
          </h1>

          <p className="mt-8 max-w-md text-brown/80 text-base md:text-lg leading-relaxed">
            Hand-rolled ladoos, slow-fried murukku and the kind of mysore pak that
            crumbles before it reaches your tongue. Made the way <em>paati</em> made
            them — small batches, big memory.
          </p>

          <div className="mt-10 flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <a href="#shop">Open the Dabba</a>
            </Button>
            <Button size="lg" variant="outline" asChild>
              <a href="#story">Read our story</a>
            </Button>
            <div className="flex items-center gap-2 ml-2 text-olive">
              <LeafIcon size={20} />
              <span className="font-script text-xl text-brown">freshly packed daily</span>
            </div>
          </div>

          {/* corner stamp */}
          <div className="hidden md:flex absolute -left-4 top-4 -translate-x-full items-center justify-center w-20 h-20 rounded-full ink-border-thin text-[10px] uppercase tracking-widest text-brown/70 paper-sand stamp-rotate-l">
            <div className="text-center leading-tight">
              made<br />with<br />love
            </div>
          </div>
        </div>

        <div className="md:col-span-5 relative flex items-center justify-center">
          {/* big circular cream plate */}
          <div className="relative w-full aspect-square max-w-[520px]">
            <div className="absolute inset-0 rounded-full ink-border paper-sand" />
            <div className="absolute inset-6 rounded-full border border-brown/40" />
            <div className="absolute inset-10 rounded-full border border-dashed border-brown/30" />

            <img
              src={potImg}
              alt="A clay pot brewing memory"
              className="absolute inset-0 w-full h-full object-contain p-12 line-art"
              width={768}
              height={768}
            />

            <FlowerIcon size={36} className="absolute -top-2 right-10 text-olive rotate-12" />
            <FlowerIcon size={28} className="absolute bottom-6 -left-2 text-rust -rotate-12" />
            <SparkIcon size={22} className="absolute top-1/2 -right-3 text-brown/60" />
          </div>

          <div className="absolute -bottom-2 right-0 font-script text-brown/70 text-2xl rotate-[-4deg]">
            “onnu try pannu da”
          </div>
        </div>
      </div>
    </section>
  );
}
