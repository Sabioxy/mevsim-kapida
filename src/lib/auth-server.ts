import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";
import type { AuthSession } from "./auth";

const secretKey = "super_secret_mevsim_key_for_jwt_auth_123!";
const key = new TextEncoder().encode(secretKey);

export async function encrypt(payload: any) {
  return await new SignJWT(payload)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("24h")
    .sign(key);
}

export async function decrypt(input: string): Promise<any> {
  const { payload } = await jwtVerify(input, key, {
    algorithms: ["HS256"],
  });
  return payload;
}

export async function createSession(sessionData: AuthSession) {
  const session = await encrypt(sessionData);
  const cookieStore = await cookies();
  
  cookieStore.set("session", session, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: 60 * 60 * 24, // 24 hours
  });
}

export async function getSession(): Promise<AuthSession | null> {
  const cookieStore = await cookies();
  const session = cookieStore.get("session")?.value;
  if (!session) return null;

  try {
    const parsed = await decrypt(session);
    return parsed as AuthSession;
  } catch (error) {
    return null;
  }
}

export async function destroySession() {
  const cookieStore = await cookies();
  cookieStore.delete("session");
}
