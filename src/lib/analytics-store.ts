// Computes platform analytics (orders/day, GMV, top products) directly from
// the orders + order_items tables.
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

export type DayBucket = { date: string; orders: number; gmv: number };
export type TopProduct = {
  productId: string;
  name: string;
  units: number;
  revenue: number;
};

export type Analytics = {
  ordersByDay: DayBucket[];   // last 30 days, oldest → newest
  topProducts: TopProduct[];  // top 8 by revenue
  totalGmv30d: number;
  totalOrders30d: number;
  ordersToday: number;
  gmvThisMonth: number;
  loading: boolean;
};

const EMPTY: Analytics = {
  ordersByDay: [],
  topProducts: [],
  totalGmv30d: 0,
  totalOrders30d: 0,
  ordersToday: 0,
  gmvThisMonth: 0,
  loading: true,
};

export function useAnalytics(): Analytics {
  const [data, setData] = useState<Analytics>(EMPTY);

  useEffect(() => {
    let alive = true;
    (async () => {
      const since = new Date();
      since.setDate(since.getDate() - 29);
      since.setHours(0, 0, 0, 0);

      const [{ data: orders }, { data: items }] = await Promise.all([
        supabase
          .from("orders")
          .select("id,total,placed_at")
          .gte("placed_at", since.toISOString()),
        supabase
          .from("order_items")
          .select("product_id,product_name,qty,unit_price,created_at")
          .gte("created_at", since.toISOString()),
      ]);

      // Build 30-day buckets
      const buckets = new Map<string, DayBucket>();
      for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const key = d.toISOString().slice(0, 10);
        buckets.set(key, { date: key, orders: 0, gmv: 0 });
      }
      (orders ?? []).forEach((o) => {
        const key = o.placed_at.slice(0, 10);
        const b = buckets.get(key);
        if (b) { b.orders += 1; b.gmv += Number(o.total); }
      });
      const ordersByDay = Array.from(buckets.values());

      // Top products
      const map = new Map<string, TopProduct>();
      (items ?? []).forEach((i) => {
        const key = i.product_id ?? i.product_name;
        const cur = map.get(key) ?? {
          productId: i.product_id ?? "",
          name: i.product_name,
          units: 0,
          revenue: 0,
        };
        cur.units += i.qty;
        cur.revenue += Number(i.unit_price) * i.qty;
        map.set(key, cur);
      });
      const topProducts = Array.from(map.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 8);

      const today = new Date().toISOString().slice(0, 10);
      const ordersToday = buckets.get(today)?.orders ?? 0;

      const now = new Date();
      const monthKey = now.toISOString().slice(0, 7);
      const gmvThisMonth = ordersByDay
        .filter((b) => b.date.startsWith(monthKey))
        .reduce((s, b) => s + b.gmv, 0);

      const totalGmv30d = ordersByDay.reduce((s, b) => s + b.gmv, 0);
      const totalOrders30d = ordersByDay.reduce((s, b) => s + b.orders, 0);

      if (alive) {
        setData({
          ordersByDay,
          topProducts,
          totalGmv30d,
          totalOrders30d,
          ordersToday,
          gmvThisMonth,
          loading: false,
        });
      }
    })();
    return () => { alive = false; };
  }, []);

  return data;
}
