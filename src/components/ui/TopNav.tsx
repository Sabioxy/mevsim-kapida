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
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
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
        <div className="flex items-center gap-8 flex-1">
          <Link href="/" className="font-semibold text-emerald-800 text-lg whitespace-nowrap">
            Mevsim Kapıda
          </Link>
          
          <form 
            onSubmit={(e) => {
              e.preventDefault();
              const q = (e.currentTarget.elements.namedItem("q") as HTMLInputElement).value;
              if (q.trim()) router.push(`/search?q=${encodeURIComponent(q)}`);
            }}
            className="hidden md:flex flex-1 max-w-md relative"
          >
            <input 
              name="q"
              type="text" 
              placeholder="Taze ürün ara..." 
              className="w-full h-9 rounded-full bg-emerald-50 border border-emerald-100 px-4 text-sm outline-none focus:border-emerald-300 focus:ring-2 focus:ring-emerald-100 transition-all"
            />
            <button type="submit" className="absolute right-3 top-2 text-emerald-400 hover:text-emerald-600">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/></svg>
            </button>
          </form>
        </div>

        <nav className="flex items-center gap-4 text-sm">
          <div className="relative group">
            <button className="flex items-center gap-1 text-emerald-950/70 hover:text-emerald-700 font-medium transition-colors py-4">
              Keşfet
              <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="group-hover:rotate-180 transition-transform"><path d="m6 9 6 6 6-6"/></svg>
            </button>
            <div className="absolute left-0 top-full hidden group-hover:block w-48 rounded-xl border border-emerald-100 bg-white p-2 shadow-xl shadow-emerald-900/5 z-50">
              <Link href="/" className="block rounded-lg px-3 py-2 text-xs font-semibold text-emerald-900 hover:bg-emerald-50 transition-colors">
                Tüm Ürünler
              </Link>
              <div className="my-1 border-t border-emerald-50" />
              <Link href="/#category-taze-sebze" className="block rounded-lg px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 transition-colors">
                Taze Sebze
              </Link>
              <Link href="/#category-taze-meyve" className="block rounded-lg px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 transition-colors">
                Taze Meyve
              </Link>
              <Link href="/#category-sera-urunleri" className="block rounded-lg px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 transition-colors">
                Sera Ürünleri
              </Link>
              <Link href="/#category-dogal-tarim-urunleri" className="block rounded-lg px-3 py-2 text-xs text-emerald-700 hover:bg-emerald-50 transition-colors">
                Doğal Tarım Ürünleri
              </Link>
            </div>
          </div>
          <Link href="/subscription" className="text-emerald-950/70 hover:text-emerald-700 font-medium transition-colors">
            Abonelik
          </Link>
          
          {session?.role === "ADMIN" && (
            <Link href="/admin/orders" className="text-emerald-950 hover:text-emerald-700 font-bold transition-colors">
              Siparişler
            </Link>
          )}

          {session && (
            <Link href="/profile/orders" className="text-emerald-950/70 hover:text-emerald-700 font-medium transition-colors">
              Siparişlerim
            </Link>
          )}

          <Link href="/cart" className="relative text-emerald-950/70 hover:text-emerald-700 font-medium transition-colors">
            Sepet
            {mounted && cartCount > 0 && (
              <span className="absolute -right-3 -top-2 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] text-white">
                {cartCount}
              </span>
            )}
          </Link>

          {session ? (
            <div className="flex items-center gap-2 border-l border-emerald-100 pl-4">
              <Link href="/profile" className="flex items-center gap-2 group">
                <div className="h-7 w-7 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-700 text-[10px] font-bold border border-emerald-200 group-hover:bg-emerald-200 transition-colors">
                  {session.name.charAt(0).toUpperCase()}
                </div>
                <span className="text-xs text-emerald-600 font-semibold group-hover:text-emerald-800 transition-colors">Profil</span>
              </Link>
              <button onClick={logout} className="ml-2 rounded-md border border-emerald-200 px-3 py-1.5 text-xs text-emerald-700 hover:bg-emerald-50 transition-colors">
                Çıkış
              </button>
            </div>
          ) : (
            <div className="flex items-center gap-2 border-l border-emerald-100 pl-4">
              <Link href="/login" className="text-emerald-950/70 hover:text-emerald-700 font-medium transition-colors">
                Giriş
              </Link>
              <Link href="/register" className="rounded-full bg-emerald-600 px-4 py-1.5 text-xs font-bold text-white hover:bg-emerald-700 transition-all">
                Kayıt Ol
              </Link>
            </div>
          )}
        </nav>
      </Container>
    </header>
  );
}
