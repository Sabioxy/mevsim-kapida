"use client";

import { useEffect, useState } from "react";
import { CATEGORIES } from "@/lib/catalog";
import { AuthGate } from "@/components/auth/AuthGate";

type Prod = any;

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Prod[]>([]);
  const [producers, setProducers] = useState<any[]>([]);
  const [form, setForm] = useState({ name: "", slug: "", price: "", image: "", category: "", producerId: "" });
  const [editingId, setEditingId] = useState<number | null>(null);
  const [status, setStatus] = useState<string>("");
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    setLoading(true);
    Promise.all([
      fetch("/api/admin/products").then((r) => r.json()),
      fetch("/api/admin/producers").then((r) => r.json()),
    ])
      .then(([productData, producerData]) => {
        setProducts(productData);
        setProducers(producerData);
      })
      .finally(() => setLoading(false));
  }, []);

  async function createProduct(e: any) {
    e.preventDefault();
    setStatus("");
    const body = { ...form };
    const method = editingId ? "PATCH" : "POST";
    const endpoint = editingId ? `/api/admin/products/${editingId}` : "/api/admin/products";

    const res = await fetch(endpoint, {
      method,
      body: JSON.stringify(body),
      headers: { "Content-Type": "application/json" },
    });

    const saved = await res.json();
    if (!res.ok) {
      setStatus(saved?.error || "Kayıt işlemi başarısız oldu.");
      return;
    }

    setProducts((current) =>
      editingId ? current.map((p) => (p.id === editingId ? saved : p)) : [saved, ...current],
    );
    setForm({ name: "", slug: "", price: "", image: "", category: "", producerId: "" });
    setEditingId(null);
    setStatus(editingId ? "Ürün güncellendi." : "Yeni ürün oluşturuldu.");
  }

  async function deleteProduct(id: number) {
    if (!confirm("Silinsin mi?")) return;
    await fetch(`/api/admin/products/${id}`, { method: "DELETE" });
    setProducts((s) => s.filter((p) => p.id !== id));
    if (editingId === id) {
      setEditingId(null);
      setForm({ name: "", slug: "", price: "", image: "", category: "", producerId: "" });
    }
    setStatus("Ürün silindi.");
  }

  function beginEdit(product: any) {
    setEditingId(product.id);
    setForm({
      name: product.name ?? "",
      slug: product.slug ?? "",
      price: product.priceCents ? String(product.priceCents / 100) : "",
      image: product.image ?? "",
      category: product.category ?? "",
      producerId: product.producerId ? String(product.producerId) : "",
    });
    setStatus("Düzenleme modu aktif.");
  }

  function resetForm() {
    setEditingId(null);
    setForm({ name: "", slug: "", price: "", image: "", category: "", producerId: "" });
    setStatus("Form temizlendi.");
  }

  return (
    <AuthGate allowedRoles={["ADMIN"]}>
      <div className="p-6">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h2 className="text-2xl font-semibold">Ürün Yönetimi</h2>
          <p className="mt-1 text-sm text-emerald-600">
            Ürünleri oluşturun, düzenleyin, kaldırın ve üreticiye bağlayın.
          </p>
        </div>
        <div className="text-sm text-emerald-500">
          {loading ? "Yükleniyor..." : `${products.length} ürün`}
        </div>
      </div>

      {status ? (
        <div className="mt-4 rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          {status}
        </div>
      ) : null}

      <div className="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-[360px_1fr]">
        <form onSubmit={createProduct} className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">{editingId ? "Ürünü Düzenle" : "Yeni Ürün"}</h3>
            {editingId ? (
              <button type="button" onClick={resetForm} className="text-sm text-emerald-600 hover:text-emerald-900">
                İptal
              </button>
            ) : null}
          </div>

          <div className="mt-4 grid grid-cols-1 gap-3">
            <input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} placeholder="Ürün adı" className="rounded-md border border-emerald-200 p-2 text-sm outline-none focus:border-blue-500" />
            <input value={form.slug} onChange={(e) => setForm({ ...form, slug: e.target.value })} placeholder="slug" className="rounded-md border border-emerald-200 p-2 text-sm outline-none focus:border-blue-500" />
            <input value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} placeholder="Fiyat (ör. 12.5)" className="rounded-md border border-emerald-200 p-2 text-sm outline-none focus:border-blue-500" />
            <div className="flex gap-2">
              <input value={form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="Görsel URL" className="flex-1 rounded-md border border-emerald-200 p-2 text-sm outline-none focus:border-blue-500" />
              {form.image && (
                <div className="relative h-9 w-9 flex-shrink-0 rounded border border-emerald-200 overflow-hidden bg-gray-50">
                  <img src={form.image} alt="Görsel" className="h-full w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setForm({ ...form, image: "" })}
                    className="absolute inset-0 bg-black/60 opacity-0 hover:opacity-100 flex items-center justify-center text-[10px] text-white transition-opacity font-bold cursor-pointer"
                  >
                    Kaldır
                  </button>
                </div>
              )}
            </div>

            <div>
              <label 
                htmlFor="admin-file-upload" 
                className={`flex flex-col items-center justify-center border border-dashed rounded-lg p-2.5 text-center cursor-pointer transition-all duration-200 ${
                  uploading 
                    ? "border-emerald-300 bg-emerald-50/20" 
                    : "border-emerald-200 hover:border-emerald-400 hover:bg-emerald-50/10"
                }`}
              >
                <span className="text-xs font-semibold text-emerald-800 flex items-center gap-2">
                  <span>{uploading ? "⏳" : "📷"}</span>
                  <span>{uploading ? "Görsel Yükleniyor..." : "Dosya Yükle"}</span>
                </span>
              </label>
              <input 
                type="file" 
                id="admin-file-upload" 
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
                    setForm({ ...form, image: result.url });
                  } catch (err: any) {
                    alert(err.message);
                  } finally {
                    setUploading(false);
                  }
                }}
              />
            </div>
            <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className="rounded-md border border-emerald-200 p-2 text-sm outline-none focus:border-blue-500">
              <option value="">Kategori seçin</option>
              {CATEGORIES.map((category) => (
                <option key={category.slug} value={category.slug}>
                  {category.title}
                </option>
              ))}
            </select>
            <select value={form.producerId} onChange={(e) => setForm({ ...form, producerId: e.target.value })} className="rounded-md border border-emerald-200 p-2 text-sm outline-none focus:border-blue-500">
              <option value="">Üretici seçin</option>
              {producers.map((pr) => (
                <option key={pr.id} value={pr.id}>
                  {pr.name}
                </option>
              ))}
            </select>
          </div>

          <div className="mt-4 flex gap-2">
            <button className="rounded-md bg-blue-600 px-4 py-2 text-sm font-medium text-white hover:bg-blue-700">
              {editingId ? "Güncelle" : "Oluştur"}
            </button>
            {editingId ? (
              <button type="button" onClick={resetForm} className="rounded-md border border-emerald-200 px-4 py-2 text-sm font-medium text-emerald-700 hover:bg-emerald-50">
                Temizle
              </button>
            ) : null}
          </div>
        </form>

        <div className="rounded-xl border border-emerald-200 bg-white p-4 shadow-sm">
          <div className="flex items-center justify-between gap-3">
            <h3 className="text-lg font-semibold">Mevcut Ürünler</h3>
            <button onClick={() => window.location.reload()} className="text-sm text-emerald-600 hover:text-emerald-900">
              Yenile
            </button>
          </div>

          <div className="mt-4 overflow-hidden rounded-lg border border-emerald-200">
            <div className="grid grid-cols-[1.4fr_1fr_1fr_110px] gap-3 border-b border-emerald-200 bg-emerald-50 px-4 py-3 text-xs font-semibold uppercase tracking-wide text-emerald-500">
              <div>Ürün</div>
              <div>Üretici</div>
              <div>Kategori</div>
              <div>İşlemler</div>
            </div>

            <div className="divide-y divide-emerald-200">
              {products.map((p: any) => (
                <div key={p.id} className="grid grid-cols-[1.4fr_1fr_1fr_110px] gap-3 px-4 py-3 text-sm">
                  <div>
                    <div className="font-medium text-emerald-900">{p.name}</div>
                    <div className="mt-1 text-xs text-emerald-500">
                      {p.slug} • {p.priceCents ? `${(p.priceCents / 100).toFixed(2)} TL` : "Fiyat yok"}
                    </div>
                  </div>
                  <div className="text-emerald-700">{p.producer?.name ?? "-"}</div>
                  <div className="text-emerald-700">{p.category ?? "-"}</div>
                  <div className="flex flex-wrap gap-2">
                    <button onClick={() => beginEdit(p)} className="rounded-md border border-emerald-200 px-3 py-1.5 text-xs font-medium text-emerald-700 hover:bg-emerald-50">
                      Düzenle
                    </button>
                    <button onClick={() => deleteProduct(p.id)} className="rounded-md border border-rose-200 px-3 py-1.5 text-xs font-medium text-rose-700 hover:bg-rose-50">
                      Sil
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      </div>
    </div>
  </AuthGate>
  );
}
