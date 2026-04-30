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
  const row = {
    updated_at: new Date().toISOString(),
    ...(patch.platformName !== undefined && { platform_name: patch.platformName }),
    ...(patch.supportEmail !== undefined && { support_email: patch.supportEmail }),
    ...(patch.defaultCommission !== undefined && { default_commission: patch.defaultCommission }),
    ...(patch.minPayout !== undefined && { min_payout: patch.minPayout }),
    ...(patch.freeShipThreshold !== undefined && { free_ship_threshold: patch.freeShipThreshold }),
    ...(patch.twoFactor !== undefined && { two_factor: patch.twoFactor }),
    ...(patch.autoApproveVendors !== undefined && { auto_approve_vendors: patch.autoApproveVendors }),
    ...(patch.publicCatalog !== undefined && { public_catalog: patch.publicCatalog }),
  };
  const { error } = await supabase.from("platform_settings").update(row).eq("singleton", true);
  if (error) throw error;
  await loadSettings(true);
}
