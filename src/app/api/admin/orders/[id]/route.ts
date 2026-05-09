import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";
import { sendStatusUpdateNotification } from "@/lib/notifications";

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ message: "Yetkisiz erişim" }, { status: 401 });
  }

  const { id } = await params;
  const { status } = await request.json();

  try {
    const updatedOrder = await prisma.order.update({
      where: { id },
      data: { status },
    });

    void sendStatusUpdateNotification(updatedOrder);

    return Response.json({ order: updatedOrder });
  } catch (error) {
    console.error("Admin order update error:", error);
    return Response.json({ message: "Sipariş güncellenemedi" }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session || session.role !== "ADMIN") {
    return Response.json({ message: "Yetkisiz erişim" }, { status: 401 });
  }

  const { id } = await params;

  try {
    // Delete order items first (though Prisma usually handles this with cascade if configured)
    await prisma.orderItem.deleteMany({
      where: { orderId: id },
    });
    
    await prisma.order.delete({
      where: { id },
    });

    return new Response(null, { status: 204 });
  } catch (error) {
    console.error("Admin order delete error:", error);
    return Response.json({ message: "Sipariş silinemedi" }, { status: 500 });
  }
}
