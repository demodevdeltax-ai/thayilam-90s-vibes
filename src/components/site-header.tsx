import { Link } from "@tanstack/react-router";
import { LeafIcon } from "./icons";

export function SiteHeader() {
  return (
    <header className="relative z-10">
      <div className="mx-auto max-w-7xl px-6 pt-8 pb-6 flex items-center justify-between">
        <Link to="/" className="flex items-end gap-2">
          <span className="font-script text-4xl md:text-5xl leading-none text-brown">
            Thayilam
          </span>
          <span className="hidden sm:inline-block font-script text-brown/60 text-lg pb-1">
            — a sweet surprise
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-8 text-sm tracking-wide uppercase text-brown/80">
          <a href="#shop" className="hover:text-rust transition-colors">Shop</a>
          <a href="#story" className="hover:text-rust transition-colors">Our Story</a>
          <a href="#letter" className="hover:text-rust transition-colors">Letters</a>
          <a href="#visit" className="hover:text-rust transition-colors">Visit</a>
        </nav>

        <div className="flex items-center gap-3">
          <LeafIcon size={22} className="text-olive -rotate-12 hidden sm:block" />
          <button className="rounded-full ink-border-thin px-4 py-2 text-xs uppercase tracking-wider text-brown hover:bg-brown hover:text-cream transition-colors">
            Basket · 0
          </button>
        </div>
      </div>
      <div className="dashed-rule mx-auto max-w-7xl" />
    </header>
  );
}
