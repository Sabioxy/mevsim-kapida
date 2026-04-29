import Image from "next/image";
import Link from "next/link";
import type { Product } from "@/lib/types";
import { customerUnitPriceFromProducerBase } from "@/lib/pricing";
import { formatTRY } from "@/lib/money";
import { ProductBadges } from "@/components/catalog/ProductBadges";

export function ProductCard({ product }: { product: Product }) {
  const firstInStock = product.variants.find((v) => v.stock > 0);
  const isSoldOut = !firstInStock;
  const priceLabel = firstInStock
    ? formatTRY(customerUnitPriceFromProducerBase(firstInStock.producerBasePrice))
    : "Tükendi";

  return (
    <Link
      href={`/product/${product.slug}`}
      className="group relative overflow-hidden rounded-xl border border-neutral-200 bg-white"
    >
      <div className="relative aspect-[4/3] w-full bg-neutral-50">
        <Image
          src={product.imageUrl}
          alt={product.title}
          fill
          className="object-cover transition-transform group-hover:scale-[1.02]"
          sizes="(max-width: 768px) 100vw, 33vw"
        />
        {isSoldOut ? (
          <div className="absolute inset-0 flex items-center justify-center bg-white/80">
            <div className="rounded-full border border-rose-200 bg-rose-50 px-3 py-1 text-sm font-semibold text-rose-700">
              Tükendi
            </div>
          </div>
        ) : null}

        <div className="absolute left-3 top-3">
          <ProductBadges badges={product.badges} />
        </div>
      </div>

      <div className="p-4">
        <div className="flex items-start justify-between gap-3">
          <div>
            <div className="text-sm font-semibold text-neutral-900">{product.title}</div>
            {product.subtitle ? (
              <div className="mt-1 text-xs text-neutral-600">{product.subtitle}</div>
            ) : null}
          </div>
          <div className="text-sm font-semibold text-neutral-900">{priceLabel}</div>
        </div>

        <div className="mt-2 text-xs text-neutral-600">
          {product.producer.name} • {product.producer.city}
        </div>
      </div>
    </Link>
  );
}
