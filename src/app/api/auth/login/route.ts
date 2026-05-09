import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth-server";

type UserRole = "ADMIN" | "USER" | "SELLER";

const isUserRole = (value: string | null): value is UserRole =>
  value === "ADMIN" || value === "USER" || value === "SELLER";

export async function POST(request: Request) {
  const body = (await request.json()) as {
    name?: string;
    email?: string;
    role?: string;
    city?: string;
    shopName?: string;
  };

  const name = body.name?.trim();
  const email = body.email?.trim().toLowerCase();
  const role = body.role as UserRole | undefined;

  if (!name || !email || !isUserRole(role ?? null)) {
    return Response.json({ message: "Geçersiz giriş bilgisi" }, { status: 400 });
  }

  const user = await prisma.user.upsert({
    where: { email },
    update: {
      name,
      role,
      city: body.city?.trim() || null,
      shopName: body.shopName?.trim() || null,
    },
    create: {
      name,
      email,
      role,
      city: body.city?.trim() || null,
      shopName: body.shopName?.trim() || null,
    },
  });

  // Create HttpOnly Cookie session
  await createSession({
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role as UserRole,
  });

  return Response.json({ user });
}
