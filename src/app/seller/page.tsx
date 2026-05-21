"use client";

import * as React from "react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AuthGate } from "@/components/auth/AuthGate";
import { format } from "date-fns";
import { tr } from "date-fns/locale";

type Sku = {
  skuId: string;
  label: string;
  stock: number;
  priceCents: number;
};

type Product = {
  id: number;
  name: string;
  skus: Sku[];
};

type OrderItem = {
  sku: {
    label: string;
    product: {
      name: string;
    };
  };
  qty: number;
  priceCents: number;
};

type Order = {
  id: string;
  customerName: string;
  status: string;
  createdAt: string;
  items: OrderItem[];
};

export default function SellerDashboardPage() {
  const [data, setData] = React.useState<{ producer: any; orders: Order[] } | null>(null);
  const [loading, setLoading] = React.useState(true);
  const [error, setError] = React.useState<string | null>(null);
  const [imageUrl, setImageUrl] = React.useState<string>("");
  const [uploading, setUploading] = React.useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/seller/dashboard");
      const json = await res.json();
      if (!res.ok) throw new Error(json.message || "Yüklenemedi");
      setData(json);
    } catch (err: any) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    loadDashboard();
  }, []);

  if (loading) {
    return (
      <Container className="py-20 text-center">
        <div className="text-emerald-800 font-medium">Dashboard yükleniyor...</div>
      </Container>
    );
  }

  if (error) {
    return (
      <Container className="py-20 text-center">
        <Card className="max-w-md mx-auto border-rose-100 bg-rose-50">
          <CardContent className="p-6">
            <div className="text-rose-800 font-bold">Hata!</div>
            <p className="text-rose-600 text-sm mt-2">{error}</p>
            <Button className="mt-4" onClick={() => window.location.reload()}>Tekrar Dene</Button>
          </CardContent>
        </Card>
      </Container>
    );
  }

  return (
    <AuthGate allowedRoles={["SELLER"]}>
      <Container className="py-8">
        <div className="flex items-center justify-between">
          <SectionTitle 
            title={data?.producer.name} 
            subtitle="Üretici Paneli — Ürünlerini ve siparişlerini yönet" 
          />
          <div className="flex gap-2">
            <Button variant="secondary" onClick={loadDashboard}>Yenile</Button>
          </div>
        </div>

        <div className="mt-8 grid gap-6 lg:grid-cols-3">
          <Card className="lg:col-span-1 border-emerald-100">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
              <div className="text-sm font-bold text-emerald-950">Yeni Ürün Ekle</div>
            </CardHeader>
            <CardContent className="p-4">
              <form 
                onSubmit={async (e) => {
                  e.preventDefault();
                  const form = e.currentTarget;
                  const formData = new FormData(form);
                  
                  const productData = {
                    name: formData.get("name"),
                    description: formData.get("description"),
                    category: formData.get("category"),
                    image: imageUrl || null,
                    skus: [
                      {
                        label: formData.get("sku_label"),
                        grams: formData.get("sku_grams"),
                        priceCents: Number(formData.get("sku_price")) * 100,
                        stock: formData.get("sku_stock"),
                      }
                    ]
                  };

                  try {
                    const res = await fetch("/api/seller/products", {
                      method: "POST",
                      headers: { "Content-Type": "application/json" },
                      body: JSON.stringify(productData),
                    });
                    if (!res.ok) throw new Error("Ekleme başarısız");
                    alert("Ürün başarıyla eklendi!");
                    loadDashboard();
                    form.reset();
                    setImageUrl("");
                  } catch (err: any) {
                    alert(err.message);
                  }
                }}
                className="space-y-3"
              >
                <div>
                  <label className="text-[10px] font-bold text-emerald-600 uppercase">Ürün Adı</label>
                  <input name="name" required className="w-full rounded-md border border-emerald-200 p-2 text-sm outline-none focus:border-emerald-500" placeholder="Örn: Salkım Domates" />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-600 uppercase">Açıklama</label>
                  <textarea name="description" className="w-full rounded-md border border-emerald-200 p-2 text-sm outline-none focus:border-emerald-500" placeholder="Ürün detayları..." />
                </div>
                <div>
                  <label className="text-[10px] font-bold text-emerald-600 uppercase">Kategori</label>
                  <select name="category" className="w-full rounded-md border border-emerald-200 p-2 text-sm outline-none focus:border-emerald-500">
                    <option value="taze-sebze">Taze Sebze</option>
                    <option value="taze-meyve">Taze Meyve</option>
                    <option value="sera-urunleri">Sera Ürünleri</option>
                    <option value="dogal-tarim-urunleri">Doğal Tarım Ürünleri</option>
                  </select>
                </div>
                
                <div>
                  <label className="text-[10px] font-bold text-emerald-600 uppercase block mb-1">Ürün Görseli</label>
                  {imageUrl ? (
                    <div className="relative rounded-lg border border-emerald-200 overflow-hidden bg-emerald-50/10 p-2 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-2">
                        <img src={imageUrl} alt="Ürün Görseli" className="h-12 w-12 rounded object-cover border border-emerald-100" />
                        <span className="text-[10px] text-emerald-700 font-medium truncate max-w-[120px]">Görsel yüklendi</span>
                      </div>
                      <button
                        type="button"
                        onClick={() => setImageUrl("")}
                        className="text-xs text-rose-600 hover:text-rose-900 font-medium cursor-pointer"
                      >
                        Kaldır
                      </button>
                    </div>
                  ) : (
                    <div className="relative">
                      <label 
                        htmlFor="seller-file-upload" 
                        className={`flex flex-col items-center justify-center border-2 border-dashed rounded-lg p-4 text-center cursor-pointer transition-all duration-200 ${
                          uploading 
                            ? "border-emerald-300 bg-emerald-50/20" 
                            : "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/10"
                        }`}
                      >
                        <div className="text-xl mb-1">{uploading ? "⏳" : "📷"}</div>
                        <div className="text-xs font-semibold text-emerald-800">
                          {uploading ? "Görsel Yükleniyor..." : "Görsel Seçin veya Sürükleyin"}
                        </div>
                        <div className="text-[9px] text-emerald-500 mt-0.5">PNG, JPG veya WEBP (Maks. 5MB)</div>
                      </label>
                      <input 
                        type="file" 
                        id="seller-file-upload" 
                        accept="image/*" 
                        disabled={uploading}
                        className="hidden" 
                        onChange={async (e) => {
                          const file = e.target.files?.[0];
                          if (!file) return;
                          
                          setUploading(true);
                          const uploadForm = new FormData();
                          uploadForm.append("file", file);
                          
                          try {
                            const res = await fetch("/api/upload", {
                              method: "POST",
                              body: uploadForm,
                            });
                            const result = await res.json();
                            if (!res.ok) throw new Error(result.error || "Görsel yüklenemedi");
                            setImageUrl(result.url);
                          } catch (err: any) {
                            alert(err.message);
                          } finally {
                            setUploading(false);
                          }
                        }}
                      />
                    </div>
                  )}
                </div>
                
                <div className="border-t border-emerald-100 pt-3">
                  <div className="text-[10px] font-bold text-emerald-600 uppercase mb-2">Varyant (SKU) Bilgileri</div>
                  <div className="grid grid-cols-2 gap-2">
                    <input name="sku_label" placeholder="Etiket (1kg)" required className="rounded-md border border-emerald-200 p-2 text-xs" />
                    <input name="sku_grams" type="number" placeholder="Gramaj (1000)" required className="rounded-md border border-emerald-200 p-2 text-xs" />
                    <input name="sku_price" type="number" step="0.01" placeholder="Fiyat (₺)" required className="rounded-md border border-emerald-200 p-2 text-xs" />
                    <input name="sku_stock" type="number" placeholder="Stok Adedi" required className="rounded-md border border-emerald-200 p-2 text-xs" />
                  </div>
                </div>

                <Button type="submit" className="w-full mt-2">Ürünü Yayınla</Button>
              </form>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2 border-emerald-100">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100">
              <div className="text-sm font-bold text-emerald-950">Bana Gelen Siparişler</div>
            </CardHeader>
            <CardContent className="p-4">
              <div className="mb-6">
                 <div className="text-xs font-bold text-emerald-600 uppercase mb-3">Mevcut Ürünlerim</div>
                  <div className="grid gap-2 sm:grid-cols-2">
                     {data?.producer.products.map((p: any) => (
                       <div key={p.id} className="rounded-lg border border-emerald-100 bg-emerald-50/20 p-3 flex flex-col justify-between">
                         <div>
                           <div className="flex justify-between items-start mb-1">
                             <div className="text-xs font-bold text-emerald-900">{p.name}</div>
                             <button
                               onClick={async () => {
                                 if (confirm("Bu ürünü silmek istediğinize emin misiniz?")) {
                                   try {
                                     const res = await fetch(`/api/seller/products/${p.id}`, {
                                       method: "DELETE"
                                     });
                                     if (!res.ok) {
                                       const errData = await res.json();
                                       throw new Error(errData.message || "Silme başarısız");
                                     }
                                     alert("Ürün başarıyla silindi!");
                                     loadDashboard();
                                   } catch (err: any) {
                                     alert(err.message);
                                   }
                                 }
                               }}
                               className="text-[10px] text-rose-600 hover:text-rose-900 font-semibold cursor-pointer"
                             >
                               Sil
                             </button>
                           </div>
                           {p.skus.map((s: any) => (
                             <div key={s.skuId} className="flex justify-between text-[10px] text-emerald-700">
                               <span>{s.label}</span>
                               <span>{s.stock} adet</span>
                             </div>
                           ))}
                         </div>
                       </div>
                     ))}
                  </div>
              </div>

              {data?.orders.length === 0 ? (
                <div className="text-center py-12 text-emerald-600 text-sm">
                  Henüz size ait bir ürün siparişi bulunmuyor.
                </div>
              ) : (
                <div className="space-y-4">
                  {data?.orders.map((order) => (
                    <div key={order.id} className="rounded-xl border border-emerald-100 p-4">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <div className="text-sm font-bold text-emerald-950">{order.customerName}</div>
                          <div className="text-[10px] text-emerald-500 uppercase font-bold tracking-tight">
                            {format(new Date(order.createdAt), "d MMM yyyy, HH:mm", { locale: tr })}
                          </div>
                        </div>
                        <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-800 border border-emerald-200">
                          {order.status}
                        </span>
                      </div>
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between text-sm bg-emerald-50/50 p-2 rounded-lg">
                            <div className="text-emerald-950">
                              <span className="font-semibold">{item.sku.product.name}</span>
                              <span className="text-xs text-emerald-600 ml-2">({item.sku.label})</span>
                            </div>
                            <div className="font-bold text-emerald-800">x{item.qty}</div>
                          </div>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </Container>
    </AuthGate>
  );
}
