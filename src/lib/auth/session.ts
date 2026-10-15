import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "mz_session";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
}

function jwtSecret(): Uint8Array {
  const env = getRequestContext<CloudflareEnv>().env;
  const secret = env.JWT_SECRET ?? "dev-secret-change-me";
  return new TextEncoder().encode(secret);
}

export function signSession(user: AdminUser): Promise<string> {
  return new SignJWT({ email: user.email, name: user.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(user.id))
    .setIssuedAt()
    .setExpirationTime("12h")
    .sign(jwtSecret());
}

export function sessionCookie(token: string): string {
  return `${SESSION_COOKIE}=${token}; Path=/; HttpOnly; SameSite=Strict; Max-Age=${12 * 3600}; Secure`;
}

export async function requireAdmin(req: NextRequest): Promise<{ ok: true; user: AdminUser } | { ok: false; response: NextResponse }> {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) {
    return { ok: false, response: NextResponse.json({ error: "Non authentifié." }, { status: 401 }) };
  }
  try {
    const { payload } = await jwtVerify(cookie, jwtSecret());
    const user = await db()
      .prepare(`SELECT id, email, name FROM admin_users WHERE id = ?`)
      .bind(Number(payload.sub))
      .first<AdminUser>();
    if (!user) throw new Error("unknown user");
    return { ok: true, user };
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Session invalide." }, { status: 401 }) };
  }
}
