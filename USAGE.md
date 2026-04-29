# Mevsim Kapıda — Kullanım Kılavuzu

Bu dosya projeyi yerelde çalıştırmayı, ana ekranları kullanmayı, admin/satıcı akışlarını ve SQLite/Prisma veritabanını yönetmeyi adım adım anlatır.

## 1) Hızlı Başlangıç

1. Bağımlılıkları kurun:

```bash
npm install
```

2. Geliştirme sunucusunu başlatın:

```bash
npm run dev
```

3. Tarayıcıdan açın:

```text
http://localhost:3000
```

## 2) Ortam ve Veritabanı

- `.env` dosyasında `DATABASE_URL=file:./dev.db` bulunur.
- SQLite veritabanı proje kökünde `dev.db` olarak oluşur.
- Şema değiştiğinde şu komutları çalıştırın:

```bash
npx prisma db push
npx prisma generate
```

## 3) İlk Veri Yükleme (Seed)

Sistemdeki örnek ürünler `src/lib/catalog.ts` içinden veritabanına taşınır.

1. Dev sunucunun açık olduğundan emin olun.
2. Seed endpoint'ini çağırın:

PowerShell:
```powershell
Invoke-RestMethod -Method Post -Uri http://localhost:3000/api/db/seed-products -ContentType 'application/json' -Body '{}'
```

curl:
```bash
curl -X POST http://localhost:3000/api/db/seed-products
```

Seed işlemi şu kayıtları oluşturur:
- `Producer`
- `Product`
- `Sku`

## 4) Müşteri (Mağaza) Kullanımı

### Ana sayfa

- Adres: `http://localhost:3000/`
- Kategoriler ve öne çıkan ürünler burada görünür.
- Ürün kartına tıklayarak detay sayfasına geçersiniz.

### Ürün detay

- Adres: `http://localhost:3000/product/{slug}`
- Ürün açıklaması, fiyatı ve varyantları görüntülenir.
- Sepete ekleme işlemleri bu sayfada başlatılır.

### Sepet ve ödeme

- Sepet: `http://localhost:3000/cart`
- Ödeme: `http://localhost:3000/checkout`
- Sepet miktarları, teslimat ve ödeme özetini burada kontrol edersiniz.

### Abonelik

- Adres: `http://localhost:3000/subscription`
- MVP abonelik planları ve teklif mantığı bu sayfada yer alır.

## 5) Admin Kullanımı

### Kullanıcı yönetimi

- Adres: `http://localhost:3000/admin`
- Kullanıcı rolü oluşturma/silme işlemleri için kullanılır.
- Roller: `ADMIN`, `USER`, `SELLER`.

### Ürün yönetimi

- Adres: `http://localhost:3000/admin/products`
- Bu sayfada ürünleri listeleyebilir, yeni ürün oluşturabilir ve silebilirsiniz.

Ürün oluştururken:
- `name`: ürün adı
- `slug`: benzersiz URL anahtarı
- `price`: TRY cinsinden fiyat (ör. `12.5`)
- `image`: ürün görsel yolu veya URL'si
- `category`: ürün kategorisi
- `producer`: ilişkili üretici

Notlar:
- Ürün oluşturulunca storefront tarafında anında görünür.
- Ürünler DB üzerinden okunur; sayfa yenilemesi gerekmez.

### Üreticiler

- Admin tarafında üretici kaydı oluşturulabilir.
- Üretici kayıtları `producer` tablosunda saklanır.
- Üretici detayları ürünlerle ilişkilendirilir.

## 6) Satıcı / Üretici Kullanımı

### Satıcı paneli

- Adres: `http://localhost:3000/producer`
- Üretici olarak kayıt olabilir, ürün ekleyebilir ve stok akışını yönetebilirsiniz.

Satıcı akışının mantığı:
1. `register` ile üretici kaydı oluşturulur.
2. Bu kaydın `producerId` bilgisi yerelde saklanır.
3. Ürün ekleme işlemi `ProducerProvider` üzerinden admin ürün API'sine gider.
4. SKU stok güncellemeleri SKU API'sine yazılır.

### Satıcı sayfasında neler yapılır?

- Yeni üretici kaydı açma
- Ürün ekleme
- Varyant/stok görüntüleme ve güncelleme

## 7) API Özeti

### Ürün API'leri

- `GET /api/products`
  - Tüm ürünleri döner.
  - Filtreler: `?category=...`, `?producerId=...`

- `GET /api/products/[slug]`
  - Slug'a göre tek ürün döner.

- `POST /api/db/seed-products`
  - Örnek katalog verisini DB'ye aktarır.

### Admin API'leri

- `GET /api/admin/products`
- `POST /api/admin/products`
- `PATCH /api/admin/products/[id]`
- `DELETE /api/admin/products/[id]`

- `GET /api/admin/producers`
- `POST /api/admin/producers`
- `GET /api/admin/producers/[id]`

- `GET /api/admin/skus?skuId=...`
- `PATCH /api/admin/skus/[id]`

### Kullanıcı API'leri

- `GET /api/users`
- `POST /api/users`
- `DELETE /api/users/[id]`

## 8) Önemli Dosyalar

- `src/lib/prisma.ts` — Prisma client tanımı
- `src/lib/catalog.ts` — seed için örnek katalog
- `src/providers/producer/ProducerProvider.tsx` — satıcı akışı
- `src/app/admin/products/page.tsx` — admin ürün ekranı
- `src/app/product/[slug]/page.tsx` — ürün detay sayfası
- `prisma/schema.prisma` — veritabanı modeli

## 9) Sorun Giderme

### Prisma client değiştiyse

```bash
npx prisma db push
npx prisma generate
```

### Seed 500 hatası verirse

- Dev server'ı kapatıp tekrar açın.
- Sonra seed endpoint'ini yeniden çağırın.

```bash
npm run dev
```

### DB dosyası oluşmadıysa

- `.env` içindeki `DATABASE_URL=file:./dev.db` değerini kontrol edin.
- Ardından `npx prisma db push` çalıştırın.

## 10) Güvenlik Notu

Bu sürümde admin ve satıcı endpoint'lerinde kimlik doğrulama yoktur. Gerçek yayına geçmeden önce auth katmanı ekleyin ve yetkisiz erişimi kapatın.

---

İsterseniz bir sonraki adımda bu kılavuza ekran görüntüsü mantığında “hangi sayfada ne var” bölümü de ekleyebilirim.
