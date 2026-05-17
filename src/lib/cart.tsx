import { createContext, useCallback, useContext, useEffect, useMemo, useState, type ReactNode } from "react";
import { toast } from "sonner";
import type { Product, Weight } from "@/lib/products";
import { getCachedProduct, loadProducts, useAllProducts } from "@/lib/products-store";
import { useAuth } from "@/lib/auth";

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

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [hydrated, setHydrated] = useState(false);
  const products = useAllProducts();
  const { isAuthenticated, user } = useAuth();

  // User-specific storage key — prevents one user's cart showing for another
  const storageKey = `thayilam-cart-v1${user?.id ? `-${user.id}` : ""}`;

  // Re-hydrate whenever user identity changes (login / logout)
  useEffect(() => {
    try {
      const raw = typeof window !== "undefined" ? localStorage.getItem(storageKey) : null;
      setItems(raw ? JSON.parse(raw) : []);
    } catch {
      setItems([]);
    }
    setHydrated(true);
  }, [storageKey]);

  useEffect(() => {
    if (!hydrated) return;
    try {
      localStorage.setItem(storageKey, JSON.stringify(items));
    } catch {
      // ignore
    }
  }, [items, hydrated, storageKey]);

  const getProduct = useCallback(
    (productId: string) => products.find((p) => p.id === productId) ?? getCachedProduct(productId),
    [products],
  );

  const add = useCallback<CartCtx["add"]>(async (productId, weight, qty = 1, unitPrice) => {
    if (!isAuthenticated) {
      toast.error("Please sign in to add items to your dabba", {
        action: {
          label: "Sign in",
          onClick: () => {
            window.location.href = `/auth?redirect=${encodeURIComponent(window.location.pathname)}&mode=login`;
          },
        },
      });
      return;
    }
    let product = getCachedProduct(productId) ?? products.find((p) => p.id === productId);
    if (!product) {
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
    toast.success(`Added ${product.name} to your dabba`);
  }, [products, isAuthenticated]);

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
