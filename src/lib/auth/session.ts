import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { SignJWT, jwtVerify } from "jose";
import { db } from "@/lib/db";

export const SESSION_COOKIE = "mz_session";

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: "superadmin" | "admin";
  permissions: string; // JSON array de sections
}

export const SECTIONS = ["projects", "team", "messages"] as const;
export type Section = (typeof SECTIONS)[number];

export function canAccess(user: AdminUser, section: Section): boolean {
  if (user.role === "superadmin") return true;
  try {
    return (JSON.parse(user.permissions) as string[]).includes(section);
  } catch {
    return false;
  }
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

export async function requireAdmin(req: NextRequest, section?: Section): Promise<{ ok: true; user: AdminUser } | { ok: false; response: NextResponse }> {
  const cookie = req.cookies.get(SESSION_COOKIE)?.value;
  if (!cookie) {
    return { ok: false, response: NextResponse.json({ error: "Non authentifié." }, { status: 401 }) };
  }
  try {
    const { payload } = await jwtVerify(cookie, jwtSecret());
    const user = await db()
      .prepare(`SELECT id, email, name, role, permissions FROM admin_users WHERE id = ?`)
      .bind(Number(payload.sub))
      .first<AdminUser>();
    if (!user) throw new Error("unknown user");
    // Droits lus en base à chaque requête → application immédiate des changements.
    if (section && !canAccess(user, section)) {
      return { ok: false, response: NextResponse.json({ error: "Droits insuffisants." }, { status: 403 }) };
    }
    return { ok: true, user };
  } catch {
    return { ok: false, response: NextResponse.json({ error: "Session invalide." }, { status: 401 }) };
  }
}
