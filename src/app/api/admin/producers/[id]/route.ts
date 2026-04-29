import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET(request: Request, { params }: any) {
  const id = Number(params.id);
  const prod = await prisma.producer.findUnique({ where: { id } });
  if (!prod) return NextResponse.json({ error: "not found" }, { status: 404 });
  return NextResponse.json(prod);
}
