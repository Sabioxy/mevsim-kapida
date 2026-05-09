import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session || session.role !== "SELLER") {
    return NextResponse.json({ message: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const producer = await prisma.producer.findUnique({
      where: { userId: session.id },
    });

    if (!producer) {
      return NextResponse.json({ message: "Üretici profili bulunamadı" }, { status: 404 });
    }

    const { name, description, category, skus } = await request.json();

    if (!name || !skus || skus.length === 0) {
      return NextResponse.json({ message: "Eksik bilgi" }, { status: 400 });
    }

    const slug = name.toLowerCase().replace(/\s+/g, "-") + "-" + Math.random().toString(36).substring(2, 5);

    const product = await prisma.product.create({
      data: {
        name,
        slug,
        description,
        category,
        producerId: producer.id,
        skus: {
          create: skus.map((sku: any) => ({
            skuId: (slug + "-" + sku.label.toLowerCase().replace(/\s+/g, "-")),
            label: sku.label,
            grams: Number(sku.grams),
            priceCents: Number(sku.priceCents),
            stock: Number(sku.stock),
          })),
        },
      },
      include: {
        skus: true,
      },
    });

    return NextResponse.json({ product });
  } catch (error: any) {
    console.error("Add product error:", error);
    return NextResponse.json({ message: "Ürün eklenemedi", error: error.message }, { status: 500 });
  }
}
