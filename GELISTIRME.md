# Mevsim Kapıda — Geliştirme Notları

Bu proje şu an **SQLite + Prisma** ile çalışır.
- Veritabanı dosyası: `prisma/dev.db`
- Prisma config: `prisma.config.ts`
- Prisma şeması: `prisma/schema.prisma`
- Prisma client: `src/lib/prisma.ts`
- Admin API: `src/app/api/users/route.ts`
- Satıcı kayıt API: `src/app/api/users/[id]/route.ts`
- Admin sayfası: `/admin`
- Satıcı sayfası: `/seller`
- Eski üretici yolu: `/producer` artık `/seller` sayfasına yönlenir

Not: Ürün kataloğu şu an hâlâ mock TypeScript veri olarak duruyor (`src/lib/catalog.ts`). Sepet tarafı ise tarayıcı `localStorage` kullanıyor.

---

## 1) Projeyi Başlatma

### Kurulum

```bash
npm install
```

İlk kurulumdan sonra Prisma client ve SQLite dosyası otomatik hazırlanır. Gerekirse şu komutlar da çalıştırılabilir:

```bash
npx prisma db push
npx prisma generate
```

### Development (hot reload)

```bash
npm run dev
```

- Tarayıcıda: `http://localhost:3000`

### Lint

```bash
npm run lint
```

### Production build + start

```bash
npm run build
npm run start
```

---

## 2) Veritabanına Nasıl Ulaşılır?

Bu projede veritabanı olarak **SQLite** kullanılıyor.

### Bağlantı bilgisi
- `.env` içindeki `DATABASE_URL="file:./dev.db"`
- Prisma client bağlantısı: `src/lib/prisma.ts`
- Şema tanımı: `prisma/schema.prisma`

### SQLite dosyası nerede?
- Dosya: `prisma/dev.db`
- Bu dosya yerel geliştirme verisini tutar.

### Veriyi görüntüleme / düzenleme
1. Uygulamayı aç: `npm run dev`
2. Tarayıcıda `http://localhost:3000/admin` veya `http://localhost:3000/seller` sayfasına git
3. Formları kullanarak kayıt ekle veya sil
4. SQLite’ı doğrudan görmek için Prisma Studio aç:

```bash
npx prisma studio --config ./prisma.config.ts
```

5. Studio içinde `User` tablosunu düzenle

Notlar:
- SQLite dosyasını elle silersen uygulama boş bir veritabanı ile tekrar açılır.
- Şema değiştiriyorsan önce `npx prisma db push` çalıştır.

---

## 3) Veritabanı Verisi Nasıl Değiştirilir?

### A) UI üzerinden (önerilen)
- Admin: `/admin` sayfasından admin, kullanıcı veya satıcı kaydı oluştur/sil
- Satıcı: `/seller` sayfasından satıcı kaydı oluştur

### B) Prisma Studio ile direkt düzenleyerek
- `npx prisma studio --config ./prisma.config.ts`
- `User` kayıtlarını tabloda aç, düzenle, sil.

### C) Kod ile (kalıcı davranış değişikliği)
- Veritabanı şeması: `prisma/schema.prisma`
- Prisma client bağlantısı: `src/lib/prisma.ts`
- API üzerinden CRUD: `src/app/api/users/route.ts`
- Satıcı ve admin sayfalarının fetch ettiği endpoint: `/api/users`

### Sıfırlama
- SQLite verisini sıfırlamak için `prisma/dev.db` dosyasını silebilirsin.
- Alternatif olarak Prisma Studio’da kayıtları tek tek temizleyebilirsin.

---

## 4) Yönetim Sayfaları

### Admin sayfası
- Yol: `/admin`
- İşlev: admin, kullanıcı ve satıcı kaydı oluşturur
- Listeleme/silme: aynı sayfadan yapılır

### Satıcı sayfası
- Yol: `/seller`
- İşlev: satıcı kaydı oluşturur ve satıcıları listeler

### Üretici yolu
- Yol: `/producer`
- Bu yol geriye dönük uyumluluk için tutulur ve `/seller` sayfasına yönlenir.

---

## 5) Ürün Kataloğu (Mock Veri) Nereden Değiştirilir?

Bu proje şu an ürünleri **statik olarak** `src/lib/catalog.ts` dosyasından okur:
- `PRODUCTS`: ürün listesi
- `getProductBySlug(slug)`: ürün detay sayfası bunu kullanır

Örnek değişiklikler:
- Yeni ürün eklemek: `PRODUCTS` dizisine yeni obje ekle
- Stok bitirme: ilgili varyantta `stock: 0` yap
- Fiyat değiştirme: ilgili varyantta `producerBasePrice: TRY(…)` değerini güncelle

Uyarı:
- Bu veri “DB” değildir; build ile birlikte paketlenir.
- Gerçek DB’ye geçince bu dosya genelde “seed” veya “fixture” gibi kullanılır.

---

## 6) Proje Yapısı İçin Kısa Not

Önemli dosyalar:
- `prisma/schema.prisma`: SQLite şeması
- `prisma.config.ts`: Prisma CLI bağlantı ayarı
- `src/lib/prisma.ts`: uygulama içi Prisma client
- `src/app/api/users/route.ts`: kullanıcı CRUD API
- `src/app/admin/page.tsx`: admin paneli
- `src/app/seller/page.tsx`: satıcı paneli

İstersen sonraki adımda ürün kataloğunu da SQLite’a taşıyıp `src/lib/catalog.ts` dosyasını seed kaynağına çevirebilirim.
