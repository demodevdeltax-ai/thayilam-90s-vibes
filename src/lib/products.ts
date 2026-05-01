// Catalog types and helpers. Product data itself lives in Supabase and is
// loaded via `useAllProducts()` in `./products-store`. This file only exposes
// the shared types, taxonomy and small utilities used across the app.

export type Diet = "Vegan" | "Jain" | "Contains Dairy";
export type Weight = "100g" | "250g" | "500g" | "1kg";
export type Category =
  | "Murukku"
  | "Ladoo"
  | "Chakli"
  | "Mixture"
  | "Pickle"
  | "Pappad"
  | "Sweets";

export type Product = {
  id: string;
  name: string;
  name_telugu: string;
  category_name: Category;
  /** Deprecated single-vendor field, kept as empty string for back-compat. */
  vendor: string;
  default_weight: Weight;
  price: number;
  mrp?: number;
  diet: Diet[];
  popularity: number; // 0-100
  createdAt: string; // ISO
  image_url?: string;
  badge?: string;
  packSizes: number[];
  sku: string;
  description: string;
  highlights: string[];
};

const CATEGORY_PACKS: Record<Category, number[]> = {
  Ladoo: [100, 250, 1000],
  Sweets: [100, 250, 500],
  Murukku: [100, 250, 500],
  Chakli: [100, 250, 500],
  Mixture: [100, 250, 500],
  Pickle: [100, 250],
  Pappad: [100, 250],
};

const SKU_PREFIX: Record<Category, string> = {
  Ladoo: "LAD",
  Sweets: "SWT",
  Murukku: "MUR",
  Chakli: "CHK",
  Mixture: "MIX",
  Pickle: "PKL",
  Pappad: "PAP",
};

const CATEGORY_DESC: Record<Category, string> = {
  Ladoo: "Hand-rolled in small batches with stone-ground flour and slow-cooked syrup.",
  Sweets: "Made the traditional South-Indian way in a heavy iron kadai over a low flame.",
  Murukku: "Pressed by hand through a brass achu, deep-fried in cold-pressed groundnut oil.",
  Chakli: "Spiced with roasted cumin, sesame, and a pinch of hing. Hand-piped and fried fresh.",
  Mixture: "Crisp sev, fried peanuts, curry leaves, fried gram, and a whisper of red chilli.",
  Pickle: "Sun-cured the Andhra way with raw mango, fenugreek, mustard, and gingelly oil.",
  Pappad: "Hand-rolled paper-thin and sun-dried on cotton sheets for two full days.",
};

const CATEGORY_HIGHLIGHTS: Record<Category, string[]> = {
  Ladoo:   ["Hand-rolled", "A2 cow ghee", "No preservatives", "Cardamom"],
  Sweets:  ["Slow-cooked", "Single-farm jaggery", "A2 ghee", "Festival favourite"],
  Murukku: ["Brass-pressed", "Cold-pressed oil", "Crisp & savoury", "Vegan"],
  Chakli:  ["Hand-piped", "Roasted spices", "Vegan", "Fried on order day"],
  Mixture: ["Hand-mixed", "Curry leaf hit", "Sealed-tin fresh", "Vegan"],
  Pickle:  ["Sun-cured", "Clay-pot matured", "Gingelly oil", "Two-week brew"],
  Pappad:  ["Sun-dried 2 days", "Paper-thin", "Roast or fry", "Vegan"],
};

export const CATEGORIES: Category[] = [
  "Murukku", "Ladoo", "Chakli", "Mixture", "Pickle", "Pappad", "Sweets",
];

export const WEIGHTS: Weight[] = ["100g", "250g", "500g", "1kg"];
export const DIETS: Diet[] = ["Vegan", "Jain", "Contains Dairy"];
export const SORT_OPTIONS = ["Newest", "Price: Low to High", "Price: High to Low", "Popular"] as const;
export type SortOption = (typeof SORT_OPTIONS)[number];

/** @deprecated single-vendor store. Empty list — kept so old code compiles. */
export const VENDORS: string[] = [];

export function defaultDescriptionFor(category: Category): string {
  return CATEGORY_DESC[category];
}
export function defaultHighlightsFor(category: Category): string[] {
  return [...CATEGORY_HIGHLIGHTS[category]];
}
export function defaultPacksFor(category: Category): number[] {
  return [...CATEGORY_PACKS[category]];
}
export function nextSkuFor(category: Category, existingSkus: string[] = []): string {
  const prefix = SKU_PREFIX[category];
  const used = existingSkus.filter((s) => s.startsWith(`THY-${prefix}-`)).length;
  return `THY-${prefix}-${String(used + 1).padStart(3, "0")}`;
}

export function rupee(n: number) {
  return "₹" + n.toLocaleString("en-IN");
}

/** @deprecated PRODUCTS is no longer the source of truth. Use `useAllProducts()`
 *  from `./products-store`. Kept as an empty array so old imports still type-check. */
export const PRODUCTS: Product[] = [];
