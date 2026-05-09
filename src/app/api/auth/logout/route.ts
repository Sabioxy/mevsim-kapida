import { destroySession } from "@/lib/auth-server";

export async function POST() {
  await destroySession();
  return Response.json({ success: true });
}
