import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req, "messages");
  if (!session.ok) return session.response;
  const rows = await db()
    .prepare(
      `SELECT m.id, m.name, m.email, m.message, m.read, m.created_at,
              a.id AS attachment_id, a.filename AS attachment_name, a.size AS attachment_size
       FROM contact_messages m LEFT JOIN attachments a ON a.message_id = m.id
       ORDER BY m.read ASC, m.id DESC`
    )
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
