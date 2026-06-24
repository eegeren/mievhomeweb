import { NextResponse } from "next/server";
import { products as fallbackProducts } from "@/data/products";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(fallbackProducts);
  }

  try {
    const products = await prisma.product.findMany({
      where: { active: true },
      orderBy: [{ reviews: "desc" }, { createdAt: "desc" }]
    });

    return NextResponse.json(products);
  } catch (error) {
    console.error("Products API error", error);
    return NextResponse.json(fallbackProducts);
  }
}
