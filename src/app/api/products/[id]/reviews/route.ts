import { prisma } from "@/lib/prisma";
import { getSession } from "@/lib/auth-server";

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const productId = parseInt(id);

  try {
    const reviews = await prisma.review.findMany({
      where: { productId },
      include: {
        user: {
          select: {
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: "desc",
      },
    });

    return Response.json({ reviews });
  } catch (error) {
    return Response.json({ message: "Yorumlar yüklenemedi" }, { status: 500 });
  }
}

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const session = await getSession();
  if (!session) {
    return Response.json({ message: "Yorum yapmak için giriş yapmalısınız" }, { status: 401 });
  }

  const { id } = await params;
  const productId = parseInt(id);
  const { rating, comment } = await request.json();

  if (!rating || rating < 1 || rating > 5) {
    return Response.json({ message: "Geçersiz puan" }, { status: 400 });
  }

  try {
    const review = await prisma.review.create({
      data: {
        rating,
        comment,
        userId: session.id,
        productId,
      },
    });

    return Response.json({ review }, { status: 201 });
  } catch (error) {
    console.error("Review creation error:", error);
    return Response.json({ message: "Yorum gönderilemedi" }, { status: 500 });
  }
}
