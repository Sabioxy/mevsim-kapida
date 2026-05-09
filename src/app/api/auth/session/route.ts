import { getSession } from "@/lib/auth-server";
import { prisma } from "@/lib/prisma";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json(null);
  }

  // Fetch fresh data from DB to get latest subscription status
  const user = await prisma.user.findUnique({
    where: { id: session.id },
    select: {
      id: true,
      name: true,
      email: true,
      role: true,
      subscriptionPlan: true,
      subscriptionStatus: true,
    },
  });

  return Response.json(user);
}
