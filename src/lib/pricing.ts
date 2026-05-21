import type {
  Cart,
  Money,
  PriceFreezeSnapshot,
  Product,
  Promotion,
} from "@/lib/types";
import { addMoney, maxMoney, mulMoney, subMoney, TRY } from "@/lib/money";
import { COMMISSION_RATE } from "@/lib/catalog";

export const SHIPPING_FEE_DEFAULT = TRY(49);

export const customerUnitPriceFromProducerBase = (producerBase: Money): Money => {
  // Customer pays producer base + platform commission (10%)
  return mulMoney(producerBase, 1 + COMMISSION_RATE);
};

export const calcLineSubtotalCustomer = (
  product: Product,
  skuId: string,
  qty: number,
): Money => {
  const sku = product.variants.find((v) => v.skuId === skuId);
  if (!sku) return TRY(0);
  const unit = customerUnitPriceFromProducerBase(sku.producerBasePrice);
  return mulMoney(unit, qty);
};

export const calcCartItemsSubtotal = (cart: Cart, products: Product[]): Money => {
  return cart.lines.reduce((acc, line) => {
    const product = products.find((p) => String(p.id) === String(line.productId));
    if (!product) return acc;
    return addMoney(acc, calcLineSubtotalCustomer(product, line.skuId, line.qty));
  }, TRY(0));
};

export const computeDiscounts = (args: {
  itemsSubtotal: Money;
  shippingFee: Money;
  promotions: Promotion[];
  isFirstOrder: boolean;
}): { discountsTotal: Money; shippingFeeFinal: Money } => {
  const { itemsSubtotal, promotions, isFirstOrder } = args;

  let shippingFeeFinal = args.shippingFee;
  let discountsTotal = TRY(0);

  for (const promo of promotions) {
    if (promo.kind === "FREE_SHIPPING") {
      shippingFeeFinal = TRY(0);
    }

    if (promo.kind === "PERCENT") {
      const discount = mulMoney(itemsSubtotal, promo.percent / 100);
      discountsTotal = addMoney(discountsTotal, discount);
    }

    if (promo.kind === "FIRST_ORDER_PERCENT" && isFirstOrder) {
      const discount = mulMoney(itemsSubtotal, promo.percent / 100);
      discountsTotal = addMoney(discountsTotal, discount);
    }
  }

  // guard: discount cannot exceed items subtotal
  discountsTotal = maxMoney(discountsTotal, TRY(0));
  if (discountsTotal.amount > itemsSubtotal.amount) discountsTotal = itemsSubtotal;

  return { discountsTotal, shippingFeeFinal };
};

export const calcPayableTotal = (args: {
  itemsSubtotal: Money;
  shippingFee: Money;
  discountsTotal: Money;
}): Money => {
  const beforeDiscount = addMoney(args.itemsSubtotal, args.shippingFee);
  const after = subMoney(beforeDiscount, args.discountsTotal);
  return { currency: after.currency, amount: Math.max(0, after.amount) };
};

export const freezePrices = (args: {
  cart: Cart;
  products: Product[];
  promotions: Promotion[];
  isFirstOrder: boolean;
  shippingFee: Money;
}): PriceFreezeSnapshot => {
  const itemsSubtotal = calcCartItemsSubtotal(args.cart, args.products);
  const { discountsTotal, shippingFeeFinal } = computeDiscounts({
    itemsSubtotal,
    shippingFee: args.shippingFee,
    promotions: args.promotions,
    isFirstOrder: args.isFirstOrder,
  });
  const payableTotal = calcPayableTotal({
    itemsSubtotal,
    shippingFee: shippingFeeFinal,
    discountsTotal,
  });

  return {
    frozenAt: Date.now(),
    cartId: args.cart.id,
    itemsSubtotal,
    shippingFee: shippingFeeFinal,
    discountsTotal,
    payableTotal,
    lines: args.cart.lines
      .map((line) => {
        const product = args.products.find((p) => String(p.id) === String(line.productId));
        const sku = product?.variants.find((v) => v.skuId === line.skuId);
        if (!product || !sku) return null;
        return {
          productId: product.id,
          skuId: sku.skuId,
          qty: line.qty,
          unitPriceCustomer: customerUnitPriceFromProducerBase(sku.producerBasePrice),
          unitProducerBasePrice: sku.producerBasePrice,
          commissionRate: COMMISSION_RATE,
        };
      })
      .filter((x): x is NonNullable<typeof x> => Boolean(x)),
  };
};

export const promoFromCode = (codeRaw: string): Promotion | null => {
  const code = codeRaw.trim().toUpperCase();
  if (!code) return null;

  if (code === "FIRST10") return { kind: "FIRST_ORDER_PERCENT", percent: 10 };
  if (code === "SAVE20" || code === "KUPON") return { kind: "PERCENT", percent: 20 };
  if (code === "FREESHIP") return { kind: "FREE_SHIPPING" };

  return null;
};
