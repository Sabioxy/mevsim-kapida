import { prisma } from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function GET() {
  try {
    console.log("Database wipe started via API...");

    // Delete in order to respect foreign key constraints
    await prisma.review.deleteMany();
    await prisma.orderItem.deleteMany();
    await prisma.order.deleteMany();
    await prisma.sku.deleteMany();
    await prisma.product.deleteMany();
    await prisma.producer.deleteMany();
    await prisma.user.deleteMany();

    console.log("Database wipe completed successfully.");
    return NextResponse.json({ message: "Database wiped successfully" });
  } catch (error: any) {
    console.error("Error wiping database:", error);
    return NextResponse.json({ message: "Error wiping database", error: error.message }, { status: 500 });
  }
}
