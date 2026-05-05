import { FlowerIcon, MangoIcon, RibbonIcon } from "./icons";

export function Story() {
  return (
    <section id="story" className="relative py-20 md:py-28">
      <span id="about" className="block -mt-24 pt-24" aria-hidden />
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
            <div>freshly<br/>packed<br/>· today ·</div>
          </div>
        </div>

        <div>
          <div className="text-xs tracking-[0.25em] uppercase text-olive mb-4">
            — Our story —
          </div>
          <h2 className="font-display text-4xl md:text-5xl text-brown leading-tight">
            It began with a simple thought in a mother’s kitchen —
            <span className="italic"> “Will my child ever know the taste I grew up with?”</span>
          </h2>

          <div className="dashed-rule my-8" />

          <div className="space-y-5 text-brown/85 leading-relaxed">
            <p>
              Not the bright packets and artificial flavors of today,
              but the real ones—slow-made, honest, full of warmth.
            </p>

            <p>
              The kind that filled homes with aroma,
              and brought children running closer, not away.
              The kind that brought families together, not distractions.
            </p>

            <p>
              So she went back to it.
              To the recipes she trusted.
              To the recipes she learnt from her mother.
              To the way it was made — slow, careful, with love.
            </p>

            <p>
              What started as a way to share her childhood with her own kids became
              <span className="font-script text-2xl text-rust"> Thayilam</span>.
            </p>

            <p>
              Today, we make small batches, just like it was done back then —
              honest ingredients, authentic recipes, no shortcuts.
            </p>

            <p>
              Because this isn’t just food. It’s a way to pass down memories.
              It’s a bridge between generations.
              A way to sit closer, share a bite, and belong.
            </p>

            <p className="font-script text-3xl text-brown">
              A mother’s effort to reconnect — one taste at a time.
            </p>

            <p>
              To replace junk with joy.
              To swap artificial with authentic.
              To bond, one bite at a time.
            </p>
          </div>
        </div>
      </div>
    </section>
  );
}