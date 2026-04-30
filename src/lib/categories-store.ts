// Supabase-backed categories store. Reads + mutations.
import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AdminCategory } from "./admin-data";
import { isMissingColumn, logDbError } from "./db-compat";

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
  icon?: string | null;
  icon_url?: string | null;
};

function rowToCategory(r: Row): AdminCategory {
  return {
    id: r.id,
    name: r.name,
    telugu: r.name_telugu ?? "",
    slug: r.slug,
    icon: r.icon ?? "•",
    parentId: r.parent_id,
    productCount: 0, // computed separately
    active: r.is_visible,
    sortOrder: r.sort_order,
  };
}

export async function loadCategories(force = false): Promise<AdminCategory[]> {
  if (LOADED && !force) return CACHE;
  if (LOADING && !force) { await LOADING; return CACHE; }
  LOADING = (async () => {
    const primary = await supabase
      .from("categories")
      .select("id,name,name_telugu,slug,parent_id,sort_order,is_visible,icon" as never)
      .order("sort_order", { ascending: true });
    let data: unknown = primary.data;
    let error = primary.error;
    if (isMissingColumn(error, "icon")) {
      const fallback = await supabase
        .from("categories")
        .select("id,name,name_telugu,slug,parent_id,sort_order,is_visible")
        .order("sort_order", { ascending: true });
      data = fallback.data;
      error = fallback.error;
    }
    if (error) {
      logDbError("categories", error);
      CACHE = [];
    } else {
      CACHE = ((data ?? []) as unknown as Row[]).map(rowToCategory);
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
  const { error } = await supabase.from("categories").update({ is_visible: !c.active }).eq("id", id);
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

type CategoryInput = Omit<AdminCategory, "id" | "productCount" | "sortOrder"> & { id?: string };

export async function upsertCategory(input: CategoryInput): Promise<void> {
  const payload = {
    name: input.name,
    name_telugu: input.telugu,
    slug: input.slug,
    parent_id: input.parentId,
    is_visible: input.active,
    icon: input.icon,
  };
  if (input.id) {
    let { error } = await supabase.from("categories").update(payload as never).eq("id", input.id);
    if (isMissingColumn(error, "icon")) {
      const { icon: _icon, ...withoutIcon } = payload;
      ({ error } = await supabase.from("categories").update(withoutIcon).eq("id", input.id));
    }
    if (error) { console.error(error); return; }
  } else {
    const nextSort = (CACHE[CACHE.length - 1]?.sortOrder ?? 0) + 1;
    let { error } = await supabase.from("categories").insert({
      ...payload,
      sort_order: nextSort,
    } as never);
    if (isMissingColumn(error, "icon")) {
      const { icon: _icon, ...withoutIcon } = payload;
      ({ error } = await supabase.from("categories").insert({
        ...withoutIcon,
        sort_order: nextSort,
      }));
    }
    if (error) { console.error(error); return; }
  }
  await loadCategories(true);
}

export async function deleteCategory(id: string): Promise<void> {
  // Re-parent children to root first
  await supabase.from("categories").update({ parent_id: null }).eq("parent_id", id);
  const { error } = await supabase.from("categories").delete().eq("id", id);
  if (error) { console.error(error); return; }
  await loadCategories(true);
}
