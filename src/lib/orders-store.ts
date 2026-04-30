// Supabase-backed orders store (admin view)
import { useEffect, useSyncExternalStore } from "react";
import { supabase } from "@/integrations/supabase/client";
import type { Order, OrderItem, OrderStatus } from "./vendor-data";
import type { Weight } from "./products";
import { logDbError } from "./db-compat";

let CACHE: Order[] = [];
let LOADED = false;
let LOADING: Promise<void> | null = null;

const listeners = new Set<() => void>();
const subscribe = (l: () => void) => { listeners.add(l); return () => listeners.delete(l); };
const emit = () => listeners.forEach((l) => l());

type OrderRow = {
  id: string;
  order_number: string;
  user_id: string;
  status: OrderStatus;
  subtotal: number;
  discount: number;
  shipping: number;
  total: number;
  ship_name: string;
  ship_phone: string;
  ship_line: string;
  ship_city: string;
  ship_state: string;
  ship_pincode: string;
  placed_at: string;
  courier: string | null;
  tracking: string | null;
  order_items: {
    product_id: string | null;
    product_name: string;
    weight: string;
    qty: number;
    unit_price: number;
  }[];
};

function rowToOrder(r: OrderRow): Order {
  const items: OrderItem[] = (r.order_items ?? []).map((i) => ({
    productId: i.product_id ?? "",
    name: i.product_name,
    weight: i.weight as Weight,
    qty: i.qty,
    unitPrice: Number(i.unit_price),
  }));
  return {
    id: r.order_number,
    customer: { name: r.ship_name, phone: r.ship_phone },
    address: { line: r.ship_line, city: r.ship_city, state: r.ship_state, pincode: r.ship_pincode },
    items,
    amount: Number(r.total),
    status: r.status,
    placedAt: r.placed_at,
    courier: r.courier ?? undefined,
    tracking: r.tracking ?? undefined,
  };
}

// Map order_number → uuid for status updates
const NUMBER_TO_ID = new Map<string, string>();

export async function loadOrders(force = false): Promise<Order[]> {
  if (LOADED && !force) return CACHE;
  if (LOADING && !force) { await LOADING; return CACHE; }
  LOADING = (async () => {
    const { data, error } = await supabase
      .from("orders")
      .select("*, order_items(product_id,product_name,weight,qty,unit_price)")
      .order("placed_at", { ascending: false });
    if (error) { logDbError("orders", error); CACHE = []; }
    else {
      const rows = (data ?? []) as unknown as OrderRow[];
      NUMBER_TO_ID.clear();
      rows.forEach((r) => NUMBER_TO_ID.set(r.order_number, r.id));
      CACHE = rows.map(rowToOrder);
    }
    LOADED = true;
    LOADING = null;
    emit();
  })();
  await LOADING;
  return CACHE;
}

export function useOrders(): Order[] {
  const list = useSyncExternalStore(subscribe, () => CACHE, () => CACHE);
  useEffect(() => { if (!LOADED) void loadOrders(); }, []);
  return list;
}

export async function setOrderStatus(orderNumber: string, status: OrderStatus): Promise<void> {
  const id = NUMBER_TO_ID.get(orderNumber);
  if (!id) return;
  const { error } = await supabase.from("orders").update({ status }).eq("id", id);
  if (error) throw error;
  await loadOrders(true);
}
