import type { ProductBadgeKind } from "@/lib/types";
import { Badge } from "@/components/ui/Badge";

const labelMap: Record<ProductBadgeKind, string> = {
  MEVSIMINDE: "Mevsiminde",
  SERA: "Sera",
};

const classMap: Record<ProductBadgeKind, string> = {
  MEVSIMINDE: "border-emerald-200 bg-emerald-50 text-emerald-800",
  SERA: "border-sky-200 bg-sky-50 text-sky-800",
};

export function ProductBadges({ badges }: { badges: ProductBadgeKind[] }) {
  if (!badges?.length) return null;
  return (
    <div className="flex flex-wrap gap-2">
      {badges.map((b) => (
        <Badge key={b} className={classMap[b]}>
          {labelMap[b]}
        </Badge>
      ))}
    </div>
  );
}
