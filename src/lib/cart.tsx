import { createContext, useContext, useEffect, useState, type ReactNode } from "react";
import type { CartItem } from "./types";

interface CartState {
  items: CartItem[];
  wishlist: string[];
  add: (item: CartItem, maxStock: number) => boolean;
  setQty: (variantId: string, qty: number) => void;
  remove: (variantId: string) => void;
  clear: () => void;
  toggleWish: (productId: string) => void;
  count: number;
  subtotal: number;
}
const Ctx = createContext<CartState | null>(null);

export function CartProvider({ children }: { children: ReactNode }) {
  const [items, setItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<string[]>([]);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    try {
      setItems(JSON.parse(localStorage.getItem("sbb-cart") || "[]"));
      setWishlist(JSON.parse(localStorage.getItem("sbb-wish") || "[]"));
    } catch { /* ignore */ }
    setReady(true);
  }, []);
  useEffect(() => { if (ready) localStorage.setItem("sbb-cart", JSON.stringify(items)); }, [items, ready]);
  useEffect(() => { if (ready) localStorage.setItem("sbb-wish", JSON.stringify(wishlist)); }, [wishlist, ready]);

  const value: CartState = {
    items, wishlist,
    add: (item, maxStock) => {
      const existing = items.find((i) => i.variantId === item.variantId);
      const qty = (existing?.quantity ?? 0) + item.quantity;
      if (qty > maxStock) return false;
      setItems(existing ? items.map((i) => (i.variantId === item.variantId ? { ...i, quantity: qty } : i)) : [...items, item]);
      return true;
    },
    setQty: (id, qty) => setItems((s) => s.map((i) => (i.variantId === id ? { ...i, quantity: Math.max(1, qty) } : i))),
    remove: (id) => setItems((s) => s.filter((i) => i.variantId !== id)),
    clear: () => setItems([]),
    toggleWish: (pid) => setWishlist((w) => (w.includes(pid) ? w.filter((x) => x !== pid) : [...w, pid])),
    count: items.reduce((n, i) => n + i.quantity, 0),
    subtotal: items.reduce((n, i) => n + i.price * i.quantity, 0),
  };
  return <Ctx.Provider value={value}>{children}</Ctx.Provider>;
}
export function useCart() {
  const c = useContext(Ctx);
  if (!c) throw new Error("useCart outside CartProvider");
  return c;
}
