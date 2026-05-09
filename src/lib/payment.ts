export type PaymentResult = {
  success: boolean;
  transactionId?: string;
  errorMessage?: string;
};

export type PaymentRequest = {
  amountCents: number;
  cardNumber: string; // MVP'de sadece test edilebilirlik için
  expiryMonth: string;
  expiryYear: string;
  cvc: string;
  cardHolderName: string;
};

/**
 * Sanal POS (Payment Gateway) Simülasyon Servisi
 * İleride Iyzico veya Stripe ile değiştirilecek katman.
 */
export async function processPaymentGateway(req: PaymentRequest): Promise<PaymentResult> {
  // Simüle edilmiş gecikme (1.5 saniye)
  await new Promise((resolve) => setTimeout(resolve, 1500));

  // TEST KARTLARI (Stripe standartları)
  // 4242 4242 4242 4242 her zaman başarılı geçer.
  const cleanedCard = req.cardNumber.replace(/\s/g, "");
  
  if (!cleanedCard) {
    return { success: false, errorMessage: "Kart numarası girilmedi." };
  }

  if (cleanedCard.startsWith("4000")) {
    return { success: false, errorMessage: "Yetersiz bakiye (Simülasyon)." };
  }

  if (cleanedCard.startsWith("4111")) {
    return { success: false, errorMessage: "Kart reddedildi (Simülasyon)." };
  }

  // Varsayılan başarılı işlem
  return {
    success: true,
    transactionId: "txn_" + Math.random().toString(36).substring(2, 10),
  };
}
