"use client";

export type AuthRole = "ADMIN" | "USER" | "SELLER";

export type AuthSession = {
  id: string;
  name: string;
  email: string;
  role: AuthRole;
  subscriptionPlan?: string | null;
  subscriptionStatus?: string | null;
};

const AUTH_KEY = "mk_auth_session_v1";

export const readAuthSession = (): AuthSession | null => {
  if (typeof window === "undefined") return null;
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as AuthSession;
    if (!parsed || typeof parsed !== "object") return null;
    return parsed;
  } catch {
    return null;
  }
};

export const writeAuthSession = (session: AuthSession) => {
  localStorage.setItem(AUTH_KEY, JSON.stringify(session));
};

export const clearAuthSession = () => {
  localStorage.removeItem(AUTH_KEY);
};
