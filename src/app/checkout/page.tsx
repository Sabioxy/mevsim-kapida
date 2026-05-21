"use client";

import * as React from "react";
import Link from "next/link";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import dayjs from "dayjs";
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

  const [address, setAddress] = React.useState<Address & { email: string }>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userAddressInfo");
      if (saved) return JSON.parse(saved);
    }
    return {
      fullName: "",
      phone: "",
      city: "",
      district: "",
      addressLine: "",
      email: "",
    };
  });
  const [delivery, setDelivery] = React.useState<DeliveryMethod>("STANDARD");

  // Adres değiştiğinde localStorage'a kaydet
  React.useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("userAddressInfo", JSON.stringify(address));
    }
  }, [address]);

  const [paymentDetails, setPaymentDetails] = React.useState<{
    cardNumber: string;
    expiryMonth: string;
    expiryYear: string;
    cvc: string;
    cardHolderName: string;
  }>(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userCardInfo");
      if (saved) {
        try {
          return JSON.parse(saved);
        } catch {}
      }
    }
    return {
      cardNumber: "",
      expiryMonth: "",
      expiryYear: "",
      cvc: "",
      cardHolderName: "",
    };
  });

  // Planlı teslimat için tarih seçimi
  const [scheduledDate, setScheduledDate] = React.useState<string>("");

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

  if (loadingProducts) {
    return (
      <Container className="py-8">
        <SectionTitle title="Ödeme" subtitle="Adres, teslimat ve güvenli ödeme" />
        <div className="mt-6 flex h-40 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/30">
          <div className="text-sm font-semibold text-emerald-800">Yükleniyor...</div>
        </div>
      </Container>
    );
  }

  const onPay = async () => {
    if (!canPay) return;

    const paymentRequestId = makeId("payment_request");
    cancelledRef.current.delete(paymentRequestId);
    setPayment({ status: "PENDING", paymentRequestId, startedAt: Date.now() });

    try {
      // API call instead of mock processPayment
      const response = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          cart,
          address: `${address.district}, ${address.addressLine}`,
          city: address.city,
          customerName: address.fullName,
          customerEmail: address.email || "guest@example.com",
          payment: paymentDetails,
          promotions,
        }),
      });

      if (cancelledRef.current.has(paymentRequestId)) {
        return;
      }

      if (!response.ok) {
        const errorData = await response.json();
        setPayment({
          status: "FAILED",
          paymentRequestId,
          message: errorData.message || "Sipariş oluşturulamadı. Lütfen tekrar deneyin.",
        });
        return;
      }

      const data = await response.json();

      const snapshot = freezePrices({
        cart,
        products,
        promotions,
        isFirstOrder,
        shippingFee: SHIPPING_FEE_DEFAULT,
      });
      setPriceFreeze(snapshot);

      const orderId = data.order.id;
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
        <div className="mt-6 rounded-2xl border border-emerald-100 bg-emerald-50/30 p-6">
          <div className="text-sm font-semibold text-emerald-950">Sepetin boş</div>
          <div className="mt-1 text-sm text-emerald-800/80">
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
                <div className="text-sm font-semibold text-emerald-900">1) Adres Bilgisi</div>
                <div className="mt-1 text-xs text-emerald-600">
                  Sipariş oluşturulurken teslimat için gereklidir.
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-emerald-700">Ad Soyad</label>
                    <Input
                      value={address.fullName}
                      onChange={(e) => setAddress((p) => ({ ...p, fullName: e.target.value }))}
                      placeholder="Örn: Ayşe Yılmaz"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-emerald-700">Telefon</label>
                    <Input
                      value={address.phone}
                      onChange={(e) => setAddress((p) => ({ ...p, phone: e.target.value }))}
                      placeholder="05xx xxx xx xx"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-emerald-700">E-posta</label>
                    <Input
                      type="email"
                      value={address.email}
                      onChange={(e) => setAddress((p) => ({ ...p, email: e.target.value }))}
                      placeholder="ornek@site.com"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-emerald-700">Şehir</label>
                    <Input
                      value={address.city}
                      onChange={(e) => setAddress((p) => ({ ...p, city: e.target.value }))}
                      placeholder="İstanbul"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-emerald-700">İlçe</label>
                    <Input
                      value={address.district}
                      onChange={(e) => setAddress((p) => ({ ...p, district: e.target.value }))}
                      placeholder="Kadıköy"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-emerald-700">Adres</label>
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
                <div className="text-sm font-semibold text-emerald-900">2) Teslimat Seçimi</div>
                <div className="mt-1 text-xs text-emerald-600">
                  Standart veya planlı teslimat.
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-2 sm:grid-cols-2">
                  <button
                    type="button"
                    onClick={() => setDelivery("STANDARD")}
                    className={`rounded-xl border p-4 text-left text-sm transition-colors ${delivery === "STANDARD"
                      ? "border-emerald-600 bg-emerald-50/50 shadow-sm shadow-emerald-100"
                      : "border-emerald-100 bg-white hover:bg-emerald-50/30"
                      }`}
                  >
                    <div className="font-semibold text-emerald-950">Standart</div>
                    <div className="mt-1 text-xs text-emerald-800/80">1-2 iş günü</div>
                  </button>
                  <button
                    type="button"
                    onClick={() => setDelivery("SCHEDULED")}
                    className={`rounded-xl border p-4 text-left text-sm transition-colors ${delivery === "SCHEDULED"
                      ? "border-emerald-600 bg-emerald-50/50 shadow-sm shadow-emerald-100"
                      : "border-emerald-100 bg-white hover:bg-emerald-50/30"
                      }`}
                  >
                    <div className="font-semibold text-emerald-950">Planlı</div>
                    <div className="mt-1 text-xs text-emerald-800/80">Teslimat günü seçimi</div>
                  </button>
                </div>
                {delivery === "SCHEDULED" && (
                  <div className="mt-4">
                    <label className="text-xs font-semibold text-emerald-700">Teslimat Günü</label>
                    <Input
                      type="date"
                      value={scheduledDate}
                      min={dayjs().format("YYYY-MM-DD")}
                      max={dayjs().add(7, "day").format("YYYY-MM-DD")}
                      onChange={e => setScheduledDate(e.target.value)}
                    />
                    <div className="text-xs text-emerald-600 mt-1">Bugünden itibaren en fazla 7 gün sonrası seçilebilir.</div>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-sm font-semibold text-emerald-900">3) Ödeme Bilgileri</div>
                <div className="mt-1 text-xs text-emerald-600">
                  Kart bilgilerini girin (Test için: 4242 4242 4242 4242)
                </div>
              </CardHeader>
              <CardContent>
                <div className="grid gap-3 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-emerald-700">Kart Üzerindeki İsim</label>
                    <Input
                      value={paymentDetails.cardHolderName}
                      onChange={e => setPaymentDetails(p => ({ ...p, cardHolderName: e.target.value }))}
                      placeholder="Örn: Ayşe Yılmaz"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-xs font-semibold text-emerald-700">Kart Numarası</label>
                    <Input
                      value={paymentDetails.cardNumber}
                      onChange={e => {
                        // Sadece rakam ve otomatik boşluk ekle
                        let val = e.target.value.replace(/\D/g, "").slice(0, 16);
                        val = val.replace(/(.{4})/g, "$1 ").trim();
                        setPaymentDetails(p => ({ ...p, cardNumber: val }));
                      }}
                      placeholder="0000 0000 0000 0000"
                      maxLength={19}
                      inputMode="numeric"
                    />
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-emerald-700">Son Kullanma (AA/YY)</label>
                    <div className="flex gap-2">
                      <Input
                        value={paymentDetails.expiryMonth}
                        onChange={e => {
                          let val = e.target.value.replace(/\D/g, "").slice(0, 2);
                          setPaymentDetails(p => ({ ...p, expiryMonth: val }));
                        }}
                        placeholder="AA"
                        maxLength={2}
                        inputMode="numeric"
                      />
                      <Input
                        value={paymentDetails.expiryYear}
                        onChange={e => {
                          let val = e.target.value.replace(/\D/g, "").slice(0, 2);
                          setPaymentDetails(p => ({ ...p, expiryYear: val }));
                        }}
                        placeholder="YY"
                        maxLength={2}
                        inputMode="numeric"
                      />
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-semibold text-emerald-700">CVC</label>
                    <Input
                      value={paymentDetails.cvc}
                      onChange={e => {
                        let val = e.target.value.replace(/\D/g, "").slice(0, 3);
                        setPaymentDetails(p => ({ ...p, cvc: val }));
                      }}
                      placeholder="123"
                      maxLength={3}
                      inputMode="numeric"
                    />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <div className="text-sm font-semibold text-emerald-900">4) Ödeme Durumu</div>
                <div className="mt-1 text-xs text-emerald-600">
                  State machine: INIT → PENDING → SUCCESS/FAILED/CANCELLED
                </div>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap items-center justify-between gap-3">
                  <div className="text-sm">
                    <span className="text-emerald-600">Durum: </span>
                    <span className="font-semibold text-emerald-900">{payment.status}</span>
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
                  <div className="mt-3 text-xs text-emerald-600">
                    Idempotency: aynı `payment_request_id` yeniden işlenmez. Buton disable.
                  </div>
                ) : null}

                {payment.status === "CANCELLED" ? (
                  <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                    Ödeme iptal edildi.
                  </div>
                ) : null}
              </CardContent>
            </Card>

            {priceFreeze ? (
              <Card>
                <CardHeader>
                  <div className="text-sm font-semibold text-emerald-900">Price Freeze</div>
                  <div className="mt-1 text-xs text-emerald-600">
                    Sipariş onayında hesaplanan tutarlar sabitlendi.
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-xs text-emerald-700">
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
