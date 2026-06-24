import { SignJWT, jwtVerify } from "jose";

export type SessionUser = {
  id: number;
  email: string;
  name?: string | null;
};

const cookieName = "miev_session";

function getSecret() {
  const secret = process.env.AUTH_SECRET ?? "miev-home-local-development-secret";
  return new TextEncoder().encode(secret);
}

export async function createSessionToken(user: SessionUser) {
  return new SignJWT(user)
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime("30d")
    .sign(getSecret());
}

export async function verifySessionToken(token?: string) {
  if (!token) {
    return null;
  }

  try {
    const { payload } = await jwtVerify(token, getSecret());

    if (typeof payload.id !== "number" || typeof payload.email !== "string") {
      return null;
    }

    return {
      id: payload.id,
      email: payload.email,
      name: typeof payload.name === "string" ? payload.name : null
    };
  } catch {
    return null;
  }
}

export function sessionCookieOptions() {
  return {
    name: cookieName,
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 60 * 60 * 24 * 30
  };
}

export function clearSessionCookieOptions() {
  return {
    name: cookieName,
    value: "",
    httpOnly: true,
    sameSite: "lax" as const,
    secure: process.env.NODE_ENV === "production",
    path: "/",
    maxAge: 0
  };
}

export { cookieName };
