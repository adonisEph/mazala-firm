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

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req);
  if (!session.ok) return session.response;
  const { id } = await params;
  const body = schema.parse(await req.json());
  await db()
    .prepare(`UPDATE projects SET title=?, description_fr=?, description_en=?, techs=?, image_url=?, sort_order=? WHERE id=?`)
    .bind(body.title, body.description_fr, body.description_en, body.techs, body.image_url, body.sort_order, Number(id))
    .run();
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req);
  if (!session.ok) return session.response;
  const { id } = await params;
  await db().prepare(`DELETE FROM projects WHERE id=?`).bind(Number(id)).run();
  return NextResponse.json({ ok: true });
}
