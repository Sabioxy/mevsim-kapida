import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, slug, description, image, category, price } = body;
  const producerId = body.producerId ? Number(body.producerId) : undefined;

  const priceCents = Math.round((Number(price) || 0) * 100);

  const created = await prisma.product.create({
    data: {
      name,
      slug,
      description,
      image,
      category,
      priceCents,
      producerId,
    },
    include: { producer: true },
  });

  return NextResponse.json(created);
}

export async function GET() {
  const products = await prisma.product.findMany({ include: { producer: true }, orderBy: { createdAt: "desc" } });
  return NextResponse.json(products);
}
