// Lightweight reactive store for vendor admin mutations (status, stock, products).
// In-memory only — survives navigation within the SPA, resets on full reload.

import { useSyncExternalStore } from "react";
import {
  ORDERS,
  STOCK,
  REVIEWS,
  type Order,
  type OrderStatus,
  type StockState,
  type VendorReview,
} from "./vendor-data";
import { PRODUCTS, type Product } from "./products";

type Listener = () => void;
const listeners = new Set<Listener>();

function emit() {
  listeners.forEach((l) => l());
}

function subscribe(l: Listener) {
  listeners.add(l);
  return () => listeners.delete(l);
}

// ----- Orders -----
export function setOrderStatus(id: string, status: OrderStatus) {
  const o = ORDERS.find((x) => x.id === id);
  if (!o) return;
  o.status = status;
  emit();
}

export function shipOrder(id: string, courier: string, tracking: string) {
  const o = ORDERS.find((x) => x.id === id);
  if (!o) return;
  o.status = "Shipped";
  o.courier = courier;
  o.tracking = tracking;
  emit();
}

export function useOrders(): Order[] {
  return useSyncExternalStore(
    subscribe,
    () => ORDERS,
    () => ORDERS,
  );
}

// ----- Stock -----
export function toggleStockEnabled(productId: string) {
  const s = STOCK[productId];
  if (!s) return;
  s.enabled = !s.enabled;
  emit();
}

export function setStockEnabled(productId: string, enabled: boolean) {
  const s = STOCK[productId];
  if (!s) return;
  s.enabled = enabled;
  emit();
}

export function deleteVendorProduct(productId: string) {
  const idx = PRODUCTS.findIndex((p) => p.id === productId);
  if (idx >= 0) PRODUCTS.splice(idx, 1);
  delete STOCK[productId];
  emit();
}

export function addVendorProduct(p: Product, stock: StockState) {
  PRODUCTS.unshift(p);
  STOCK[p.id] = stock;
  emit();
}

export function useVendorProducts(vendor: string): Product[] {
  return useSyncExternalStore(
    subscribe,
    () => PRODUCTS.filter((p) => p.vendor === vendor),
    () => PRODUCTS.filter((p) => p.vendor === vendor),
  );
}

export function useStock(): Record<string, StockState> {
  return useSyncExternalStore(
    subscribe,
    () => STOCK,
    () => STOCK,
  );
}

// ----- Reviews -----
export function replyReview(id: string, reply: string) {
  const r = REVIEWS.find((x) => x.id === id);
  if (!r) return;
  r.reply = reply;
  emit();
}

export function useReviews(): VendorReview[] {
  return useSyncExternalStore(
    subscribe,
    () => REVIEWS,
    () => REVIEWS,
  );
}
