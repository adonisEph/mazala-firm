import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin, SECTIONS } from "@/lib/auth/session";
import { hashPassword } from "@/lib/auth/password";

export const runtime = "edge";

const updateSchema = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(200),
  password: z.string().min(8).max(200).optional(), // absent = inchangé
  permissions: z.array(z.enum(SECTIONS)).max(SECTIONS.length).default([]),
});

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req);
  if (!session.ok) return session.response;
  if (session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Réservé au superadmin." }, { status: 403 });
  }
  const { id } = await params;
  const targetId = Number(id);
  const body = updateSchema.parse(await req.json());
  const target = await db()
    .prepare(`SELECT role FROM admin_users WHERE id = ?`)
    .bind(targetId)
    .first<{ role: string }>();
  if (!target) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  if (target.role === "superadmin" && targetId !== session.user.id) {
    return NextResponse.json({ error: "Impossible de modifier un autre superadmin." }, { status: 403 });
  }
  const hash = body.password ? await hashPassword(body.password) : null;
  try {
    if (hash) {
      await db()
        .prepare(`UPDATE admin_users SET name=?, email=?, password_hash=?, permissions=? WHERE id=?`)
        .bind(body.name, body.email.toLowerCase(), hash, JSON.stringify(body.permissions), targetId)
        .run();
    } else {
      await db()
        .prepare(`UPDATE admin_users SET name=?, email=?, permissions=? WHERE id=?`)
        .bind(body.name, body.email.toLowerCase(), JSON.stringify(body.permissions), targetId)
        .run();
    }
  } catch {
    return NextResponse.json({ error: "Cet email est déjà utilisé." }, { status: 409 });
  }
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req);
  if (!session.ok) return session.response;
  if (session.user.role !== "superadmin") {
    return NextResponse.json({ error: "Réservé au superadmin." }, { status: 403 });
  }
  const { id } = await params;
  const targetId = Number(id);
  if (targetId === session.user.id) {
    return NextResponse.json({ error: "Impossible de supprimer votre propre compte." }, { status: 400 });
  }
  // Un superadmin ne peut jamais être supprimé → garantit qu'il en reste toujours un.
  const target = await db()
    .prepare(`SELECT role FROM admin_users WHERE id = ?`)
    .bind(targetId)
    .first<{ role: string }>();
  if (!target) return NextResponse.json({ error: "Compte introuvable." }, { status: 404 });
  if (target.role === "superadmin") {
    return NextResponse.json({ error: "Impossible de supprimer un superadmin." }, { status: 403 });
  }
  await db().prepare(`DELETE FROM admin_users WHERE id=?`).bind(targetId).run();
  return NextResponse.json({ ok: true });
}
