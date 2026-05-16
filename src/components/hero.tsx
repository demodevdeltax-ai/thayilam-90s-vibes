import { Button } from "@/components/ui/button";
import { LeafIcon, SparkIcon } from "./icons";
import dabbaImg from "@/assets/illustration-dabba.png";

export function Hero() {
  return (
    <section className="relative overflow-hidden paper">
      <div className="mx-auto max-w-7xl px-5 md:px-8 pt-12 pb-16 md:pt-20 md:pb-24 grid md:grid-cols-12 gap-10 items-center">
        <div className="md:col-span-7 relative">
          <div className="flex items-center gap-3 mb-5 text-olive">
            <SparkIcon size={18} />
            <span className="text-[13px] tracking-[0.3em] uppercase font-bold ">మర్చిపోయిన ఆనాటి రుచులు మళ్లీ కొత్తగా!!!</span>
          </div>


          <h1 className="font-script text-rust leading-[0.85] text-[5.5rem] sm:text-[7rem] md:text-[9rem] lg:text-[11rem]"> Thayilam </h1>

            <p className="mt-5 max-w-lg text-brown/85 text-lg md:text-xl font-display italic leading-snug">
              Nostalgia in every bite.<br className="hidden sm:block" />
              90s snacks, made fresh up on order.
            </p>

          <div className="mt-8 flex flex-wrap items-center gap-4">
            <Button size="lg" asChild>
              <a href="#shop">Shop Now</a>
            </Button>
            <div className="flex items-center gap-2 text-olive">

            </div>
          </div>
        </div>

        <div className="md:col-span-5 relative flex items-center justify-center">
          <div className="relative w-full aspect-square max-w-[460px]">
            <div className="absolute inset-0 rounded-full border border-dashed border-brown/30" />
            <div className="absolute inset-8 rounded-full border border-brown/15" />
            <video
              src="/thayilamfoods.mp4"
              autoPlay
              loop
              muted
              playsInline
              className="relative w-full h-full object-cover rounded-full"
            ></video>
            <span className="absolute top-4 -right-2 paper-sand ink-border-thin rounded-full h-20 w-20 grid place-items-center text-center text-[10px] uppercase tracking-widest text-brown/80 stamp-rotate-r leading-tight">
              Freshly<br/>prepared<br/>· today ·
            </span>
          </div>
        </div>
      </div>
      <div className="dashed-rule mx-auto max-w-7xl" />
    </section>
  );
}
