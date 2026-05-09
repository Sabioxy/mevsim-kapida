import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth-server";

export async function POST(request: Request) {
  const body = await request.json();
  const { name, email, password, role, city, shopName } = body;

  if (!name || !email || !password) {
    return Response.json({ message: "Eksik bilgi" }, { status: 400 });
  }

  try {
    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return Response.json({ message: "Bu e-posta zaten kullanımda" }, { status: 409 });
    }

    const user = await prisma.$transaction(async (tx) => {
      const newUser = await tx.user.create({
        data: {
          name,
          email: email.toLowerCase(),
          password: password,
          role: role || "USER",
          city,
          shopName,
        },
      });

      if (role === "SELLER") {
        await tx.producer.create({
          data: {
            name: shopName || name,
            slug: (shopName || name).toLowerCase().replace(/\s+/g, "-"),
            user: { connect: { id: newUser.id } },
          },
        });
      }

      return newUser;
    });

    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
    });

    return Response.json({ user }, { status: 201 });
  } catch (error) {
    console.error("Register error:", error);
    return Response.json({ message: "Kayıt sırasında bir hata oluştu" }, { status: 500 });
  }
}
