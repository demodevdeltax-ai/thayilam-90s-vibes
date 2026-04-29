import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Product, Weight } from "@/lib/products";
import { getCachedProduct, loadProducts, useAllProducts } from "@/lib/products-store";
import { useAuth } from "@/lib/auth";
import { supabase } from "@/integrations/supabase/client";

export type CartItem = {
  id: string; // composite: productId|weight
  productId: string;
  weight: Weight;
  qty: number;
  unitPrice: number;
};

type CartCtx = {
  items: CartItem[];
  count: number;
  subtotal: number;
  add: (productId: string, weight?: Weight, qty?: number, unitPrice?: number) => void;
  setQty: (id: string, qty: number) => void;
  remove: (id: string) => void;
  clear: () => void;
  getProduct: (productId: string) => Product | undefined;
};

const Ctx = createContext<CartCtx | null>(null);
const KEY = "thayilam-cart-v1";

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  // Trigger product loading so add()/getProduct() find data.
  const products = useAllProducts();
  const { isAuthenticated } = useAuth();

  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(KEY) : null;
      if (raw) setItems(JSON.parse(raw));
    } catch {
      // ignore
    }
    setHydrated(true);
  }, []);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(KEY, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated]);

  const getProduct = useCallback(
    (productId: string) => products.find((p) => p.id === productId) ?? getCachedProduct(productId),
    [products],
  );

  const add = useCallback<CartCtx["add"]>(async (productId, weight, qty = 1, unitPrice) => {
    let product = getCachedProduct(productId) ?? products.find((p) => p.id === productId);
    if (!product) {
      // Make sure products are loaded before bailing.
      await loadProducts();
      product = getCachedProduct(productId);
      if (!product) return;
    }
    const w = weight ?? product.weight;
    const price = unitPrice ?? product.price;
    const id = `${productId}|${w}`;
    setItems((prev) => {
      const existing = prev.find((i) => i.id === id);
      if (existing) {
        return prev.map((i) => (i.id === id ? { ...i, qty: i.qty + qty } : i));
      }
      return [...prev, { id, productId, weight: w, qty, unitPrice: price }];
    });
  }, [products]);

  const setQty = useCallback<CartCtx["setQty"]>((id, qty) => {
    setItems((prev) =>
      qty <= 0
        ? prev.filter((i) => i.id !== id)
        : prev.map((i) => (i.id === id ? { ...i, qty } : i)),
    );
  }, []);

  const remove = useCallback<CartCtx["remove"]>((id) => {
    setItems((prev) => prev.filter((i) => i.id !== id));
  }, []);

  const clear = useCallback(() => setItems([]), []);

  const value = useMemo<CartCtx>(() => {
    const count = items.reduce((s, i) => s + i.qty, 0);
    const subtotal = items.reduce((s, i) => s + i.unitPrice * i.qty, 0);
    return { items, count, subtotal, add, setQty, remove, clear, getProduct };
  }, [items, add, setQty, remove, clear, getProduct]);

  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}

export function useCart() {
  const ctx = useContext(Ctx);
  if (!ctx) throw new Error("useCart must be used inside CartProvider");
  return ctx;
}
