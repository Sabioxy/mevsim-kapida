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
    <div className="relative border-b border-emerald-100 bg-emerald-950 overflow-hidden min-h-[400px] flex items-center">
      {/* Background Image with Overlay */}
      <div className="absolute inset-0 z-0">
        <img
          src="/images/hero-fresh.png"
          alt="Taze Meyve Sebze Reyonu"
          className="h-full w-full object-cover opacity-40"
        />
        <div className="absolute inset-0 bg-gradient-to-r from-emerald-950 via-emerald-900/60 to-transparent" />
      </div>

      <Container className="relative z-10 py-12 sm:py-20">
        <div className="max-w-2xl text-white">
          <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-100/50 px-3 py-1 text-xs font-semibold text-emerald-800">
            Mevsim Kapıda • Doğrudan Üreticiden
          </div>
          <h1 className="mt-4 text-3xl font-bold tracking-tight text-white sm:text-6xl">
            {msg.title}
          </h1>
          <p className="mt-4 text-lg leading-relaxed text-emerald-50/90 sm:text-xl">
            {msg.subtitle}
          </p>
          <div className="mt-10 flex flex-wrap gap-4">
            <Link href="#mevsimlik">
              <Button size="lg" className="bg-emerald-600 hover:bg-emerald-500 text-white border-none px-8 py-6 text-base font-bold shadow-lg shadow-emerald-900/20">
                Mevsimlik Ürünler
              </Button>
            </Link>
            <Link href="/cart">
              <Button variant="secondary" size="lg" className="bg-white/10 hover:bg-white/20 text-white border-white/20 backdrop-blur-md px-8 py-6 text-base font-bold">
                Sepete Git
              </Button>
            </Link>
          </div>
        </div>
      </Container>
    </div>
  );
}
