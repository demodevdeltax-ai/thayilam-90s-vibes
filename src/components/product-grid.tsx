import { Link } from "@/lib/router-compat";
import { useEffect, useState } from "react";
import { supabase } from "@/lib/supabase";
import { ProductCard } from "@/components/product-card";

export function ProductGrid() {
  const [products, setProducts] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  // =============================
  // MAP DB → UI FORMAT
  // =============================
  const mapProduct = (p: any) => ({
    ...p,
    img: p.image_url,               // 🔥 FIX image
    category: p.category_name,      // 🔥 FIX category
    weight: p.default_weight,       // 🔥 FIX weight
    telugu: p.name_telugu,          // 🔥 FIX telugu
  });

  // =============================
  // FETCH FROM SUPABASE
  // =============================
  useEffect(() => {
    const fetchProducts = async () => {
      const { data, error } = await supabase
        .from("products")
        .select("*")
        .eq("is_active", true);

      if (error) {
        console.error(error);
      } else {
        const mapped = (data || []).map(mapProduct);
        setProducts(mapped);
      }

      setLoading(false);
    };

    fetchProducts();
  }, []);

  // =============================
  // FEATURED LOGIC (same as before)
  // =============================
  const featured = [...products]
    .sort((a, b) => (b.popularity ?? 50) - (a.popularity ?? 50))
    .slice(0, 8);

  return (
    <section id="shop" className="paper py-16 md:py-24">
      <div className="mx-auto max-w-7xl px-5 md:px-8">

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
            Small batches from kitchens we know by name. Tied with thread, packed in brown paper.
          </p>
        </div>

        {loading ? (
          <div className="text-center text-brown/60 py-20 font-script text-2xl">
            Loading the day's tray…
          </div>
        ) : featured.length === 0 ? (
          <div className="text-center text-brown/60 py-20 font-script text-2xl">
            No products available.
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