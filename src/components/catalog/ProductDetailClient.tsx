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
    </div>
  );
}
