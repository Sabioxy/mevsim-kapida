"use client";

import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { formatTRY } from "@/lib/money";
import { customerUnitPriceFromProducerBase } from "@/lib/pricing";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function CartLineItem({
  lineId,
  productId,
  skuId,
  qty,
  onQtyChange,
  onRemove,
  products,
}: {
  lineId: string;
  productId: string;
  skuId: string;
  qty: number;
  onQtyChange: (lineId: string, qty: number) => void;
  onRemove: (lineId: string) => void;
  products: Product[];
}) {
  const product = products.find((p) => p.id === productId);
  const sku = product?.variants.find((v) => v.skuId === skuId);
  if (!product || !sku) return null;

  const unitCustomer = customerUnitPriceFromProducerBase(sku.producerBasePrice);
  const outOfStock = sku.stock <= 0;

  return (
    <div className="flex gap-3 rounded-xl border border-neutral-200 p-3">
      <Link
        href={`/product/${product.slug}`}
        className="relative h-20 w-20 overflow-hidden rounded-lg bg-neutral-50"
      >
        <Image src={product.imageUrl} alt={product.title} fill className="object-cover" />
      </Link>

      <div className="flex flex-1 flex-col gap-1">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-neutral-900">{product.title}</div>
            <div className="text-xs text-neutral-600">Varyant: {sku.label}</div>
            {outOfStock ? (
              <div className="mt-1 text-xs font-semibold text-rose-600">
                Tükendi — satışa kapalı
              </div>
            ) : null}
          </div>

          <div className="text-sm font-semibold text-neutral-900">{formatTRY(unitCustomer)}</div>
        </div>

        <div className="mt-2 flex items-center justify-between gap-2">
          <div className="flex items-center gap-2">
            <Input
              inputMode="numeric"
              value={qty}
              onChange={(e) => onQtyChange(lineId, Number(e.target.value))}
              className="h-9 w-20 text-center"
              disabled={outOfStock}
            />
            <div className="text-xs text-neutral-600">adet</div>
          </div>

          <Button type="button" variant="ghost" onClick={() => onRemove(lineId)}>
            Kaldır
          </Button>
        </div>
      </div>
    </div>
  );
}
