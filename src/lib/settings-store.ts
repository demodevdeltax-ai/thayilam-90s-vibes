// Supabase-backed platform settings (singleton row).
import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";

export type PlatformSettings = {
  platformName: string;
  supportEmail: string;
  defaultCommission: number;
  minPayout: number;
  freeShipThreshold: number;
  twoFactor: boolean;
  autoApproveVendors: boolean;
  publicCatalog: boolean;
};

const DEFAULTS: PlatformSettings = {
  platformName: "Thayilam",
  supportEmail: "support@thayilam.in",
  defaultCommission: 12,
  minPayout: 1000,
  freeShipThreshold: 999,
  twoFactor: true,
  autoApproveVendors: false,
  publicCatalog: true,
};

let CACHE: PlatformSettings = DEFAULTS;
let LOADED = false;
let LOADING: Promise<void> | null = null;

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const emit = () => listeners.forEach((l) => l());

export async function loadSettings(force = false): Promise<PlatformSettings> {
  if (LOADED && !force) return CACHE;
  if (LOADING && !force) { await LOADING; return CACHE; }
  LOADING = (async () => {
    const { data } = await supabase.from("platform_settings").select("*").limit(1).maybeSingle();
    if (data) {
      CACHE = {
        platformName: data.platform_name,
        supportEmail: data.support_email,
        defaultCommission: Number(data.default_commission),
        minPayout: Number(data.min_payout),
        freeShipThreshold: Number(data.free_ship_threshold),
        twoFactor: data.two_factor,
        autoApproveVendors: data.auto_approve_vendors,
        publicCatalog: data.public_catalog,
      };
    }
    LOADED = true;
    LOADING = null;
    emit();
  })();
  await LOADING;
  return CACHE;
}

export function useSettings(): PlatformSettings {
  const s = useSyncExternalStore(subscribe, () => CACHE, () => CACHE);
  useEffect(() => { if (!LOADED) void loadSettings(); }, []);
  return s;
}

export async function saveSettings(patch: Partial<PlatformSettings>): Promise<void> {
  const row: Record<string, unknown> = { updated_at: new Date().toISOString() };
  if (patch.platformName !== undefined) row.platform_name = patch.platformName;
  if (patch.supportEmail !== undefined) row.support_email = patch.supportEmail;
  if (patch.defaultCommission !== undefined) row.default_commission = patch.defaultCommission;
  if (patch.minPayout !== undefined) row.min_payout = patch.minPayout;
  if (patch.freeShipThreshold !== undefined) row.free_ship_threshold = patch.freeShipThreshold;
  if (patch.twoFactor !== undefined) row.two_factor = patch.twoFactor;
  if (patch.autoApproveVendors !== undefined) row.auto_approve_vendors = patch.autoApproveVendors;
  if (patch.publicCatalog !== undefined) row.public_catalog = patch.publicCatalog;

  const { error } = await supabase.from("platform_settings").update(row).eq("singleton", true);
  if (error) throw error;
  await loadSettings(true);
}
