import { Link } from "@/lib/router-compat";
import { Helmet } from "react-helmet-async";
import { useMemo, useState } from "react";
import { ChevronLeft, ChevronRight, SlidersHorizontal } from "lucide-react";
import { SiteHeader } from "@/components/site-header";
import { SiteFooter } from "@/components/site-footer";
import { WhatsAppFab } from "@/components/whatsapp-fab";
import { ProductCard } from "@/components/product-card";
import { EmptyState } from "@/components/empty-state";
import { FiltersPanel, PRICE_BOUNDS, type Filters } from "@/components/filters-panel";
import {
  Drawer,
  DrawerContent,
  DrawerTrigger,
  DrawerHeader,
  DrawerTitle,
} from "@/components/ui/drawer";
import { SORT_OPTIONS, type SortOption } from "@/lib/products";
import { useAllProducts } from "@/lib/products-store";

function RouteHead() {
  return (
    <Helmet>
      <title>{"Shop — Thayilam | Murukku, Ladoo, Pickles & 90s snacks"}</title>
      <meta name="description" content="Browse hand-rolled murukku, ladoos, mixture, pickles and pappad from small Chennai kitchens. Filter by category, vendor, weight, price and dietary needs." />
      <meta property="og:title" content="Shop — Thayilam" />
      <meta property="og:description" content="Small-batch 90s Indian snacks. Filter by category, vendor, weight and dietary needs." />
    </Helmet>
  );
}

export default ShopPage;

const PAGE_SIZE = 9;
const DEFAULT_FILTERS: Filters = {
  categories: [],
  vendors: [],
  weights: [],
  diets: [],
  price: PRICE_BOUNDS,
};

function ShopPage() {
  const PRODUCTS = useAllProducts();
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("Newest");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  const filtered = useMemo(() => {
    const list = PRODUCTS.filter((p) => {
      // ✅ fixed: was p.category → now p.category_name
      if (filters.categories.length && !filters.categories.includes(p.category_name ?? "")) return false;
      // ✅ fixed: was p.weight → now p.default_weight
      if (filters.weights.length && !filters.weights.includes(p.default_weight)) return false;
      // ✅ correct: p.diet is already an array in DB schema
      if (filters.diets.length && !filters.diets.some((d) => (p.diet ?? []).includes(d))) return false;
      if (p.price < filters.price[0] || p.price > filters.price[1]) return false;
      return true;
    });

    const sorted = [...list];
    switch (sort) {
      case "Price: Low to High":
        sorted.sort((a, b) => a.price - b.price);
        break;
      case "Price: High to Low":
        sorted.sort((a, b) => b.price - a.price);
        break;
      case "Popular":
        sorted.sort((a, b) => (b.popularity ?? 50) - (a.popularity ?? 50));
        break;
      case "Newest":
      default:
        // ✅ fixed: was b.createdAt → now b.created_at
        sorted.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));
    }
    return sorted;
  }, [PRODUCTS, filters, sort]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const safePage = Math.min(page, totalPages);
  const start = (safePage - 1) * PAGE_SIZE;
  const visible = filtered.slice(start, start + PAGE_SIZE);

  const updateFilters = (next: Filters) => {
    setFilters(next);
    setPage(1);
  };
  const reset = () => {
    setFilters(DEFAULT_FILTERS);
    setPage(1);
  };

  return (
    <>
      <RouteHead />
      <div className="min-h-screen flex flex-col">
        <SiteHeader />

        <main className="flex-1 paper">
          {/* Top bar */}
          <div className="border-b border-brown/20">
            <div className="mx-auto max-w-7xl px-5 md:px-8 py-6 md:py-8">
              <nav className="flex items-center gap-2 text-xs text-brown/60 uppercase tracking-widest mb-3">
                <Link to="/" className="hover:text-rust">Home</Link>
                <span>/</span>
                <span className="text-brown">Shop</span>
              </nav>
              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl md:text-5xl text-brown leading-tight">
                    All <span className="italic">snacks &amp; sweets</span>
                  </h1>
                  <p className="mt-1 text-sm text-brown/70">
                    Showing <span className="font-semibold text-brown">{filtered.length}</span>
                    {" "}of {PRODUCTS.length} small-batch goodies
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <DrawerTrigger asChild>
                      <button className="lg:hidden inline-flex items-center gap-2 rounded-full ink-border-thin px-4 py-2 text-xs uppercase tracking-wider text-brown hover:bg-brown hover:text-cream transition-colors">
                        <SlidersHorizontal size={14} />
                        Filters
                      </button>
                    </DrawerTrigger>
                    <DrawerContent className="paper border-brown/30 max-h-[85vh]">
                      <DrawerHeader className="text-left">
                        <DrawerTitle className="font-display text-2xl text-brown">
                          Filter snacks
                        </DrawerTitle>
                      </DrawerHeader>
                      <div className="px-4 pb-6 overflow-y-auto">
                        <FiltersPanel
                          value={filters}
                          onChange={updateFilters}
                          onReset={reset}
                        />
                        <button
                          onClick={() => setDrawerOpen(false)}
                          className="mt-4 w-full rounded-full bg-rust text-cream uppercase tracking-wider text-xs font-semibold py-3"
                        >
                          Show {filtered.length} results
                        </button>
                      </div>
                    </DrawerContent>
                  </Drawer>

                  <label className="flex items-center gap-2 text-xs uppercase tracking-widest text-brown/70">
                    Sort
                    <div className="relative">
                      <select
                        value={sort}
                        onChange={(e) => setSort(e.target.value as SortOption)}
                        className="appearance-none paper-sand ink-border-thin rounded-full pl-4 pr-9 py-2 text-xs uppercase tracking-wider text-brown focus:outline-none focus:ring-2 focus:ring-rust/40 cursor-pointer"
                      >
                        {SORT_OPTIONS.map((o) => (
                          <option key={o} value={o}>{o}</option>
                        ))}
                      </select>
                      <ChevronRight
                        size={14}
                        className="absolute right-3 top-1/2 -translate-y-1/2 rotate-90 text-brown/60 pointer-events-none"
                      />
                    </div>
                  </label>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-5 md:px-8 py-8 md:py-12 grid lg:grid-cols-12 gap-8">
            {/* Sidebar */}
            <div className="hidden lg:block lg:col-span-3">
              <div className="sticky top-24">
                <FiltersPanel
                  value={filters}
                  onChange={updateFilters}
                  onReset={reset}
                />
              </div>
            </div>

            {/* Main grid */}
            <div className="lg:col-span-9">
              {visible.length === 0 ? (
                <EmptyState onReset={reset} />
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 md:gap-6">
                    {visible.map((p) => (
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

                  {totalPages > 1 && (
                    <Pagination
                      page={safePage}
                      totalPages={totalPages}
                      onChange={(p) => {
                        setPage(p);
                        window.scrollTo({ top: 0, behavior: "smooth" });
                      }}
                    />
                  )}
                </>
              )}
            </div>
          </div>
        </main>

        <SiteFooter />
        <WhatsAppFab />
      </div>
    </>
  );
}

function Pagination({
  page,
  totalPages,
  onChange,
}: {
  page: number;
  totalPages: number;
  onChange: (p: number) => void;
}) {
  const pages = Array.from({ length: totalPages }, (_, i) => i + 1);
  const btn =
    "h-10 w-10 grid place-items-center rounded-full text-sm transition-colors ink-border-thin";

  return (
    <nav className="mt-12 flex items-center justify-center gap-2" aria-label="Pagination">
      <button
        onClick={() => onChange(Math.max(1, page - 1))}
        disabled={page === 1}
        aria-label="Previous page"
        className={`${btn} text-brown disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brown hover:text-cream`}
      >
        <ChevronLeft size={16} />
      </button>
      {pages.map((p) => (
        <button
          key={p}
          onClick={() => onChange(p)}
          aria-current={p === page ? "page" : undefined}
          className={`${btn} ${
            p === page
              ? "bg-rust text-cream border-rust font-semibold"
              : "text-brown hover:bg-brown hover:text-cream"
          }`}
        >
          {p}
        </button>
      ))}
      <button
        onClick={() => onChange(Math.min(totalPages, page + 1))}
        disabled={page === totalPages}
        aria-label="Next page"
        className={`${btn} text-brown disabled:opacity-30 disabled:cursor-not-allowed hover:bg-brown hover:text-cream`}
      >
        <ChevronRight size={16} />
      </button>
    </nav>
  );
}
