import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieName, verifySessionToken } from "@/lib/auth";
import { prisma } from "@/lib/prisma";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = cookies().get(cookieName)?.value;
  const user = await verifySessionToken(token);

  if (!user) {
    return NextResponse.json({ user: null });
  }

  if (!process.env.DATABASE_URL) {
    return NextResponse.json({ user });
  }

  const profile = await prisma.user.findUnique({
    where: { id: user.id },
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

  return NextResponse.json({ user: profile ?? user });
}
