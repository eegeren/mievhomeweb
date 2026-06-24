import bcrypt from "bcryptjs";
import { NextResponse } from "next/server";
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
    name?: string;
    phone?: string;
  };

  if (!body.email || !body.password || body.password.length < 6) {
    return NextResponse.json(
      { error: "Geçerli e-posta ve en az 6 karakter şifre gerekli." },
      { status: 400 }
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: body.email.toLowerCase() }
  });

  if (existingUser) {
    return NextResponse.json(
      { error: "Bu e-posta ile kayıtlı kullanıcı var." },
      { status: 409 }
    );
  }

  const passwordHash = await bcrypt.hash(body.password, 12);
  const user = await prisma.user.create({
    data: {
      email: body.email.toLowerCase(),
      passwordHash,
      name: body.name,
      phone: body.phone
    },
    select: {
      id: true,
      email: true,
      name: true,
      phone: true,
      createdAt: true
    }
  });

  return NextResponse.json(user, { status: 201 });
}
