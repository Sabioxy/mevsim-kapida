"use client";

import * as React from "react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AuthGate } from "@/components/auth/AuthGate";
import Link from "next/link";
import { type AuthSession } from "@/lib/auth";

export default function ProfilePage() {
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  if (loading) return <Container className="py-20 text-center">Yükleniyor...</Container>;

  return (
    <AuthGate allowedRoles={["USER", "SELLER", "ADMIN"]}>
      <Container className="py-8">
        <SectionTitle title="Profilim" subtitle="Hesap bilgilerinizi yönetin" />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-1 border-emerald-100">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 text-center py-8">
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-2xl font-bold border-2 border-white shadow-sm">
                {session?.name?.charAt(0).toUpperCase()}
              </div>
              <h3 className="mt-4 font-bold text-emerald-950">{session?.name}</h3>
              <p className="text-xs text-emerald-600 uppercase font-bold tracking-widest">{session?.role}</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-emerald-400 uppercase">E-posta</label>
                <div className="text-sm font-medium text-emerald-900">{session?.email}</div>
              </div>
              <Button variant="secondary" className="w-full text-xs" onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => window.location.href = "/")}>
                Oturumu Kapat
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-emerald-100">
              <CardHeader className="border-b border-emerald-50">
                <h4 className="font-bold text-emerald-950">Hızlı İşlemler</h4>
              </CardHeader>
              <CardContent className="p-6 grid gap-4 sm:grid-cols-2">
                <Link href="/profile/orders" className="group">
                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-50 bg-emerald-50/20 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-emerald-100 text-emerald-600">
                      📦
                    </div>
                    <div>
                      <div className="font-bold text-sm text-emerald-950">Siparişlerim</div>
                      <div className="text-xs text-emerald-500">Sipariş durumlarını takip et</div>
                    </div>
                  </div>
                </Link>

                {session?.role === "SELLER" && (
                  <Link href="/seller" className="group">
                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-50 bg-emerald-50/20 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-emerald-100 text-emerald-600">
                        🏪
                      </div>
                      <div>
                        <div className="font-bold text-sm text-emerald-950">Mağaza Paneli</div>
                        <div className="text-xs text-emerald-500">Ürünlerini ve satışlarını yönet</div>
                      </div>
                    </div>
                  </Link>
                )}

                {session?.role === "ADMIN" && (
                  <Link href="/admin/orders" className="group">
                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-50 bg-emerald-50/20 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-emerald-100 text-emerald-600">
                        🛡️
                      </div>
                      <div>
                        <div className="font-bold text-sm text-emerald-950">Yönetici Paneli</div>
                        <div className="text-xs text-emerald-500">Tüm sistemi kontrol et</div>
                      </div>
                    </div>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="border-emerald-100">
              <CardHeader className="border-b border-emerald-50 bg-emerald-50/10">
                <h4 className="font-bold text-emerald-950">Abonelik Durumu</h4>
              </CardHeader>
              <CardContent className="p-6">
                {session?.subscriptionStatus === "ACTIVE" ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-900">{session.subscriptionPlan === "sebze" ? "Sebze Kutusu" : session.subscriptionPlan === "meyve" ? "Meyve Kutusu" : "Karışık Kutu"}</div>
                      <div className="text-xs text-emerald-600">Durum: <span className="font-bold text-emerald-700">AKTİF</span></div>
                    </div>
                    <div className="text-2xl">🌿</div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-emerald-600 italic">Aktif bir aboneliğiniz bulunmuyor.</p>
                    <Link href="/subscription">
                      <Button variant="ghost" className="mt-2 text-xs text-emerald-700 underline">Planları Keşfet</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-emerald-100">
              <CardHeader className="border-b border-emerald-50">
                <h4 className="font-bold text-emerald-950">Hesap Ayarları</h4>
              </CardHeader>
              <CardContent className="p-6 text-center text-sm text-emerald-400 italic">
                Ayarlar yakında aktif edilecektir...
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </AuthGate>
  );
}
