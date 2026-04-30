// Supabase-backed product store. Loads on first use, exposes a reactive list
// to all readers, and writes mutations back to the database.

import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Database } from "@/integrations/supabase/types";
import type { Category, Diet, Product, Weight } from "./products";
import { toast } from "sonner";

function reportError(scope: string, error: unknown) {
  const msg = (error as { message?: string } | null)?.message ?? String(error);
  console.error(`[${scope}]`, error);
  toast.error(`${scope} failed`, { description: msg });
}

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

// ----- Moderation hooks (approval / featured / flagged) -----
type ApprovalStatus = "Approved" | "Pending" | "Rejected";

let RAW_ROWS: Row[] = [];
let APPROVALS_CACHE: Record<string, ApprovalStatus> = {};
let FEATURED_CACHE: Set<string> = new Set();
let FLAGGED_CACHE: Set<string> = new Set();

function rebuildModerationCaches() {
  const a: Record<string, ApprovalStatus> = {};
  const f = new Set<string>();
  const g = new Set<string>();
  for (const r of RAW_ROWS) {
    const row = r as Row & { approval_status?: string; is_featured?: boolean; is_flagged?: boolean };
    a[r.id] = (row.approval_status as ApprovalStatus) ?? "Approved";
    if (row.is_featured) f.add(r.id);
    if (row.is_flagged) g.add(r.id);
  }
  APPROVALS_CACHE = a;
  FEATURED_CACHE = f;
  FLAGGED_CACHE = g;
}

export function useApprovals(): Record<string, ApprovalStatus> {
  return useSyncExternalStore(subscribe, () => APPROVALS_CACHE, () => APPROVALS_CACHE);
}
export function useFeatured(): Set<string> {
  return useSyncExternalStore(subscribe, () => FEATURED_CACHE, () => FEATURED_CACHE);
}
export function useFlagged(): Set<string> {
  return useSyncExternalStore(subscribe, () => FLAGGED_CACHE, () => FLAGGED_CACHE);
}

export async function setApproval(productId: string, status: ApprovalStatus): Promise<void> {
  const { error } = await supabase.from("products").update({ approval_status: status }).eq("id", productId);
  if (isMissingColumn(error, "approval_status")) return;
  if (error) throw error;
  await loadProducts(true);
}
export async function toggleFeatured(productId: string): Promise<void> {
  const cur = FEATURED_CACHE.has(productId);
  const { error } = await supabase.from("products").update({ is_featured: !cur }).eq("id", productId);
  if (isMissingColumn(error, "is_featured")) return;
  if (error) throw error;
  await loadProducts(true);
}
export async function toggleFlag(productId: string): Promise<void> {
  const cur = FLAGGED_CACHE.has(productId);
  const { error } = await supabase.from("products").update({ is_flagged: !cur }).eq("id", productId);
  if (isMissingColumn(error, "is_flagged")) return;
  if (error) throw error;
  await loadProducts(true);
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
      logDbError("products", error);
      CACHE = [];
      RAW_ROWS = [];
    } else {
      RAW_ROWS = (data ?? []) as Row[];
      CACHE = RAW_ROWS.map(rowToProduct);
    }
    rebuildModerationCaches();
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
