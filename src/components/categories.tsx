import { Link } from "@/lib/router-compat";
import { LeafIcon } from "./icons";
import { useAdminCategories } from "@/lib/categories-store";

const IMAGE_MAP: Record<string, string> = {
  Sweets: "/Sweets.png",
  Snacks: "/Snacks.png",
  "Spice Powders": "/Spice Powders.png",

  Pickel: "/Pickels.png",
  Pickels: "/Pickels.png",
  Pickles: "/Pickels.png",

  Combo: "/Combo.png",
  Combos: "/Combo.png",
};

type CategoryItem = {
  label: string;
  image: string | null;
  slug: string;
};

export function Categories() {
  const cats = useAdminCategories().filter(
    (c) => c.is_visible && c.parent_id === null
  );

  console.log("===== CATEGORIES FROM ADMIN =====");
  console.log(cats);

  console.log(
    "Category Names:",
    cats.map((c) => c.name)
  );

  const items: CategoryItem[] = cats.map((c) => {
    console.log(
      `Category: "${c.name}" -> Image:`,
      IMAGE_MAP[c.name]
    );

    return {
      label: c.name,
      image: IMAGE_MAP[c.name] ?? null,
      slug: c.slug,
    };
  });

  console.log("Items being rendered:", items);

  items.push({
    label: "All Products",
    image: null,
    slug: "",
  });

  return (
    <section className="paper py-10 md:py-14 border-b border-brown/20">
      <div className="mx-auto max-w-7xl px-5 md:px-8">
        <div className="flex items-end justify-between mb-6">
          <div>
            <h2 className="font-display text-2xl md:text-3xl text-brown">
              Explore Our Tastes
            </h2>
          </div>

          <Link
            to="/shop"
            className="hidden sm:inline text-xs uppercase tracking-widest text-rust hover:underline"
          >
            View all →
          </Link>
        </div>

        <div className="-mx-5 md:-mx-8 px-5 md:px-8 overflow-x-auto scrollbar-none">
          <ul className="flex gap-5 md:gap-7 min-w-max pb-2">
            {items.map(({ label, image }) => (
              <li key={label}>
                <Link
                  to="/shop"
                  className="group flex flex-col items-center gap-3 w-20 md:w-24 focus:outline-none"
                >
                  <span className="h-20 w-20 md:h-24 md:w-24 rounded-full ink-border paper-sand overflow-hidden grid place-items-center transition-all group-hover:-translate-y-1">
                    {image ? (
                      <img
                        src={image}
                        alt={label}
                        loading="lazy"
                        onLoad={() =>
                          console.log(`Loaded image: ${image}`)
                        }
                        onError={() =>
                          console.error(
                            `FAILED image: ${image} for category "${label}"`
                          )
                        }
                        className="w-full h-full object-contain p-1"
                      />
                    ) : (
                      <>
                        {console.warn(
                          `No image mapping found for category "${label}"`
                        )}
                        <LeafIcon
                          size={38}
                          className="text-brown"
                        />
                      </>
                    )}
                  </span>

                  <span className="text-[11px] md:text-xs tracking-wide uppercase text-brown text-center leading-tight">
                    {label}
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </div>
      </div>
    </section>
  );
}