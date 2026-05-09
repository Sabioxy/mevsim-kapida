"use client";

import * as React from "react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Input } from "@/components/ui/Input";
import { Button } from "@/components/ui/Button";

type UserRecord = {
  id: string;
  name: string;
  email: string;
  city: string | null;
  shopName: string | null;
  createdAt: string;
};

export default function SellerPage() {
  const [sellers, setSellers] = React.useState<UserRecord[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [submitting, setSubmitting] = React.useState(false);

  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [city, setCity] = React.useState("");
  const [shopName, setShopName] = React.useState("");

  const loadSellers = React.useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/users?role=SELLER", { cache: "no-store" });
      const data = (await response.json()) as { users?: UserRecord[]; message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Satıcılar yüklenemedi");
      }

      setSellers(data.users ?? []);
    } catch (fetchError) {
      setError(fetchError instanceof Error ? fetchError.message : "Satıcılar yüklenemedi");
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
        const response = await fetch("/api/users?role=SELLER", { cache: "no-store" });
        const data = (await response.json()) as { users?: UserRecord[]; message?: string };

        if (!response.ok) {
          throw new Error(data.message ?? "Satıcılar yüklenemedi");
        }

        if (active) {
          setSellers(data.users ?? []);
        }
      } catch (fetchError) {
        if (active) {
          setError(fetchError instanceof Error ? fetchError.message : "Satıcılar yüklenemedi");
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

  const createSeller = async () => {
    if (!name.trim() || !email.trim() || !shopName.trim()) return;
    setSubmitting(true);
    setError(null);

    try {
      const response = await fetch("/api/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          email,
          role: "SELLER",
          city,
          shopName,
        }),
      });
      const data = (await response.json()) as { message?: string };

      if (!response.ok) {
        throw new Error(data.message ?? "Satıcı oluşturulamadı");
      }

      setName("");
      setEmail("");
      setCity("");
      setShopName("");
      await loadSellers();
    } catch (createError) {
      setError(createError instanceof Error ? createError.message : "Satıcı oluşturulamadı");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <Container className="py-8">
      <SectionTitle
        title="Satıcı Paneli"
        subtitle="Satıcı hesabı oluştur, kayıtlı satıcıları izle"
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[360px_1fr]">
        <Card>
          <CardHeader>
            <div className="text-sm font-semibold text-emerald-900">Satıcı Kaydı</div>
            <div className="mt-1 text-xs text-emerald-600">
              SQLite üzerinde satıcı rolü ile kayıt oluşturur.
            </div>
          </CardHeader>
          <CardContent className="space-y-3">
            <div>
              <label className="text-xs font-semibold text-emerald-700">Ad Soyad</label>
              <Input value={name} onChange={(e) => setName(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-emerald-700">E-posta</label>
              <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-emerald-700">Şehir</label>
              <Input value={city} onChange={(e) => setCity(e.target.value)} />
            </div>
            <div>
              <label className="text-xs font-semibold text-emerald-700">Mağaza Adı</label>
              <Input value={shopName} onChange={(e) => setShopName(e.target.value)} />
            </div>
            <Button className="w-full" disabled={submitting} onClick={createSeller}>
              {submitting ? "Kaydediliyor..." : "Satıcı Oluştur"}
            </Button>
            {error ? (
              <div className="rounded-xl border border-rose-200 bg-rose-50 p-3 text-sm text-rose-700">
                {error}
              </div>
            ) : null}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <div className="text-sm font-semibold text-emerald-900">Kayıtlı Satıcılar</div>
            <div className="mt-1 text-xs text-emerald-600">
              Buradaki kayıtlar admin panelinden de yönetilebilir.
            </div>
          </CardHeader>
          <CardContent>
            {loading ? (
              <div className="text-sm text-emerald-600">Yükleniyor...</div>
            ) : sellers.length === 0 ? (
              <div className="text-sm text-emerald-600">Henüz satıcı kaydı yok.</div>
            ) : (
              <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-3">
                {sellers.map((seller) => (
                  <div key={seller.id} className="rounded-xl border border-emerald-200 p-3">
                    <div className="text-sm font-semibold text-emerald-900">{seller.name}</div>
                    <div className="mt-1 text-xs text-emerald-600">{seller.email}</div>
                    <div className="mt-2 text-xs text-emerald-500">
                      {seller.shopName ?? "Mağaza adı yok"}
                    </div>
                    <div className="text-xs text-emerald-500">{seller.city ?? "Şehir yok"}</div>
                  </div>
                ))}
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    </Container>
  );
}
