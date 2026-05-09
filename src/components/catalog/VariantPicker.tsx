"use client";

import * as React from "react";
import type { SkuVariant } from "@/lib/types";
import { cn } from "@/lib/utils";

export function VariantPicker({
  variants,
  selectedSkuId,
  onChange,
}: {
  variants: SkuVariant[];
  selectedSkuId: string;
  onChange: (skuId: string) => void;
}) {
  return (
    <div className="grid grid-cols-2 gap-2">
      {variants.map((v) => {
        const selected = v.skuId === selectedSkuId;
        const disabled = v.stock <= 0;
        return (
          <button
            key={v.skuId}
            type="button"
            onClick={() => onChange(v.skuId)}
            disabled={disabled}
            className={cn(
              "rounded-lg border px-3 py-2 text-left text-sm transition-colors",
              selected
                ? "border-emerald-900 bg-emerald-50"
                : "border-emerald-200 bg-white hover:bg-emerald-50",
              disabled && "opacity-50",
            )}
          >
            <div className="flex items-center justify-between gap-2">
              <div className="font-medium text-emerald-900">{v.label}</div>
              {disabled ? (
                <span className="text-xs font-semibold text-rose-600">Tükendi</span>
              ) : (
                <span className="text-xs text-emerald-600">Stok: {v.stock}</span>
              )}
            </div>
          </button>
        );
      })}
    </div>
  );
}
