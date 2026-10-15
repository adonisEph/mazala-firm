import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export const runtime = "edge";

const schema = z.object({
  name: z.string().trim().min(1).max(150),
  role_fr: z.string().trim().max(300).default(""),
  role_en: z.string().trim().max(300).default(""),
  bio_fr: z.string().trim().max(3000).default(""),
  bio_en: z.string().trim().max(3000).default(""),
  photo_url: z.string().trim().max(500).default(""),
  linkedin: z.string().trim().max(300).default(""),
  sort_order: z.number().int().default(0),
});

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session.ok) return session.response;
  const rows = await db().prepare(`SELECT * FROM team_members ORDER BY sort_order, id`).all();
  return NextResponse.json({ members: rows.results });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session.ok) return session.response;
  const body = schema.parse(await req.json());
  const r = await db()
    .prepare(`INSERT INTO team_members (name, role_fr, role_en, bio_fr, bio_en, photo_url, linkedin, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(body.name, body.role_fr, body.role_en, body.bio_fr, body.bio_en, body.photo_url, body.linkedin, body.sort_order)
    .run();
  return NextResponse.json({ ok: true, id: r.meta.last_row_id });
}
