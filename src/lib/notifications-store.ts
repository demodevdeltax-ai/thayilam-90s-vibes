// Supabase-backed notifications log
import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { NotifAudience, NotifChannel, SentNotification } from "./admin-data";

let CACHE: SentNotification[] = [];
let LOADED = false;
let LOADING: Promise<void> | null = null;

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const emit = () => listeners.forEach((l) => l());

export async function loadNotifications(force = false): Promise<SentNotification[]> {
  if (LOADED && !force) return CACHE;
  if (LOADING && !force) { await LOADING; return CACHE; }
  LOADING = (async () => {
    const { data, error } = await supabase
      .from("notifications")
      .select("*")
      .order("sent_at", { ascending: false })
      .limit(100);
    if (error) { console.error("[notifications] load failed:", error); CACHE = []; }
    else {
      CACHE = (data ?? []).map((r): SentNotification => ({
        id: r.id,
        channel: r.channel as NotifChannel,
        title: r.title,
        body: r.body,
        audience: r.audience as unknown as NotifAudience,
        recipients: r.recipients,
        sentAt: r.sent_at,
      }));
    }
    LOADED = true; LOADING = null; emit();
  })();
  await LOADING;
  return CACHE;
}

export function useNotifications(): SentNotification[] {
  const list = useSyncExternalStore(subscribe, () => CACHE, () => CACHE);
  useEffect(() => { if (!LOADED) void loadNotifications(); }, []);
  return list;
}

export async function sendNotification(input: {
  channel: NotifChannel;
  title: string;
  body: string;
  audience: NotifAudience;
  recipients: number;
}): Promise<void> {
  const { data: u } = await supabase.auth.getUser();
  const { error } = await supabase.from("notifications").insert({
    channel: input.channel,
    title: input.title,
    body: input.body,
    audience: input.audience as unknown as Record<string, unknown>,
    recipients: input.recipients,
    sent_by: u.user?.id ?? null,
  });
  if (error) throw error;
  await loadNotifications(true);
}
