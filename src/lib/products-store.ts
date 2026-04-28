// Reactive store for product mutations from the admin panel.
// In-memory only — mutates the PRODUCTS array directly so all readers see updates.

import { useSyncExternalStore } from "react";
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

export function updateProduct(
  id: string,
  patch: Partial<Pick<Product, "packSizes" | "sku" | "price" | "name">>,
) {
  const p = PRODUCTS.find((x) => x.id === id);
  if (!p) return;
  Object.assign(p, patch);
  emit();
}

export function updatePackSizes(id: string, sizes: number[]) {
  const cleaned = [...new Set(sizes.filter((n) => n > 0))].sort((a, b) => a - b);
  updateProduct(id, { packSizes: cleaned });
}

export function useAllProducts(): Product[] {
  return useSyncExternalStore(
    subscribe,
    () => PRODUCTS,
    () => PRODUCTS,
  );
}
