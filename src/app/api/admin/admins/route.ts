import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, SECTIONS } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";

export const runtime = "edge";

function requireSuperadmin(user: { role: string }): NextResponse | null {
  return user.role === "superadmin"
    ? null
    : NextResponse.json({ error: "Réservé au superadmin." }, { status: 403 });
}

const createSchema = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(200),
  permissions: z.array(z.enum(SECTIONS)).max(SECTIONS.length).default([]),
});

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session.ok) return session.response;
  const denied = requireSuperadmin(session.user);
  if (denied) return denied;
  const rows = await db()
    .prepare(`SELECT id, email, name, role, permissions, created_at FROM admin_users ORDER BY id`)
    .all();
  return NextResponse.json({ admins: rows.results });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session.ok) return session.response;
  const denied = requireSuperadmin(session.user);
  if (denied) return denied;
  const body = createSchema.parse(await req.json());
  const password_hash = await hashPassword(body.password);
  try {
    const r = await db()
      .prepare(`INSERT INTO admin_users (email, password_hash, name, role, permissions) VALUES (?, ?, ?, 'admin', ?)`)
      .bind(body.email.toLowerCase(), password_hash, body.name, JSON.stringify(body.permissions))
      .run();
    return NextResponse.json({ ok: true, id: r.meta.last_row_id });
  } catch {
    return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
  }
}
