// Supabase-backed product store. Loads on first use, exposes a reactive list
// to all readers, and writes mutations back to the database.

import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Category, Diet, Product, Weight } from "./products";

type Row = Database["public"]["Tables"]["products"]["Row"];

let CACHE: Product[] = [];
let LOADED = false;
let LOADING: Promise<void> | null = null;

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => {
  listeners.add(l);
  return () => listeners.delete(l);
};
const emit = () => listeners.forEach((l) => l());

function rowToProduct(r: Row): Product {
  return {
    id: r.id,
    name: r.name,
    telugu: r.name_telugu ?? "",
    category: (r.category_name as Category) ?? "Sweets",
    vendor: "",
    weight: (r.default_weight as Weight) ?? "250g",
    price: Number(r.price),
    mrp: r.mrp != null ? Number(r.mrp) : undefined,
    diet: (r.diet ?? []) as Diet[],
    popularity: r.popularity ?? 50,
    createdAt: r.created_at,
    img: r.image_url ?? "",
    badge: r.badge ?? undefined,
    packSizes: (r.pack_sizes ?? []) as number[],
    sku: r.sku,
    description: r.description ?? "",
    highlights: (r.highlights ?? []) as string[],
  };
}

export async function loadProducts(force = false): Promise<Product[]> {
  if (LOADED && !force) return CACHE;
  if (LOADING && !force) {
    await LOADING;
    return CACHE;
  }
  LOADING = (async () => {
    const { data, error } = await supabase
      .from("products")
      .select("*")
      .order("created_at", { ascending: false });
    if (error) {
      console.error("[products] load failed:", error);
      CACHE = [];
    } else {
      CACHE = (data ?? []).map(rowToProduct);
    }
    LOADED = true;
    LOADING = null;
    emit();
  })();
  await LOADING;
  return CACHE;
}

export function getCachedProduct(id: string): Product | undefined {
  return CACHE.find((p) => p.id === id);
}

/** Reactive hook — returns products in cache and triggers an initial load. */
export function useAllProducts(): Product[] {
  const list = useSyncExternalStore(
    subscribe,
    () => CACHE,
    () => CACHE,
  );
  useEffect(() => {
    if (!LOADED) void loadProducts();
  }, []);
  return list;
}

type ProductPatch = {
  name?: string;
  telugu?: string;
  category?: Category;
  price?: number;
  mrp?: number | null;
  badge?: string | null;
  diet?: Diet[];
  packSizes?: number[];
  sku?: string;
  description?: string;
  highlights?: string[];
  defaultWeight?: Weight;
  imageUrl?: string;
  popularity?: number;
};

function toRowPatch(p: ProductPatch): Database["public"]["Tables"]["products"]["Update"] {
  const row: Database["public"]["Tables"]["products"]["Update"] = {};
  if (p.name !== undefined) row.name = p.name;
  if (p.telugu !== undefined) row.name_telugu = p.telugu;
  if (p.category !== undefined) row.category_name = p.category;
  if (p.price !== undefined) row.price = p.price;
  if (p.mrp !== undefined) row.mrp = p.mrp;
  if (p.badge !== undefined) row.badge = p.badge;
  if (p.diet !== undefined) row.diet = p.diet;
  if (p.packSizes !== undefined) {
    row.pack_sizes = [...new Set(p.packSizes.filter((n) => n > 0))].sort((a, b) => a - b);
  }
  if (p.sku !== undefined) row.sku = p.sku;
  if (p.description !== undefined) row.description = p.description;
  if (p.highlights !== undefined) row.highlights = p.highlights;
  if (p.defaultWeight !== undefined) row.default_weight = p.defaultWeight;
  if (p.imageUrl !== undefined) row.image_url = p.imageUrl;
  if (p.popularity !== undefined) row.popularity = p.popularity;
  return row;
}

export async function updateProduct(id: string, patch: ProductPatch): Promise<void> {
  const { error } = await supabase.from("products").update(toRowPatch(patch)).eq("id", id);
  if (error) throw error;
  await loadProducts(true);
}

export async function updatePackSizes(id: string, sizes: number[]): Promise<void> {
  await updateProduct(id, { packSizes: sizes });
}

export type NewProductInput = Required<Pick<ProductPatch, "name" | "category" | "price" | "sku">> &
  Partial<ProductPatch> & { slug?: string };

export async function createProduct(input: NewProductInput): Promise<string> {
  const slug = (input.slug ?? input.name)
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "")
    .slice(0, 80);
  const insert: Database["public"]["Tables"]["products"]["Insert"] = {
    name: input.name,
    name_telugu: input.telugu ?? "",
    slug,
    sku: input.sku,
    price: input.price,
    mrp: input.mrp ?? null,
    category_name: input.category,
    badge: input.badge ?? null,
    description: input.description ?? "",
    highlights: input.highlights ?? [],
    diet: input.diet ?? [],
    pack_sizes: input.packSizes ?? [100, 250, 500],
    default_weight: input.defaultWeight ?? "250g",
    image_url: input.imageUrl ?? null,
    popularity: input.popularity ?? 50,
  };
  const { data, error } = await supabase.from("products").insert(insert).select("id").single();
  if (error) throw error;
  await loadProducts(true);
  return data.id;
}

export async function deleteProduct(id: string): Promise<void> {
  const { error } = await supabase.from("products").delete().eq("id", id);
  if (error) throw error;
  await loadProducts(true);
}

/** Upload a file to the product-images bucket and return its public URL. */
export async function uploadProductImage(file: File): Promise<string> {
  const ext = file.name.split(".").pop()?.toLowerCase() || "png";
  const path = `${crypto.randomUUID()}.${ext}`;
  const { error } = await supabase.storage
    .from("product-images")
    .upload(path, file, { contentType: file.type, cacheControl: "3600", upsert: false });
  if (error) throw error;
  const { data } = supabase.storage.from("product-images").getPublicUrl(path);
  return data.publicUrl;
}
