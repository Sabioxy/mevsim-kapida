import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

export async function DELETE(request: Request, { params }: any) {
  try {
    // 1. Authenticate the request
    const session = await getSession();
    if (!session || session.role !== "SELLER") {
      return NextResponse.json({ message: "Yetkisiz erişim." }, { status: 401 });
    }

    // 2. Fetch the seller's producer profile
    const producer = await prisma.producer.findUnique({
      where: { userId: session.id },
    });

    if (!producer) {
      return NextResponse.json({ message: "Üretici profili bulunamadı." }, { status: 404 });
    }

    const { id: rawId } = await params;
    const id = Number(rawId);
    if (isNaN(id)) {
      return NextResponse.json({ message: "Geçersiz ürün ID." }, { status: 400 });
    }

    // 3. Verify that the product exists and belongs to this seller
    const product = await prisma.product.findUnique({
      where: { id },
    });

    if (!product) {
      return NextResponse.json({ message: "Ürün bulunamadı." }, { status: 404 });
    }

    if (product.producerId !== producer.id) {
      return NextResponse.json({ message: "Bu ürünü silme yetkiniz yok." }, { status: 403 });
    }

    // 4. Safely delete the product and its cascades in a transaction
    await prisma.$transaction(async (tx) => {
      // Delete reviews related to this product
      await tx.review.deleteMany({
        where: { productId: id },
      });

      // Find SKUs of this product to clean up order items
      const skus = await tx.sku.findMany({
        where: { productId: id },
      });
      const skuIds = skus.map((s) => s.skuId);

      if (skuIds.length > 0) {
        // Delete order items referencing this product's SKUs
        await tx.orderItem.deleteMany({
          where: { skuId: { in: skuIds } },
        });
      }

      // Delete the SKUs
      await tx.sku.deleteMany({
        where: { productId: id },
      });

      // Delete the product itself
      await tx.product.delete({
        where: { id },
      });
    });

    return NextResponse.json({ success: true, message: "Ürün başarıyla silindi." });
  } catch (error: any) {
    console.error("Seller delete error:", error);
    return NextResponse.json(
      { message: "Ürün silinirken bir hata oluştu." },
      { status: 500 }
    );
  }
}
