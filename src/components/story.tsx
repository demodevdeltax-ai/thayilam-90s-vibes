import { FlowerIcon, MangoIcon, RibbonIcon } from "./icons";

export function Story() {
  return (
    <section id="story" className="relative py-20 md:py-28">
      <span id="about" className="block -mt-24 pt-24" aria-hidden />

      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12 md:gap-20 items-center">

        {/* LEFT CARD */}
        <div className="relative">
          <div className="aspect-[4/5] paper-sand ink-border rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute inset-3 border border-dashed border-brown/30 rounded-2xl pointer-events-none" />

            <div className="h-full flex flex-col justify-between text-brown">
              <div className="flex justify-between items-start">
                <MangoIcon size={48} className="text-olive" />
              </div>

              <div className="text-center">
                <div className="font-script text-5xl md:text-6xl text-rust leading-none">
                  Thayilam
                </div>

                <div className="dashed-rule my-4 mx-auto w-2/3" />

                <p className="font-display italic text-lg md:text-xl">
                  "A sweet surprise"
                  <br />
                  from a small kitchen.
                </p>
              </div>

              <div className="flex justify-between items-end">
                <RibbonIcon size={48} className="text-rust" />
                <FlowerIcon size={36} className="text-olive" />
              </div>
            </div>
          </div>

          <div className="absolute -top-4 -right-4 paper rounded-full w-24 h-24 ink-border-thin flex items-center justify-center text-center text-[10px] uppercase tracking-widest text-brown/80 stamp-rotate-r">
            <div>
              freshly
              <br />
              Prepared
              <br />· today ·
            </div>
          </div>
        </div>

        {/* STORY CONTENT */}
        <div className="max-w-xl">
          <div className="text-[10px] tracking-[0.25em] uppercase text-olive mb-3">
            — Why Thayilam Exists —
          </div>

          <h2 className="font-display text-3xl md:text-4xl text-brown leading-snug">
            We started Thayilam for one simple reason —
            <span className="italic">
              {" "}the snacks we grew up loving were slowly disappearing.
            </span>
          </h2>

          <div className="dashed-rule my-6" />

          <div className="space-y-4 text-brown/85 leading-relaxed text-base md:text-[17px]">
            <p>
              The real taste of homemade Chekkalu, Murukku, Janthikalu and
              traditional Andhra snacks was getting replaced by factory-made versions.
            </p>

            <p>
              So we decided to bring back:
            </p>

            <div className="space-y-2 pl-4">
              <p>• fresh preparation</p>
              <p>• authentic recipes</p>
              <p>• nostalgic flavors</p>
              <p>
                • and the joy of opening a snack box that feels like home.
              </p>
            </div>

            <p className="font-script text-2xl text-brown pt-2 leading-snug">
              Made slowly. Packed warmly. Shared lovingly.
            </p>
          </div>
        </div>

      </div>
    </section>
  );
}