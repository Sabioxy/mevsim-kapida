"use client";

import * as React from "react";
import type { Cart, CartLine, Promotion } from "@/lib/types";
import { makeId } from "@/lib/utils";

const STORAGE_KEY = "mk_cart_v1";

type CartContextValue = {
  cart: Cart;
  cartCount: number;
  addLine: (args: { productId: string; skuId: string; qty: number }) => void;
  updateQty: (lineId: string, qty: number) => void;
  removeLine: (lineId: string) => void;
  clearCart: () => void;

  promotions: Promotion[];
  setPromotions: (promos: Promotion[]) => void;
  isFirstOrder: boolean;
  setIsFirstOrder: (v: boolean) => void;
};

const CartContext = React.createContext<CartContextValue | null>(null);

const newCart = (): Cart => ({
  id: makeId("cart"),
  lines: [],
  createdAt: Date.now(),
  updatedAt: Date.now(),
});

const normalizeQty = (qty: number) => {
  if (!Number.isFinite(qty)) return 1;
  return Math.max(1, Math.min(99, Math.floor(qty)));
};

export function CartProvider({ children }: { children: React.ReactNode }) {
  const [cart, setCart] = React.useState<Cart>(() => {
    if (typeof window === "undefined") return newCart();
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return newCart();
      const parsed = JSON.parse(raw) as Cart;
      if (!parsed?.id || !Array.isArray(parsed.lines)) return newCart();
      return parsed;
    } catch {
      return newCart();
    }
  });
  const [promotions, setPromotions] = React.useState<Promotion[]>([]);
  const [isFirstOrder, setIsFirstOrder] = React.useState(true);

  React.useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
    } catch {
      // ignore
    }
  }, [cart]);

  const cartCount = React.useMemo(
    () => cart.lines.reduce((sum, l) => sum + l.qty, 0),
    [cart.lines],
  );

  const addLine = React.useCallback(
    (args: { productId: string; skuId: string; qty: number }) => {
      const qty = normalizeQty(args.qty);
      setCart((prev) => {
        // Same product+sku merges in one line
        const existing = prev.lines.find(
          (l) => l.productId === args.productId && l.skuId === args.skuId,
        );
        const nextLines: CartLine[] = existing
          ? prev.lines.map((l) =>
              l.lineId === existing.lineId ? { ...l, qty: l.qty + qty } : l,
            )
          : [
              ...prev.lines,
              {
                lineId: makeId("line"),
                productId: args.productId,
                skuId: args.skuId,
                qty,
              },
            ];

        return { ...prev, lines: nextLines, updatedAt: Date.now() };
      });
    },
    [],
  );

  const updateQty = React.useCallback((lineId: string, qty: number) => {
    const normalized = normalizeQty(qty);
    setCart((prev) => ({
      ...prev,
      lines: prev.lines.map((l) => (l.lineId === lineId ? { ...l, qty: normalized } : l)),
      updatedAt: Date.now(),
    }));
  }, []);

  const removeLine = React.useCallback((lineId: string) => {
    setCart((prev) => ({
      ...prev,
      lines: prev.lines.filter((l) => l.lineId !== lineId),
      updatedAt: Date.now(),
    }));
  }, []);

  const clearCart = React.useCallback(() => setCart(newCart()), []);

  const value: CartContextValue = {
    cart,
    cartCount,
    addLine,
    updateQty,
    removeLine,
    clearCart,
    promotions,
    setPromotions,
    isFirstOrder,
    setIsFirstOrder,
  };

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCart() {
  const ctx = React.useContext(CartContext);
  if (!ctx) throw new Error("useCart must be used within CartProvider");
  return ctx;
}
