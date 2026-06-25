import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

async function getSessionUser() {
  const token = cookies().get(cookieName)?.value;
  return verifySessionToken(token);
}

export async function GET() {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL tanımlı değil." },
      { status: 503 }
    );
  }

  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      defaultDeliveryAddress: true,
      defaultBillingAddress: true,
      emailNotifications: true,
      smsNotifications: true
    }
  });

  return NextResponse.json({ user });
}

export async function PATCH(request: Request) {
  if (!process.env.DATABASE_URL) {
    return NextResponse.json(
      { error: "DATABASE_URL tanımlı değil." },
      { status: 503 }
    );
  }

  const sessionUser = await getSessionUser();

  if (!sessionUser) {
    return NextResponse.json({ error: "Giriş gerekli." }, { status: 401 });
  }

  const body = (await request.json()) as {
    name?: string;
    phone?: string;
    defaultDeliveryAddress?: string;
    defaultBillingAddress?: string;
    emailNotifications?: boolean;
    smsNotifications?: boolean;
  };

  const user = await prisma.user.update({
    where: { id: sessionUser.id },
    data: {
      name: body.name,
      phone: body.phone,
      defaultDeliveryAddress: body.defaultDeliveryAddress,
      defaultBillingAddress: body.defaultBillingAddress,
      emailNotifications: body.emailNotifications,
      smsNotifications: body.smsNotifications
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      defaultDeliveryAddress: true,
      defaultBillingAddress: true,
      emailNotifications: true,
      smsNotifications: true
    }
  });

  return NextResponse.json({ user });
}
