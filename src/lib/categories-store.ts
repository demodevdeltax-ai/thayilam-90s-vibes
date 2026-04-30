import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { AdminCategory } from "./admin-data";

let CACHE: AdminCategory[] = [];
let LOADED = false;
let LOADING: Promise<void> | null = null;

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const emit = () => listeners.forEach((l) => l());

type Row = {
  id: string;
  name: string;
  name_telugu: string | null;
  slug: string;
  parent_id: string | null;
  sort_order: number;
  is_visible: boolean;
  icon: string | null;
  icon_url: string | null;
  created_at: string;
  updated_at: string;
};

function rowToCategory(r: Row): AdminCategory {
  return {
    id: r.id,
    name: r.name,
    name_telugu: r.name_telugu,
    slug: r.slug,
    icon: r.icon,
    icon_url: r.icon_url,
    parent_id: r.parent_id,
    sort_order: r.sort_order,
    is_visible: r.is_visible,
    created_at: r.created_at,
    updated_at: r.updated_at,
    productCount: 0,
  };
}

function reportError(scope: string, error: unknown) {
  const msg = (error as { message?: string } | null)?.message ?? String(error);
  console.error(`[${scope}]`, error);
  toast.error(`${scope} failed`, { description: msg });
}

async function findUniqueSlug(base: string, excludeId?: string): Promise<string> {
  const root = base.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "").slice(0, 80) || "item";
  let candidate = root;
  let n = 0;
  while (n < 100) {
    let q = supabase.from("categories").select("id").eq("slug", candidate).limit(1);
    if (excludeId) q = q.neq("id", excludeId);
    const { data, error } = await q.maybeSingle();
    if (error) throw error;
    if (!data) return candidate;
    n += 1;
    candidate = `${root}-${n}`;
  }
  throw new Error("Could not find unique slug");
}

export async function loadCategories(force = false): Promise<AdminCategory[]> {
  if (LOADED && !force) return CACHE;
  if (LOADING && !force) { await LOADING; return CACHE; }

  LOADING = (async () => {
    const { data, error } = await supabase
      .from("categories")
      .select("id,name,name_telugu,slug,parent_id,sort_order,is_visible,icon,icon_url,created_at,updated_at")
      .order("sort_order", { ascending: true });

    if (error) {
      reportError("Load categories", error);
      CACHE = [];
    } else {
      CACHE = ((data ?? []) as Row[]).map(rowToCategory);
      const { data: products } = await supabase.from("products").select("category_name");
      if (products) {
        const counts = new Map<string, number>();
        for (const p of products) {
          if (p.category_name) counts.set(p.category_name, (counts.get(p.category_name) ?? 0) + 1);
        }
        CACHE = CACHE.map((c) => ({ ...c, productCount: counts.get(c.name) ?? 0 }));
      }
    }

    LOADED = true;
    LOADING = null;
    emit();
  })();

  await LOADING;
  return CACHE;
}

export function useAdminCategories(): AdminCategory[] {
  const list = useSyncExternalStore(subscribe, () => CACHE, () => CACHE);
  useEffect(() => { if (!LOADED) void loadCategories(); }, []);
  return list;
}

export async function toggleCategory(id: string): Promise<void> {
  const c = CACHE.find((x) => x.id === id);
  if (!c) return;
  const { error } = await supabase
    .from("categories")
    .update({ is_visible: !c.is_visible })
    .eq("id", id);
  if (error) { reportError("Toggle category", error); return; }
  toast.success(c.is_visible ? "Category hidden" : "Category visible");
  await loadCategories(true);
}

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  const results = await Promise.all(
    orderedIds.map((id, idx) =>
      supabase.from("categories").update({ sort_order: idx + 1 }).eq("id", id),
    ),
  );
  const firstErr = results.find((r) => r.error)?.error;
  if (firstErr) { reportError("Reorder categories", firstErr); return; }
  await loadCategories(true);
}

type CategoryInput = {
  id?: string;
  name: string;
  name_telugu: string | null;
  slug: string;
  icon: string | null;
  icon_url: string | null;
  parent_id: string | null;
  is_visible: boolean;
};

export async function upsertCategory(input: CategoryInput): Promise<void> {
  try {
    const slug = await findUniqueSlug(input.slug || input.name, input.id);
    const payload = {
      name: input.name,
      name_telugu: input.name_telugu,
      slug,
      parent_id: input.parent_id,
      is_visible: input.is_visible,
      icon: input.icon,
      icon_url: input.icon_url,
    };

    if (input.id) {
      const { error } = await supabase.from("categories").update(payload).eq("id", input.id);
      if (error) throw error;
      toast.success("Category saved");
    } else {
      const nextSort = (CACHE[CACHE.length - 1]?.sort_order ?? 0) + 1;
      const { error } = await supabase
        .from("categories")
        .insert({ ...payload, sort_order: nextSort });
      if (error) throw error;
      toast.success("Category created");
    }
    await loadCategories(true);
  } catch (e) {
    reportError("Save category", e);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  await supabase.from("categories").update({ parent_id: null }).eq("parent_id", id);
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) { reportError("Delete category", error); return; }
  toast.success("Category deleted");
  await loadCategories(true);
}
