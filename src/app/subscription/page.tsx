"use client";

import * as React from "react";
import { Container } from "@/components/ui/Container";
import { SectionTitle } from "@/components/ui/SectionTitle";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { formatTRY, TRY } from "@/lib/money";
import { PlanCard, type SubscriptionPlan } from "@/components/subscription/PlanCard";

type Period = "WEEKLY" | "MONTHLY";

const PLANS: SubscriptionPlan[] = [
  {
    id: "sebze",
    title: "Sebze Kutusu",
    description: "Haftalık / aylık taze sebze seçkisi",
    imageUrl: "/images/box-sebze.svg",
    highlights: ["Mevsiminde içerik", "SKU bazlı planlama (MVP)", "Kapıya teslim"],
    weeklyPriceTRY: 349,
    monthlyPriceTRY: 1299,
  },
  {
    id: "meyve",
    title: "Meyve Kutusu",
    description: "Haftalık / aylık taze meyve seçkisi",
    imageUrl: "/images/box-meyve.svg",
    highlights: ["Tatlı & dengeli seçki", "Soğuk zincir paketleme", "Kapıya teslim"],
    weeklyPriceTRY: 399,
    monthlyPriceTRY: 1499,
  },
  {
    id: "karisik",
    title: "Karışık Kutu",
    description: "Sebze + meyve karışımı",
    imageUrl: "/images/box-karisik.svg",
    highlights: ["Dengeli içerik", "Sera + mevsiminde", "Kapıya teslim"],
    weeklyPriceTRY: 379,
    monthlyPriceTRY: 1399,
  },
];

export default function SubscriptionPage() {
  const [selectedPlanId, setSelectedPlanId] = React.useState<SubscriptionPlan["id"]>(
    "sebze",
  );
  const [period, setPeriod] = React.useState<Period>("WEEKLY");
  const [status, setStatus] = React.useState<"IDLE" | "SUCCESS">("IDLE");

  const selectedPlan = PLANS.find((p) => p.id === selectedPlanId)!;
  const price = period === "WEEKLY" ? selectedPlan.weeklyPriceTRY : selectedPlan.monthlyPriceTRY;

  return (
    <Container className="py-8">
      <SectionTitle
        title="Abonelik Modeli"
        subtitle="Haftalık veya aylık periyotlarla düzenli teslimat"
      />

      <div className="mt-6 grid gap-6 lg:grid-cols-[1fr_360px]">
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {PLANS.map((p) => (
            <PlanCard
              key={p.id}
              plan={p}
              selected={p.id === selectedPlanId}
              onSelect={() => {
                setSelectedPlanId(p.id);
                setStatus("IDLE");
              }}
            />
          ))}
        </div>

        <div className="space-y-4">
          <Card>
            <CardHeader>
              <div className="text-sm font-semibold text-neutral-900">Periyot Seçimi</div>
              <div className="mt-1 text-xs text-neutral-600">
                Haftalık veya aylık teslimat planı.
              </div>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setPeriod("WEEKLY")}
                  className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                    period === "WEEKLY"
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-neutral-200 bg-white hover:bg-neutral-50"
                  }`}
                >
                  <div className="font-semibold text-neutral-900">Haftalık</div>
                  <div className="mt-1 text-xs text-neutral-600">Her hafta 1 gönderim</div>
                </button>
                <button
                  type="button"
                  onClick={() => setPeriod("MONTHLY")}
                  className={`rounded-xl border p-3 text-left text-sm transition-colors ${
                    period === "MONTHLY"
                      ? "border-neutral-900 bg-neutral-50"
                      : "border-neutral-200 bg-white hover:bg-neutral-50"
                  }`}
                >
                  <div className="font-semibold text-neutral-900">Aylık</div>
                  <div className="mt-1 text-xs text-neutral-600">Ayda 4 gönderim (MVP)</div>
                </button>
              </div>

              <div className="mt-4 rounded-xl border border-neutral-200 bg-white p-3">
                <div className="text-xs font-semibold text-neutral-600">Seçim</div>
                <div className="mt-1 text-sm font-semibold text-neutral-900">
                  {selectedPlan.title} • {period === "WEEKLY" ? "Haftalık" : "Aylık"}
                </div>
                <div className="mt-2 flex items-center justify-between text-sm">
                  <span className="text-neutral-600">Tutar</span>
                  <span className="font-semibold text-neutral-900">{formatTRY(TRY(price))}</span>
                </div>
              </div>

              <Button
                className="mt-4 w-full"
                onClick={() => {
                  setStatus("SUCCESS");
                }}
              >
                Aboneliği Başlat
              </Button>

              {status === "SUCCESS" ? (
                <div className="mt-3 rounded-xl border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-800">
                  Abonelik talebin alındı (MVP). Teslimat planı üretici stoklarına göre
                  oluşturulacak.
                </div>
              ) : null}
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <div className="text-sm font-semibold text-neutral-900">Not</div>
              <div className="mt-1 text-xs text-neutral-600">
                Bu sayfa satın alma arayüzü MVP’sidir.
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-sm text-neutral-700">
                Ödeme ve adres akışı, marketplace checkout akışıyla birleştirilebilir.
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </Container>
  );
}
