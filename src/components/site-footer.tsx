import { LeafIcon, FlowerIcon, SparkIcon } from "./icons";

export function SiteFooter() {
  return (
    <footer className="relative pt-16 pb-10">
      <div className="mx-auto max-w-7xl px-6">
        <div className="dashed-rule mb-12" />
        <div className="grid md:grid-cols-4 gap-10">
          <div className="md:col-span-2">
            <div className="font-script text-5xl text-red-700 leading-none">Thayilam</div>
            <div className="font-script text-brown/60 text-2xl mt-1">a sweet surprise</div>
          </div>

          <div>
            <div className="text-[10px] uppercase tracking-widest text-red-700 mb-3">Wander</div>
            <ul className="space-y-2 text-brown">
              <li><a href="#shop" className="hover:text-rust">Shop</a></li>
              <li><a href="#story" className="hover:text-rust">Our story</a></li>
              <li><a href="#letter" className="hover:text-rust">Letters</a></li>
              <li><a href="#letter" className="hover:text-rust">Policies</a></li>
            </ul>
          </div>

          {/* <div>
            <div className="text-[10px] uppercase tracking-widest text-brown/60 mb-3">Stay near</div>
            <p className="text-brown/80 text-sm mb-3">A short letter, once a season. No spam, only sweets.</p>
            <form
              className="flex items-center gap-2"
              onSubmit={(e) => e.preventDefault()}
            >
              <input
                type="email"
                placeholder="your@kitchen.email"
                className="flex-1 bg-transparent border-b border-brown/60 focus:border-rust outline-none py-2 text-sm placeholder:text-brown/40"
              />
              <button className="text-rust" aria-label="Subscribe">
                <SparkIcon size={20} />
              </button>
            </form>
          </div> */}
        </div>

        <div className="dashed-rule my-10" />

        <div className="flex flex-col md:flex-row gap-4 items-center justify-between text-xs text-brown/60">
          <div className="flex items-center gap-2">
            <LeafIcon size={16} className="text-olive" />
            <span>© {new Date().getFullYear()} Thayilam Sweets. Hand-rolled in out kitchen.</span>
            <FlowerIcon size={16} className="text-rust" />
          </div>
          <div className="uppercase tracking-widest">
            Made with ghee · authentic ground nut oil · No preservatives
          </div>
        </div>
      </div>
    </footer>
  );
}
