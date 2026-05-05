import { Link } from "@/lib/router-compat";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/product-card";
import { PRICE_BOUNDS, type Filters } from "@/components/filters-panel";

// ✅ All filter fields default to "show everything"
const DEFAULT_FILTERS: Filters = {
  categories: [],
  vendors: [],
  weights: [],
  diets: [],
  price: PRICE_BOUNDS,
};

// ✅ filters is now optional — works on homepage with no props
export function ProductGrid({ filters = DEFAULT_FILTERS }: { filters?: Filters }) {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // =============================
  // FETCH FROM SUPABASE
  // =============================
  useEffect(() => {
    const fetchProducts = async () => {
      setLoading(true);

      const { data, error } = await supabase
        .from("products")
        .select("*, categories(slug)")
        .eq("is_active", true);

      if (error) {
        console.error("Product fetch error:", error);
      } else {
        const normalized = (data || []).map((p) => ({
          ...p,
          category_slug: (p.categories?.slug || "general").toLowerCase().trim(),
          price: Number(p.price || 0),
          default_weight: p.default_weight || "",
        }));

        setProducts(normalized);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  // =============================
  // HELPERS
  // =============================
  const normalize = (s?: string) =>
    (s || "general").toLowerCase().trim();

  // =============================
  // FILTER LOGIC
  // =============================
  const filteredProducts = products.filter((p) => {
    const categorySlug = normalize(p.category_slug);

    const matchCategory =
      filters.categories.length === 0 ||
      filters.categories.map(normalize).includes(categorySlug);

    const matchPrice =
      p.price >= filters.price[0] &&
      p.price <= filters.price[1];

    const matchWeight =
      filters.weights.length === 0 ||
      filters.weights.includes(p.default_weight);

    return matchCategory && matchPrice && matchWeight;
  });

  // =============================
  // FEATURED LOGIC
  // =============================
  const featured = [...filteredProducts]
    .sort((a, b) => (b.popularity ?? 50) - (a.popularity ?? 50))
    .slice(0, 8);

  return (
    <section id="shop" className="paper py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">

        {/* HEADER */}
        <div className="flex flex-col md:flex-row md:items-end md:justify-between gap-4 mb-10">
          <div>
            <div className="text-[11px] tracking-[0.3em] uppercase text-olive mb-2">
              — Today's tray —
            </div>
            <h2 className="font-display text-3xl md:text-5xl text-brown leading-tight">
              Featured <span className="italic">snacks &amp; sweets</span>
            </h2>
          </div>
          <p className="md:max-w-sm text-brown/75">
            Freshly crafted in our kitchen, inspired by ’90s flavors you love . . .
          </p>
        </div>

        {/* STATES */}
        {loading ? (
          <div className="text-center text-brown/60 py-20 font-script text-2xl">
            Loading the day's tray…
          </div>
        ) : filteredProducts.length === 0 ? (
          <div className="text-center text-brown/60 py-20 font-script text-2xl">
            No products match your filters.
          </div>
        ) : (
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 md:gap-6">
            {featured.map((p) => (
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
        )}

        {/* CTA */}
        <div className="mt-10 text-center">
          <Link
            to="/shop"
            className="inline-block rounded-full bg-rust text-cream uppercase tracking-wider text-xs font-semibold px-6 py-3 hover:bg-rust/90 transition-colors"
          >
            View all snacks →
          </Link>
        </div>

      </div>
    </section>
  );
}