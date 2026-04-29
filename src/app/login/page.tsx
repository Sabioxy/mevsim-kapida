"use client";

import * as React from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/Button";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Container } from "@/components/ui/Container";
import { Input } from "@/components/ui/Input";
import { clearAuthSession, writeAuthSession, type AuthRole } from "@/lib/auth";

const roleNext: Record<AuthRole, string> = {
  ADMIN: "/admin",
  SELLER: "/seller",
  USER: "/",
};

export default function LoginPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const next = searchParams.get("next");

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [role, setRole] = React.useState<AuthRole>("ADMIN");
  const [loading, setLoading] = React.useState(false);
  const [error, setError] = React.useState<string | null>(null);

  const login = async () => {
    if (!name.trim() || !email.trim()) return;
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/auth/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, role }),
      });
      const data = (await response.json()) as { user?: { id: string; name: string; email: string; role: AuthRole }; message?: string };

      if (!response.ok || !data.user) {
        throw new Error(data.message ?? "Giriş yapılamadı");
      }

      writeAuthSession(data.user);
      const target = next && next.startsWith("/") ? next : roleNext[role];
      router.replace(target);
    } catch (authError) {
      setError(authError instanceof Error ? authError.message : "Giriş yapılamadı");
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    clearAuthSession();
  }, []);

  return (
    <Container className="flex min-h-[calc(100vh-56px)] items-center justify-center py-10">
      <Card className="w-full max-w-md">
        <CardHeader>
          <div className="text-lg font-semibold text-neutral-900">Giriş Yap</div>
          <div className="mt-1 text-sm text-neutral-600">
            Admin veya satıcı paneline erişmek için kullanıcı kaydıyla oturum açın.
          </div>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <label className="text-xs font-semibold text-neutral-700">Ad Soyad</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Örn. Ayşe Yılmaz" />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-700">E-posta</label>
            <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="ornek@site.com" />
          </div>
          <div>
            <label className="text-xs font-semibold text-neutral-700">Rol</label>
            <select value={role} onChange={(e) => setRole(e.target.value as AuthRole)} className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm">
              <option value="ADMIN">Admin</option>
              <option value="SELLER">Satıcı</option>
              <option value="USER">Kullanıcı</option>
            </select>
          </div>
          <Button className="w-full" disabled={loading} onClick={login}>
            {loading ? "Giriş yapılıyor..." : "Giriş Yap"}
          </Button>
          {error ? <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">{error}</div> : null}
        </CardContent>
      </Card>
    </Container>
  );
}
