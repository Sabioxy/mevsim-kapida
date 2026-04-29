import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: any) {
  const id = Number(params.id);
  const body = await request.json();
  const data: any = {};
  if (body.stock !== undefined) data.stock = Number(body.stock);
  if (body.price !== undefined) data.priceCents = Math.round(Number(body.price) * 100);

  const updated = await prisma.sku.update({ where: { id }, data });
  return NextResponse.json(updated);
}
