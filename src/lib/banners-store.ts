// Supabase-backed banners store
import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Banner } from "./admin-data";

let CACHE: Banner[] = [];
let LOADED = false;
let LOADING: Promise<void> | null = null;

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const emit = () => listeners.forEach((l) => l());

type Row = {
  id: string;
  title: string;
  subtitle: string | null;
  cta: string | null;
  image_url: string;
  link_url: string | null;
  placement: string | null;
  is_active: boolean;
  active_from: string | null;
  active_until: string | null;
  sort_order: number;
};

function rowToBanner(r: Row): Banner {
  return {
    id: r.id,
    title: r.title,
    subtitle: r.subtitle ?? "",
    cta: r.cta ?? "Shop now",
    imageUrl: r.image_url,
    linkUrl: r.link_url ?? "/shop",
    placement: (r.placement as Banner["placement"]) ?? "Homepage Hero",
    active: r.is_active,
    startsAt: r.active_from ? r.active_from.slice(0, 10) : "",
    endsAt: r.active_until ? r.active_until.slice(0, 10) : "",
    sortOrder: r.sort_order,
  };
}

export async function loadBanners(force = false): Promise<Banner[]> {
  if (LOADED && !force) return CACHE;
  if (LOADING && !force) { await LOADING; return CACHE; }
  LOADING = (async () => {
    const { data, error } = await supabase
      .from("banners")
      .select("*")
      .order("sort_order", { ascending: true });
    if (error) { console.error("[banners] load failed:", error); CACHE = []; }
    else CACHE = ((data ?? []) as unknown as Row[]).map(rowToBanner);
    LOADED = true;
    LOADING = null;
    emit();
  })();
  await LOADING;
  return CACHE;
}

export function useBanners(): Banner[] {
  const list = useSyncExternalStore(subscribe, () => CACHE, () => CACHE);
  useEffect(() => { if (!LOADED) void loadBanners(); }, []);
  return list;
}

export async function toggleBanner(id: string): Promise<void> {
  const b = CACHE.find((x) => x.id === id);
  if (!b) return;
  await supabase.from("banners").update({ is_active: !b.active }).eq("id", id);
  await loadBanners(true);
}

type BannerInput = Omit<Banner, "id" | "sortOrder"> & { id?: string; sortOrder?: number };

export async function upsertBanner(input: BannerInput): Promise<void> {
  const payload = {
    title: input.title,
    subtitle: input.subtitle,
    cta: input.cta,
    image_url: input.imageUrl,
    link_url: input.linkUrl,
    placement: input.placement,
    is_active: input.active,
    active_from: input.startsAt ? new Date(input.startsAt).toISOString() : null,
    active_until: input.endsAt ? new Date(input.endsAt).toISOString() : null,
    sort_order: input.sortOrder ?? CACHE.length + 1,
  };
  if (input.id) {
    await supabase.from("banners").update(payload as never).eq("id", input.id);
  } else {
    await supabase.from("banners").insert(payload as never);
  }
  await loadBanners(true);
}

export async function deleteBanner(id: string): Promise<void> {
  await supabase.from("banners").delete().eq("id", id);
  await loadBanners(true);
}
