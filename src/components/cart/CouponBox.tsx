"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";
import type { Promotion } from "@/lib/types";
import { promoFromCode } from "@/lib/pricing";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";

export function CouponBox({
  promotions,
  setPromotions,
}: {
  promotions: Promotion[];
  setPromotions: (p: Promotion[]) => void;
}) {
  const [code, setCode] = React.useState("");
  const [message, setMessage] = React.useState<string | null>(null);

  const apply = () => {
    const promo = promoFromCode(code);
    if (!promo) {
      setMessage("Kupon bulunamadı. Örn: FIRST10, SAVE20, FREESHIP");
      return;
    }
    setPromotions([promo]);
    setMessage("Kupon uygulandı.");
  };

  const clear = () => {
    setPromotions([]);
    setCode("");
    setMessage(null);
  };

  return (
    <Card>
      <CardHeader>
        <div className="text-sm font-semibold text-emerald-900">Kupon / Kampanya</div>
        <div className="mt-1 text-xs text-emerald-600">
          İlk sipariş indirimi, ücretsiz kargo veya yüzdelik indirim.
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex gap-2">
          <Input
            placeholder="Kupon kodu"
            value={code}
            onChange={(e) => setCode(e.target.value)}
          />
          <Button type="button" onClick={apply}>
            Uygula
          </Button>
        </div>
        <div className="mt-2 flex items-center justify-between">
          <div className="text-xs text-emerald-600">
            {promotions.length ? "Aktif kampanya: " : ""}
            {promotions.length ? (
              <span className="font-medium text-emerald-900">
                {(() => {
                  const p = promotions[0];
                  if (p.kind === "FREE_SHIPPING") return "Ücretsiz Kargo";
                  if (p.kind === "PERCENT" || p.kind === "FIRST_ORDER_PERCENT")
                    return `%${p.percent} İndirim`;
                  return "Kampanya";
                })()}
              </span>
            ) : (
              <span>Yok</span>
            )}
          </div>
          {promotions.length ? (
            <button
              type="button"
              onClick={clear}
              className="text-xs font-medium text-emerald-700 hover:text-emerald-900"
            >
              Temizle
            </button>
          ) : null}
        </div>
        {message ? <div className="mt-2 text-xs text-emerald-600">{message}</div> : null}
      </CardContent>
    </Card>
  );
}
