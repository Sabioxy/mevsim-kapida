"use client";

import * as React from "react";
import Link from "next/link";
import { useCart } from "@/providers/CartProvider";
import { Container } from "@/components/ui/Container";
import { clearAuthSession, readAuthSession, type AuthSession } from "@/lib/auth";
import { useRouter } from "next/navigation";

export function TopNav() {
  const { cartCount } = useCart();
  const router = useRouter();
  const [session, setSession] = React.useState<AuthSession | null>(null);

  React.useEffect(() => {
    setSession(readAuthSession());
  }, []);

  const logout = () => {
    clearAuthSession();
    setSession(null);
    router.push("/");
  };

  return (
    <header className="sticky top-0 z-40 border-b border-neutral-200 bg-white/90 backdrop-blur">
      <Container className="flex h-14 items-center justify-between">
        <Link href="/" className="font-semibold text-neutral-900">
          Mevsim Kapıda
        </Link>

        <nav className="flex items-center gap-4 text-sm">
          <Link href="/" className="text-neutral-700 hover:text-neutral-900">
            Keşfet
          </Link>
          <Link
            href="/subscription"
            className="text-neutral-700 hover:text-neutral-900"
          >
            Abonelik
          </Link>
          <Link href="/admin" className="text-neutral-700 hover:text-neutral-900">
            Admin
          </Link>
          <Link href="/seller" className="text-neutral-700 hover:text-neutral-900">
            Satıcı
          </Link>
          <Link href="/login" className="text-neutral-700 hover:text-neutral-900">
            Giriş
          </Link>
          <Link href="/cart" className="text-neutral-700 hover:text-neutral-900">
            Sepet ({cartCount})
          </Link>
          {session ? (
            <button onClick={logout} className="rounded-md border border-neutral-200 px-3 py-1.5 text-neutral-700 hover:bg-neutral-50">
              Çıkış ({session.role})
            </button>
          ) : null}
        </nav>
      </Container>
    </header>
  );
}
