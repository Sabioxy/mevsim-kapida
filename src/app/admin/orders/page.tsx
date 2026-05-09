"use client";

import * as React from "react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AuthGate } from "@/components/auth/AuthGate";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type OrderItem = {
  skuId: string;
  qty: number;
  priceCents: number;
};

type Order = {
  id: string;
  customerName: string;
  customerEmail: string;
  address: string;
  city: string;
  status: string;
  totalCents: number;
  createdAt: string;
  items: OrderItem[];
};

const statusColors: Record<string, string> = {
  PENDING: "bg-amber-100 text-amber-800 border-amber-200",
  SUCCESS: "bg-emerald-100 text-emerald-800 border-emerald-200",
  FAILED: "bg-rose-100 text-rose-800 border-rose-200",
  CARGO: "bg-blue-100 text-blue-800 border-blue-200",
  DELIVERED: "bg-slate-100 text-slate-800 border-slate-200",
};

export default function AdminOrdersPage() {
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);

  const loadOrders = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/admin/orders");
      const data = await res.json();
      if (!res.ok) throw new Error(data.message || "Yüklenemedi");
      setOrders(data.orders);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadOrders();
  }, []);

  const updateStatus = async (id: string, newStatus: string) => {
    try {
      const res = await fetch(`/api/admin/orders/${id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ status: newStatus }),
      });
      if (res.ok) {
        setOrders(orders.map(o => o.id === id ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      console.error("Update failed", err);
    }
  };

  const deleteOrder = async (id: string) => {
    if (!confirm("Bu siparişi silmek istediğinize emin misiniz?")) return;
    try {
      const res = await fetch(`/api/admin/orders/${id}`, { method: "DELETE" });
      if (res.ok) {
        setOrders(orders.filter(o => o.id !== id));
      }
    } catch (err) {
      console.error("Delete failed", err);
    }
  };

  return (
    <AuthGate allowedRoles={["ADMIN"]}>
      <Container className="py-8">
        <div className="flex items-center justify-between">
          <SectionTitle 
            title="Sipariş Yönetimi" 
            subtitle="Gelen siparişleri takip et ve durumlarını güncelle" 
          />
          <Button variant="secondary" onClick={loadOrders} disabled={loading}>
            {loading ? "Yükleniyor..." : "Yenile"}
          </Button>
        </div>

        <div className="mt-8">
          {error && (
            <div className="mb-6 rounded-xl border border-rose-200 bg-rose-50 p-4 text-sm text-rose-700">
              Hata: {error}
            </div>
          )}

          {loading ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/30">
              <span className="text-emerald-800 font-medium">Siparişler yükleniyor...</span>
            </div>
          ) : orders.length === 0 ? (
            <div className="flex h-64 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/30">
              <span className="text-emerald-800 font-medium">Henüz sipariş bulunmuyor.</span>
            </div>
          ) : (
            <div className="space-y-6">
              {orders.map((order) => (
                <Card key={order.id} className="overflow-hidden border-emerald-100">
                  <CardHeader className="bg-emerald-50/50 flex flex-row items-center justify-between border-b border-emerald-100 px-6 py-4">
                    <div className="space-y-1">
                      <div className="text-sm font-bold text-emerald-950">
                        Sipariş #{order.id.slice(-6).toUpperCase()}
                      </div>
                      <div className="text-xs text-emerald-600">
                        {format(new Date(order.createdAt), "d MMMM yyyy, HH:mm", { locale: tr })}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <span className={`rounded-full border px-3 py-1 text-xs font-semibold ${statusColors[order.status] || "bg-gray-100 text-gray-800"}`}>
                        {order.status}
                      </span>
                      <select 
                        value={order.status}
                        onChange={(e) => updateStatus(order.id, e.target.value)}
                        className="rounded-md border border-emerald-200 bg-white px-2 py-1 text-xs outline-none focus:ring-1 focus:ring-emerald-500"
                      >
                        <option value="PENDING">Beklemede</option>
                        <option value="SUCCESS">Başarılı</option>
                        <option value="CARGO">Kargoda</option>
                        <option value="DELIVERED">Teslim Edildi</option>
                        <option value="FAILED">İptal/Hata</option>
                      </select>
                    </div>
                  </CardHeader>
                  <CardContent className="p-6">
                    <div className="grid gap-6 md:grid-cols-3">
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500">Müşteri</h4>
                        <div className="mt-2 space-y-1 text-sm text-emerald-950">
                          <div className="font-semibold">{order.customerName}</div>
                          <div className="text-emerald-600">{order.customerEmail}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500">Teslimat Adresi</h4>
                        <div className="mt-2 space-y-1 text-sm text-emerald-950">
                          <div>{order.address}</div>
                          <div className="font-semibold text-emerald-600">{order.city}</div>
                        </div>
                      </div>
                      <div>
                        <h4 className="text-xs font-bold uppercase tracking-wider text-emerald-500">Özet</h4>
                        <div className="mt-2 space-y-1 text-sm text-emerald-950">
                          <div className="text-lg font-bold text-emerald-800">
                            {(order.totalCents / 100).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                          </div>
                          <div className="text-xs text-emerald-500">{order.items.length} farklı ürün</div>
                        </div>
                      </div>
                    </div>

                    <div className="mt-6 border-t border-emerald-50 pt-4 flex justify-end">
                      <Button variant="secondary" onClick={() => deleteOrder(order.id)} className="text-rose-600 hover:bg-rose-50 hover:text-rose-700">
                        Siparişi Sil
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>
      </Container>
    </AuthGate>
  );
}
