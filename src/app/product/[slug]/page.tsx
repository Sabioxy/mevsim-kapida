import { notFound } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { ProductDetailClient } from "@/components/catalog/ProductDetailClient";
import { prisma } from "@/lib/prisma";

export default async function ProductPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const p = await prisma.product.findUnique({ where: { slug }, include: { producer: true, skus: true } });
  if (!p) notFound();

  const product = {
    id: String(p.id),
    slug: p.slug,
    title: p.name,
    subtitle: undefined,
    imageUrl: p.image ?? "/images/placeholder.svg",
    category: (p.category as any) || "taze-sebze",
    badges: [] as unknown as import("@/lib/types").ProductBadgeKind[],
    producer: { id: `producer-${p.producerId ?? "0"}`, name: p.producer?.name ?? "", city: "" },
    description: p.description ?? "",
    variants: p.skus.map(sku => ({
      skuId: sku.skuId,
      label: sku.label,
      grams: sku.grams,
      producerBasePrice: { currency: "TRY", amount: sku.priceCents / 100 } as import("@/lib/types").Money,
      stock: sku.stock,
    })),
  };

  return (
    <Container className="py-8">
      <ProductDetailClient product={product} />
    </Container>
  );
}
