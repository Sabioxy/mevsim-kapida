"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { OrderSummary } from "@/components/cart/OrderSummary";
import { useCart } from "@/providers/CartProvider";
import type { Address, DeliveryMethod, PaymentState, PriceFreezeSnapshot } from "@/lib/types";
import {
  calcCartItemsSubtotal,
  calcPayableTotal,
  computeDiscounts,
  freezePrices,
  SHIPPING_FEE_DEFAULT,
} from "@/lib/pricing";
import { makeId } from "@/lib/utils";
import type { Product } from "@/lib/types";

function isAddressValid(a: Address) {
  return Boolean(
    a.fullName.trim() &&
      a.phone.trim() &&
      a.city.trim() &&
      a.district.trim() &&
      a.addressLine.trim(),
  );
}

export default function CheckoutPage() {
  const {
    cart,
    clearCart,
    promotions,
    isFirstOrder,
    setIsFirstOrder,
  } = useCart();

  const [address, setAddress] = React.useState<Address>({
    fullName: "",
    phone: "",
    city: "",
    district: "",
    addressLine: "",
  });
  const [delivery, setDelivery] = React.useState<DeliveryMethod>("STANDARD");

  const [payment, setPayment] = React.useState<PaymentState>({ status: "INIT" });
  const [priceFreeze, setPriceFreeze] = React.useState<PriceFreezeSnapshot | null>(null);

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

  const itemsSubtotal = React.useMemo(() => calcCartItemsSubtotal(cart), [cart]);
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
    const p = products.find((x) => x.id === l.productId);
    const sku = p?.variants.find((v) => v.skuId === l.skuId);
    return !sku || sku.stock <= 0;
  });

  if (loadingProducts) {
    return (
      <Container className="py-8">
        <SectionTitle title="Ödeme" subtitle="Adres, teslimat ve güvenli ödeme" />
        <div className="mt-6 flex h-40 items-center justify-center rounded-2xl border border-neutral-200 bg-white">
          <div className="text-sm font-semibold text-neutral-500">Yükleniyor...</div>
        </div>
      </Container>
    );
  }

  // Idempotency: same payment_request_id should not be processed twice.
  const inflightRef = React.useRef<Map<string, Promise<"SUCCESS" | "FAILED">>>(new Map());
  const cancelledRef = React.useRef<Set<string>>(new Set());

  const canPay =
    cart.lines.length > 0 &&
    !hasOutOfStock &&
    isAddressValid(address) &&
    Boolean(delivery) &&
    payment.status !== "PENDING" &&
    payment.status !== "SUCCESS";

  const processPayment = React.useCallback(async (paymentRequestId: string) => {
    const existing = inflightRef.current.get(paymentRequestId);
    if (existing) return existing;

    const p = new Promise<"SUCCESS" | "FAILED">((resolve) => {
      window.setTimeout(() => {
        // MVP: always succeed
        resolve("SUCCESS");
      }, 1400);
    });

    inflightRef.current.set(paymentRequestId, p);
    return p;
  }, []);

  const onPay = async () => {
    if (!canPay) return;

    const paymentRequestId = makeId("payment_request");
    cancelledRef.current.delete(paymentRequestId);
    setPayment({ status: "PENDING", paymentRequestId, startedAt: Date.now() });

    try {
      const result = await processPayment(paymentRequestId);
      if (cancelledRef.current.has(paymentRequestId)) {
        return;
      }
      if (result !== "SUCCESS") {
        setPayment({
          status: "FAILED",
          paymentRequestId,
          message: "Ödeme başarısız oldu. Lütfen tekrar deneyin.",
        });
        return;
      }

      const snapshot = freezePrices({
        cart,
        promotions,
        isFirstOrder,
        shippingFee: SHIPPING_FEE_DEFAULT,
      });
      setPriceFreeze(snapshot);

      const orderId = makeId("order");
      setPayment({
        status: "SUCCESS",
        orderId,
        paymentRequestId,
        completedAt: Date.now(),
      });

      clearCart();
      setIsFirstOrder(false);
    } catch {
      setPayment({ status: "FAILED", paymentRequestId, message: "Beklenmeyen hata" });
    }
  };

  return (
    <Container className="py-8">
      <SectionTitle title="Ödeme" subtitle="Adres, teslimat ve güvenli ödeme" />

      {cart.lines.length === 0 && payment.status !== "SUCCESS" ? (
        <div className="mt-6 rounded-2xl border border-neutral-200 bg-white p-6">
          <div className="text-sm font-semibold text-neutral-900">Sepetin boş</div>
          <div className="mt-1 text-sm text-neutral-600">
            Ödeme yapabilmek için sepete ürün eklemelisin.
          </div>
          <div className="mt-5">
            <Link href="/">
              <Button>Ürünleri Keşfet</Button>
            </Link>
          </div>
        </div>
      ) : (
        <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
          <div className="space-y-4">
            {hasOutOfStock ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                Sepetinde tükendiği için satışa kapalı ürün var. Ödeme yapamazsın.
              </div>
            ) : null}

            <Card>
              <CardHeader>
                <div className="text-sm font-semibold text-neutral-900">1) Adres Bilgisi</div>
                <div className="mt-1 text-xs text-neutral-600">
                  Sipariş oluşturulurken teslimat için gereklidir.
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-neutral-700">Ad Soyad</label>
                    <Input
                      value={address.fullName}
                      onChange={(e) => setAddress((p) => ({ ...p, fullName: e.target.value }))}
                      placeholder="Örn: Ayşe Yılmaz"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-700">Telefon</label>
                    <Input
                      value={address.phone}
                      onChange={(e) => setAddress((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="05xx xxx xx xx"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-700">Şehir</label>
                    <Input
                      value={address.city}
                      onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                      placeholder="İstanbul"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-neutral-700">İlçe</label>
                    <Input
                      value={address.district}
                      onChange={(e) => setAddress((p) => ({ ...p, district: e.target.value }))}
                      placeholder="Kadıköy"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-neutral-700">Adres</label>
                    <Input
                      value={address.addressLine}
                      onChange={(e) =>
                        setAddress((p) => ({ ...p, addressLine: e.target.value }))
                      }
                      placeholder="Mahalle, sokak, bina no, daire"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-sm font-semibold text-neutral-900">2) Teslimat Seçimi</div>
                <div className="mt-1 text-xs text-neutral-600">
                  Standart veya planlı teslimat.
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setDelivery("STANDARD")}
                    className={`rounded-xl border p-4 text-left text-sm transition-colors ${
                      delivery === "STANDARD"
                        ? "border-neutral-900 bg-neutral-50"
                        : "border-neutral-200 bg-white hover:bg-neutral-50"
                    }`}
                  >
                    <div className="font-semibold text-neutral-900">Standart</div>
                    <div className="mt-1 text-xs text-neutral-600">1-2 iş günü</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDelivery("SCHEDULED")}
                    className={`rounded-xl border p-4 text-left text-sm transition-colors ${
                      delivery === "SCHEDULED"
                        ? "border-neutral-900 bg-neutral-50"
                        : "border-neutral-200 bg-white hover:bg-neutral-50"
                    }`}
                  >
                    <div className="font-semibold text-neutral-900">Planlı</div>
                    <div className="mt-1 text-xs text-neutral-600">Teslimat günü seçimi (MVP)</div>
                  </button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-sm font-semibold text-neutral-900">3) Ödeme Durumu</div>
                <div className="mt-1 text-xs text-neutral-600">
                  State machine: INIT → PENDING → SUCCESS/FAILED/CANCELLED
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm">
                    <span className="text-neutral-600">Durum: </span>
                    <span className="font-semibold text-neutral-900">{payment.status}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    {payment.status === "PENDING" ? (
                      <Button
                        variant="secondary"
                        onClick={() => {
                          cancelledRef.current.add(payment.paymentRequestId);
                          setPayment({
                            status: "CANCELLED",
                            paymentRequestId: payment.paymentRequestId,
                          });
                        }}
                      >
                        İptal
                      </Button>
                    ) : null}
                    <Button onClick={onPay} disabled={!canPay}>
                      {payment.status === "PENDING" ? "Ödeme Alınıyor..." : "Ödemeyi Tamamla"}
                    </Button>
                  </div>
                </div>

                {payment.status === "FAILED" ? (
                  <div className="mt-3 rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-800">
                    {payment.message}
                  </div>
                ) : null}

                {payment.status === "SUCCESS" ? (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                    Sipariş onaylandı. Order ID: <b>{payment.orderId}</b>
                    <div className="mt-1 text-xs">
                      Price Freeze yapıldı (fiyatlar sabitlendi).
                    </div>
                  </div>
                ) : null}

                {payment.status === "PENDING" ? (
                  <div className="mt-3 text-xs text-neutral-600">
                    Idempotency: aynı `payment_request_id` yeniden işlenmez. Buton disable.
                  </div>
                ) : null}

                {payment.status === "CANCELLED" ? (
                  <div className="mt-3 rounded-xl border border-neutral-200 bg-neutral-50 p-3 text-sm text-neutral-800">
                    Ödeme iptal edildi.
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {priceFreeze ? (
              <Card>
                <CardHeader>
                  <div className="text-sm font-semibold text-neutral-900">Price Freeze</div>
                  <div className="mt-1 text-xs text-neutral-600">
                    Sipariş onayında hesaplanan tutarlar sabitlendi.
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-neutral-700">
                    Frozen At: {new Date(priceFreeze.frozenAt).toLocaleString("tr-TR")}
                  </div>
                  <div className="mt-3">
                    <OrderSummary
                      itemsSubtotal={priceFreeze.itemsSubtotal}
                      shippingFee={priceFreeze.shippingFee}
                      discountsTotal={priceFreeze.discountsTotal}
                      payableTotal={priceFreeze.payableTotal}
                    />
                  </div>
                </CardContent>
              </Card>
            ) : null}
          </div>

          <div className="space-y-4">
            <OrderSummary
              itemsSubtotal={itemsSubtotal}
              shippingFee={shippingFeeFinal}
              discountsTotal={discountsTotal}
              payableTotal={payableTotal}
            />
            <Link href="/cart">
              <Button variant="secondary" className="w-full">
                Sepete Dön
              </Button>
            </Link>
          </div>
        </div>
      )}
    </Container>
  );
}
