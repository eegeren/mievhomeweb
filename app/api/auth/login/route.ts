import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
import { createSessionToken, sessionCookieOptions } from "@/lib/auth";
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
    email?: string;
    password?: string;
  };

  if (!body.email || !body.password) {
    return NextResponse.json(
      { error: "E-posta ve şifre gerekli." },
      { status: 400 }
    );
  }

  const user = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() }
  });

  if (!user || !(await bcrypt.compare(body.password, user.passwordHash))) {
    return NextResponse.json(
      { error: "E-posta veya şifre hatalı." },
      { status: 401 }
    );
  }

  const sessionUser = {
    id: user.id,
    email: user.email,
    name: user.name
  };
  const token = await createSessionToken(sessionUser);
  const response = NextResponse.json({
    ...sessionUser,
    phone: user.phone
  });

  response.cookies.set({
    ...sessionCookieOptions(),
    value: token
  });

  return response;
}
