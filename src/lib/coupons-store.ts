// Supabase-backed coupons store
import { useEffect, useSyncExternalStore } from "react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import type { Offer } from "./admin-data";

let CACHE: Offer[] = [];
let LOADED = false;
let LOADING: Promise<void> | null = null;

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const emit = () => listeners.forEach((l) => l());

type Row = {
  id: string;
  code: string;
  description: string | null;
  discount_type: "flat" | "percent";
  discount_value: number;
  min_order_value: number;
  max_discount: number | null;
  valid_from: string;
  valid_until: string | null;
  usage_count: number;
  usage_limit: number | null;
  scope: string;
  scope_targets: string[] | null;
  is_active: boolean;
};

function reportError(scope: string, error: unknown) {
  const msg = (error as { message?: string } | null)?.message ?? String(error);
  console.error(`[${scope}]`, error);
  toast.error(`${scope} failed`, { description: msg });
}

function rowToOffer(r: Row): Offer {
  return {
    id: r.id,
    code: r.code,
    description: r.description ?? "",
    type: r.discount_type,
    value: Number(r.discount_value),
    minOrder: Number(r.min_order_value),
    maxDiscount: r.max_discount != null ? Number(r.max_discount) : 0,
    startsAt: r.valid_from.slice(0, 10),
    endsAt: r.valid_until ? r.valid_until.slice(0, 10) : "",
    used: r.usage_count,
    cap: r.usage_limit ?? 0,
    scope: (r.scope as Offer["scope"]) ?? "all",
    scopeTargets: r.scope_targets ?? [],
    active: r.is_active,
  };
}

export async function loadCoupons(force = false): Promise<Offer[]> {
  if (LOADED && !force) return CACHE;
  if (LOADING && !force) { await LOADING; return CACHE; }
  LOADING = (async () => {
    const { data, error } = await supabase
      .from("coupons")
      .select("id,code,description,discount_type,discount_value,min_order_value,max_discount,valid_from,valid_until,usage_count,usage_limit,scope,scope_targets,is_active")
      .order("created_at", { ascending: false });
    if (error) { reportError("Load coupons", error); CACHE = []; }
    else CACHE = ((data ?? []) as unknown as Row[]).map(rowToOffer);
    LOADED = true;
    LOADING = null;
    emit();
  })();
  await LOADING;
  return CACHE;
}

export function useOffers(): Offer[] {
  const list = useSyncExternalStore(subscribe, () => CACHE, () => CACHE);
  useEffect(() => { if (!LOADED) void loadCoupons(); }, []);
  return list;
}

export async function toggleOffer(id: string): Promise<void> {
  const o = CACHE.find((x) => x.id === id);
  if (!o) return;
  const { error } = await supabase.from("coupons").update({ is_active: !o.active }).eq("id", id);
  if (error) { reportError("Toggle coupon", error); return; }
  toast.success(o.active ? "Coupon disabled" : "Coupon activated");
  await loadCoupons(true);
}

type OfferInput = Omit<Offer, "id" | "used"> & { id?: string; used?: number };

export async function upsertOffer(input: OfferInput): Promise<void> {
  const payload = {
    code: input.code,
    description: input.description,
    discount_type: input.type,
    discount_value: input.value,
    min_order_value: input.minOrder,
    max_discount: input.maxDiscount || null,
    valid_from: input.startsAt ? new Date(input.startsAt).toISOString() : new Date().toISOString(),
    valid_until: input.endsAt ? new Date(input.endsAt).toISOString() : null,
    usage_limit: input.cap || null,
    scope: input.scope,
    scope_targets: input.scopeTargets,
    is_active: input.active,
  };
  if (input.id) {
    const { error } = await supabase.from("coupons").update(payload).eq("id", input.id);
    if (error) { reportError("Save coupon", error); return; }
    toast.success("Coupon saved");
  } else {
    const { error } = await supabase.from("coupons").insert(payload);
    if (error) { reportError("Create coupon", error); return; }
    toast.success("Coupon created");
  }
  await loadCoupons(true);
}

export async function deleteOffer(id: string): Promise<void> {
  const { error } = await supabase.from("coupons").delete().eq("id", id);
  if (error) { reportError("Delete coupon", error); return; }
  toast.success("Coupon deleted");
  await loadCoupons(true);
}
