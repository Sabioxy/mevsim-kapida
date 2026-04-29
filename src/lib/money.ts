import type { Money } from "@/lib/types";

export const TRY = (amount: number): Money => ({ currency: "TRY", amount });

export const formatTRY = (money: Money): string => {
  return new Intl.NumberFormat("tr-TR", {
    style: "currency",
    currency: money.currency,
    maximumFractionDigits: 2,
  }).format(money.amount);
};

export const addMoney = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency) throw new Error("Currency mismatch");
  return { currency: a.currency, amount: round2(a.amount + b.amount) };
};

export const subMoney = (a: Money, b: Money): Money => {
  if (a.currency !== b.currency) throw new Error("Currency mismatch");
  return { currency: a.currency, amount: round2(a.amount - b.amount) };
};

export const mulMoney = (a: Money, multiplier: number): Money => {
  return { currency: a.currency, amount: round2(a.amount * multiplier) };
};

export const maxMoney = (a: Money, min: Money): Money => {
  if (a.currency !== min.currency) throw new Error("Currency mismatch");
  return { currency: a.currency, amount: Math.max(a.amount, min.amount) };
};

export const round2 = (n: number) => Math.round(n * 100) / 100;
