import type { CategorySlug, Producer, Product } from "@/lib/types";
import { TRY } from "@/lib/money";

const producer1: Producer = {
  id: "p-antalya-01",
  name: "Antalya Sera Kooperatifi",
  city: "Antalya",
};

const producer2: Producer = {
  id: "p-izmir-01",
  name: "İzmir Doğal Tarım Çiftliği",
  city: "İzmir",
};

export const CATEGORIES: Array<{ slug: CategorySlug; title: string }> = [
  { slug: "taze-sebze", title: "Taze Sebze" },
  { slug: "taze-meyve", title: "Taze Meyve" },
  { slug: "sera-urunleri", title: "Sera Ürünleri" },
  { slug: "dogal-tarim-urunleri", title: "Doğal Tarım Ürünleri" },
];

export const COMMISSION_RATE = 0.1;

export const PRODUCTS: Product[] = [
  {
    id: "prd-domates",
    slug: "domates",
    title: "Domates",
    subtitle: "Sulu, aromalı ve günlük hasat",
    imageUrl: "/images/domates.svg",
    category: "sera-urunleri",
    badges: ["SERA"],
    producer: producer1,
    description:
      "Sera üretim domateslerimiz aynı gün toplanır, özenle paketlenir ve doğrudan kapınıza gelir.",
    variants: [
      {
        skuId: "sku-domates-1kg",
        label: "1 kg",
        grams: 1000,
        producerBasePrice: TRY(60),
        stock: 18,
      },
      {
        skuId: "sku-domates-3kg",
        label: "3 kg",
        grams: 3000,
        producerBasePrice: TRY(165),
        stock: 0,
      },
    ],
  },
  {
    id: "prd-salatalik",
    slug: "salatalik",
    title: "Salatalık",
    subtitle: "Çıtır, ince kabuk",
    imageUrl: "/images/salatalik.svg",
    category: "taze-sebze",
    badges: ["MEVSIMINDE"],
    producer: producer2,
    description:
      "Mevsiminde yetişen salatalıklar; kalıntısız üretim, tazelik ve lezzet odaklıdır.",
    variants: [
      {
        skuId: "sku-salatalik-1kg",
        label: "1 kg",
        grams: 1000,
        producerBasePrice: TRY(45),
        stock: 12,
      },
      {
        skuId: "sku-salatalik-2kg",
        label: "2 kg",
        grams: 2000,
        producerBasePrice: TRY(84),
        stock: 7,
      },
    ],
  },
  {
    id: "prd-cilek",
    slug: "cilek",
    title: "Çilek",
    subtitle: "Tatlı, iri taneli",
    imageUrl: "/images/cilek.svg",
    category: "taze-meyve",
    badges: ["MEVSIMINDE"],
    producer: producer2,
    description:
      "Sezon çileklerimiz sabah hasat edilir, soğuk zincirle paketlenir ve tazeliği korunur.",
    variants: [
      {
        skuId: "sku-cilek-500g",
        label: "500 g",
        grams: 500,
        producerBasePrice: TRY(55),
        stock: 9,
      },
      {
        skuId: "sku-cilek-1kg",
        label: "1 kg",
        grams: 1000,
        producerBasePrice: TRY(105),
        stock: 3,
      },
    ],
  },
];

export const getProductBySlug = (slug: string): Product | undefined => {
  return PRODUCTS.find((p) => p.slug === slug);
};
