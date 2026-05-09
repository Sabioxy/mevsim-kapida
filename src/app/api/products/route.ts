import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const category = url.searchParams.get("category");
  const producerId = url.searchParams.get("producerId");
  const q = url.searchParams.get("q");

  const where: any = {};
  if (category) where.category = category;
  if (producerId) where.producerId = Number(producerId);
  if (q) {
    where.OR = [
      { name: { contains: q } },
      { description: { contains: q } },
    ];
  }

  const dbProducts = await prisma.product.findMany({
    where,
    include: { producer: true, skus: true },
    orderBy: { createdAt: "desc" },
  });

  const products = dbProducts.map((p) => ({
    id: String(p.id),
    slug: p.slug,
    title: p.name,
    subtitle: undefined,
    imageUrl: p.image ?? "/images/placeholder.svg",
    category: p.category || "taze-sebze",
    badges: [],
    producer: {
      id: `producer-${p.producerId ?? "0"}`,
      name: p.producer?.name ?? "",
      city: "",
    },
    description: p.description ?? "",
    variants: p.skus.map((sku) => ({
      skuId: sku.skuId,
      label: sku.label,
      grams: sku.grams,
      producerBasePrice: { currency: "TRY", amount: sku.priceCents / 100 },
      stock: sku.stock,
    })),
  }));

  return NextResponse.json(products);
}
