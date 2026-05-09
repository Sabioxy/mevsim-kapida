"use client";

import * as React from "react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { AuthGate } from "@/components/auth/AuthGate";
import Link from "next/link";

export default function AdminDashboardPage() {
  return (
    <AuthGate allowedRoles={["ADMIN"]}>
      <Container className="py-8">
        <SectionTitle title="Yönetim Paneli" subtitle="Sistem genel durumunu ve verileri yönetin" />

        <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          <Link href="/admin/orders">
            <Card className="hover:border-emerald-300 transition-colors group">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">📦</div>
                <div className="font-bold text-emerald-950 group-hover:text-emerald-700">Siparişler</div>
                <div className="text-xs text-emerald-500 mt-1">Sipariş takibi ve güncellemeler</div>
              </CardContent>
            </Card>
          </Link>
          
          <Link href="/admin/products">
            <Card className="hover:border-emerald-300 transition-colors group">
              <CardContent className="p-6 text-center">
                <div className="text-3xl mb-2">🍎</div>
                <div className="font-bold text-emerald-950 group-hover:text-emerald-700">Ürünler</div>
                <div className="text-xs text-emerald-500 mt-1">Ürün kataloğu yönetimi</div>
              </CardContent>
            </Card>
          </Link>

          <Card className="opacity-60 cursor-not-allowed">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">👥</div>
              <div className="font-bold text-emerald-950">Kullanıcılar</div>
              <div className="text-xs text-emerald-500 mt-1">Müşteri ve Satıcı listesi (Yakında)</div>
            </CardContent>
          </Card>

          <Card className="opacity-60 cursor-not-allowed">
            <CardContent className="p-6 text-center">
              <div className="text-3xl mb-2">📊</div>
              <div className="font-bold text-emerald-950">Raporlar</div>
              <div className="text-xs text-emerald-500 mt-1">Satış ve trafik analizi (Yakında)</div>
            </CardContent>
          </Card>
        </div>

        <div className="mt-12">
          <h3 className="text-lg font-bold text-emerald-900 mb-6">Sistem Özeti</h3>
          <div className="grid gap-6 md:grid-cols-2">
            <Card className="border-emerald-100 bg-emerald-50/20">
              <CardHeader className="font-bold text-sm text-emerald-800">Veritabanı Durumu</CardHeader>
              <CardContent className="text-sm text-emerald-600">
                SQLite veritabanı aktif. Prisma ORM üzerinden bağlantı sağlandı. 
                <div className="mt-4 p-3 bg-white rounded-lg border border-emerald-100 font-mono text-[10px]">
                  DB_URL: file:./dev.db
                </div>
              </CardContent>
            </Card>
            <Card className="border-emerald-100 bg-emerald-50/20">
              <CardHeader className="font-bold text-sm text-emerald-800">Güvenlik Durumu</CardHeader>
              <CardContent className="text-sm text-emerald-600">
                JWT tabanlı HttpOnly çerez güvenliği aktif. AuthGate bileşenleri ile rol tabanlı erişim kontrolü sağlanıyor.
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </AuthGate>
  );
}
