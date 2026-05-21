"use client";

import * as React from "react";
import { useCart } from "@/providers/CartProvider";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import Link from "next/link";
import { format } from "date-fns";
import { tr } from "date-fns/locale";
import { useRouter } from "next/navigation";

type Order = {
  id: string;
  status: string;
  totalCents: number;
  createdAt: string;
  address: string;
  city: string;
  customerName: string;
  customerEmail: string;
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
  const router = useRouter();
  const [orders, setOrders] = React.useState<Order[]>([]);
  const [loading, setLoading] = React.useState(true);
  const [selectedOrder, setSelectedOrder] = React.useState<Order | null>(null);
  const [reorderTargetOrder, setReorderTargetOrder] = React.useState<Order | null>(null);

  React.useEffect(() => {
    fetch("/api/orders")
      .then((res) => res.json())
      .then((data) => {
        setOrders(data.orders || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const { addLine } = useCart();

  // Siparişi tekrar sepete ekle
  const handleReorder = (order: Order) => {
    if (!order.items) return;
    order.items.forEach((item: any) => {
      const productId = item.sku?.productId;
      if (productId && item.skuId && item.qty) {
        addLine({ productId, skuId: item.skuId, qty: item.qty });
      }
    });
    setReorderTargetOrder(null);
    router.push("/cart");
  };

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

                    <div className="flex flex-col sm:flex-row gap-2">
                      <Button 
                        variant="secondary" 
                        className="w-full md:w-auto"
                        onClick={() => setSelectedOrder(order)}
                      >
                        Detaylar
                      </Button>
                      <Button
                        variant="primary"
                        className="w-full md:w-auto"
                        onClick={() => setReorderTargetOrder(order)}
                      >
                        Tekrar Sipariş Ver
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>

      {/* Sipariş Detayları Modali */}
      {selectedOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-lg md:max-w-2xl rounded-2xl bg-white p-6 shadow-2xl border border-emerald-100 max-h-[90vh] overflow-y-auto">
            <div className="flex items-center justify-between border-b border-emerald-50 pb-4">
              <h3 className="text-lg font-bold text-emerald-950">
                Sipariş Detayı (# {selectedOrder.id.slice(-8).toUpperCase()})
              </h3>
              <button
                onClick={() => setSelectedOrder(null)}
                className="text-emerald-500 hover:text-emerald-800 transition-colors font-bold text-lg"
              >
                ✕
              </button>
            </div>

            <div className="mt-4 grid gap-6 md:grid-cols-2">
              <div className="space-y-2">
                <h4 className="font-bold text-xs text-emerald-500 uppercase tracking-wider">Teslimat Bilgileri</h4>
                <div className="rounded-xl border border-emerald-50 bg-emerald-50/20 p-3 text-sm text-emerald-900 space-y-1">
                  <div><span className="font-semibold text-emerald-750">Alıcı:</span> {selectedOrder.customerName}</div>
                  <div><span className="font-semibold text-emerald-750">E-posta:</span> {selectedOrder.customerEmail}</div>
                  <div><span className="font-semibold text-emerald-750">Şehir:</span> {selectedOrder.city}</div>
                  <div><span className="font-semibold text-emerald-750">Adres:</span> {selectedOrder.address}</div>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="font-bold text-xs text-emerald-500 uppercase tracking-wider">Sipariş Özeti</h4>
                <div className="rounded-xl border border-emerald-50 bg-emerald-50/20 p-3 text-sm text-emerald-900 space-y-1">
                  <div><span className="font-semibold text-emerald-750">Tarih:</span> {format(new Date(selectedOrder.createdAt), "d MMMM yyyy HH:mm", { locale: tr })}</div>
                  <div>
                    <span className="font-semibold text-emerald-750">Durum:</span>{" "}
                    <span className={`inline-flex rounded-full border px-2 py-0.5 text-xs font-bold ${statusColors[selectedOrder.status] || ""}`}>
                      {statusLabels[selectedOrder.status] || selectedOrder.status}
                    </span>
                  </div>
                  <div>
                    <span className="font-semibold text-emerald-750">Toplam Tutar:</span>{" "}
                    <span className="font-bold">
                      {(selectedOrder.totalCents / 100).toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                    </span>
                  </div>
                </div>
              </div>
            </div>

            <div className="mt-6 space-y-2">
              <h4 className="font-bold text-xs text-emerald-500 uppercase tracking-wider">Sipariş Edilen Ürünler</h4>
              <div className="rounded-xl border border-emerald-50 overflow-hidden">
                <table className="w-full text-left text-sm">
                  <thead className="bg-emerald-50/50 text-xs font-bold text-emerald-800 uppercase border-b border-emerald-50">
                    <tr>
                      <th className="p-3">Ürün</th>
                      <th className="p-3">Birim Fiyat</th>
                      <th className="p-3 text-center">Adet</th>
                      <th className="p-3 text-right">Toplam</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-emerald-50 text-emerald-950">
                    {selectedOrder.items.map((item: any) => {
                      const name = item.sku?.product?.name || "Bilinmeyen Ürün";
                      const label = item.sku?.label || "";
                      const unitPrice = item.priceCents / 100;
                      const total = (item.priceCents * item.qty) / 100;

                      return (
                        <tr key={item.id}>
                          <td className="p-3">
                            <div className="font-semibold">{name}</div>
                            {label && <div className="text-xs text-emerald-500">{label}</div>}
                          </td>
                          <td className="p-3">
                            {unitPrice.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                          </td>
                          <td className="p-3 text-center font-semibold">{item.qty}</td>
                          <td className="p-3 text-right font-bold">
                            {total.toLocaleString("tr-TR", { style: "currency", currency: "TRY" })}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </div>

            <div className="mt-6 flex justify-end border-t border-emerald-50 pt-4">
              <Button onClick={() => setSelectedOrder(null)}>Kapat</Button>
            </div>
          </div>
        </div>
      )}

      {/* Tekrar Sipariş Ver Onay Modali */}
      {reorderTargetOrder && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-emerald-950/40 p-4 backdrop-blur-sm">
          <div className="relative w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl border border-emerald-100">
            <h3 className="text-lg font-bold text-emerald-950">Siparişi Tekrar Et</h3>
            <p className="mt-2 text-sm text-emerald-600">
              Bu siparişteki tüm ürünleri sepetinize ekleyip sepet sayfasına gitmek istediğinizden emin misiniz?
            </p>

            <div className="my-4 rounded-xl border border-emerald-50 bg-emerald-50/20 p-3 space-y-2">
              <div className="text-xs font-bold text-emerald-800 uppercase tracking-wider border-b border-emerald-50 pb-1">
                Eklenecek Ürünler
              </div>
              <div className="max-h-40 overflow-y-auto space-y-1.5 pr-1">
                {reorderTargetOrder.items.map((item: any) => (
                  <div key={item.id} className="flex justify-between text-xs text-emerald-900">
                    <span className="font-semibold">
                      {item.sku?.product?.name || "Ürün"} {item.sku?.label ? `(${item.sku.label})` : ""}
                    </span>
                    <span className="text-emerald-700 font-bold">{item.qty} Adet</span>
                  </div>
                ))}
              </div>
            </div>

            <div className="mt-6 flex items-center justify-end gap-2 border-t border-emerald-50 pt-4">
              <Button variant="secondary" onClick={() => setReorderTargetOrder(null)}>
                Vazgeç
              </Button>
              <Button variant="primary" onClick={() => handleReorder(reorderTargetOrder)}>
                Evet, Sepete Ekle
              </Button>
            </div>
          </div>
        </div>
      )}
    </Container>
  );
}
