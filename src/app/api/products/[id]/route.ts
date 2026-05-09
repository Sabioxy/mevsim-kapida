import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(
  request: Request, 
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;

  const product = await prisma.product.findFirst({
    where: {
      OR: [
        { slug: id },
        { id: isNaN(parseInt(id)) ? -1 : parseInt(id) }
      ]
    },
    include: { 
      producer: true,
      skus: true 
    },
  });

  if (!product) return new NextResponse(null, { status: 404 });

  return NextResponse.json(product);
}
