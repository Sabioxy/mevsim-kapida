"use client";

import * as React from "react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { AuthGate } from "@/components/auth/AuthGate";
import Link from "next/link";
import { type AuthSession } from "@/lib/auth";

export default function ProfilePage() {
  // Kullanıcıya özel adres/bilgi localStorage'dan oku
  const [userAddressInfo, setUserAddressInfo] = React.useState<any>(null);
  const [session, setSession] = React.useState<AuthSession | null>(null);
  const [loading, setLoading] = React.useState(true);

  // Form states
  const [name, setName] = React.useState("");
  const [email, setEmail] = React.useState("");
  const [phone, setPhone] = React.useState("");
  const [city, setCity] = React.useState("");
  const [district, setDistrict] = React.useState("");
  const [addressLine, setAddressLine] = React.useState("");

  // Card details states
  const [cardHolderName, setCardHolderName] = React.useState("");
  const [cardNumber, setCardNumber] = React.useState("");
  const [expiryMonth, setExpiryMonth] = React.useState("");
  const [expiryYear, setExpiryYear] = React.useState("");
  const [cvc, setCvc] = React.useState("");

  const [saveLoading, setSaveLoading] = React.useState(false);
  const [saveSuccess, setSaveSuccess] = React.useState(false);
  const [saveError, setSaveError] = React.useState<string | null>(null);

  React.useEffect(() => {
    // 1. Load from localStorage
    let localAddress: any = null;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("userAddressInfo");
      if (saved) {
        localAddress = JSON.parse(saved);
        setUserAddressInfo(localAddress);
        if (localAddress.phone) setPhone(localAddress.phone);
        if (localAddress.district) setDistrict(localAddress.district);
        if (localAddress.addressLine) setAddressLine(localAddress.addressLine);
      }

      const savedCard = localStorage.getItem("userCardInfo");
      if (savedCard) {
        const parsed = JSON.parse(savedCard);
        if (parsed.cardHolderName) setCardHolderName(parsed.cardHolderName);
        if (parsed.cardNumber) setCardNumber(parsed.cardNumber);
        if (parsed.expiryMonth) setExpiryMonth(parsed.expiryMonth);
        if (parsed.expiryYear) setExpiryYear(parsed.expiryYear);
        if (parsed.cvc) setCvc(parsed.cvc);
      }
    }

    // 2. Fetch profile from DB
    fetch("/api/profile")
      .then((res) => res.json())
      .then((data) => {
        if (data.user) {
          setName(data.user.name || "");
          setEmail(data.user.email || "");
          setCity(data.user.city || localAddress?.city || "");
        }
      })
      .catch(() => {});

    // 3. Fetch session
    fetch("/api/auth/session")
      .then((res) => res.json())
      .then((data) => {
        setSession(data);
        setLoading(false);
      })
      .catch(() => setLoading(false));
  }, []);

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaveLoading(true);
    setSaveSuccess(false);
    setSaveError(null);

    try {
      // 1. Update database profile
      const response = await fetch("/api/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, city }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Profil güncellenemedi");
      }

      // 2. Update localStorage userAddressInfo
      const updatedAddress = {
        fullName: name,
        phone,
        email,
        city,
        district,
        addressLine,
      };
      localStorage.setItem("userAddressInfo", JSON.stringify(updatedAddress));
      setUserAddressInfo(updatedAddress);

      // 3. Update localStorage userCardInfo
      const updatedCard = {
        cardHolderName,
        cardNumber,
        expiryMonth,
        expiryYear,
        cvc,
      };
      localStorage.setItem("userCardInfo", JSON.stringify(updatedCard));

      // 4. Update session locally
      if (session) {
        setSession({
          ...session,
          name,
          email,
        });
      }

      setSaveSuccess(true);
      setTimeout(() => setSaveSuccess(false), 3000);
    } catch (err: any) {
      setSaveError(err.message || "Bir hata oluştu");
    } finally {
      setSaveLoading(false);
    }
  };

  if (loading) return <Container className="py-20 text-center">Yükleniyor...</Container>;

  return (
    <AuthGate allowedRoles={["USER", "SELLER", "ADMIN"]}>
      <Container className="py-8">
        <SectionTitle title="Profilim" subtitle="Hesap bilgilerinizi yönetin" />

        <div className="mt-8 grid gap-8 lg:grid-cols-3">
          <Card className="lg:col-span-1 border-emerald-100">
            <CardHeader className="bg-emerald-50/50 border-b border-emerald-100 text-center py-8">
              <div className="mx-auto h-20 w-20 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-800 text-2xl font-bold border-2 border-white shadow-sm">
                {session?.name?.charAt(0).toUpperCase()}
              </div>
              <h3 className="mt-4 font-bold text-emerald-950">{session?.name}</h3>
              <p className="text-xs text-emerald-600 uppercase font-bold tracking-widest">{session?.role}</p>
            </CardHeader>
            <CardContent className="p-6 space-y-4">
              <div className="space-y-1">
                <label className="text-[10px] font-bold text-emerald-400 uppercase">E-posta</label>
                <div className="text-sm font-medium text-emerald-900">{session?.email}</div>
              </div>
              <Button variant="secondary" className="w-full text-xs" onClick={() => fetch("/api/auth/logout", { method: "POST" }).then(() => window.location.href = "/")}>
                Oturumu Kapat
              </Button>
            </CardContent>
          </Card>

          <div className="lg:col-span-2 space-y-6">
            <Card className="border-emerald-100">
              <CardHeader className="border-b border-emerald-50">
                <h4 className="font-bold text-emerald-950">Hızlı İşlemler</h4>
              </CardHeader>
              <CardContent className="p-6 grid gap-4 sm:grid-cols-2">
                <Link href="/profile/orders" className="group">
                  <div className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-50 bg-emerald-50/20 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                    <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-emerald-100 text-emerald-600">
                      📦
                    </div>
                    <div>
                      <div className="font-bold text-sm text-emerald-950">Siparişlerim</div>
                      <div className="text-xs text-emerald-500">Sipariş durumlarını takip et</div>
                    </div>
                  </div>
                </Link>

                {session?.role === "SELLER" && (
                  <Link href="/seller" className="group">
                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-50 bg-emerald-50/20 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-emerald-100 text-emerald-600">
                        🏪
                      </div>
                      <div>
                        <div className="font-bold text-sm text-emerald-950">Mağaza Paneli</div>
                        <div className="text-xs text-emerald-500">Ürünlerini ve satışlarını yönet</div>
                      </div>
                    </div>
                  </Link>
                )}

                {session?.role === "ADMIN" && (
                  <Link href="/admin/orders" className="group">
                    <div className="flex items-center gap-4 p-4 rounded-2xl border border-emerald-50 bg-emerald-50/20 hover:border-emerald-200 hover:bg-emerald-50 transition-all">
                      <div className="h-10 w-10 rounded-full bg-white flex items-center justify-center border border-emerald-100 text-emerald-600">
                        🛡️
                      </div>
                      <div>
                        <div className="font-bold text-sm text-emerald-950">Yönetici Paneli</div>
                        <div className="text-xs text-emerald-500">Tüm sistemi kontrol et</div>
                      </div>
                    </div>
                  </Link>
                )}
              </CardContent>
            </Card>

            <Card className="border-emerald-100">
              <CardHeader className="border-b border-emerald-50 bg-emerald-50/10">
                <h4 className="font-bold text-emerald-950">Kayıtlı Teslimat Bilgilerim</h4>
              </CardHeader>
              <CardContent className="p-6">
                {userAddressInfo ? (
                  <div className="space-y-1 text-sm">
                    <div><span className="font-bold">Ad Soyad:</span> {userAddressInfo.fullName}</div>
                    <div><span className="font-bold">Telefon:</span> {userAddressInfo.phone}</div>
                    <div><span className="font-bold">E-posta:</span> {userAddressInfo.email}</div>
                    <div><span className="font-bold">Şehir:</span> {userAddressInfo.city}</div>
                    <div><span className="font-bold">İlçe:</span> {userAddressInfo.district}</div>
                    <div><span className="font-bold">Adres:</span> {userAddressInfo.addressLine}</div>
                  </div>
                ) : (
                  <div className="text-emerald-500 text-xs italic">Henüz kayıtlı teslimat bilginiz yok.</div>
                )}
              </CardContent>
            </Card>

            <Card className="border-emerald-100">
              <CardHeader className="border-b border-emerald-50 bg-emerald-50/10">
                <h4 className="font-bold text-emerald-950">Abonelik Durumu</h4>
              </CardHeader>
              <CardContent className="p-6">
                {session?.subscriptionStatus === "ACTIVE" ? (
                  <div className="flex items-center justify-between">
                    <div>
                      <div className="font-bold text-emerald-900">{session.subscriptionPlan === "sebze" ? "Sebze Kutusu" : session.subscriptionPlan === "meyve" ? "Meyve Kutusu" : "Karışık Kutu"}</div>
                      <div className="text-xs text-emerald-600">Durum: <span className="font-bold text-emerald-700">AKTİF</span></div>
                    </div>
                    <div className="text-2xl">🌿</div>
                  </div>
                ) : (
                  <div className="text-center py-2">
                    <p className="text-sm text-emerald-600 italic">Aktif bir aboneliğiniz bulunmuyor.</p>
                    <Link href="/subscription">
                      <Button variant="ghost" className="mt-2 text-xs text-emerald-700 underline">Planları Keşfet</Button>
                    </Link>
                  </div>
                )}
              </CardContent>
            </Card>

            <Card className="border-emerald-100">
              <CardHeader className="border-b border-emerald-50">
                <h4 className="font-bold text-emerald-950">Hesap Ayarları</h4>
              </CardHeader>
              <CardContent className="p-6">
                <form onSubmit={handleSaveProfile} className="space-y-6">
                  {/* Address Section */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider border-b border-emerald-50 pb-2">Teslimat & İletişim Bilgileri</h5>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-emerald-700 uppercase">Ad Soyad</label>
                        <input
                          type="text"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className="w-full h-10 rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 text-sm focus:border-emerald-500 outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-emerald-700 uppercase">E-posta</label>
                        <input
                          type="email"
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
                          className="w-full h-10 rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 text-sm focus:border-emerald-500 outline-none transition-all"
                          required
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-emerald-700 uppercase">Telefon</label>
                        <input
                          type="text"
                          value={phone}
                          onChange={(e) => setPhone(e.target.value)}
                          placeholder="05xx xxx xx xx"
                          className="w-full h-10 rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 text-sm focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-emerald-700 uppercase">Şehir</label>
                        <input
                          type="text"
                          value={city}
                          onChange={(e) => setCity(e.target.value)}
                          className="w-full h-10 rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 text-sm focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-emerald-700 uppercase">İlçe</label>
                        <input
                          type="text"
                          value={district}
                          onChange={(e) => setDistrict(e.target.value)}
                          className="w-full h-10 rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 text-sm focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-emerald-700 uppercase">Adres</label>
                        <textarea
                          value={addressLine}
                          onChange={(e) => setAddressLine(e.target.value)}
                          placeholder="Mahalle, sokak, bina no, daire..."
                          rows={3}
                          className="w-full rounded-xl border border-emerald-100 bg-emerald-50/30 p-3 text-sm focus:border-emerald-500 outline-none transition-all resize-none"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Card Section */}
                  <div className="space-y-4">
                    <h5 className="text-xs font-bold text-emerald-800 uppercase tracking-wider border-b border-emerald-50 pb-2">Kayıtlı Ödeme Kartı</h5>
                    <div className="grid gap-4 sm:grid-cols-2">
                      <div className="sm:col-span-2 space-y-1">
                        <label className="text-xs font-bold text-emerald-700 uppercase">Kart Üzerindeki İsim</label>
                        <input
                          type="text"
                          value={cardHolderName}
                          onChange={(e) => setCardHolderName(e.target.value)}
                          placeholder="Örn: Ayşe Yılmaz"
                          className="w-full h-10 rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 text-sm focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="space-y-1">
                        <label className="text-xs font-bold text-emerald-700 uppercase">Kart Numarası</label>
                        <input
                          type="text"
                          value={cardNumber}
                          onChange={(e) => {
                            let val = e.target.value.replace(/\D/g, "").slice(0, 16);
                            val = val.replace(/(.{4})/g, "$1 ").trim();
                            setCardNumber(val);
                          }}
                          placeholder="0000 0000 0000 0000"
                          className="w-full h-10 rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 text-sm focus:border-emerald-500 outline-none transition-all"
                        />
                      </div>
                      <div className="grid grid-cols-3 gap-2">
                        <div className="space-y-1 col-span-2">
                          <label className="text-xs font-bold text-emerald-700 uppercase">Son Kul. (AA/YY)</label>
                          <div className="flex gap-1">
                            <input
                              type="text"
                              value={expiryMonth}
                              onChange={(e) => setExpiryMonth(e.target.value.replace(/\D/g, "").slice(0, 2))}
                              placeholder="AA"
                              className="w-full h-10 rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 text-center text-sm focus:border-emerald-500 outline-none transition-all animate-none"
                            />
                            <input
                              type="text"
                              value={expiryYear}
                              onChange={(e) => setExpiryYear(e.target.value.replace(/\D/g, "").slice(0, 2))}
                              placeholder="YY"
                              className="w-full h-10 rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 text-center text-sm focus:border-emerald-500 outline-none transition-all animate-none"
                            />
                          </div>
                        </div>
                        <div className="space-y-1">
                          <label className="text-xs font-bold text-emerald-700 uppercase">CVC</label>
                          <input
                            type="text"
                            value={cvc}
                            onChange={(e) => setCvc(e.target.value.replace(/\D/g, "").slice(0, 3))}
                            placeholder="CVC"
                            className="w-full h-10 rounded-xl border border-emerald-100 bg-emerald-50/30 px-3 text-center text-sm focus:border-emerald-500 outline-none transition-all"
                          />
                        </div>
                      </div>
                    </div>
                  </div>

                  {saveError && (
                    <div className="text-xs text-rose-600 font-bold bg-rose-50 p-3 rounded-lg border border-rose-100">
                      {saveError}
                    </div>
                  )}

                  {saveSuccess && (
                    <div className="text-xs text-emerald-600 font-bold bg-emerald-50 p-3 rounded-lg border border-emerald-100">
                      Profil ve kart bilgileri başarıyla güncellendi!
                    </div>
                  )}

                  <div className="flex justify-end border-t border-emerald-50 pt-4">
                    <Button type="submit" disabled={saveLoading} className="h-10 px-6">
                      {saveLoading ? "Kaydediliyor..." : "Değişiklikleri Kaydet"}
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>
          </div>
        </div>
      </Container>
    </AuthGate>
  );
}
