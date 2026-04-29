import { prisma } from "@/lib/prisma";

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> },
) {
  const { id } = await params;

  try {
    await prisma.user.delete({ where: { id } });
    return new Response(null, { status: 204 });
  } catch {
    return Response.json({ message: "Kullanıcı silinemedi" }, { status: 500 });
  }
}
