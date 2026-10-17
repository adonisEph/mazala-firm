import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req, "messages");
  if (!session.ok) return session.response;
  const rows = await db()
    .prepare(`SELECT id, name, email, message, read, created_at FROM contact_messages ORDER BY read ASC, id DESC`)
    .all();
  return NextResponse.json({ messages: rows.results });
}

const patchSchema = z.object({ id: z.number().int(), read: z.boolean() });

export async function PATCH(req: NextRequest) {
  const session = await requireAdmin(req, "messages");
  if (!session.ok) return session.response;
  const { id, read } = patchSchema.parse(await req.json());
  await db().prepare(`UPDATE contact_messages SET read=? WHERE id=?`).bind(read ? 1 : 0, id).run();
  return NextResponse.json({ ok: true });
}
