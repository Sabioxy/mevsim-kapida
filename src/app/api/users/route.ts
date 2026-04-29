import { prisma } from "@/lib/prisma";

type UserRole = "ADMIN" | "USER" | "SELLER";

const isUserRole = (value: string | null): value is UserRole =>
  value === "ADMIN" || value === "USER" || value === "SELLER";

const isUniqueConstraintError = (error: unknown) => {
  return typeof error === "object" && error !== null && "code" in error && (error as { code?: string }).code === "P2002";
};

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const role = searchParams.get("role");

  const users = await prisma.user.findMany({
    where: isUserRole(role) ? { role } : undefined,
    orderBy: { createdAt: "desc" },
  });

  return Response.json({ users });
}

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
    return Response.json({ message: "Geçersiz kullanıcı bilgisi" }, { status: 400 });
  }

  try {
    const user = await prisma.user.create({
      data: {
        name,
        email,
        role,
        city: body.city?.trim() || null,
        shopName: body.shopName?.trim() || null,
      },
    });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    if (isUniqueConstraintError(error)) {
      return Response.json({ message: "Bu e-posta zaten kayıtlı" }, { status: 409 });
    }

    return Response.json({ message: "Kullanıcı oluşturulamadı" }, { status: 500 });
  }
}
