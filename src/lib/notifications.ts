/**
 * Notification system simulation for Mevsim Kapıda.
 * In a real production app, this would use Resend, Nodemailer, or an SMS gateway.
 */

export async function sendOrderNotification(order: any) {
  console.log("------------------------------------------");
  console.log("📧 BİLDİRİM: Yeni Sipariş Alındı!");
  console.log(`Sipariş ID: ${order.id}`);
  console.log(`Müşteri: ${order.customerName} (${order.customerEmail})`);
  console.log(`Tutar: ${(order.totalCents / 100).toFixed(2)} TL`);
  console.log("------------------------------------------");
}

export async function sendStatusUpdateNotification(order: any) {
  console.log("------------------------------------------");
  console.log(`📧 BİLDİRİM: Sipariş Durumu Güncellendi!`);
  console.log(`Sipariş ID: ${order.id}`);
  console.log(`Yeni Durum: ${order.status}`);
  console.log(`Müşteri: ${order.customerEmail}`);
  console.log("------------------------------------------");
}
