import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  const session = await getSession();
  if (!session) {
    return NextResponse.json({ message: "Giriş yapmalısınız" }, { status: 401 });
  }

  try {
    const { planId } = await request.json();

    if (!planId) {
      return NextResponse.json({ message: "Plan seçilmedi" }, { status: 400 });
    }

    const updatedUser = await prisma.user.update({
      where: { id: session.id },
      data: {
        subscriptionPlan: planId,
        subscriptionStatus: "ACTIVE",
      },
    });

    return NextResponse.json({ user: updatedUser });
  } catch (error: any) {
    console.error("Subscription purchase error:", error);
    return NextResponse.json({ message: "Abonelik başlatılamadı" }, { status: 500 });
  }
}
