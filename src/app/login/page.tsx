"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import Link from "next/link";
import { Suspense } from "react";

function LoginForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [email, setEmail] = React.useState("");
  const [password, setPassword] = React.useState("");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  React.useEffect(() => {
    const { readAuthSession } = require("@/lib/auth");
    if (readAuthSession()) {
      router.replace("/");
    }
  }, [router]);

  const handleLogin = async () => {
    if (!email.trim() || !password.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });
      const data = await response.json();

      if (!response.ok) throw new Error(data.message || "Giriş yapılamadı");

      // SAVE SESSION TO LOCALSTORAGE FOR CLIENT SIDE
      const { writeAuthSession } = await import("@/lib/auth");
      writeAuthSession(data.user);

      const userRole = data.user.role;
      let target = next || "/";
      if (!next) {
        if (userRole === "ADMIN") target = "/admin/orders";
        else if (userRole === "SELLER") target = "/seller";
      }

      router.replace(target);
      // Force refresh to update Navbar/UI
      window.location.reload();
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-md border-emerald-100 shadow-xl shadow-emerald-50/50">
      <CardHeader className="text-center">
        <h1 className="text-2xl font-bold text-emerald-950">Tekrar Hoş Geldin</h1>
        <p className="text-sm text-emerald-600 mt-1">E-posta adresinle oturum aç.</p>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1">
          <label className="text-xs font-bold text-emerald-700 uppercase">E-posta</label>
          <Input 
            type="email" 
            value={email} 
            onChange={(e) => setEmail(e.target.value)} 
            placeholder="ornek@mail.com" 
          />
        </div>
        <div className="space-y-1">
          <label className="text-xs font-bold text-emerald-700 uppercase">Şifre</label>
          <Input 
            type="password" 
            value={password} 
            onChange={(e) => setPassword(e.target.value)} 
            placeholder="••••••••" 
          />
        </div>

        <Button className="w-full h-11" disabled={loading} onClick={handleLogin}>
          {loading ? "Giriş Yapılıyor..." : "Giriş Yap"}
        </Button>

        {error && <div className="text-xs text-rose-600 font-bold bg-rose-50 p-3 rounded-lg border border-rose-100">{error}</div>}

        <div className="text-center pt-2 text-sm text-emerald-600">
          Hesabın yok mu? <Link href="/register" className="font-bold text-emerald-800 hover:underline">Şimdi Kayıt Ol</Link>
        </div>
      </CardContent>
    </Card>
  );
}

export default function LoginPage() {
  return (
    <Container className="flex min-h-[calc(100vh-56px)] items-center justify-center py-10">
      <Suspense fallback={<div>Yükleniyor...</div>}>
        <LoginForm />
      </Suspense>
    </Container>
  );
}
