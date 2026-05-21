import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

export async function GET() {
  const producers = await prisma.producer.findMany({ orderBy: { name: "asc" } });
  return NextResponse.json(producers);
}

export async function POST(request: Request) {
  const body = await request.json();
  const name = (body.name || "").trim();
  const slug = (body.slug || name.toLowerCase().replace(/[^a-z0-9]+/g, "-")).slice(0, 60);

  if (!name) return NextResponse.json({ error: "name required" }, { status: 400 });

  const session = await getSession();
  let userId = session?.id || body.userId;

  if (!userId) {
    const fallbackUser = (await prisma.user.findFirst({ where: { role: "SELLER" } })) || (await prisma.user.findFirst());
    userId = fallbackUser?.id;
  }

  if (!userId) {
    return NextResponse.json({ error: "User required to associate producer" }, { status: 400 });
  }

  const created = await prisma.producer.create({
    data: {
      name,
      slug,
      userId,
      description: body.description || null,
    },
  });
  return NextResponse.json(created);
}
