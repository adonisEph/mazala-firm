import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export const runtime = "edge";

const schema = z.object({
  title: z.string().trim().min(1).max(150),
  description_fr: z.string().trim().max(3000).default(""),
  description_en: z.string().trim().max(3000).default(""),
  techs: z.string().trim().max(500).default(""),
  image_url: z.string().trim().max(500).default(""),
  sort_order: z.number().int().default(0),
});

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session.ok) return session.response;
  const rows = await db().prepare(`SELECT * FROM projects ORDER BY sort_order, id`).all();
  return NextResponse.json({ projects: rows.results });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session.ok) return session.response;
  const body = schema.parse(await req.json());
  const r = await db()
    .prepare(`INSERT INTO projects (title, description_fr, description_en, techs, image_url, sort_order) VALUES (?, ?, ?, ?, ?, ?)`)
    .bind(body.title, body.description_fr, body.description_en, body.techs, body.image_url, body.sort_order)
    .run();
  return NextResponse.json({ ok: true, id: r.meta.last_row_id });
}
