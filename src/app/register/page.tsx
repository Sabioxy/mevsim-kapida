"use client";

import * as React from "react";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import Link from "next/link";


export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [role, setRole] = React.useState("USER");
  const [city, setCity] = React.useState("");
  const [shopName, setShopName] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);
  const [mounted, setMounted] = React.useState(false);

  React.useEffect(() => {
    setMounted(true);
  }, []);

  React.useEffect(() => {
    if (!mounted) return;
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        if (data) {
          router.replace("/");
        } else {
          const { clearAuthSession } = require("@/lib/auth");
          clearAuthSession();
        }
      })
      .catch(() => {});
  }, [router, mounted]);

  const handleRegister = async () => {
    if (!name.trim() || !email.trim() || !password.trim()) {
      setError("Lütfen gerekli alanları doldurun.");
      return;
    }
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password, role, city, shopName }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Kayıt olunamadı");

      // SAVE SESSION TO LOCALSTORAGE FOR CLIENT SIDE
      const { writeAuthSession } = await import("@/lib/auth");
      writeAuthSession(data.user);

      // Yönlendirme: next parametresi varsa öncelikli, yoksa role göre
      const params = new URLSearchParams(window.location.search);
      const next = params.get("next");
      let target = next || (role === "SELLER" ? "/seller" : "/");
      window.location.href = target;
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Container className="flex min-h-[calc(100vh-56px)] items-center justify-center py-10">
      <Card className="w-full max-w-md border-emerald-100 shadow-xl shadow-emerald-50/50">
        <CardHeader className="text-center">
          <h1 className="text-2xl font-bold text-emerald-950">Mevsim'e Katıl</h1>
          <p className="text-sm text-emerald-600 mt-1">Tazeliğin adresinde yerini al.</p>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1">
            <label className="text-xs font-bold text-emerald-700 uppercase">Ad Soyad *</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ahmet Yılmaz" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-emerald-700 uppercase">E-posta *</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ahmet@mail.com" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-emerald-700 uppercase">Şifre *</label>
            <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="••••••••" />
          </div>
          <div className="space-y-1">
            <label className="text-xs font-bold text-emerald-700 uppercase">Hesap Türü</label>
            <select
              value={role}
              onChange={(e) => setRole(e.target.value)}
              className="w-full h-10 rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 text-sm focus:border-emerald-500 outline-none transition-all"
            >
              <option value="USER">Müşteri (Alışveriş yapmak istiyorum)</option>
              <option value="SELLER">Satıcı (Ürün satmak istiyorum)</option>
            </select>
          </div>

          {role === "SELLER" && (
            <div className="animate-in slide-in-from-top-2 duration-300 space-y-4 pt-2 border-t border-emerald-50">
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-700 uppercase">Mağaza Adı</label>
                <Input value={shopName} onChange={(e) => setShopName(e.target.value)} placeholder="Bereketli Bahçe" />
              </div>
              <div className="space-y-1">
                <label className="text-xs font-bold text-emerald-700 uppercase">Şehir</label>
                <Input value={city} onChange={(e) => setCity(e.target.value)} placeholder="Bursa" />
              </div>
            </div>
          )}

          <Button className="w-full h-11" disabled={loading} onClick={handleRegister}>
            {loading ? "Hesap Oluşturuluyor..." : "Kayıt Ol"}
          </Button>

          {error && <div className="text-xs text-rose-600 font-bold bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</div>}

          <div className="text-center pt-2 text-sm text-emerald-600">
            Zaten hesabın var mı? <Link href="/login" className="font-bold text-emerald-800 hover:underline">Giriş Yap</Link>
          </div>
        </CardContent>
      </Card>
    </Container>
  );
}
