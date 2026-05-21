"use client";

import Link from "next/link";
import * as React from "react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { useCart } from "@/providers/CartProvider";
import { CartLineItem } from "@/components/cart/CartLineItem";
import { CouponBox } from "@/components/cart/CouponBox";
import {
  calcCartItemsSubtotal,
  calcPayableTotal,
  computeDiscounts,
  SHIPPING_FEE_DEFAULT,
} from "@/lib/pricing";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { Button } from "@/components/ui/Button";
import type { Product } from "@/lib/types";

export default function CartPage() {
  const {
    cart,
    updateQty,
    removeLine,
    clearCart,
    promotions,
    setPromotions,
    isFirstOrder,
  } = useCart();

  const [products, setProducts] = React.useState<Product[]>([]);
  const [loadingProducts, setLoadingProducts] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/products")
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);
        setLoadingProducts(false);
      })
      .catch(() => setLoadingProducts(false));
  }, []);

  const itemsSubtotal = React.useMemo(() => calcCartItemsSubtotal(cart, products), [cart, products]);
  const { discountsTotal, shippingFeeFinal } = React.useMemo(
    () =>
      computeDiscounts({
        itemsSubtotal,
        shippingFee: SHIPPING_FEE_DEFAULT,
        promotions,
        isFirstOrder,
      }),
    [itemsSubtotal, promotions, isFirstOrder],
  );
  const payableTotal = React.useMemo(
    () =>
      calcPayableTotal({
        itemsSubtotal,
        shippingFee: shippingFeeFinal,
        discountsTotal,
      }),
    [itemsSubtotal, shippingFeeFinal, discountsTotal],
  );

  const hasOutOfStock = cart.lines.some((l) => {
    const p = products.find((x) => String(x.id) === String(l.productId));
    const sku = p?.variants.find((v) => v.skuId === l.skuId);
    return !sku || sku.stock <= 0;
  });

  if (loadingProducts) {
    return (
      <Container className="py-8">
        <SectionTitle title="Sepet" subtitle="Aynı anda sadece 1 aktif sepet" />
        <div className="mt-6 flex h-40 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/30">
          <div className="text-sm font-semibold text-emerald-800">Yükleniyor...</div>
        </div>
      </Container>
    );
  }

  return (
    <Container className="py-8">
      <div className="flex items-center justify-between">
        <SectionTitle title="Sepet" subtitle="Aynı anda sadece 1 aktif sepet" />
        {cart.lines.length > 0 && (
          <Button variant="ghost" onClick={clearCart} className="text-rose-600 text-xs">
            Sepeti Boşalt
          </Button>
        )}
      </div>

      {cart.lines.length === 0 ? (
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6">
          <div className="text-sm font-semibold text-emerald-950">Sepetin boş</div>
          <div className="mt-1 text-sm text-emerald-800/80">
            Ürünleri keşfedip sepete ekleyebilirsin.
          </div>
          <div className="mt-5">
            <Link href="/">
              <Button>Alışverişe Başla</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-3">
            {hasOutOfStock ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                Sepetinde tükendiği için satışa kapalı ürün var. Ödeme için önce kaldırmalısın.
              </div>
            ) : null}

            {cart.lines.map((l) => (
              <CartLineItem
                key={l.lineId}
                lineId={l.lineId}
                productId={l.productId}
                skuId={l.skuId}
                qty={l.qty}
                onQtyChange={updateQty}
                onRemove={removeLine}
                products={products}
              />
            ))}
          </div>

          <div className="space-y-4">
            <CouponBox promotions={promotions} setPromotions={setPromotions} />
            <OrderSummary
              itemsSubtotal={itemsSubtotal}
              shippingFee={shippingFeeFinal}
              discountsTotal={discountsTotal}
              payableTotal={payableTotal}
            />
            <Link href="/checkout">
              <Button className="w-full" disabled={hasOutOfStock}>
                Ödemeye Geç
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Container>
  );
}
