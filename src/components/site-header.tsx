import { Link } from "@tanstack/react-router";
import { ShoppingBag, Menu, LogIn, LogOut, User } from "lucide-react";
import { useState } from "react";
import { useCart } from "@/lib/cart";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";

const NAV = [
  { label: "Home", to: "/" as const },
  { label: "Shop", to: "/shop" as const },
  { label: "About", to: "/about" as const },
];

export function SiteHeader() {
  const [open, setOpen] = useState(false);
  const { count } = useCart();
  const { isAuthenticated, signOut, user } = useAuth();

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
            <Link key={n.label} to={n.to} className="hover:text-rust transition-colors relative group">
              {n.label}
              <span className="absolute left-0 -bottom-1 h-px w-0 bg-rust transition-all group-hover:w-full" />
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-1.5">
          {isAuthenticated ? (
            <>
              <span className="hidden md:inline text-[11px] uppercase tracking-wider text-brown/65 max-w-[140px] truncate">
                <User size={13} className="inline mr-1" />
                {user?.email?.split("@")[0]}
              </span>
              <button
                onClick={async () => {
                  await signOut();
                  toast.success("Signed out");
                }}
                aria-label="Sign out"
                title="Sign out"
                className="h-10 w-10 rounded-full hover:bg-brown/10 text-brown grid place-items-center transition-colors"
              >
                <LogOut size={17} strokeWidth={1.6} />
              </button>
            </>
          ) : (
            <Link
              to="/auth"
              search={{ redirect: "/", mode: "login" }}
              aria-label="Sign in"
              title="Sign in"
              className="h-10 w-10 rounded-full hover:bg-brown/10 text-brown grid place-items-center transition-colors"
            >
              <LogIn size={17} strokeWidth={1.6} />
            </Link>
          )}
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
              <Link key={n.label} to={n.to} onClick={() => setOpen(false)} className="py-1 hover:text-rust">
                {n.label}
              </Link>
            ))}
          </nav>
        </div>
      )}
    </header>
  );
}
