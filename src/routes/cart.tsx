import { Link, useNavigate } from "@/lib/router-compat";
import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { Minus, Plus, Trash2, Tag, ChevronRight } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { Button } from "@/components/ui/button";
import { useCart, type CartItem } from "@/lib/cart";
import { rupee } from "@/lib/products";
import { useAuth } from "@/lib/auth";
import emptyDabba from "@/assets/illustration-empty-dabba.png";


function RouteHead() {
  return (
    <Helmet>
      <title>{"Your Dabba — Thayilam"}</title>
      <meta name="description" content="Review your hand-picked snacks before checkout. Cream-coloured cart, rust-coloured rupees." />
      <meta property="og:title" content="Your Dabba — Thayilam" />
      <meta property="og:description" content="Review your hand-picked Indian snacks before checkout." />
      <meta name="robots" content="noindex, nofollow" />
    </Helmet>
  );
}

export default CartPage;


const COUPONS: Record<string, { off: number; label: string }> = {
  PAATI10: { off: 0.1, label: "10% off — Paati's blessing" },
  FREESHIP: { off: 0, label: "Free shipping unlocked" },
  THAYI50: { off: 50, label: "₹50 off — welcome home" },
};

function CartPage() {
  const { items, subtotal, setQty, remove, getProduct } = useCart();
  const { isAuthenticated, loading } = useAuth();
  const navigate = useNavigate();
  const [code, setCode] = useState("");
  const [applied, setApplied] = useState<{ code: string; off: number; flat: number; label: string } | null>(null);

  // Require auth to view cart
  useEffect(() => {
    if (!loading && !isAuthenticated) {
      navigate({ to: "/auth", search: { redirect: "/cart", mode: "login" } });
    }
  }, [loading, isAuthenticated, navigate]);

  const detailed = useMemo(() => {
    type Row = CartItem & { name: string; telugu: string; img: string; mrp: number | null };
    const rows: Row[] = [];
    for (const it of items) {
      const p = getProduct(it.productId);
      if (!p) continue;
      rows.push({
        ...it,
        name: p.name,
        telugu: p.name_telugu ?? "",
        img: p.image_url ?? "",
        mrp: p.mrp ?? null,
      });
    }
    return rows;
  }, [items, getProduct]);

  const delivery = subtotal === 0 ? 0 : subtotal >= 999 || applied?.code === "FREESHIP" ? 0 : 0;
  const discount = applied
    ? applied.off > 0
      ? Math.round(subtotal * applied.off)
      : applied.flat
    : 0;
  const total = Math.max(0, subtotal - discount + delivery);

  const apply = () => {
    const k = code.trim().toUpperCase();
    if (k && COUPONS[k]) {
      const c = COUPONS[k];
      setApplied({ code: k, off: c.off, flat: c.off === 0 && k !== "FREESHIP" ? c.off : (k === "THAYI50" ? 50 : 0), label: c.label });
    } else {
      setApplied(null);
    }
  };

  return (
    <>
      <RouteHead />
      <div className="min-h-screen flex flex-col">
      <SiteHeader />
      <main className="flex-1 paper">
        <div className="border-b border-brown/20">
          <div className="mx-auto max-w-7xl px-5 md:px-8 py-5">
            <nav className="flex items-center gap-2 text-xs text-brown/60 uppercase tracking-widest">
              <Link to="/" className="hover:text-rust">Home</Link>
              <ChevronRight size={12} />
              <Link to="/shop" className="hover:text-rust">Shop</Link>
              <ChevronRight size={12} />
              <span className="text-brown">Cart</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 md:px-8 py-8 md:py-14">

          {items.length === 0 ? (
            <EmptyCart />
          ) : (
            <div className="grid lg:grid-cols-12 gap-8 lg:gap-12">
              {/* ITEMS */}
              <div className="lg:col-span-8 space-y-7">
                <section className="paper-sand ink-border-thin rounded-2xl overflow-hidden">
                  <header className="flex items-center justify-between px-5 md:px-6 py-3 bg-cream border-b border-brown/20">
                    <div className="text-[10px] uppercase tracking-widest text-brown/60">Your selection</div>
                    <span className="text-[10px] uppercase tracking-widest text-olive">Packed together</span>
                  </header>
                  <ul className="divide-y divide-brown/15">
                    {detailed.map((it) => (
                      <li key={it.id} className="flex gap-4 p-4 md:p-5">
                        <div className="relative h-24 w-24 md:h-28 md:w-28 shrink-0 rounded-xl overflow-hidden paper grid place-items-center">
                          <div className="absolute inset-2 rounded-full border border-dashed border-brown/25" />
                          <img
                            src={it.img}
                            alt={it.name}
                            loading="lazy"
                            width={224}
                            height={224}
                            className="relative w-full h-full object-contain p-3 line-art"
                          />
                        </div>
                        <div className="flex-1 min-w-0 flex flex-col">
                          <div className="flex items-start justify-between gap-3">
                            <div className="min-w-0">
                              <h3 className="font-display text-lg text-brown truncate">{it.name}</h3>
                              <div className="text-xs text-brown/55 truncate">{it.telugu}</div>
                            </div>
                            <button
                              onClick={() => remove(it.id)}
                              aria-label={`Remove ${it.name}`}
                              className="shrink-0 h-8 w-8 rounded-full text-brown/60 hover:bg-rust hover:text-cream grid place-items-center transition-colors"
                            >
                              <Trash2 size={15} strokeWidth={1.6} />
                            </button>
                          </div>
                          <div className="mt-1 flex items-center gap-2 flex-wrap">
                            <span className="text-[10px] uppercase tracking-widest px-2 py-0.5 rounded-full ink-border-thin text-brown bg-cream">
                              {it.weight}
                            </span>
                            {it.mrp && it.mrp > it.unitPrice && (
                              <span className="text-[10px] uppercase tracking-widest text-olive font-semibold">
                                Save {rupee(it.mrp - it.unitPrice)}/pack
                              </span>
                            )}
                          </div>
                          <div className="mt-auto pt-3 flex items-end justify-between gap-3">
                            <div className="flex items-center ink-border-thin rounded-full overflow-hidden bg-cream">
                              <button
                                onClick={() => setQty(it.id, it.qty - 1)}
                                aria-label="Decrease"
                                className="h-9 w-9 grid place-items-center text-brown hover:bg-brown hover:text-cream transition-colors"
                              >
                                <Minus size={13} />
                              </button>
                              <span className="w-9 text-center font-display text-base text-brown">{it.qty}</span>
                              <button
                                onClick={() => setQty(it.id, it.qty + 1)}
                                aria-label="Increase"
                                className="h-9 w-9 grid place-items-center text-brown hover:bg-brown hover:text-cream transition-colors"
                              >
                                <Plus size={13} />
                              </button>
                            </div>
                            <div className="text-right">
                              <div className="font-script text-2xl text-rust leading-none">
                                {rupee(it.unitPrice * it.qty)}
                              </div>
                              <div className="text-[10px] text-brown/55 mt-1">
                                {rupee(it.unitPrice)} × {it.qty}
                              </div>
                            </div>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>

                <div className="flex items-center justify-between text-xs text-brown/60 uppercase tracking-widest">
                  <Link to="/shop" className="hover:text-rust">← Continue shopping</Link>
                  <span>Free shipping above ₹999</span>
                </div>
              </div>

              {/* SUMMARY */}
              <aside className="lg:col-span-4">
                <div className="lg:sticky lg:top-24 paper-sand ink-border rounded-2xl p-6 md:p-7">
                  <div className="text-[11px] tracking-[0.3em] uppercase text-olive mb-1">— Order summary —</div>
                  <h2 className="font-display text-2xl text-brown">The bill</h2>
                  <div className="dashed-rule my-5" />

                  <dl className="space-y-3 text-sm">
                    <div className="flex justify-between">
                      <dt className="text-brown/75">Subtotal</dt>
                      <dd className="text-brown font-medium">{rupee(subtotal)}</dd>
                    </div>
                    <div className="flex justify-between">
                      <dt className="text-brown/75">Delivery</dt>
                      <dd className="text-brown font-medium">
                        {delivery === 0 ? <span className="text-olive">Free</span> : rupee(delivery)}
                      </dd>
                    </div>
                    {discount > 0 && (
                      <div className="flex justify-between">
                        <dt className="text-brown/75">Discount ({applied?.code})</dt>
                        <dd className="text-olive font-medium">− {rupee(discount)}</dd>
                      </div>
                    )}
                  </dl>

                  <div className="mt-5">
                    <label className="text-[10px] uppercase tracking-widest text-brown/60">Coupon</label>
                    <div className="mt-2 flex gap-2">
                      <div className="relative flex-1">
                        <Tag size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-brown/50" />
                        <input
                          value={code}
                          onChange={(e) => setCode(e.target.value)}
                          placeholder="PAATI10"
                          className="w-full ink-border-thin rounded-full bg-cream pl-9 pr-3 h-10 text-sm text-brown placeholder:text-brown/40 focus:outline-none focus:ring-2 focus:ring-rust"
                        />
                      </div>
                      <button
                        onClick={apply}
                        className="rounded-full ink-border-thin px-4 h-10 text-xs uppercase tracking-wider text-brown hover:bg-brown hover:text-cream transition-colors"
                      >
                        Apply
                      </button>
                    </div>
                    {applied && (
                      <div className="mt-2 text-xs text-olive font-script text-base">
                        ✦ {applied.label}
                      </div>
                    )}
                    {!applied && code && (
                      <div className="mt-2 text-xs text-rust">Try PAATI10, FREESHIP or THAYI50.</div>
                    )}
                  </div>

                  <div className="dashed-rule my-5" />
                  <div className="flex items-baseline justify-between">
                    <span className="font-display text-brown">Total</span>
                    <span className="font-script text-4xl text-rust leading-none">{rupee(total)}</span>
                  </div>
                  <div className="text-[10px] text-brown/55 mt-1">Inclusive of all taxes</div>

                  <Button asChild size="lg" className="w-full mt-5">
                    <Link to="/checkout">Proceed to Checkout →</Link>
                  </Button>
                  <p className="text-[10px] text-brown/55 mt-3 text-center">
                    Packed by hand · Ships within 24 hours
                  </p>
                </div>
              </aside>
            </div>
          )}
        </div>
      </main>
      <SiteFooter />
    </div>
    </>
  );
}

function EmptyCart() {
  return (
    <div className="paper-sand ink-border-thin rounded-3xl p-10 md:p-20 text-center max-w-2xl mx-auto">
      <img
        src={emptyDabba}
        alt="An empty dabba"
        loading="lazy"
        width={512}
        height={512}
        className="mx-auto w-56 h-56 md:w-64 md:h-64 line-art"
      />
      <h2 className="font-display text-3xl md:text-4xl text-brown mt-4">
        Your dabba is empty!
      </h2>
      <p className="font-script text-2xl text-brown/70 mt-1">
        nothing rattling inside…
      </p>
      <p className="text-sm text-brown/65 mt-4 max-w-sm mx-auto">
        Murukku, ladoo, pickle, pappad — pick a few favourites and we'll tie them up with thread.
      </p>
      <Button asChild size="lg" className="mt-6">
        <Link to="/shop">Fill it up →</Link>
      </Button>
    </div>
  );
}
