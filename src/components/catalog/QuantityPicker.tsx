"use client";

import * as React from "react";
import { Button } from "@/components/ui/Button";
import { Input } from "@/components/ui/Input";

export function QuantityPicker({
  qty,
  setQty,
  max = 99,
}: {
  qty: number;
  setQty: (qty: number) => void;
  max?: number;
}) {
  const dec = () => setQty(Math.max(1, qty - 1));
  const inc = () => setQty(Math.min(max, qty + 1));

  return (
    <div className="flex items-center gap-2">
      <Button type="button" variant="secondary" onClick={dec}>
        -
      </Button>
      <Input
        inputMode="numeric"
        value={qty}
        onChange={(e) => {
          const v = Number(e.target.value);
          if (!Number.isFinite(v)) return;
          setQty(Math.max(1, Math.min(max, Math.floor(v))));
        }}
        className="h-10 w-16 text-center"
      />
      <Button type="button" variant="secondary" onClick={inc}>
        +
      </Button>
    </div>
  );
}
