"use client";

import * as React from "react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";
import { AuthGate } from "@/components/auth/AuthGate";

type Role = "ADMIN" | "USER" | "SELLER";
type UserRecord = {
  id: string;
  name: string;
  email: string;
  role: Role;
  city: string | null;
  shopName: string | null;
  createdAt: string;
};

const roleLabels: Record<Role, string> = {
  ADMIN: "Admin",
  USER: "Kullanıcı",
  SELLER: "Satıcı",
};

export default function AdminPage() {
  const [users, setUsers] = React.useState<UserRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [city, setCity] = React.useState("");
  const [shopName, setShopName] = React.useState("");
  const [role, setRole] = React.useState<Role>("USER");

  const loadUsers = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users", { cache: "no-store" });
      const data = (await response.json()) as { users?: UserRecord[]; message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Kullanıcılar yüklenemedi");
      }

      setUsers(data.users ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Kullanıcılar yüklenemedi");
    } finally {
      setLoading(false);
    }
  }, []);

  React.useEffect(() => {
    let active = true;

    const run = async () => {
      setLoading(true);
      setError(null);

      try {
        const response = await fetch("/api/users", { cache: "no-store" });
        const data = (await response.json()) as { users?: UserRecord[]; message?: string };

        if (!response.ok) {
          throw new Error(data.message ?? "Kullanıcılar yüklenemedi");
        }

        if (active) {
          setUsers(data.users ?? []);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "Kullanıcılar yüklenemedi");
        }
      } finally {
        if (active) {
          setLoading(false);
        }
      }
    };

    void run();

    return () => {
      active = false;
    };
  }, []);

  const createUser = async () => {
    if (!name.trim() || !email.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role,
          city,
          shopName: role === "SELLER" ? shopName : undefined,
        }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Kullanıcı oluşturulamadı");
      }

      setName("");
      setEmail("");
      setCity("");
      setShopName("");
      setRole("USER");
      await loadUsers();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Kullanıcı oluşturulamadı");
    } finally {
      setSubmitting(false);
    }
  };

  const deleteUser = async (id: string) => {
    setError(null);
    try {
      const response = await fetch(`/api/users/${id}`, { method: "DELETE" });
      if (!response.ok && response.status !== 204) {
        throw new Error("Kullanıcı silinemedi");
      }
      await loadUsers();
    } catch (deleteError) {
      setError(deleteError instanceof Error ? deleteError.message : "Kullanıcı silinemedi");
    }
  };

  const counts = users.reduce(
    (acc, item) => ({
      admin: acc.admin + (item.role === "ADMIN" ? 1 : 0),
      user: acc.user + (item.role === "USER" ? 1 : 0),
      seller: acc.seller + (item.role === "SELLER" ? 1 : 0),
    }),
    { admin: 0, user: 0, seller: 0 },
  );

  return (
    <AuthGate allowedRoles={["ADMIN"]}>
    <Container className="py-8">
      <SectionTitle
        title="Admin Paneli"
        subtitle="SQLite veritabanında admin, kullanıcı ve satıcı kaydı oluştur"
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold text-neutral-900">Yeni Kayıt</div>
            <div className="mt-1 text-xs text-neutral-600">
              Tek formdan tüm rol türleri oluşturulur.
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-neutral-700">Ad Soyad</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">E-posta</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Şehir</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-neutral-700">Rol</label>
              <select
                value={role}
                onChange={(e) => setRole(e.target.value as Role)}
                className="h-10 w-full rounded-md border border-neutral-200 bg-white px-3 text-sm"
              >
                <option value="USER">Kullanıcı</option>
                <option value="SELLER">Satıcı</option>
                <option value="ADMIN">Admin</option>
              </select>
            </div>
            {role === "SELLER" ? (
              <div>
                <label className="text-xs font-semibold text-neutral-700">Mağaza Adı</label>
                <Input value={shopName} onChange={(e) => setShopName(e.target.value)} />
              </div>
            ) : null}
            <Button className="w-full" disabled={submitting} onClick={createUser}>
              {submitting ? "Kaydediliyor..." : "Kayıt Oluştur"}
            </Button>
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <div className="grid gap-3 sm:grid-cols-3">
            <Card>
              <CardContent className="p-4">
                <div className="text-xs font-semibold text-neutral-600">Admin</div>
                <div className="mt-1 text-2xl font-semibold text-neutral-900">{counts.admin}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs font-semibold text-neutral-600">Kullanıcı</div>
                <div className="mt-1 text-2xl font-semibold text-neutral-900">{counts.user}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-xs font-semibold text-neutral-600">Satıcı</div>
                <div className="mt-1 text-2xl font-semibold text-neutral-900">{counts.seller}</div>
              </CardContent>
            </Card>
          </div>

          <Card>
            <CardHeader>
              <div className="text-sm font-semibold text-neutral-900">Kayıtlı Hesaplar</div>
              <div className="mt-1 text-xs text-neutral-600">
                SQLite üzerinden geliyor, sayfa yenilemeden güncellenir.
              </div>
            </CardHeader>
            <CardContent>
              {loading ? (
                <div className="text-sm text-neutral-600">Yükleniyor...</div>
              ) : users.length === 0 ? (
                <div className="text-sm text-neutral-600">Henüz kayıt yok.</div>
              ) : (
                <div className="space-y-3">
                  {users.map((user) => (
                    <div
                      key={user.id}
                      className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-neutral-200 p-3"
                    >
                      <div>
                        <div className="text-sm font-semibold text-neutral-900">{user.name}</div>
                        <div className="text-xs text-neutral-600">{user.email}</div>
                        <div className="mt-1 text-xs text-neutral-500">
                          {roleLabels[user.role]}
                          {user.city ? ` • ${user.city}` : ""}
                          {user.shopName ? ` • ${user.shopName}` : ""}
                        </div>
                      </div>
                      <Button variant="secondary" onClick={() => deleteUser(user.id)}>
                        Sil
                      </Button>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
    </AuthGate>
  );
}
