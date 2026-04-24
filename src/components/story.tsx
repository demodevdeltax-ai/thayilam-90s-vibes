import { FlowerIcon, MangoIcon, RibbonIcon } from "./icons";

export function Story() {
  return (
    <section id="story" className="relative py-20 md:py-28">
      <div className="mx-auto max-w-6xl px-6 grid md:grid-cols-2 gap-12 md:gap-20 items-center">
        <div className="relative">
          <div className="aspect-[4/5] paper-sand ink-border rounded-3xl p-8 relative overflow-hidden">
            <div className="absolute inset-3 border border-dashed border-brown/30 rounded-2xl pointer-events-none" />
            <div className="h-full flex flex-col justify-between text-brown">
              <div className="flex justify-between items-start">
                <MangoIcon size={48} className="text-olive" />
                <div className="text-right text-[10px] uppercase tracking-widest text-brown/60">
                  Vol. I<br/>Summer · 1994
                </div>
              </div>

              <div className="text-center">
                <div className="font-script text-5xl md:text-6xl text-rust leading-none">
                  Thayilam
                </div>
                <div className="dashed-rule my-4 mx-auto w-2/3" />
                <p className="font-display italic text-xl md:text-2xl">
                  "A sweet surprise<br/>from a small kitchen."
                </p>
              </div>

              <div className="flex justify-between items-end">
                <RibbonIcon size={48} className="text-rust" />
                <FlowerIcon size={36} className="text-olive" />
              </div>
            </div>
          </div>
          <div className="absolute -top-4 -right-4 paper rounded-full w-24 h-24 ink-border-thin flex items-center justify-center text-center text-[10px] uppercase tracking-widest text-brown/80 stamp-rotate-r">
            <div>Hand<br/>Rolled<br/>· est ·</div>
          </div>
        </div>

        <div>
          <div className="text-xs tracking-[0.25em] uppercase text-olive mb-4">
            — Our story —
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-brown leading-tight">
            We started with one
            <span className="italic"> stainless steel dabba</span> on the kitchen counter.
          </h2>

          <div className="dashed-rule my-8" />

          <div className="space-y-5 text-brown/85 leading-relaxed">
            <p>
              Every Friday afternoon, after school, the smell of ghee would crawl
              under the bedroom door. <em>Paati</em> would be at the stove, gold
              bangles tied up in a kerchief, frying murukku in a black iron kadai.
            </p>
            <p>
              <span className="font-script text-2xl text-rust">Thayilam</span> is
              that afternoon — bottled. We don't add palm oil. We don't bulk
              order. We make small batches in a kitchen in T. Nagar and we tie
              every box with a piece of thread.
            </p>
            <p className="font-script text-3xl text-brown">
              Try one. You'll remember something.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}
