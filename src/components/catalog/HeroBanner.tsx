"use client";

import Link from "next/link";
import * as React from "react";
import { Container } from "@/components/ui/Container";
import { Button } from "@/components/ui/Button";

const messages = [
  {
    title: "Mevsiminde tazelik, kapına kadar",
    subtitle:
      "Sera üreticilerinden doğrudan. Modüler paketleme, hızlı teslimat, şeffaf fiyat.",
  },
  {
    title: "Sera ürünleri: stabil kalite",
    subtitle:
      "SKU bazlı stok takibi, gramaj seçimi ve güvenli ödeme akışıyla alışveriş.",
  },
  {
    title: "Sağlıklı beslenmeye bir adım",
    subtitle:
      "Öne çıkan mevsimlik ürünleri keşfet, sepete ekle ve kolayca tamamla.",
  },
];

export function HeroBanner() {
  const [index, setIndex] = React.useState(0);

  React.useEffect(() => {
    const id = window.setInterval(() => {
      setIndex((i) => (i + 1) % messages.length);
    }, 4500);
    return () => window.clearInterval(id);
  }, []);

  const msg = messages[index];

  return (
    <div className="border-b border-neutral-200 bg-neutral-50">
      <Container className="py-10 sm:py-14">
        <div className="grid gap-8 sm:grid-cols-2 sm:items-center">
          <div>
            <div className="inline-flex items-center rounded-full border border-neutral-200 bg-white px-3 py-1 text-xs font-semibold text-neutral-800">
              Mevsim Kapıda • Doğrudan Üreticiden
            </div>
            <h1 className="mt-4 text-2xl font-semibold tracking-tight text-neutral-900 sm:text-4xl">
              {msg.title}
            </h1>
            <p className="mt-3 text-sm leading-6 text-neutral-600 sm:text-base">
              {msg.subtitle}
            </p>
            <div className="mt-6 flex flex-wrap gap-3">
              <Link href="#mevsimlik">
                <Button>Mevsimlik Ürünler</Button>
              </Link>
              <Link href="/cart">
                <Button variant="secondary">Sepete Git</Button>
              </Link>
            </div>
          </div>

          <div className="rounded-2xl border border-neutral-200 bg-white p-5">
            <div className="grid gap-3">
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-xs font-semibold text-neutral-700">
                  Dönüşüm odaklı akış
                </div>
                <div className="mt-1 text-sm text-neutral-900">
                  Gramaj seç → Sepet → Adres & Teslimat → Ödeme
                </div>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-xs font-semibold text-neutral-700">Şeffaf fiyat</div>
                <div className="mt-1 text-sm text-neutral-900">
                  Üretici baz fiyat + %10 komisyon = müşteri fiyatı
                </div>
              </div>
              <div className="rounded-xl border border-neutral-200 bg-neutral-50 p-4">
                <div className="text-xs font-semibold text-neutral-700">Stok güvenliği</div>
                <div className="mt-1 text-sm text-neutral-900">
                  SKU stok 0 ise ürün “Tükendi” ve satışa kapalı
                </div>
              </div>
            </div>
          </div>
        </div>
      </Container>
    </div>
  );
}
