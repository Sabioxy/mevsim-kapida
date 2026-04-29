"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { clearAuthSession, readAuthSession, type AuthRole, type AuthSession } from "@/lib/auth";

export function AuthGate({
  allowedRoles,
  children,
}: {
  allowedRoles: AuthRole[];
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [ready, setReady] = React.useState(false);

  React.useEffect(() => {
    const current = readAuthSession();
    if (!current) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    if (!allowedRoles.includes(current.role)) {
      router.replace(`/login?next=${encodeURIComponent(window.location.pathname)}`);
      return;
    }

    setSession(current);
    setReady(true);
  }, [allowedRoles, router]);

  if (!ready) {
    return <div className="p-6 text-sm text-neutral-600">Yükleniyor...</div>;
  }

  const logout = () => {
    clearAuthSession();
    router.replace("/login");
  };

  return (
    <div>
      <div className="border-b border-neutral-200 bg-neutral-50 px-6 py-3 text-sm text-neutral-700">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            Oturum: <span className="font-semibold">{session?.name}</span> • {session?.role}
          </div>
          <button onClick={logout} className="rounded-md border border-neutral-200 bg-white px-3 py-1.5 text-sm hover:bg-neutral-50">
            Çıkış Yap
          </button>
        </div>
      </div>
      {children}
    </div>
  );
}
