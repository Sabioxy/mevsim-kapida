"use client";

import * as React from "react";
import { useSearchParams } from "next/navigation";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductCard } from "@/components/catalog/ProductCard";
import type { Product } from "@/lib/types";

export default function SearchPage() {
  const searchParams = useSearchParams();
  const query = searchParams.get("q") || "";
  const category = searchParams.get("category") || "";

  const [products, setProducts] = React.useState<Product[]>([]);
  const [loading, setLoading] = React.useState(true);

  React.useEffect(() => {
    setLoading(true);
    const params = new URLSearchParams();
    if (query) params.set("q", query);
    if (category) params.set("category", category);

    fetch(`/api/products?${params.toString()}`)
      .then((res) => res.json())
      .then((data) => {
        setProducts(data || []);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, [query, category]);

  return (
    <Container className="py-8">
      <SectionTitle 
        title={query ? `"${query}" için sonuçlar` : "Tüm Ürünler"} 
        subtitle={`${products.length} ürün bulundu`} 
      />

      {loading ? (
        <div className="mt-8 flex h-64 items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/30">
          <span className="text-emerald-800 font-medium">Aranıyor...</span>
        </div>
      ) : products.length === 0 ? (
        <div className="mt-8 flex flex-col items-center justify-center rounded-2xl border border-emerald-100 bg-emerald-50/30 p-12 text-center">
          <div className="text-lg font-bold text-emerald-950">Sonuç bulunamadı</div>
          <p className="mt-2 text-sm text-emerald-600">Farklı bir anahtar kelime veya kategori deneyebilirsiniz.</p>
        </div>
      ) : (
        <div className="mt-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {products.map((p) => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </Container>
  );
}
