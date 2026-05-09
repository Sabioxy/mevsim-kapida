# Mevsim Kapıda - E-Ticaret Platformu

Mevsim Kapıda, doğrudan sera üreticilerinden taze ürünlerin satıldığı, stok kontrollü, JWT yetkilendirmeli ve entegre ödeme (mock) sistemine sahip uçtan uca bir e-ticaret platformudur. Proje **Next.js 14/15**, **Prisma**, **SQLite** ve **TailwindCSS (v4)** üzerine inşa edilmiştir.

## Özellikler

- **Gelişmiş Sepet ve Ödeme Sistemi**: `CartProvider` ile dinamik sepet yönetimi, kredi kartı entegrasyonlu (sanal) ödeme akışı.
- **Stok Kontrolü**: Sipariş tamamlandığında Prisma Transaction ile güvenli stok (SKU) düşümü.
- **Güvenli Kimlik Doğrulama**: `jose` kullanılarak şifrelenmiş JWT ve `HttpOnly` çerez tabanlı oturum yönetimi.
- **Dinamik Veritabanı**: Statik dosya bağımlılığı olmadan ürünler ve varyantlar tamamen SQLite üzerinden beslenir.
- **Premium Tasarım**: `emerald` (zümrüt yeşili) ve beyaz tonları ağırlıklı, dönüşüm odaklı modern UI arayüzü.

---

## 🚀 Kurulum (Github'dan Klonladıktan Sonra İzlenecek Adımlar)

Projeyi bilgisayarınıza indirdikten sonra eksiksiz bir şekilde ayağa kaldırmak için aşağıdaki adımları **sırasıyla** uygulayın.

### 1. Bağımlılıkları Yükleyin
Proje dizininde terminali açın ve gerekli Node modüllerini kurun:
```bash
npm install
```

### 2. Veritabanını Hazırlayın (Prisma + SQLite)
Projeyi ilk indirdiğinizde `.db` dosyası mevcut olmayabilir. Veritabanı şemasını oluşturmak ve Prisma Client'ı senkronize etmek için:
```bash
npx prisma db push
```
*(Bu komut `dev.db` adında yerel bir SQLite veritabanı oluşturacaktır.)*

### 3. Geliştirme Sunucusunu Başlatın
Veritabanı hazır olduktan sonra uygulamayı çalıştırın:
```bash
npm run dev
```
Uygulama `http://localhost:3000` adresinde ayağa kalkacaktır.

### 4. Örnek Ürünleri Veritabanına Yükleyin (Seed)
Veritabanı şu an boş olduğu için katalogda ürün göremeyeceksiniz. Örnek ürünleri yüklemek için, **sunucu çalışırken** yeni bir terminal açıp aşağıdaki komutu çalıştırın (veya tarayıcınızda gizli sekmeden bu adrese bir POST/GET isteği atın):
```bash
curl -X POST http://localhost:3000/api/db/seed-products
```
*(Bu işlem tamamlandıktan sonra anasayfada ve katalogda ürünleri görebilirsiniz.)*

---

## 🧪 Test İşlemleri ve Kullanım Kılavuzu

### 💳 Ödeme Testi (Sanal POS)
Ödeme sayfasında gerçek bir ödeme geçidi gibi davranan bir State Machine bulunur. İşlemleri test etmek için aşağıdaki kredi kartı numaralarını kullanabilirsiniz (AA/YY ve CVC değerlerine rastgele rakamlar girebilirsiniz):

- **Başarılı Çekim:** `4242 4242 4242 4242`
- **Yetersiz Bakiye Hatası:** `4000 0000 0000 0000`
- **Kart Reddedildi Hatası:** `4111 0000 0000 0000`

Başarılı ödemeler sonrasında `npx prisma studio` komutuyla veritabanına bakarak `Order` tablosuna kaydın düştüğünü ve alınan `Sku` stokunun otomatik azaldığını doğrulayabilirsiniz.

### 🔐 Kimlik Doğrulama Testi
Menüden **Giriş** sayfasına giderek herhangi bir şifre olmadan e-posta ve isimle, istediğiniz rolde (`ADMIN`, `SELLER`, `USER`) giriş yapabilirsiniz. Giriş yaptıktan sonra sistem size güvenli bir `HttpOnly` Cookie atayacaktır. Çıkış yapana kadar oturumunuz sunucu tarafından güvenle saklanır.

---

## 🆕 Yeni Eklenen Özellikler (Phase 1-5)

Son güncellemelerle birlikte projeye aşağıdaki profesyonel özellikler dahil edilmiştir:

- **Sipariş Takip Sistemi:** Hem Adminler için genel sipariş yönetimi hem de kullanıcılar için kişisel sipariş geçmişi sayfası.
- **Üretici (Seller) Dashboard:** Satıcı rolündeki kullanıcılar için otomatik profil oluşturma ve sadece kendi ürünlerini/siparişlerini yönettikleri özel panel.
- **Gelişmiş Arama:** Navbar üzerinden ürün ismi veya açıklamasına göre anlık arama desteği.
- **Yorum ve Puanlama:** Ürün detay sayfasında kullanıcıların 1-5 arası puan verebildiği ve yorum yapabildiği interaktif alan.
- **SEO ve Performans:** Dinamik meta tagler (generateMetadata) ve özel yükleme (loading.tsx) ekranları.

---

## 🛠️ Teknolojiler
- **Framework:** Next.js (App Router)
- **Veritabanı:** Prisma ORM & SQLite
- **Stil:** Tailwind CSS v4
- **Auth:** `jose` (JWT)
- **Tarih Yönetimi:** `date-fns`

---

## ⚙️ Uygulamayı Çalıştırma (Adım Adım)

Projeyi ilk kez çalıştıracaksanız veya hata alıyorsanız şu sırayı takip edin:

1. **Terminali Açın:** VS Code kullanıyorsanız `Ctrl + "` (veya Terminal -> New Terminal) ile terminali açın.
2. **Paketleri Kurun:**
   ```bash
   npm install
   ```
3. **Veritabanını Güncelleyin:** Eğer veritabanı hatası alıyorsanız şemayı push edin:
   ```bash
   npx prisma db push
   ```
4. **Uygulamayı Başlatın:**
   ```bash
   npm run dev
   ```
5. **Tarayıcı:** `http://localhost:3000` adresine gidin.

**Not:** Eğer "Sayfa bulunamadı" veya "Ürün yok" diyorsa, yukarıdaki `seed-products` adımını (Adım 4) uygulayarak örnek verileri yüklemeyi unutmayın.
