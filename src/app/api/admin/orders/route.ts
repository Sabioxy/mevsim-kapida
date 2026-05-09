import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ message: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const orders = await prisma.order.findMany({
      include: {
        items: true,
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({ orders });
  } catch (error) {
    console.error("Admin orders fetch error:", error);
    return Response.json({ message: "Siparişler yüklenemedi" }, { status: 500 });
  }
}
