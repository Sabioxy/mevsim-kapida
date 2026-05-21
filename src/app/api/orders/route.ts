import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Oturum açmanız gerekiyor" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      where: {
        userId: session.id,
      },
      include: {
        items: {
          include: {
            sku: {
              include: {
                product: true,
              },
            },
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({ orders });
  } catch (error) {
    console.error("User orders fetch error:", error);
    return Response.json({ message: "Siparişleriniz yüklenemedi" }, { status: 500 });
  }
}
