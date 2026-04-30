// Supabase-backed customers store - reads from profiles + aggregates orders
import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { AdminCustomer } from "./admin-data";

let CACHE: AdminCustomer[] = [];
let LOADED = false;
let LOADING: Promise<void> | null = null;

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const emit = () => listeners.forEach((l) => l());

export async function loadCustomers(force = false): Promise<AdminCustomer[]> {
  if (LOADED && !force) return CACHE;
  if (LOADING && !force) { await LOADING; return CACHE; }
  LOADING = (async () => {
    const { data: profiles, error } = await supabase
      .from("profiles")
      .select("id,full_name,phone,created_at")
      .order("created_at", { ascending: false });
    if (error) { console.error("[customers] load failed:", error); CACHE = []; LOADED = true; LOADING = null; emit(); return; }

    const { data: orders } = await supabase
      .from("orders")
      .select("user_id,total,ship_city");

    const stats = new Map<string, { orders: number; spend: number; city: string }>();
    (orders ?? []).forEach((o) => {
      const cur = stats.get(o.user_id) ?? { orders: 0, spend: 0, city: "" };
      cur.orders += 1;
      cur.spend += Number(o.total);
      if (!cur.city && o.ship_city) cur.city = o.ship_city;
      stats.set(o.user_id, cur);
    });

    CACHE = (profiles ?? []).map((p): AdminCustomer => {
      const s = stats.get(p.id) ?? { orders: 0, spend: 0, city: "—" };
      return {
        id: p.id,
        name: p.full_name || "Unnamed",
        phone: p.phone || "—",
        email: "—", // not in profiles table
        city: s.city || "—",
        joinedAt: p.created_at,
        orders: s.orders,
        spend: s.spend,
      };
    });
    LOADED = true;
    LOADING = null;
    emit();
  })();
  await LOADING;
  return CACHE;
}

export function useCustomers(): AdminCustomer[] {
  const list = useSyncExternalStore(subscribe, () => CACHE, () => CACHE);
  useEffect(() => { if (!LOADED) void loadCustomers(); }, []);
  return list;
}
