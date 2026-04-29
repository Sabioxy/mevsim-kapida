import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request) {
  const url = new URL(request.url);
  const skuId = url.searchParams.get("skuId");
  if (!skuId) return NextResponse.json({ error: "skuId required" }, { status: 400 });

  const sku = await prisma.sku.findUnique({ where: { skuId } });
  if (!sku) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(sku);
}
