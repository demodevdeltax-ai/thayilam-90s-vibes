import { Link } from "@tanstack/react-router";
import { Search, ShoppingBag, Menu } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";

const NAV = [
  { label: "Home", href: "/" },
  { label: "Shop", href: "/shop" },
  { label: "About", href: "/about" },
  { label: "Contact", href: "/#contact" },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();

  return (
    <header className="sticky top-0 z-40 paper border-b border-brown/20 backdrop-blur-[1px]">
      <div className="mx-auto max-w-7xl px-5 md:px-8 h-16 md:h-20 flex items-center justify-between gap-4">
        <Link to="/" className="flex items-end gap-2 shrink-0">
          <span className="font-script text-3xl md:text-4xl leading-none text-brown">
            Thayilam
          </span>
          <span className="hidden md:inline-block font-script text-brown/55 text-sm pb-1">
            a sweet surprise
          </span>
        </Link>

        <nav className="hidden md:flex items-center gap-9 text-[13px] tracking-[0.18em] uppercase text-brown/85">
          {NAV.map((n) => (
            <a key={n.label} href={n.href} className="hover:text-rust transition-colors relative group">
              {n.label}
              <span className="absolute left-0 -bottom-1 h-px w-0 bg-rust transition-all group-hover:w-full" />
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          <button aria-label="Search" className="h-10 w-10 rounded-full hover:bg-brown/10 text-brown grid place-items-center transition-colors">
            <Search size={18} strokeWidth={1.6} />
          </button>
          <Link
            to="/cart"
            aria-label="Cart"
            className="relative h-10 w-10 rounded-full hover:bg-brown/10 text-brown grid place-items-center transition-colors"
          >
            <ShoppingBag size={18} strokeWidth={1.6} />
            {count > 0 && (
              <span className="absolute -top-0.5 -right-0.5 text-[10px] bg-rust text-cream rounded-full h-4 min-w-4 px-1 grid place-items-center font-semibold">
                {count}
              </span>
            )}
          </Link>
          <button
            aria-label="Menu"
            className="md:hidden h-10 w-10 rounded-full hover:bg-brown/10 text-brown grid place-items-center"
            onClick={() => setOpen((v) => !v)}
          >
            <Menu size={20} strokeWidth={1.6} />
          </button>
        </div>
      </div>

      {open && (
        <div className="md:hidden border-t border-brown/20 paper">
          <nav className="px-6 py-4 flex flex-col gap-3 text-sm tracking-[0.18em] uppercase text-brown">
            {NAV.map((n) => (
              <a key={n.label} href={n.href} onClick={() => setOpen(false)} className="py-1 hover:text-rust">
                {n.label}
              </a>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
