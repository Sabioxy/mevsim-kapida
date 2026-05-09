"use client";

import * as React from "react";
import Link from "next/link";
import { useCart } from "@/providers/CartProvider";
import { Container } from "@/components/ui/Container";
import { type AuthSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function TopNav() {
  const { cartCount } = useCart();
  const router = useRouter();
  const [session, setSession] = React.useState<AuthSession | null>(null);

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => setSession(data))
      .catch(() => setSession(null));
  }, []);

  const logout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    setSession(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-emerald-100 bg-white/90 backdrop-blur">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold text-emerald-800 text-lg">
          Mevsim Kapıda
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-emerald-950/70 hover:text-emerald-700 font-medium transition-colors">
            Keşfet
          </Link>
          <Link
            href="/subscription"
            className="text-emerald-950/70 hover:text-emerald-700 font-medium transition-colors"
          >
            Abonelik
          </Link>
          <Link href="/admin" className="text-emerald-950/70 hover:text-emerald-700 font-medium transition-colors">
            Admin
          </Link>
          <Link href="/seller" className="text-emerald-950/70 hover:text-emerald-700 font-medium transition-colors">
            Satıcı
          </Link>
          <Link href="/login" className="text-emerald-950/70 hover:text-emerald-700 font-medium transition-colors">
            Giriş
          </Link>
          <Link href="/cart" className="text-emerald-950/70 hover:text-emerald-700 font-medium transition-colors">
            Sepet ({cartCount})
          </Link>
          {session ? (
            <button onClick={logout} className="rounded-md border border-emerald-200 px-3 py-1.5 text-emerald-700 hover:bg-emerald-50 transition-colors">
              Çıkış ({session.role})
            </button>
          ) : null}
        </nav>
      </Container>
    </header>
  );
}
