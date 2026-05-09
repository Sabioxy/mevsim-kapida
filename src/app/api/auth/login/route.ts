import { prisma } from "@/lib/prisma";
import { createSession } from "@/lib/auth-server";

export async function POST(request: Request) {
  const body = await request.json();
  const { email, password } = body;

  if (!email || !password) {
    return Response.json({ message: "E-posta ve şifre gereklidir" }, { status: 400 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { email: email.toLowerCase() },
    });

    if (!user || !user.password) {
      return Response.json({ message: "Geçersiz e-posta veya şifre" }, { status: 401 });
    }

    const isValid = password === user.password;
    if (!isValid) {
      return Response.json({ message: "Geçersiz e-posta veya şifre" }, { status: 401 });
    }

    await createSession({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role as any,
    });

    return Response.json({ user });
  } catch (error) {
    console.error("Login error:", error);
    return Response.json({ message: "Giriş sırasında bir hata oluştu" }, { status: 500 });
  }
}
