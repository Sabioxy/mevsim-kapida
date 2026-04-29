import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const producers = await prisma.producer.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(producers);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = (body.name || "").trim();
  const slug = (body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).slice(0, 60);
  const city = (body.city || "").trim();

  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const created = await prisma.producer.create({ data: { name, slug, description: body.description || null } });
  return NextResponse.json(created);
}
