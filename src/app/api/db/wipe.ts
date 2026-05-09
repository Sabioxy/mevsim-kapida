import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

async function main() {
  console.log("Database wipe started...");

  // Delete in order to respect foreign key constraints
  await prisma.review.deleteMany();
  console.log("Deleted all reviews");

  await prisma.orderItem.deleteMany();
  console.log("Deleted all order items");

  await prisma.order.deleteMany();
  console.log("Deleted all orders");

  await prisma.sku.deleteMany();
  console.log("Deleted all SKUs");

  await prisma.product.deleteMany();
  console.log("Deleted all products");

  await prisma.producer.deleteMany();
  console.log("Deleted all producers");

  await prisma.user.deleteMany();
  console.log("Deleted all users");

  console.log("Database wipe completed successfully.");
}

main()
  .catch((e) => {
    console.error("Error wiping database:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
