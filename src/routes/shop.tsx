import { Link } from "@/lib/router-compat";
import { Helmet } from "react-helmet-async";
import { useEffect, useMemo, useState } from "react";
import { SlidersHorizontal } from "lucide-react";
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
import { supabase } from "@/lib/supabase";

function RouteHead() {
  return (
    <Helmet>
      <title>{"Shop — Thayilam"}</title>
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
  const [PRODUCTS, setProducts] = useState<any[]>([]);
  const [filters, setFilters] = useState<Filters>(DEFAULT_FILTERS);
  const [sort, setSort] = useState<SortOption>("Newest");
  const [page, setPage] = useState(1);
  const [drawerOpen, setDrawerOpen] = useState(false);

  // ✅ FETCH FROM SUPABASE — join categories to get slug
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*, categories(slug)")   // ✅ join to get category slug
        .eq("is_active", true);

      if (error) {
        console.error(error);
      } else {
        // ✅ Flatten category_slug onto each product
        const normalized = (data || []).map((p) => ({
          ...p,
          category_slug: p.categories?.slug ?? "general",
        }));
        setProducts(normalized);
      }
    };

    fetchProducts();
  }, []);

  const filtered = useMemo(() => {
    const list = PRODUCTS.filter((p) => {
      // ✅ FIXED: compare against category_slug (not category_name)
      if (filters.categories.length && !filters.categories.includes(p.category_slug ?? "general")) return false;
      if (filters.weights.length && !filters.weights.includes(p.default_weight)) return false;
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
          <div className="border-b border-brown/20">
            <div className="mx-auto max-w-7xl px-5 md:px-8 py-6 md:py-8">

              <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4">
                <div>
                  <h1 className="font-display text-3xl md:text-5xl text-brown leading-tight">
                    All snacks & sweets
                  </h1>
                  <p className="mt-1 text-sm text-brown/70">
                    Showing <span className="font-semibold text-brown">{filtered.length}</span>
                    {" "}of {PRODUCTS.length} products
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <Drawer open={drawerOpen} onOpenChange={setDrawerOpen}>
                    <DrawerTrigger asChild>
                      <button className="lg:hidden px-4 py-2 border rounded">
                        <SlidersHorizontal size={14} /> Filters
                      </button>
                    </DrawerTrigger>
                    <DrawerContent>
                      <DrawerHeader>
                        <DrawerTitle>Filters</DrawerTitle>
                      </DrawerHeader>
                      <FiltersPanel
                        value={filters}
                        onChange={updateFilters}
                        onReset={reset}
                      />
                    </DrawerContent>
                  </Drawer>

                  <select
                    value={sort}
                    onChange={(e) => setSort(e.target.value as SortOption)}
                  >
                    {SORT_OPTIONS.map((o) => (
                      <option key={o}>{o}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </div>

          <div className="mx-auto max-w-7xl px-5 md:px-8 py-8 grid lg:grid-cols-12 gap-8">
            <div className="hidden lg:block lg:col-span-3">
              <FiltersPanel value={filters} onChange={updateFilters} onReset={reset} />
            </div>

            <div className="lg:col-span-9">
              {visible.length === 0 ? (
                <EmptyState onReset={reset} />
              ) : (
                <>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {visible.map((p) => (
                      <Link key={p.id} to="/shop/$productId" params={{ productId: p.id }}>
                        <ProductCard p={p} />
                      </Link>
                    ))}
                  </div>

                  <Pagination
                    page={safePage}
                    totalPages={totalPages}
                    onChange={setPage}
                  />
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

function Pagination({ page, totalPages, onChange }: any) {
  return (
    <div className="flex justify-center gap-2 mt-8">
      {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
        <button key={p} onClick={() => onChange(p)}>
          {p}
        </button>
      ))}
    </div>
  );
}