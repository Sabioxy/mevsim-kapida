import { prisma } from "@/lib/prisma";
import {
  customerUnitPriceFromProducerBase,
  SHIPPING_FEE_DEFAULT,
  computeDiscounts,
  calcPayableTotal,
} from "@/lib/pricing";
import { processPaymentGateway } from "@/lib/payment";
import { getSession } from "@/lib/auth-server";
import { sendOrderNotification } from "@/lib/notifications";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { cart, address, city, customerName, customerEmail, payment, promotions } = body;

    const session = await getSession();
    const userId = session?.id;

    if (!cart || !cart.lines || cart.lines.length === 0) {
      return Response.json({ message: "Sepet boş" }, { status: 400 });
    }

    if (!address || !city || !customerName || !customerEmail) {
      return Response.json({ message: "Adres ve iletişim bilgileri eksik" }, { status: 400 });
    }

    if (!payment || !payment.cardNumber) {
      return Response.json({ message: "Ödeme bilgileri eksik" }, { status: 400 });
    }

    // Determine if first order
    let isFirstOrder = true;
    if (userId) {
      const orderCount = await prisma.order.count({
        where: {
          userId,
          status: "SUCCESS",
        },
      });
      isFirstOrder = orderCount === 0;
    }

    // Process checkout in a transaction to ensure atomic operations (order creation + stock deduction)
    const order = await prisma.$transaction(async (tx) => {
      let itemsSubtotalAmount = 0;
      const orderItemsData = [];

      for (const line of cart.lines) {
        // Find the specific SKU to verify stock and price
        const sku = await tx.sku.findUnique({
          where: { skuId: line.skuId },
        });

        if (!sku) {
          throw new Error(`Ürün varyantı bulunamadı: ${line.skuId}`);
        }

        if (sku.stock < line.qty) {
          throw new Error(`Yetersiz stok: ${sku.label}. Mevcut stok: ${sku.stock}`);
        }

        const unitCustomerPriceAmount = customerUnitPriceFromProducerBase({
          currency: "TRY",
          amount: sku.priceCents / 100,
        }).amount;

        const lineTotalTRY = unitCustomerPriceAmount * line.qty;
        itemsSubtotalAmount += lineTotalTRY;

        // Deduct stock
        await tx.sku.update({
          where: { skuId: line.skuId },
          data: {
            stock: {
              decrement: line.qty,
            },
          },
        });

        orderItemsData.push({
          skuId: sku.skuId,
          qty: line.qty,
          priceCents: Math.round(unitCustomerPriceAmount * 100),
        });
      }

      // Compute final payable total in TRY
      const itemsSubtotal = { currency: "TRY" as const, amount: itemsSubtotalAmount };
      const { discountsTotal, shippingFeeFinal } = computeDiscounts({
        itemsSubtotal,
        shippingFee: SHIPPING_FEE_DEFAULT,
        promotions: promotions || [],
        isFirstOrder,
      });

      const payableTotal = calcPayableTotal({
        itemsSubtotal,
        shippingFee: shippingFeeFinal,
        discountsTotal,
      });

      const totalCents = Math.round(payableTotal.amount * 100);

      // Proceed with Payment simulation
      const paymentResult = await processPaymentGateway({
        amountCents: totalCents,
        ...payment,
      });

      if (!paymentResult.success) {
        throw new Error(paymentResult.errorMessage || "Ödeme reddedildi.");
      }

      // Create the order
      const newOrder = await tx.order.create({
        data: {
          userId,
          customerName,
          customerEmail,
          address,
          city,
          totalCents,
          status: "SUCCESS", // Mocked as SUCCESS for now until Payment Gateway
          items: {
            create: orderItemsData,
          },
        },
      });

      return newOrder;
    });

    // Send notification in background
    void sendOrderNotification(order);

    return Response.json({ order });
  } catch (error: any) {
    console.error("Checkout error:", error);
    return Response.json({ message: error.message || "Sipariş oluşturulamadı" }, { status: 400 });
  }
}
