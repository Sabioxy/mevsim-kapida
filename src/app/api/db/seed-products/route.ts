import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { PRODUCTS } from "@/lib/catalog";

export async function POST() {
  try {
    let seller = await prisma.user.findFirst({ where: { role: "SELLER" } });
    if (!seller) {
      seller = await prisma.user.create({
        data: {
          name: "Mevsim Üreticisi",
          email: "uretici@mevsim.com",
          password: "password123",
          role: "SELLER",
          city: "Antalya",
        }
      });
    }

    for (const p of PRODUCTS) {
      const producerSlug = p.producer.name.toLowerCase().replace(/[^a-z0-9ğüşöçıİĞÜŞÖÇ\s-]/gi, "").replace(/\s+/g, "-");

      const producer = await prisma.producer.upsert({
        where: { slug: producerSlug },
        update: { name: p.producer.name },
        create: { name: p.producer.name, slug: producerSlug, userId: seller.id },
      });

      const up = await prisma.product.upsert({
        where: { slug: p.slug },
        update: {
          name: p.title,
          description: p.description,
          priceCents: Math.round((p.variants[0]?.producerBasePrice.amount || 0) * 100),
          image: p.imageUrl,
          category: p.category,
          producerId: producer.id,
        },
        create: {
          name: p.title,
          slug: p.slug,
          description: p.description,
          priceCents: Math.round((p.variants[0]?.producerBasePrice.amount || 0) * 100),
          image: p.imageUrl,
          category: p.category,
          producerId: producer.id,
        },
      });

      // create/update skus
      for (const v of p.variants) {
        await prisma.sku.upsert({
          where: { skuId: v.skuId },
          update: {
            label: v.label,
            grams: v.grams,
            priceCents: Math.round((v.producerBasePrice.amount || 0) * 100),
            stock: v.stock,
            productId: up.id,
          },
          create: {
            skuId: v.skuId,
            label: v.label,
            grams: v.grams,
            priceCents: Math.round((v.producerBasePrice.amount || 0) * 100),
            stock: v.stock,
            productId: up.id,
          },
        });
      }
    }

    return NextResponse.json({ ok: true });
  } catch (err) {
    console.error(err);
    return NextResponse.json({ ok: false, error: String(err) }, { status: 500 });
  }
}
