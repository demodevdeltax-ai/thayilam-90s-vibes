import { Link, useNavigate, useParams } from "@/lib/router-compat";
import { useEffect, useMemo, useState } from "react";
import { Helmet } from "react-helmet-async";
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
import { rupee, type Weight } from "@/lib/products";
import { useCart } from "@/lib/cart";
import { supabase } from "@/lib/supabase";

export default ProductDetailPage;

const WEIGHTS_AVAILABLE = ["100g", "250g", "500g"] as const;
type WeightChoice = (typeof WEIGHTS_AVAILABLE)[number];

const WEIGHT_MULT: Record<string, number> = {
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

// ============================================================
// IMAGE RESOLVER — exact same logic as product-card.tsx
// Case A: full https:// URL → use as-is
// Case B: filename/path  → build Supabase Storage URL
// Case C: null/empty     → placeholder
// ============================================================
function resolveImage(image_url?: string | null): string {
  if (!image_url || image_url.trim() === "") return "/placeholder.jpeg";

  if (image_url.startsWith("http://") || image_url.startsWith("https://")) {
    return image_url;
  }

  const base = import.meta.env.VITE_SUPABASE_URL;
  if (!base) {
    console.warn("[ProductDetail] VITE_SUPABASE_URL is not set in .env");
    return "/placeholder.jpeg";
  }

  return `${base}/storage/v1/object/public/product-images/${image_url}`;
}

// ============================================================
// SAFE IMG — falls back to placeholder on load error
// ============================================================
function SafeImg({
  src,
  alt,
  className,
  width,
  height,
  style,
}: {
  src: string;
  alt: string;
  className?: string;
  width?: number;
  height?: number;
  style?: React.CSSProperties;
}) {
  return (
    <img
      src={src}
      alt={alt}
      width={width}
      height={height}
      className={className}
      style={style}
      onError={(e) => {
        const t = e.currentTarget;
        if (!t.src.endsWith("/placeholder.jpeg")) {
          t.src = "/placeholder.jpeg";
        }
      }}
    />
  );
}

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

// ============================================================
// ROUTE WRAPPER — fetches data, handles loading/not-found
// ============================================================
function ProductDetailPage() {
  const { productId } = useParams<{ productId: string }>();
  const [product, setProduct] = useState<any | null>(null);
  const [allProducts, setAllProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      setLoading(true);

      const [{ data: prod, error: prodErr }, { data: all, error: allErr }] =
        await Promise.all([
          supabase
            .from("products")
            .select("*, categories(slug, name)")
            .eq("id", productId)
            .eq("is_active", true)
            .single(),
          supabase
            .from("products")
            .select("*, categories(slug, name)")
            .eq("is_active", true),
        ]);

      if (prodErr) console.error("Product fetch error:", prodErr);
      if (allErr) console.error("All products fetch error:", allErr);

      // Flatten joined category fields onto each product
      const normalize = (p: any) => ({
        ...p,
        category_slug: p.categories?.slug ?? "general",
        // keep category_name from DB; fall back to joined name
        category_name: p.category_name ?? p.categories?.name ?? "General",
      });

      if (prod) setProduct(normalize(prod));
      if (all) setAllProducts(all.map(normalize));

      setLoading(false);
    };

    if (productId) load();
  }, [productId]);

  if (loading) {
    return (
      <div className="min-h-screen grid place-items-center paper">
        <p className="font-script text-rust text-4xl">Loading…</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen grid place-items-center paper">
        <div className="text-center">
          <h1 className="font-display text-4xl text-brown">Snack not found</h1>
          <p className="text-brown/70 mt-2">That dabba is empty.</p>
          <div className="mt-6">
            <Button asChild><Link to="/shop">Back to shop</Link></Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <ProductDetailInner
      product={product}
      allProducts={allProducts}
      productId={productId}
    />
  );
}

type Variant = {
  size: number;
  price: number;
  mrp: number;
};

function decodeVariants(highlights: string[] = []): Variant[] {
  const v = highlights.find((h) => h.startsWith("VARIANTS::"));
  if (!v) return [];

  try {
    return JSON.parse(v.replace("VARIANTS::", ""));
  } catch {
    return [];
  }
}

// ============================================================
// MAIN DETAIL PAGE
// ============================================================
function ProductDetailInner({
  product,
  allProducts,
  productId,
}: {
  product: any;
  allProducts: any[];
  productId: string;
}) {
  const [zoomXY, setZoomXY] = useState<{ x: number; y: number } | null>(null);
  const [activeImg, setActiveImg] = useState(0);

  // Use pack_sizes from DB if available, else WEIGHTS_AVAILABLE
  const availableWeights = useMemo(() => {
    const sizes = product.pack_sizes;

    if (!sizes || sizes.length === 0) {
      // fallback if DB empty
      return ["250g"];
    }

    // normalize everything to string format like "250g"
    return sizes.map((s: any) => {
      if (typeof s === "number") return `${s}g`;
      if (typeof s === "string") return s.toLowerCase().trim();
      return "";
    }).filter(Boolean);
  }, [product.pack_sizes]);

  const [weight, setWeight] = useState<string>(() => {
    const sizes = product.pack_sizes;

    if (sizes && sizes.length > 0) {
      const first = sizes[0];
      return typeof first === "number" ? `${first}g` : first;
    }

    return "250g";
  });

  const [qty, setQty] = useState(1);
  const [wished, setWished] = useState(false);
  const cart = useCart();
  const navigate = useNavigate();

  // Gallery: product's own image first, then sibling product images
  const gallery = useMemo(() => {
    return [resolveImage(product.image_url)];
  }, [product]);

  // Related products scored by category, diet overlap, price proximity
  const related = useMemo(() => {
    const scored = allProducts
      .filter((p) => p.id !== product.id)
      .map((p) => {
        let s = 0;
        if (p.category_slug === product.category_slug) s += 5;
        const sharedDiet = (p.diet ?? []).filter((d: string) =>
          (product.diet ?? []).includes(d)
        ).length;
        s += sharedDiet * 3;
        const priceDelta =
          Math.abs(Number(p.price) - Number(product.price)) /
          (Number(product.price) || 1);
        if (priceDelta < 0.3) s += 2;
        s += (p.popularity ?? 50) / 100;
        if (p.category_slug !== product.category_slug) s += 2;
        return { p, s, cat: p.category_slug };
      });

    scored.sort((a, b) => b.s - a.s);

    const picked: typeof scored = [];
    const catCount: Record<string, number> = {};
    for (const item of scored) {
      const c = catCount[item.cat] ?? 0;
      if (c >= 2 && picked.length < 6) continue;
      picked.push(item);
      catCount[item.cat] = c + 1;
      if (picked.length === 6) break;
    }
    if (picked.length < 6) {
      for (const item of scored) {
        if (picked.length >= 6) break;
        if (!picked.find((x) => x.p.id === item.p.id)) picked.push(item);
      }
    }
    return picked.map((x) => x.p);
  }, [product, allProducts]);

  const multiplier = WEIGHT_MULT[weight] ?? 1;

  const unitPrice = Math.round(Number(product.price || 0) * multiplier);

  const unitMrp = product.mrp
    ? Math.round(Number(product.mrp || 0) * multiplier)
    : undefined;

  const total = unitPrice * qty;

  const discount =
    unitMrp && unitMrp > 0
      ? Math.round(((unitMrp - unitPrice) / unitMrp) * 100)
      : 0;

  const totalReviews = RATING_BREAKDOWN.reduce((s, r) => s + r.count, 0);
  const avgRating =
    RATING_BREAKDOWN.reduce((s, r) => s + r.stars * r.count, 0) / totalReviews;

  const productUrl = `https://thayilam-90s-vibes.lovable.app/shop/${productId}`;
  const categoryDisplay = product.category_name ?? "General";

  // Diet tags formatted for display
  const dietTags: string[] = product.diet ?? [];

  // Highlights from DB
  const highlights: string[] = product.highlights ?? [];

  return (
    <div className="min-h-screen flex flex-col">
      <Helmet>
        <title>{`${product.name} — Thayilam`}</title>
        <meta
          name="description"
          content={`${product.name}${product.name_telugu ? ` (${product.name_telugu})` : ""}. ${product.default_weight} pack at ${rupee(Number(product.price))}. Hand-made, ships within 24 hours.`}
        />
        <meta property="og:title" content={`${product.name} — Thayilam`} />
        <meta property="og:type" content="product" />
        <meta property="og:url" content={productUrl} />
        <meta property="og:image" content={resolveImage(product.image_url)} />
        <link rel="canonical" href={productUrl} />
      </Helmet>

      <SiteHeader />

      <main className="flex-1 paper">

        {/* ── BREADCRUMB ── */}
        <div className="border-b border-brown/20">
          <div className="mx-auto max-w-7xl px-5 md:px-8 py-5">
            <nav className="flex items-center gap-2 text-xs text-brown/60 uppercase tracking-widest flex-wrap">
              <Link to="/" className="hover:text-rust">Home</Link>
              <ChevronRight size={12} />
              <Link to="/shop" className="hover:text-rust">Shop</Link>
              <ChevronRight size={12} />
              <span className="text-brown/80">{categoryDisplay}</span>
              <ChevronRight size={12} />
              <span className="text-brown">{product.name}</span>
            </nav>
          </div>
        </div>

        {/* ── MAIN GRID ── */}
        <div className="mx-auto max-w-7xl px-5 md:px-8 py-8 md:py-14 grid lg:grid-cols-12 gap-10 lg:gap-14">

          {/* ── LEFT: GALLERY + TABS ── */}
          <div className="lg:col-span-7">

            {/* Gallery */}
            <div className="grid md:grid-cols-[88px_1fr] gap-4">

              {/* Thumbnails */}
              <div className="order-2 md:order-1 flex md:flex-col gap-3">
                {gallery.map((src, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImg(i)}
                    aria-label={`View image ${i + 1}`}
                    className={`relative aspect-square w-20 md:w-full rounded-xl overflow-hidden ink-border-thin paper-sand grid place-items-center transition-all ${
                      i === activeImg
                        ? "ring-2 ring-rust ring-offset-2 ring-offset-cream"
                        : "hover:-translate-y-0.5"
                    }`}
                  >
                    <SafeImg
                      src={src}
                      alt=""
                      className="w-full h-full object-cover p-1"
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
                  className="relative aspect-square paper-sand ink-border rounded-3xl overflow-hidden cursor-zoom-in"
                >
                  <div className="absolute inset-6 rounded-full border border-dashed border-brown/30 pointer-events-none" />
                  <div className="absolute inset-12 rounded-full border border-brown/15 pointer-events-none" />

                  <SafeImg
                    src={gallery[activeImg]}
                    alt={product.name}
                    width={768}
                    height={768}
                    className="absolute inset-0 w-full h-full object-contain p-10 transition-transform duration-200"
                    style={
                      zoomXY
                        ? {
                            transformOrigin: `${zoomXY.x}% ${zoomXY.y}%`,
                            transform: "scale(1.8)",
                          }
                        : undefined
                    }
                  />

                  {/* Badges */}
                  <div className="absolute top-4 left-4 z-10 flex flex-col gap-1.5 items-start">
                    {product.badge && (
                      <span className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-rust text-cream font-semibold">
                        {product.badge}
                      </span>
                    )}
                  </div>

                  <span className="absolute top-4 right-4 z-10 text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-brown/80 text-cream font-semibold">
                    {categoryDisplay}
                  </span>

                  {/* Diet tags on image */}
                  {dietTags.length > 0 && (
                    <div className="absolute bottom-4 left-4 z-10 flex flex-wrap gap-1">
                      {dietTags.map((d) => (
                        <span
                          key={d}
                          className="text-[9px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-cream/80 text-olive font-semibold"
                        >
                          {d}
                        </span>
                      ))}
                    </div>
                  )}

                  <div className="absolute bottom-4 right-4 pointer-events-none">
                    <FlowerIcon size={28} className="text-olive/60" />
                  </div>
                </div>
              </div>
            </div>

            {/* ── TABS ── */}
            <Tabs defaultValue="description" className="mt-10">
              <TabsList className="bg-transparent p-0 h-auto flex flex-wrap gap-1 border-b border-brown/30 w-full justify-start rounded-none">
                {["description", "shipping"].map((t) => (
                  <TabsTrigger
                    key={t}
                    value={t}
                    className="uppercase tracking-widest text-brown/70 hover:text-brown"
                  >
                    {t}
                  </TabsTrigger>
                ))}
              </TabsList>

              {/* Description tab — product.description + product.highlights from DB */}
              <TabsContent
                value="description"
                className="paper-sand ink-border-thin rounded-2xl p-6 md:p-7 mt-5"
              >
                {product.description ? (
                  <p className="text-brown/85 leading-relaxed whitespace-pre-line">
                    {product.description}
                  </p>
                ) : (
                  <p className="text-brown/50 italic">No description available.</p>
                )}

                {highlights.length > 0 && (
                  <>
                    <div className="dashed-rule my-5" />
                    <div className="text-[11px] uppercase tracking-[0.25em] text-brown/60 mb-3">
                      What makes it special
                    </div>
                    <ul className="grid sm:grid-cols-2 gap-y-2 gap-x-6 text-sm text-brown/85">
                      {highlights.map((h) => (
                        <li key={h} className="flex items-center gap-2">
                          <LeafIcon size={14} className="text-olive shrink-0" />
                          {h}
                        </li>
                      ))}
                    </ul>
                  </>
                )}
              </TabsContent>


              {/* Shipping tab */}
              <TabsContent
                value="shipping"
                className="paper-sand ink-border-thin rounded-2xl p-6 md:p-7 mt-5 space-y-3 text-sm text-brown/85"
              >
                <p>
                  <span className="font-semibold text-brown">Ships within 24 hours</span> of
                  order, packed in food-safe brown paper and tied with thread.
                </p>
                <p>
                  Standard delivery{" "}
                  <span className="font-semibold">3–5 working days</span> across Kukatpally.
                  Free shipping on orders above ₹999.
                </p>
                <p>
                  For freshness, we don't ship on Sundays — your dabba rests with us.
                </p>
              </TabsContent>
            </Tabs>
          </div>

          {/* ── RIGHT: BUY BOX ── */}
          <div className="lg:col-span-5">
            <div className="lg:sticky lg:top-24">

              <div className="text-[11px] tracking-[0.3em] uppercase text-olive mb-2">
                {categoryDisplay}
              </div>

              <h1 className="font-script text-rust leading-[0.85] text-6xl md:text-7xl">
                {product.name}
              </h1>

              {/* Telugu name from DB */}
              {product.name_telugu && (
                <div className="mt-2 font-display italic text-2xl text-brown/80">
                  {product.name_telugu}
                </div>
              )}

              {/* Highlight chips from DB */}
              {highlights.length > 0 && (
                <div className="mt-4 flex flex-wrap gap-1.5">
                  {highlights.slice(0, 5).map((h) => (
                    <span
                      key={h}
                      className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full ink-border-thin text-brown bg-cream"
                    >
                      {h}
                    </span>
                  ))}
                </div>
              )}

              {/* Diet chips from DB */}
              {dietTags.length > 0 && (
                <div className="mt-2 flex flex-wrap gap-1.5">
                  {dietTags.map((d) => (
                    <span
                      key={d}
                      className="text-[10px] uppercase tracking-wider px-2.5 py-1 rounded-full bg-olive/15 text-olive font-semibold"
                    >
                      {d}
                    </span>
                  ))}
                </div>
              )}

              <div className="dashed-rule my-6" />

              {/* Price — calculated from DB price × weight multiplier */}
              <div className="flex items-baseline gap-3">
                <span className="font-script text-5xl text-rust leading-none">
                  {rupee(unitPrice)}
                </span>
                {unitMrp && unitMrp > unitPrice && (
                  <>
                    <span className="text-brown/45 line-through">{rupee(unitMrp)}</span>
                    <span className="text-[11px] uppercase tracking-widest text-olive font-semibold">
                      Save {rupee(unitMrp - unitPrice)}
                    </span>
                  </>
                )}
              </div>
              <div className="text-xs text-brown/60 mt-1">Inclusive of all taxes</div>

              {/* Pack size selector — uses pack_sizes from DB */}
              <div className="mt-6">
                <div className="text-[11px] uppercase tracking-[0.25em] text-brown/70 mb-2">
                  Pack size
                </div>
                <div className="flex flex-wrap gap-2">
                  {availableWeights.map((w: string) => {
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

              {/* Qty + Add to Cart + Buy Now */}
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


              {/* Trust badges */}
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

            </div>
          </div>
        </div>

        {/* ── RELATED PRODUCTS ── */}
        <section className="border-t border-brown/20 paper-sand">
          <div className="mx-auto max-w-7xl px-5 md:px-8 py-14 md:py-20">
            <div className="flex items-end justify-between mb-8">
              <div>
                <div className="text-[11px] tracking-[0.3em] uppercase text-olive mb-2">
                  — Picked just for you —
                </div>
                <h2 className="font-display text-3xl md:text-4xl text-brown">
                  More from the dabba
                </h2>
              </div>
              <Link
                to="/shop"
                className="hidden sm:inline text-xs uppercase tracking-widest text-rust hover:underline"
              >
                View all →
              </Link>
            </div>

            {related.length === 0 ? (
              <p className="text-brown/50 italic">No related products found.</p>
            ) : (
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
            )}
          </div>
        </section>
      </main>

      <SiteFooter />
      <WhatsAppFab />
    </div>
  );
}

// kept for future use
export function _ScrollHint() {
  return <ChevronLeft className="hidden" />;
}