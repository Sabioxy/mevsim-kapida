import { getSession } from "@/lib/auth-server";

export async function GET() {
  const session = await getSession();
  if (!session) {
    return Response.json(null);
  }
  return Response.json(session);
}
