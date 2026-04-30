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
    order_id?: string;
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
    const [{ data: orders, error }, { data: items, error: itemsError }] = await Promise.all([
      supabase
      .from("orders")
      .select("id,order_number,user_id,status,subtotal,discount,shipping,total,ship_name,ship_phone,ship_line,ship_city,ship_state,ship_pincode,placed_at,courier,tracking")
      .order("placed_at", { ascending: false }),
      supabase
        .from("order_items")
        .select("order_id,product_id,product_name,weight,qty,unit_price"),
    ]);
    if (error) { logDbError("orders", error); CACHE = []; }
    else if (itemsError) { logDbError("order_items", itemsError); CACHE = []; }
    else {
      const byOrderId = new Map<string, OrderRow["order_items"]>();
      ((items ?? []) as unknown as OrderRow["order_items"]).forEach((i) => {
        if (!i.order_id) return;
        const list = byOrderId.get(i.order_id) ?? [];
        list.push(i);
        byOrderId.set(i.order_id, list);
      });
      const rows = ((orders ?? []) as unknown as Omit<OrderRow, "order_items">[]).map((r) => ({
        ...r,
        order_items: byOrderId.get(r.id) ?? [],
      }));
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
