import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import { cookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL tanımlı değil." },
      { status: 503 }
    );
  }

  const body = (await request.json()) as {
    deliveryAddress?: string;
    billingAddress?: string;
    paymentMethod?: string;
    items?: Array<{
      productId: number;
      quantity: number;
    }>;
  };

  if (!body.items?.length) {
    return NextResponse.json(
      { error: "Sipariş için en az bir ürün gerekli." },
      { status: 400 }
    );
  }

  const productIds = body.items.map((item) => item.productId);
  const products = await prisma.product.findMany({
    where: {
      id: { in: productIds },
      active: true
    }
  });

  const orderItems = body.items.map((item) => {
    const product = products.find((entry) => entry.id === item.productId);

    if (!product) {
      throw new Error(`Ürün bulunamadı: ${item.productId}`);
    }

    return {
      productId: product.id,
      quantity: item.quantity,
      unitPrice: product.price
    };
  });

  const total = orderItems.reduce(
    (sum, item) => sum + item.unitPrice * item.quantity,
    0
  );
  const token = cookies().get(cookieName)?.value;
  const user = await verifySessionToken(token);

  const order = await prisma.order.create({
    data: {
      userId: user?.id,
      total,
      deliveryAddress: body.deliveryAddress,
      billingAddress: body.billingAddress,
      paymentMethod: body.paymentMethod,
      items: {
        create: orderItems
      }
    },
    include: {
      items: true
    }
  });

  return NextResponse.json(order, { status: 201 });
}
