import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getSession();
  if (!session || session.role !== "SELLER") {
    return Response.json({ message: "Yetkisiz erişim" }, { status: 401 });
  }

  try {
    const producer = await prisma.producer.findUnique({
      where: { userId: session.id },
      include: {
        products: {
          include: {
            skus: true,
          },
        },
      },
    });

    if (!producer) {
      return Response.json({ message: "Üretici profili bulunamadı" }, { status: 404 });
    }

    // Find orders that contain products from this producer
    const orders = await prisma.order.findMany({
      where: {
        items: {
          some: {
            sku: {
              product: {
                producerId: producer.id,
              },
            },
          },
        },
      },
      include: {
        items: {
          where: {
            sku: {
              product: {
                producerId: producer.id,
              },
            },
          },
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

    return Response.json({ producer, orders });
  } catch (error) {
    console.error("Seller dashboard fetch error:", error);
    return Response.json({ message: "Dashboard yüklenemedi" }, { status: 500 });
  }
}
