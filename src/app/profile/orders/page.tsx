"use client";

import * as React from "react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type Order = {
  id: string;
  status: string;
  totalCents: number;
  createdAt: string;
  items: any[];
};

const statusLabels: Record<string, string> = {
  PENDING: "Beklemede",
  SUCCESS: "Onaylandı",
  FAILED: "İptal Edildi",
  CARGO: "Kargoda",
  DELIVERED: "Teslim Edildi",
};

const statusColors: Record<string, string> = {
  PENDING: "text-amber-600 bg-amber-50 border-amber-100",
  SUCCESS: "text-emerald-600 bg-emerald-50 border-emerald-100",
  FAILED: "text-rose-600 bg-rose-50 border-rose-100",
  CARGO: "text-blue-600 bg-blue-50 border-blue-100",
  DELIVERED: "text-slate-600 bg-slate-50 border-slate-100",
};

export default function UserOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  return (
    <Container className="py-12">
      <SectionTitle title="Siparişlerim" subtitle="Geçmiş siparişlerini ve durumlarını takip et" />

      <div className="mt-8">
        {loading ? (
          <div className="flex h-40 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/30">
            <span className="text-sm font-medium text-emerald-800">Yükleniyor...</span>
          </div>
        ) : orders.length === 0 ? (
          <div className="flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/30 p-12 text-center">
            <div className="text-lg font-bold text-emerald-950">Henüz siparişin yok</div>
            <p className="mt-2 text-sm text-emerald-600">Taze ürünlerimizi keşfetmeye ne dersin?</p>
            <div className="mt-6">
              <Link href="/">
                <Button>Alışverişe Başla</Button>
              </Link>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            {orders.map((order) => (
              <Card key={order.id} className="border-emerald-100 transition-all hover:shadow-md">
                <CardContent className="p-0">
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-6">
                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                        Sipariş Tarihi
                      </div>
                      <div className="text-sm font-semibold text-emerald-950">
                        {format(new Date(order.createdAt), "d MMMM yyyy", { locale: tr })}
                      </div>
                      <div className="text-xs text-emerald-600">ID: #{order.id.slice(-8).toUpperCase()}</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                        Toplam Tutar
                      </div>
                      <div className="text-sm font-bold text-emerald-950">
                        {(order.totalCents / 100).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                      </div>
                      <div className="text-xs text-emerald-600">{order.items.length} Ürün</div>
                    </div>

                    <div className="space-y-1">
                      <div className="text-xs font-bold uppercase tracking-wider text-emerald-500">
                        Durum
                      </div>
                      <div className={`inline-flex rounded-full border px-3 py-1 text-xs font-bold ${statusColors[order.status] || ""}`}>
                        {statusLabels[order.status] || order.status}
                      </div>
                    </div>

                    <div>
                      <Button variant="secondary" className="w-full md:w-auto">
                        Detaylar (Yakında)
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </Container>
  );
}
