"use client";

import * as React from "react";
import Image from "next/image";
import type { Product } from "@/lib/types";
import { customerUnitPriceFromProducerBase } from "@/lib/pricing";
import { formatTRY } from "@/lib/money";
import { ProductBadges } from "@/components/catalog/ProductBadges";
import { VariantPicker } from "@/components/catalog/VariantPicker";
import { QuantityPicker } from "@/components/catalog/QuantityPicker";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";
import { useCart } from "@/providers/CartProvider";
import { COMMISSION_RATE } from "@/lib/catalog";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

export function ProductDetailClient({ product }: { product: Product }) {
  const { addLine } = useCart();
  const firstInStock = product.variants.find((v) => v.stock > 0);

  const [selectedSkuId, setSelectedSkuId] = React.useState<string>(
    firstInStock?.skuId ?? product.variants[0]?.skuId ?? "",
  );
  const [qty, setQty] = React.useState(1);

  const selectedSku = product.variants.find((v) => v.skuId === selectedSkuId);
  const outOfStock = !selectedSku || selectedSku.stock <= 0;

  const unitCustomer = selectedSku
    ? customerUnitPriceFromProducerBase(selectedSku.producerBasePrice)
    : null;

  return (
    <div className="grid gap-6 lg:grid-cols-2">
      <div className="overflow-hidden rounded-2xl border border-emerald-200 bg-emerald-50">
        <div className="relative aspect-[4/3]">
          <Image
            src={product.imageUrl}
            alt={product.title}
            fill
            className="object-cover"
            sizes="(max-width: 1024px) 100vw, 50vw"
            priority
          />
          <div className="absolute left-4 top-4">
            <ProductBadges badges={product.badges} />
          </div>
        </div>
      </div>

      <div>
        <h1 className="text-2xl font-semibold tracking-tight text-emerald-900 sm:text-3xl">
          {product.title}
        </h1>
        {product.subtitle ? (
          <p className="mt-2 text-sm text-emerald-600">{product.subtitle}</p>
        ) : null}

        <div className="mt-3 text-sm text-emerald-700">
          <span className="font-semibold">Üretici:</span> {product.producer.name} •{" "}
          {product.producer.city}
        </div>

        <p className="mt-4 text-sm leading-6 text-emerald-700">
          {product.description}
        </p>

        <div className="mt-6">
          <div className="text-sm font-semibold text-emerald-900">Gramaj / Varyant</div>
          <div className="mt-2">
            <VariantPicker
              variants={product.variants}
              selectedSkuId={selectedSkuId}
              onChange={setSelectedSkuId}
            />
          </div>
        </div>

        <div className="mt-6 flex flex-wrap items-center justify-between gap-3">
          <div>
            <div className="text-xs font-semibold text-emerald-600">Müşteri Fiyatı</div>
            <div className="text-xl font-semibold text-emerald-900">
              {unitCustomer ? formatTRY(unitCustomer) : "-"}
            </div>
          </div>
          <QuantityPicker qty={qty} setQty={setQty} />
        </div>

        <div className="mt-4">
          <Button
            className="w-full"
            disabled={outOfStock}
            onClick={() => {
              if (!selectedSku) return;
              addLine({ productId: product.id, skuId: selectedSku.skuId, qty });
            }}
          >
            {outOfStock ? "Tükendi" : "Sepete Ekle"}
          </Button>
          {outOfStock ? (
            <div className="mt-2 text-xs font-semibold text-rose-600">
              Bu varyant tükendi. Satışa kapalı.
            </div>
          ) : null}
        </div>

        {selectedSku ? (
          <div className="mt-6">
            <Card>
              <CardContent className="pt-4">
                <div className="text-sm font-semibold text-emerald-900">Fiyat Şeffaflığı</div>
                <div className="mt-2 grid gap-2 text-sm">
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-600">Üretici baz fiyat</span>
                    <span className="font-medium text-emerald-900">
                      {formatTRY(selectedSku.producerBasePrice)}
                    </span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-600">Platform komisyonu</span>
                    <span className="font-medium text-emerald-900">%{COMMISSION_RATE * 100}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-emerald-600">Müşteri fiyatı</span>
                    <span className="font-semibold text-emerald-900">
                      {unitCustomer ? formatTRY(unitCustomer) : "-"}
                    </span>
                  </div>
                  <div className="mt-1 text-xs text-emerald-600">
                    Üretici kazancı (MVP): {formatTRY(selectedSku.producerBasePrice)}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        ) : null}
      </div>

      <div className="lg:col-span-2 mt-12">
        <ProductReviews productId={product.id} />
      </div>
    </div>
  );
}

function ProductReviews({ productId }: { productId: string }) {
  const [reviews, setReviews] = React.useState<any[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [rating, setRating] = React.useState(5);
  const [comment, setComment] = React.useState("");
  const [submitting, setSubmitting] = React.useState(false);

  const loadReviews = React.useCallback(async () => {
    try {
      const res = await fetch(`/api/products/${productId}/reviews`);
      const data = await res.json();
      setReviews(data.reviews || []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [productId]);

  React.useEffect(() => {
    loadReviews();
  }, [loadReviews]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch(`/api/products/${productId}/reviews`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ rating, comment }),
      });
      if (res.ok) {
        setComment("");
        setRating(5);
        loadReviews();
      } else {
        const data = await res.json();
        alert(data.message);
      }
    } catch (err) {
      alert("Bir hata oluştu.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-8">
      <div className="border-t border-emerald-100 pt-8">
        <h3 className="text-xl font-bold text-emerald-950">Müşteri Yorumları</h3>
        <p className="text-sm text-emerald-600 mt-1">Ürün hakkında ne düşünüyorlar?</p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        <Card className="lg:col-span-1 border-emerald-100 h-fit">
          <CardContent className="p-6">
            <h4 className="font-bold text-emerald-900 mb-4">Yorum Yap</h4>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">Puan</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`text-2xl ${rating >= star ? "text-amber-400" : "text-emerald-100"}`}
                    >
                      ★
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label className="block text-xs font-bold text-emerald-700 uppercase mb-1">Yorumunuz</label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  className="w-full rounded-xl border border-emerald-100 bg-emerald-50/30 p-3 text-sm outline-none focus:border-emerald-300 transition-all min-h-[100px]"
                  placeholder="Ürün tazeliği, paketleme vb. hakkında bilgi verin..."
                />
              </div>
              <Button className="w-full" disabled={submitting}>
                {submitting ? "Gönderiliyor..." : "Yorumu Gönder"}
              </Button>
            </form>
          </CardContent>
        </Card>

        <div className="lg:col-span-2 space-y-4">
          {loading ? (
            <div className="text-sm text-emerald-600">Yükleniyor...</div>
          ) : reviews.length === 0 ? (
            <div className="text-center py-12 border-2 border-dashed border-emerald-100 rounded-2xl">
              <p className="text-sm text-emerald-600">Henüz yorum yapılmamış. İlk yorumu sen yap!</p>
            </div>
          ) : (
            reviews.map((review) => (
              <div key={review.id} className="p-4 rounded-2xl border border-emerald-100 bg-white shadow-sm">
                <div className="flex justify-between items-start mb-2">
                  <div className="font-bold text-emerald-900 text-sm">{review.user.name}</div>
                  <div className="flex text-amber-400 text-xs">
                    {"★".repeat(review.rating)}
                    {"☆".repeat(5 - review.rating)}
                  </div>
                </div>
                <p className="text-sm text-emerald-800 italic">"{review.comment}"</p>
                <div className="mt-2 text-[10px] text-emerald-400 font-bold uppercase">
                  {format(new Date(review.createdAt), "d MMMM yyyy", { locale: tr })}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
