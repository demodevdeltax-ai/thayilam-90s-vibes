import { createFileRoute, Link, notFound } from "@tanstack/react-router";
import { useMemo, useState } from "react";
import {
  Star,
  Minus,
  Plus,
  Heart,
  ChevronRight,
  ChevronLeft,
  ShieldCheck,
  Truck,
  Sparkles,
} from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LeafIcon, FlowerIcon } from "@/components/icons";
import { PRODUCTS, rupee, type Product, type Weight } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/shop/$productId")({
  component: ProductDetailPage,
  loader: ({ params }) => {
    const product = PRODUCTS.find((p) => p.id === params.productId);
    if (!product) throw notFound();
    return { product };
  },
  head: ({ loaderData }) => {
    const p = loaderData?.product;
    if (!p) return { meta: [{ title: "Product — Thayilam" }] };
    return {
      meta: [
        { title: `${p.name} — Thayilam` },
        {
          name: "description",
          content: `${p.name} (${p.telugu}) by ${p.vendor}. ${p.weight} pack at ${rupee(p.price)}. Hand-rolled in Chennai, ships within 24 hours.`,
        },
        { property: "og:title", content: `${p.name} — Thayilam` },
        {
          property: "og:description",
          content: `Small-batch ${p.category.toLowerCase()} from ${p.vendor}. Made fresh, no preservatives.`,
        },
        { property: "og:image", content: p.img },
        { property: "twitter:image", content: p.img },
      ],
    };
  },
  notFoundComponent: () => (
    <div className="min-h-screen grid place-items-center paper">
      <div className="text-center">
        <h1 className="font-display text-4xl text-brown">Snack not found</h1>
        <p className="text-brown/70 mt-2">That dabba is empty.</p>
        <div className="mt-6">
          <Button asChild><Link to="/shop">Back to shop</Link></Button>
        </div>
      </div>
    </div>
  ),
});

const WEIGHTS_AVAILABLE = ["100g", "250g", "500g"] as const;
type WeightChoice = (typeof WEIGHTS_AVAILABLE)[number];

const WEIGHT_MULT: Record<WeightChoice, number> = {
  "100g": 0.45,
  "250g": 1,
  "500g": 1.85,
};

const REVIEWS = [
  { name: "Lakshmi R.", city: "Bengaluru", rating: 5, date: "Apr 12, 2025", body: "Wrapped in newspaper and brown thread. Tasted exactly like my Madurai summers. I cried a little." },
  { name: "Mr. Subramaniam", city: "Mylapore", rating: 5, date: "Apr 03, 2025", body: "Sent a box to my son in Boston. He called at 2am to say it tasted like Sunday morning at our old house." },
  { name: "Anjali D.", city: "Pune", rating: 4, date: "Mar 28, 2025", body: "Dangerous. Finished a 200g packet standing at the kitchen counter, watching the rain." },
  { name: "Rohan M.", city: "Chennai", rating: 5, date: "Mar 19, 2025", body: "The ghee aroma when you open the box — instant childhood. Will reorder." },
];

const RATING_BREAKDOWN = [
  { stars: 5, count: 142 },
  { stars: 4, count: 38 },
  { stars: 3, count: 9 },
  { stars: 2, count: 2 },
  { stars: 1, count: 1 },
];

function Stars({ value, size = 14 }: { value: number; size?: number }) {
  return (
    <div className="flex items-center gap-0.5 text-rust">
      {Array.from({ length: 5 }).map((_, i) => (
        <Star
          key={i}
          size={size}
          strokeWidth={1.4}
          fill={i < Math.round(value) ? "currentColor" : "none"}
        />
      ))}
    </div>
  );
}

function ProductDetailPage() {
  const { product } = Route.useLoaderData();

  const [zoomXY, setZoomXY] = useState<{ x: number; y: number } | null>(null);
  const [activeImg, setActiveImg] = useState(0);
  const [weight, setWeight] = useState<WeightChoice>(
    (WEIGHTS_AVAILABLE as readonly string[]).includes(product.weight)
      ? (product.weight as WeightChoice)
      : "250g",
  );
  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const cart = useCart();
  const navigate = useNavigate();

  // Build a small gallery from this and a few sibling images
  const gallery = useMemo(() => {
    const others = PRODUCTS.filter((p) => p.id !== product.id).slice(0, 3).map((p) => p.img);
    return [product.img, ...others];
  }, [product]);

  // Recommendation algorithm:
  // 1. Score each other product:
  //    +5 same category, +3 shared diet tag, +2 similar price (within 30%),
  //    +1 popularity boost (popularity / 100), +2 cross-category bonus
  //    (so we always surface variety from other categories), -2 same vendor
  //    (we DO want different makers represented).
  // 2. Take top 8, then ensure at least 3 different categories in the final
  //    list of 6 by reshuffling.
  const related = useMemo(() => {
    const scored = PRODUCTS.filter((p) => p.id !== product.id).map((p) => {
      let s = 0;
      if (p.category === product.category) s += 5;
      const sharedDiet = p.diet.filter((d) => product.diet.includes(d)).length;
      s += sharedDiet * 3;
      const priceDelta = Math.abs(p.price - product.price) / product.price;
      if (priceDelta < 0.3) s += 2;
      s += p.popularity / 100;
      if (p.category !== product.category) s += 2; // cross-category variety bonus
      return { p, s, cat: p.category };
    });
    scored.sort((a, b) => b.s - a.s);

    // Diversify: ensure at least 3 distinct categories among top 6.
    const picked: typeof scored = [];
    const catCount: Record<string, number> = {};
    for (const item of scored) {
      const c = catCount[item.cat] ?? 0;
      // Cap any single category to 2 picks until we have 6 items.
      if (c >= 2 && picked.length < 6) continue;
      picked.push(item);
      catCount[item.cat] = c + 1;
      if (picked.length === 6) break;
    }
    // Fallback: top up if we didn't reach 6 due to caps.
    if (picked.length < 6) {
      for (const item of scored) {
        if (picked.length >= 6) break;
        if (!picked.find((x) => x.p.id === item.p.id)) picked.push(item);
      }
    }
    return picked.map((x) => x.p);
  }, [product]);

  const unitPrice = Math.round(product.price * WEIGHT_MULT[weight]);
  const unitMrp = product.mrp ? Math.round(product.mrp * WEIGHT_MULT[weight]) : undefined;
  const total = unitPrice * qty;

  const totalReviews = RATING_BREAKDOWN.reduce((s, r) => s + r.count, 0);
  const avgRating =
    RATING_BREAKDOWN.reduce((s, r) => s + r.stars * r.count, 0) / totalReviews;

  return (
    <div className="min-h-screen flex flex-col">
      <SiteHeader />

      <main className="flex-1 paper">
        {/* Breadcrumb */}
        <div className="border-b border-brown/20">
          <div className="mx-auto max-w-7xl px-5 md:px-8 py-5">
            <nav className="flex items-center gap-2 text-xs text-brown/60 uppercase tracking-widest flex-wrap">
              <Link to="/" className="hover:text-rust">Home</Link>
              <ChevronRight size={12} />
              <Link to="/shop" className="hover:text-rust">Shop</Link>
              <ChevronRight size={12} />
              <span className="text-brown/80">{product.category}</span>
              <ChevronRight size={12} />
              <span className="text-brown">{product.name}</span>
            </nav>
          </div>
        </div>

        <div className="mx-auto max-w-7xl px-5 md:px-8 py-8 md:py-14 grid lg:grid-cols-12 gap-10 lg:gap-14">
          {/* GALLERY */}
          <div className="lg:col-span-7">
            <div className="grid md:grid-cols-[88px_1fr] gap-4">
              {/* Thumbnails */}
              <div className="order-2 md:order-1 flex md:flex-col gap-3">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative aspect-square w-20 md:w-full rounded-xl overflow-hidden ink-border-thin paper-sand grid place-items-center transition-all ${
                      i === activeImg ? "ring-2 ring-rust ring-offset-2 ring-offset-cream" : "hover:-translate-y-0.5"
                    }`}
                  >
                    <img
                      src={src}
                      alt=""
                      loading="lazy"
                      className="w-full h-full object-contain p-2 line-art"
                    />
                  </button>
                ))}
              </div>

              {/* Main image with hover zoom */}
              <div className="order-1 md:order-2 relative">
                <div
                  onMouseMove={(e) => {
                    const r = e.currentTarget.getBoundingClientRect();
                    setZoomXY({
                      x: ((e.clientX - r.left) / r.width) * 100,
                      y: ((e.clientY - r.top) / r.height) * 100,
                    });
                  }}
                  onMouseLeave={() => setZoomXY(null)}
                  className="relative aspect-square paper-sand ink-border rounded-3xl overflow-hidden cursor-zoom-in group"
                >
                  <div className="absolute inset-6 rounded-full border border-dashed border-brown/30" />
                  <div className="absolute inset-12 rounded-full border border-brown/15" />
                  <img
                    src={gallery[activeImg]}
                    alt={product.name}
                    width={768}
                    height={768}
                    className="absolute inset-0 w-full h-full object-contain p-12 line-art transition-transform duration-200"
                    style={
                      zoomXY
                        ? {
                            transformOrigin: `${zoomXY.x}% ${zoomXY.y}%`,
                            transform: "scale(1.8)",
                          }
                        : undefined
                    }
                  />

                  {product.badge && (
                    <span className="absolute top-4 left-4 z-10 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-rust text-cream font-semibold">
                      {product.badge}
                    </span>
                  )}
                  <span className="absolute top-4 right-4 z-10 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-olive text-cream font-semibold">
                    {product.category}
                  </span>

                  {/* handwritten note */}
                  <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between gap-3 pointer-events-none">
                    <div className="paper rounded-xl ink-border-thin px-3 py-2 stamp-rotate-l shadow-[3px_3px_0_var(--brown)]">
                      <div className="font-script text-lg text-brown leading-none">
                        Amma's recipe
                      </div>
                      <div className="text-[10px] uppercase tracking-widest text-brown/60 mt-1">
                        since 1992 ✦
                      </div>
                    </div>
                    <FlowerIcon size={28} className="text-olive" />
                  </div>
                </div>
              </div>
            </div>

            {/* Tabs */}
            <Tabs defaultValue="description" className="mt-10">
              <TabsList className="bg-transparent p-0 h-auto flex flex-wrap gap-1 border-b border-brown/30 w-full justify-start rounded-none">
                {["description", "ingredients", "nutrition", "shipping"].map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    className="capitalize rounded-none border-b-2 border-transparent data-[state=active]:border-rust data-[state=active]:bg-transparent data-[state=active]:text-rust data-[state=active]:shadow-none px-4 py-2.5 text-xs uppercase tracking-widest text-brown/70 hover:text-brown"
                  >
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>

              <TabsContent value="description" className="paper-sand ink-border-thin rounded-2xl p-6 md:p-7 mt-5">
                <p className="text-brown/85 leading-relaxed whitespace-pre-line">
                  {product.description}
                </p>
                {product.highlights.length > 0 && (
                  <>
                    <div className="dashed-rule my-5" />
                    <div className="text-[11px] uppercase tracking-[0.25em] text-brown/60 mb-3">
                      What makes it special
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-brown/85">
                      {product.highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2">
                          <LeafIcon size={14} className="text-olive shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </TabsContent>

              <TabsContent value="ingredients" className="paper-sand ink-border-thin rounded-2xl p-6 md:p-7 mt-5">
                <p className="font-display text-lg text-brown mb-3 italic">Made with:</p>
                <div className="flex flex-wrap gap-2">
                  {[
                    "Rice flour",
                    "Urad dal",
                    "A2 ghee",
                    "Cardamom",
                    "Curry leaves",
                    "Hing",
                    "Sea salt",
                    "Jaggery",
                    "Cashew",
                  ].map((i) => (
                    <span key={i} className="text-xs uppercase tracking-wider px-3 py-1.5 rounded-full ink-border-thin text-brown bg-cream">
                      {i}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-brown/60 mt-5">
                  Allergens: contains dairy and tree nuts. Made in a kitchen that handles wheat and sesame.
                </p>
              </TabsContent>

              <TabsContent value="nutrition" className="paper-sand ink-border-thin rounded-2xl p-6 md:p-7 mt-5">
                <div className="text-xs uppercase tracking-widest text-brown/60 mb-3">
                  Per 100g serving (approx.)
                </div>
                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  {[
                    ["Energy", "498 kcal"],
                    ["Protein", "8.2 g"],
                    ["Carbs", "52 g"],
                    ["Fat", "26 g"],
                    ["Sugar", "14 g"],
                    ["Fibre", "3.1 g"],
                    ["Sodium", "320 mg"],
                    ["Iron", "1.4 mg"],
                  ].map(([k, v]) => (
                    <div key={k} className="paper rounded-xl ink-border-thin p-3 text-center">
                      <dt className="text-[10px] uppercase tracking-widest text-brown/55">{k}</dt>
                      <dd className="font-display text-xl text-brown mt-1">{v}</dd>
                    </div>
                  ))}
                </dl>
              </TabsContent>

              <TabsContent value="shipping" className="paper-sand ink-border-thin rounded-2xl p-6 md:p-7 mt-5 space-y-3 text-sm text-brown/85">
                <p><span className="font-semibold text-brown">Ships within 24 hours</span> of order, packed in food-safe brown paper and tied with thread.</p>
                <p>Standard delivery <span className="font-semibold">3–5 working days</span> across India. Free shipping on orders above ₹999.</p>
                <p>For freshness, we don't ship on Sundays — your dabba rests with us.</p>
              </TabsContent>
            </Tabs>
          </div>

          {/* BUY BOX */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">
              <div className="text-[11px] tracking-[0.3em] uppercase text-olive mb-2">
                {product.category} · by {product.vendor}
              </div>
              <h1 className="font-script text-rust leading-[0.85] text-6xl md:text-7xl">
                {product.name}
              </h1>
              <div className="mt-2 font-display italic text-2xl text-brown/80">
                {product.telugu}
              </div>

              <div className="mt-4 flex items-center gap-3">
                <Stars value={avgRating} size={16} />
                <span className="text-sm text-brown/75">
                  {avgRating.toFixed(1)} · {totalReviews} reviews
                </span>
              </div>

              {product.highlights.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {product.highlights.slice(0, 5).map((h) => (
                    <span
                      key={h}
                      className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full ink-border-thin text-brown bg-cream"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}

              <div className="dashed-rule my-6" />

              {/* price */}
              <div className="flex items-baseline gap-3">
                <span className="font-script text-5xl text-rust leading-none">
                  {rupee(unitPrice)}
                </span>
                {unitMrp && (
                  <>
                    <span className="text-brown/45 line-through">{rupee(unitMrp)}</span>
                    <span className="text-[11px] uppercase tracking-widest text-olive font-semibold">
                      Save {rupee(unitMrp - unitPrice)}
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs text-brown/60 mt-1">Inclusive of all taxes</div>

              {/* weight */}
              <div className="mt-6">
                <div className="text-[11px] uppercase tracking-[0.25em] text-brown/70 mb-2">
                  Pack size
                </div>
                <div className="flex flex-wrap gap-2">
                  {WEIGHTS_AVAILABLE.map((w) => {
                    const active = w === weight;
                    return (
                      <button
                        key={w}
                        onClick={() => setWeight(w)}
                        className={`relative h-11 min-w-[72px] px-4 rounded-full text-xs uppercase tracking-wider transition-colors ink-border-thin ${
                          active
                            ? "bg-brown text-cream"
                            : "text-brown hover:bg-brown/10"
                        }`}
                      >
                        <span
                          className={`absolute top-1 right-1 h-2 w-2 rounded-full transition-colors ${
                            active ? "bg-rust" : "bg-transparent"
                          }`}
                        />
                        {w}
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* qty + buttons */}
              <div className="mt-6 flex flex-wrap items-stretch gap-3">
                <div className="flex items-center ink-border-thin rounded-full overflow-hidden bg-cream">
                  <button
                    onClick={() => setQty((q) => Math.max(1, q - 1))}
                    aria-label="Decrease"
                    className="h-11 w-11 grid place-items-center text-brown hover:bg-brown hover:text-cream transition-colors"
                  >
                    <Minus size={14} />
                  </button>
                  <span className="w-10 text-center font-display text-lg text-brown">
                    {qty}
                  </span>
                  <button
                    onClick={() => setQty((q) => Math.min(20, q + 1))}
                    aria-label="Increase"
                    className="h-11 w-11 grid place-items-center text-brown hover:bg-brown hover:text-cream transition-colors"
                  >
                    <Plus size={14} />
                  </button>
                </div>

                <Button
                  size="lg"
                  className="flex-1 min-w-[140px]"
                  onClick={() => cart.add(product.id, weight as Weight, qty, unitPrice)}
                >
                  Add to Cart · {rupee(total)}
                </Button>
                <Button
                  size="lg"
                  variant="outline"
                  className="flex-1 min-w-[120px]"
                  onClick={() => {
                    cart.add(product.id, weight as Weight, qty, unitPrice);
                    navigate({ to: "/checkout" });
                  }}
                >
                  Buy Now
                </Button>

                <button
                  onClick={() => setWished((v) => !v)}
                  aria-label="Save to wishlist"
                  className={`h-12 w-12 rounded-full ink-border-thin grid place-items-center transition-colors ${
                    wished ? "bg-rust text-cream" : "text-brown hover:bg-brown/10"
                  }`}
                >
                  <Heart size={18} fill={wished ? "currentColor" : "none"} strokeWidth={1.6} />
                </button>
              </div>

              {/* trust badges */}
              <div className="mt-7 grid grid-cols-3 gap-3">
                {[
                  { Icon: ShieldCheck, top: "No", bottom: "Preservatives" },
                  { Icon: Sparkles, top: "Made", bottom: "Fresh Daily" },
                  { Icon: Truck, top: "Ships in", bottom: "24 hours" },
                ].map(({ Icon, top, bottom }) => (
                  <div
                    key={bottom}
                    className="paper-sand ink-border-thin rounded-xl p-3 text-center"
                  >
                    <Icon size={22} strokeWidth={1.4} className="text-olive mx-auto mb-1.5" />
                    <div className="text-[10px] uppercase tracking-widest text-brown/60">{top}</div>
                    <div className="text-xs font-semibold text-brown">{bottom}</div>
                  </div>
                ))}
              </div>

              {/* vendor card */}
              <VendorCard product={product} />
            </div>
          </div>
        </div>

        {/* RELATED */}
        <section className="border-t border-brown/20 paper-sand">
          <div className="mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase text-olive mb-2">— Picked just for you —</div>
                <h2 className="font-display text-3xl md:text-4xl text-brown">
                  More from the dabba
                </h2>
              </div>
              <Link to="/shop" className="hidden sm:inline text-xs uppercase tracking-widest text-rust hover:underline">
                View all →
              </Link>
            </div>

            <div className="-mx-5 md:-mx-8 px-5 md:px-8 overflow-x-auto scrollbar-none">
              <div className="grid grid-flow-col auto-cols-[78%] sm:auto-cols-[44%] md:auto-cols-[30%] lg:auto-cols-[23%] gap-5 pb-2">
                {related.map((p) => (
                  <Link
                    key={p.id}
                    to="/shop/$productId"
                    params={{ productId: p.id }}
                    className="block"
                  >
                    <ProductCard p={p} />
                  </Link>
                ))}
              </div>
            </div>
          </div>
        </section>

        {/* REVIEWS */}
        <section className="border-t border-brown/20">
          <div className="mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-20 grid md:grid-cols-12 gap-10">
            <aside className="md:col-span-4 paper-sand ink-border-thin rounded-2xl p-6 md:p-7 self-start">
              <div className="text-[11px] tracking-[0.3em] uppercase text-olive mb-2">
                — Customer letters —
              </div>
              <div className="flex items-end gap-3">
                <div className="font-script text-rust text-7xl leading-none">
                  {avgRating.toFixed(1)}
                </div>
                <div className="pb-2">
                  <Stars value={avgRating} size={18} />
                  <div className="text-xs text-brown/65 mt-1">{totalReviews} reviews</div>
                </div>
              </div>

              <div className="dashed-rule my-5" />

              <ul className="space-y-2.5">
                {RATING_BREAKDOWN.map(({ stars, count }) => {
                  const pct = (count / totalReviews) * 100;
                  return (
                    <li key={stars} className="flex items-center gap-3 text-sm text-brown">
                      <span className="w-3 text-right tabular-nums">{stars}</span>
                      <Star size={12} fill="currentColor" className="text-rust" />
                      <div className="flex-1 h-2 rounded-full bg-brown/15 overflow-hidden">
                        <div className="h-full bg-rust" style={{ width: `${pct}%` }} />
                      </div>
                      <span className="w-10 text-right tabular-nums text-xs text-brown/60">
                        {count}
                      </span>
                    </li>
                  );
                })}
              </ul>

              <Button className="w-full mt-6" variant="outline">Write a letter</Button>
            </aside>

            <div className="md:col-span-8 grid sm:grid-cols-2 gap-5">
              {REVIEWS.map((r, i) => (
                <figure
                  key={r.name}
                  className="paper ink-border-thin rounded-2xl p-6"
                  style={{ transform: `rotate(${[-0.6, 0.4, -0.3, 0.5][i]}deg)` }}
                >
                  <div className="flex items-center justify-between gap-3 mb-3">
                    <div className="flex items-center gap-3">
                      <div className="h-10 w-10 rounded-full bg-olive text-cream grid place-items-center font-display text-base">
                        {r.name.charAt(0)}
                      </div>
                      <div>
                        <div className="font-display text-base text-brown leading-tight">
                          {r.name}
                        </div>
                        <div className="text-[10px] uppercase tracking-widest text-brown/55">
                          {r.city} · {r.date}
                        </div>
                      </div>
                    </div>
                    <Stars value={r.rating} />
                  </div>
                  <blockquote className="font-display italic text-brown leading-relaxed">
                    "{r.body}"
                  </blockquote>
                </figure>
              ))}
            </div>
          </div>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppFab />
    </div>
  );
}

function VendorCard({ product }: { product: Product }) {
  return (
    <div className="paper-sand ink-border-thin rounded-2xl p-5 mt-7 relative overflow-hidden">
      <span
        aria-hidden
        className="absolute -right-4 -top-4 h-20 w-20 rounded-full border border-dashed border-brown/30"
      />
      <div className="flex items-center gap-4">
        <div className="h-14 w-14 rounded-full ink-border-thin paper grid place-items-center text-rust font-display text-2xl shrink-0">
          {product.vendor.charAt(0)}
        </div>
        <div className="min-w-0 flex-1">
          <div className="text-[10px] uppercase tracking-widest text-brown/55">Made by</div>
          <div className="font-display text-lg text-brown leading-tight truncate">
            {product.vendor}
          </div>
          <div className="flex items-center gap-2 text-xs text-brown/65 mt-0.5">
            <LeafIcon size={12} className="text-olive" />
            T. Nagar, Chennai · ★ 4.8
          </div>
        </div>
      </div>
      <Link
        to="/shop"
        className="mt-4 inline-flex items-center gap-1 text-xs uppercase tracking-widest text-rust hover:underline"
      >
        View all from this vendor
        <ChevronRight size={12} />
      </Link>
    </div>
  );
}

// (used by related strip arrows on lg+; kept for future use)
export function _ScrollHint() {
  return <ChevronLeft className="hidden" />;
}
