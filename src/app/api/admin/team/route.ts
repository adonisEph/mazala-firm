import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";
import { translateFrToEn } from "@/lib/translate";

export const runtime = "edge";

const schema = z.object({
  name: z.string().trim().min(1).max(150),
  role_fr: z.string().trim().max(300).default(""),
  bio_fr: z.string().trim().max(3000).default(""),
  photo_url: z.string().trim().max(500).default(""),
  socials: z
    .array(
      z.object({
        type: z.enum(["linkedin", "github", "x", "facebook", "instagram", "telegram", "whatsapp", "website"]),
        url: z.string().trim().max(500),
      })
    )
    .max(10)
    .default([]),
  sort_order: z.number().int().default(0),
});

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req, "team");
  if (!session.ok) return session.response;
  const rows = await db().prepare(`SELECT * FROM team_members ORDER BY sort_order, id`).all();
  return NextResponse.json({ members: rows.results });
}

export async function POST(req: NextRequest) {
  const session = await requireAdmin(req, "team");
  if (!session.ok) return session.response;
  const body = schema.parse(await req.json());
  const [role_en, bio_en] = await Promise.all([translateFrToEn(body.role_fr), translateFrToEn(body.bio_fr)]);
  const r = await db()
    .prepare(`INSERT INTO team_members (name, role_fr, role_en, bio_fr, bio_en, photo_url, socials, sort_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)`)
    .bind(body.name, body.role_fr, role_en, body.bio_fr, bio_en, body.photo_url, JSON.stringify(body.socials), body.sort_order)
    .run();
  return NextResponse.json({ ok: true, id: r.meta.last_row_id });
}
