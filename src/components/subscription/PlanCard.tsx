"use client";

import Image from "next/image";
import { cn } from "@/lib/utils";
import { Card, CardContent } from "@/components/ui/Card";

export type SubscriptionPlan = {
  id: "sebze" | "meyve" | "karisik";
  title: string;
  description: string;
  imageUrl: string;
  highlights: string[];
  weeklyPriceTRY: number;
  monthlyPriceTRY: number;
};

export function PlanCard({
  plan,
  selected,
  onSelect,
}: {
  plan: SubscriptionPlan;
  selected: boolean;
  onSelect: () => void;
}) {
  return (
    <button type="button" onClick={onSelect} className="text-left">
      <Card
        className={cn(
          "overflow-hidden transition-colors",
          selected ? "border-emerald-900" : "hover:bg-emerald-50",
        )}
      >
        <div className="relative aspect-[4/3] bg-emerald-50">
          <Image
            src={plan.imageUrl}
            alt={plan.title}
            fill
            className="object-cover"
            sizes="(max-width: 768px) 100vw, 33vw"
          />
        </div>
        <CardContent className="pt-4">
          <div className="flex items-start justify-between gap-3">
            <div>
              <div className="text-sm font-semibold text-emerald-900">{plan.title}</div>
              <div className="mt-1 text-xs text-emerald-600">{plan.description}</div>
            </div>
            <div
              className={cn(
                "mt-0.5 h-4 w-4 rounded-full border",
                selected ? "border-emerald-900 bg-emerald-900" : "border-emerald-300",
              )}
            />
          </div>

          <div className="mt-3 grid gap-1">
            {plan.highlights.map((h) => (
              <div key={h} className="text-xs text-emerald-700">
                • {h}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </button>
  );
}
