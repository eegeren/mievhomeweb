import { cookies } from "next/headers";
import { NextResponse } from "next/server";
import { cookieName, verifySessionToken } from "@/lib/auth";

export const dynamic = "force-dynamic";

export async function GET() {
  const token = cookies().get(cookieName)?.value;
  const user = await verifySessionToken(token);

  if (!user) {
    return NextResponse.json({ user: null });
  }

  return NextResponse.json({ user });
}
