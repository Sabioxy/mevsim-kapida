export type CategorySlug =
  | "taze-sebze"
  | "taze-meyve"
  | "sera-urunleri"
  | "dogal-tarim-urunleri";

export type ProductBadgeKind = "MEVSIMINDE" | "SERA";

export type Money = {
  currency: "TRY";
  amount: number; // stored as decimal TRY for MVP
};

export type SkuVariant = {
  skuId: string;
  label: string; // e.g. "1 kg"
  grams: number;
  producerBasePrice: Money; // price that producer expects to earn
  stock: number; // SKU-level stock
};

export type Producer = {
  id: string;
  name: string;
  city: string;
};

export type Product = {
  id: string;
  slug: string;
  title: string;
  subtitle?: string;
  imageUrl: string;
  category: CategorySlug;
  badges: ProductBadgeKind[];
  producer: Producer;
  description: string;
  variants: SkuVariant[];
};

export type CartLine = {
  lineId: string;
  productId: string;
  skuId: string;
  qty: number;
};

export type Cart = {
  id: string;
  lines: CartLine[];
  createdAt: number;
  updatedAt: number;
};

export type Address = {
  fullName: string;
  phone: string;
  city: string;
  district: string;
  addressLine: string;
};

export type DeliveryMethod = "STANDARD" | "SCHEDULED";

export type PaymentState =
  | { status: "INIT" }
  | { status: "PENDING"; paymentRequestId: string; startedAt: number }
  | { status: "SUCCESS"; orderId: string; paymentRequestId: string; completedAt: number }
  | { status: "FAILED"; paymentRequestId?: string; message: string }
  | { status: "CANCELLED"; paymentRequestId?: string };

export type Promotion =
  | { kind: "FIRST_ORDER_PERCENT"; percent: number }
  | { kind: "PERCENT"; percent: number }
  | { kind: "FREE_SHIPPING" };

export type PriceFreezeSnapshot = {
  frozenAt: number;
  cartId: string;
  itemsSubtotal: Money;
  shippingFee: Money;
  discountsTotal: Money;
  payableTotal: Money;
  lines: Array<{
    productId: string;
    skuId: string;
    qty: number;
    unitPriceCustomer: Money;
    unitProducerBasePrice: Money;
    commissionRate: number;
  }>;
};
