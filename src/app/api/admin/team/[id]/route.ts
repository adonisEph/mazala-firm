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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req);
  if (!session.ok) return session.response;
  const { id } = await params;
  const body = schema.parse(await req.json());
  await db()
    .prepare(`UPDATE team_members SET name=?, role_fr=?, role_en=?, bio_fr=?, bio_en=?, photo_url=?, linkedin=?, sort_order=? WHERE id=?`)
    .bind(body.name, body.role_fr, body.role_en, body.bio_fr, body.bio_en, body.photo_url, body.linkedin, body.sort_order, Number(id))
    .run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req);
  if (!session.ok) return session.response;
  const { id } = await params;
  await db().prepare(`DELETE FROM team_members WHERE id=?`).bind(Number(id)).run();
  return NextResponse.json({ ok: true });
}
