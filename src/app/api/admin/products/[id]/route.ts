import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function PATCH(request: Request, { params }: any) {
  const id = Number(params.id);
  const body = await request.json();
  const updateData: any = {};
  if (body.name) updateData.name = body.name;
  if (body.slug) updateData.slug = body.slug;
  if (body.description) updateData.description = body.description;
  if (body.image) updateData.image = body.image;
  if (body.category) updateData.category = body.category;
  if (body.price !== undefined) updateData.priceCents = Math.round(Number(body.price) * 100);
  if (body.producerId !== undefined) updateData.producerId = Number(body.producerId);

  const updated = await prisma.product.update({ where: { id }, data: updateData, include: { producer: true } });
  return NextResponse.json(updated);
}

export async function DELETE(request: Request, { params }: any) {
  const id = Number(params.id);
  await prisma.product.delete({ where: { id } });
  return NextResponse.json({ ok: true });
}
