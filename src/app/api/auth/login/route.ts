import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { sessionCookie, signSession } from "@/lib/auth/session";
import { verifyPassword } from "@/lib/auth/password";

export const runtime = "edge";

const schema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    const user = await db()
      .prepare(`SELECT id, email, name, password_hash FROM admin_users WHERE email = ?`)
      .bind(body.email.trim().toLowerCase())
      .first<{ id: number; email: string; name: string; password_hash: string }>();

    // Vérification même si l'utilisateur n'existe pas (anti-énumération : temps constant côté PBKDF2).
    const hash = user?.password_hash ?? "pbkdf2:00000000000000000000000000000000:0000000000000000000000000000000000000000000000000000000000000000";
    const ok = await verifyPassword(body.password, hash);
    if (!user || !ok) {
      return NextResponse.json({ error: "Identifiants incorrects." }, { status: 401 });
    }

    const token = await signSession({ id: user.id, email: user.email, name: user.name });
    return NextResponse.json(
      { ok: true, user: { id: user.id, email: user.email, name: user.name } },
      { headers: { "Set-Cookie": sessionCookie(token) } }
    );
  } catch {
    return NextResponse.json({ error: "Requête invalide." }, { status: 400 });
  }
}
