import { CATEGORIES } from "@/lib/catalog";
import { prisma } from "@/lib/prisma";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { ProductCard } from "@/components/catalog/ProductCard";
import { HeroBanner } from "@/components/catalog/HeroBanner";
import { CategoryGrid } from "@/components/catalog/CategoryGrid";

export default async function Home() {
  const dbProducts = await prisma.product.findMany({ include: { producer: true, skus: true } });

  const products = dbProducts.map((p) => ({
    id: String(p.id),
    slug: p.slug,
    title: p.name,
    subtitle: undefined,
    imageUrl: p.image ?? "/images/placeholder.svg",
    category: (p.category as any) || "taze-sebze",
    badges: [] as unknown as import("@/lib/types").ProductBadgeKind[],
    producer: { id: `producer-${p.producerId ?? "0"}`, name: p.producer?.name ?? "", city: "" },
    description: p.description ?? "",
    variants: p.skus.map(sku => ({
      skuId: sku.skuId,
      label: sku.label,
      grams: sku.grams,
      producerBasePrice: { currency: "TRY", amount: sku.priceCents / 100 } as import("@/lib/types").Money,
      stock: sku.stock,
    })),
  }));

  const featuredSeasonal = products.filter((p) => p.variants.some((v) => v.stock > 0));

  return (
    <div className="flex flex-col">
      <HeroBanner />

      <Container className="py-8">
        <SectionTitle
          title="Kategoriler"
          subtitle="Taze Sebze, Taze Meyve, Sera Ürünleri, Doğal Tarım Ürünleri"
        />
        <div className="mt-4">
          <CategoryGrid />
        </div>

        <div id="mevsimlik" className="mt-10">
          <SectionTitle
            title="Öne Çıkan Mevsimlik Ürünler"
            subtitle="Mevsiminde yetişen, stoktan hızlı çıkan ürünler"
          />
          <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {featuredSeasonal.map((p) => (
              <ProductCard key={p.id} product={p} />
            ))}
          </div>
        </div>

        {CATEGORIES.map((c) => {
          const items = products.filter((p) => p.category === c.slug);
          return (
            <div key={c.slug} id={`category-${c.slug}`} className="mt-12">
              <SectionTitle title={c.title} subtitle="Üreticiden doğrudan" />
              <div className="mt-4 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {items.map((p) => (
                  <ProductCard key={p.id} product={p} />
                ))}
              </div>
            </div>
          );
        })}
      </Container>
    </div>
  );
}
