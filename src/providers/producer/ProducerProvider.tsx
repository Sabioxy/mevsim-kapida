"use client";

import * as React from "react";
import type { CategorySlug, Producer, Product, ProductBadgeKind, SkuVariant } from "@/lib/types";
import { makeId } from "@/lib/utils";
import { TRY } from "@/lib/money";

const STORAGE_KEY = "mk_producer_mvp_v1";

type ProducerState = {
  profile: Producer | null;
  products: Product[];
  deliveryDatesISO: string[]; // YYYY-MM-DD
};

type ProducerContextValue = ProducerState & {
  register: (args: { name: string; city: string }) => void;
  addProduct: (args: {
    title: string;
    category: CategorySlug;
    badges: ProductBadgeKind[];
    description: string;
    variants: Array<{
      label: string;
      grams: number;
      producerBasePriceTRY: number;
      stock: number;
    }>;
  }) => void;
  updateSkuStock: (args: { productId: string; skuId: string; stock: number }) => void;
  addDeliveryDate: (iso: string) => void;
  removeDeliveryDate: (iso: string) => void;
  resetMvp: () => void;
};

const ProducerContext = React.createContext<ProducerContextValue | null>(null);

const defaultState = (): ProducerState => ({
  profile: null,
  products: [],
  deliveryDatesISO: [],
});

const safeParse = (): { producerId?: number | null } => {
  if (typeof window === "undefined") return {};
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return {};
    const parsed = JSON.parse(raw);
    if (!parsed || typeof parsed !== "object") return {};
    return { producerId: parsed.producerId ?? null };
  } catch {
    return {};
  }
};

const clampInt = (n: number, min: number, max: number) => {
  if (!Number.isFinite(n)) return min;
  return Math.max(min, Math.min(max, Math.floor(n)));
};

export function ProducerProvider({ children }: { children: React.ReactNode }) {
  const [state, setState] = React.useState<ProducerState>(defaultState);

  React.useEffect(() => {
    const parsed = safeParse();
    if (!parsed.producerId) return;

    (async () => {
      try {
        const [prRes, prodsRes] = await Promise.all([
          fetch(`/api/admin/producers/${parsed.producerId}`),
          fetch(`/api/products?producerId=${parsed.producerId}`),
        ]);
        if (!prRes.ok) return;
        const profile = await prRes.json();
        const products = await prodsRes.json();
        setState({ profile, products, deliveryDatesISO: [] });
      } catch {
        // ignore
      }
    })();
  }, []);

  const register = (args: { name: string; city: string }) => {
    const name = args.name.trim();
    const city = args.city.trim();
    if (!name || !city) return;

    (async () => {
      try {
        const res = await fetch("/api/admin/producers", { method: "POST", body: JSON.stringify({ name, city }), headers: { "Content-Type": "application/json" } });
        const created = await res.json();
        localStorage.setItem(STORAGE_KEY, JSON.stringify({ producerId: created.id }));
        setState((prev) => ({ ...prev, profile: created }));
      } catch {
        // ignore
      }
    })();
  };

  const addProduct: ProducerContextValue["addProduct"] = (args) => {
    if (!state.profile) return;
    (async () => {
      try {
        const res = await fetch('/api/admin/products', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({
          name: args.title,
          slug: undefined,
          description: args.description,
          image: '/images/box-karisik.svg',
          category: args.category,
          price: args.variants && args.variants[0] ? args.variants[0].producerBasePriceTRY : 0,
          producerId: state.profile?.id,
        })});
        const created = await res.json();
        setState((prev) => ({ ...prev, products: [created, ...prev.products] }));
      } catch {
        // ignore
      }
    })();
  };

  const updateSkuStock: ProducerContextValue["updateSkuStock"] = (args) => {
    const stock = clampInt(args.stock, 0, 99_999);
    (async () => {
      try {
        // find sku by skuId from current state
        const allSkus = state.products.flatMap((p) => p.variants.map((v) => ({ skuId: v.skuId, productId: p.id })));
        const found = allSkus.find((s) => s.skuId === args.skuId);
        if (!found) {
          // fallback: just update local state
          setState((prev) => ({
            ...prev,
            products: prev.products.map((p) =>
              p.id !== args.productId
                ? p
                : {
                    ...p,
                    variants: p.variants.map((v) => (v.skuId === args.skuId ? { ...v, stock } : v)),
                  },
            ),
          }));
          return;
        }

        // call admin sku patch endpoint; we need numeric sku id — find by skuId
        const skuRes = await fetch(`/api/admin/skus?skuId=${encodeURIComponent(args.skuId)}`);
        const skuData = await skuRes.json();
        const skuIdNum = skuData?.id;
        if (skuIdNum) {
          await fetch(`/api/admin/skus/${skuIdNum}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ stock }) });
        }

        // update local state
        setState((prev) => ({
          ...prev,
          products: prev.products.map((p) =>
            p.id !== args.productId
              ? p
              : {
                  ...p,
                  variants: p.variants.map((v) => (v.skuId === args.skuId ? { ...v, stock } : v)),
                },
          ),
        }));
      } catch {
        // ignore
      }
    })();
  };

  const addDeliveryDate = (iso: string) => {
    const v = iso.trim();
    if (!/^\d{4}-\d{2}-\d{2}$/.test(v)) return;
    setState((prev) => ({
      ...prev,
      deliveryDatesISO: Array.from(new Set([v, ...prev.deliveryDatesISO])).sort(),
    }));
  };

  const removeDeliveryDate = (iso: string) => {
    setState((prev) => ({
      ...prev,
      deliveryDatesISO: prev.deliveryDatesISO.filter((d) => d !== iso),
    }));
  };

  const resetMvp = () => {
    setState(defaultState());
    try {
      localStorage.removeItem(STORAGE_KEY);
    } catch {
      // ignore
    }
  };

  const value: ProducerContextValue = {
    ...state,
    register,
    addProduct,
    updateSkuStock,
    addDeliveryDate,
    removeDeliveryDate,
    resetMvp,
  };

  return <ProducerContext.Provider value={value}>{children}</ProducerContext.Provider>;
}

export function useProducer() {
  const ctx = React.useContext(ProducerContext);
  if (!ctx) throw new Error("useProducer must be used within ProducerProvider");
  return ctx;
}
