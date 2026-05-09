import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    // 1. Create or get a default seller/producer
    // We'll look for an existing user or create a "seed-seller"
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

    let producer = await prisma.producer.findUnique({
      where: { userId: seller.id }
    });

    if (!producer) {
      producer = await prisma.producer.create({
        data: {
          name: "Mevsim Doğal Bahçe",
          slug: "mevsim-dogal-bahce",
          userId: seller.id,
          description: "Antalya'nın bereketli topraklarından taze ürünler.",
        }
      });
    }

    // 2. Clear existing products to ensure clean seed
    await prisma.sku.deleteMany({});
    await prisma.product.deleteMany({});

    const productsToSeed = [
      {
        name: "Kivi",
        slug: "kivi",
        category: "taze-meyve",
        image: "/images/kivi.jpg",
        description: "Taze ve vitamin dolu kivi.",
        priceCents: 8000,
        skus: [
          { label: "1 kg", grams: 1000, priceCents: 8000, stock: 50 }
        ]
      },
      {
        name: "Domates",
        slug: "domates",
        category: "sera-urunleri",
        image: "/images/domates.jpg",
        description: "Kırmızı ve sulu salkım domates.",
        priceCents: 4500,
        skus: [
          { label: "1 kg", grams: 1000, priceCents: 4500, stock: 100 }
        ]
      },
      {
        name: "Salatalık",
        slug: "salatalik",
        category: "taze-sebze",
        image: "/images/salatalık.jpg",
        description: "Çıtır çıtır taze salatalık.",
        priceCents: 3500,
        skus: [
          { label: "1 kg", grams: 1000, priceCents: 3500, stock: 80 }
        ]
      },
      {
        name: "Marul",
        slug: "marul",
        category: "taze-sebze",
        image: "/images/marul.jpg",
        description: "Taze ve diri göbek marul.",
        priceCents: 2500,
        skus: [
          { label: "1 adet", grams: 500, priceCents: 2500, stock: 60 }
        ]
      },
      {
        name: "Avokado",
        slug: "avokado",
        category: "taze-meyve",
        image: "/images/avokado.jpg",
        description: "Yumuşak ve lezzetli taze avokado.",
        priceCents: 5000,
        skus: [
          { label: "1 adet", grams: 300, priceCents: 5000, stock: 40 }
        ]
      }
    ];

    for (const p of productsToSeed) {
      await prisma.product.create({
        data: {
          name: p.name,
          slug: p.slug,
          category: p.category,
          image: p.image,
          description: p.description,
          priceCents: p.priceCents,
          producerId: producer.id,
          skus: {
            create: p.skus.map(s => ({
              skuId: `sku-${p.slug}-${s.label.toLowerCase().replace(/\s+/g, '-')}`,
              label: s.label,
              grams: s.grams,
              priceCents: s.priceCents,
              stock: s.stock
            }))
          }
        }
      });
    }

    return NextResponse.json({ message: "Seed successful", count: productsToSeed.length });
  } catch (error: any) {
    console.error("Seed error:", error);
    return NextResponse.json({ message: "Seed failed", error: error.message }, { status: 500 });
  }
}
