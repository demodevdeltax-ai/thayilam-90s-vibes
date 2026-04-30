import { useEffect, useSyncExternalStore } from "react";
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
    name_telugu: r.name_telugu,       // ← was mapped to wrong field "telugu"
    slug: r.slug,
    icon: r.icon,
    icon_url: r.icon_url,
    parent_id: r.parent_id,
    sort_order: r.sort_order,
    is_visible: r.is_visible,         // ← was mapped to wrong field "active"
    created_at: r.created_at,
    updated_at: r.updated_at,
    productCount: 0,
  };
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
      console.error("categories load error", error);
      CACHE = [];
    } else {
      CACHE = ((data ?? []) as Row[]).map(rowToCategory);

      // Compute product counts
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
    .update({ is_visible: !c.is_visible })  // ← was !c.active
    .eq("id", id);
  if (error) { console.error(error); return; }
  await loadCategories(true);
}

export async function reorderCategories(orderedIds: string[]): Promise<void> {
  await Promise.all(
    orderedIds.map((id, idx) =>
      supabase.from("categories").update({ sort_order: idx + 1 }).eq("id", id),
    ),
  );
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
  const payload = {
    name: input.name,
    name_telugu: input.name_telugu,   // ← was input.telugu (undefined)
    slug: input.slug,
    parent_id: input.parent_id,
    is_visible: input.is_visible,     // ← was input.active (undefined)
    icon: input.icon,
    icon_url: input.icon_url,
  };

  if (input.id) {
    const { error } = await supabase
      .from("categories")
      .update(payload)
      .eq("id", input.id);
    if (error) { console.error(error); return; }
  } else {
    const nextSort = (CACHE[CACHE.length - 1]?.sort_order ?? 0) + 1;
    const { error } = await supabase
      .from("categories")
      .insert({ ...payload, sort_order: nextSort });
    if (error) { console.error(error); return; }
  }

  await loadCategories(true);
}

export async function deleteCategory(id: string): Promise<void> {
  await supabase.from("categories").update({ parent_id: null }).eq("parent_id", id);
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) { console.error(error); return; }
  await loadCategories(true);
}
