import type { Money } from "@/lib/types";
import { formatTRY } from "@/lib/money";
import { Card, CardContent, CardHeader } from "@/components/ui/Card";
import { Divider } from "@/components/ui/Divider";

export function OrderSummary({
  itemsSubtotal,
  shippingFee,
  discountsTotal,
  payableTotal,
}: {
  itemsSubtotal: Money;
  shippingFee: Money;
  discountsTotal: Money;
  payableTotal: Money;
}) {
  return (
    <Card>
      <CardHeader>
        <div className="text-sm font-semibold text-neutral-900">Sipariş Özeti</div>
        <div className="mt-1 text-xs text-neutral-600">
          Ürün Liste Fiyatı + Kargo Ücreti - İndirimler = Nihai Ödeme
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3 text-sm">
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">Ürün Liste Fiyatı</span>
            <span className="font-medium text-neutral-900">{formatTRY(itemsSubtotal)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">Kargo Ücreti</span>
            <span className="font-medium text-neutral-900">{formatTRY(shippingFee)}</span>
          </div>
          <div className="flex items-center justify-between">
            <span className="text-neutral-600">İndirimler</span>
            <span className="font-medium text-emerald-700">
              -{formatTRY(discountsTotal)}
            </span>
          </div>
          <Divider />
          <div className="flex items-center justify-between">
            <span className="font-semibold text-neutral-900">Nihai Ödeme</span>
            <span className="text-base font-semibold text-neutral-900">
              {formatTRY(payableTotal)}
            </span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
