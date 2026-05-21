import { prisma } from "@/lib/prisma";
import { getSession, createSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Oturum açmanız gerekiyor" }, { status: 401 });
  }

  try {
    const user = await prisma.user.findUnique({
      where: { id: session.id },
      select: {
        id: true,
        name: true,
        email: true,
        city: true,
        role: true,
      },
    });
    return Response.json({ user });
  } catch (error) {
    return Response.json({ message: "Profil yüklenemedi" }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Oturum açmanız gerekiyor" }, { status: 401 });
  }

  try {
    const body = await request.json();
    const { name, email, city } = body;

    const trimmedName = name?.trim();
    const trimmedEmail = email?.trim().toLowerCase();
    const trimmedCity = city?.trim();

    if (!trimmedName || !trimmedEmail) {
      return Response.json({ message: "İsim ve e-posta zorunludur" }, { status: 400 });
    }

    // Check if email is already taken by another user
    if (trimmedEmail !== session.email) {
      const existing = await prisma.user.findUnique({
        where: { email: trimmedEmail },
      });
      if (existing) {
        return Response.json({ message: "Bu e-posta adresi başka bir kullanıcı tarafından kullanılıyor" }, { status: 400 });
      }
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        name: trimmedName,
        email: trimmedEmail,
        city: trimmedCity || null,
      },
    });

    const newSessionData = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      subscriptionPlan: updatedUser.subscriptionPlan,
      subscriptionStatus: updatedUser.subscriptionStatus,
    };

    // Update JWT session cookie
    await createSession(newSessionData);

    return Response.json({ user: newSessionData });
  } catch (error: any) {
    console.error("Profile update error:", error);
    return Response.json({ message: "Profil güncellenemedi" }, { status: 500 });
  }
}
