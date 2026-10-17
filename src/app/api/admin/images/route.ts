import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export const runtime = "edge";

const MAX_SIZE = 5 * 1024 * 1024; // 5 Mo
const ALLOWED = new Set(["image/png", "image/jpeg", "image/webp", "image/svg+xml"]);

// Le Content-Type client peut mentir → vérification des magic bytes.
function sniff(buf: Uint8Array, mime: string): boolean {
  if (mime === "image/png") return buf[0] === 0x89 && buf[1] === 0x50 && buf[2] === 0x4e && buf[3] === 0x47;
  if (mime === "image/jpeg") return buf[0] === 0xff && buf[1] === 0xd8;
  if (mime === "image/webp")
    return buf[0] === 0x52 && buf[1] === 0x49 && buf[2] === 0x46 && buf[3] === 0x46 && buf[8] === 0x57 && buf[9] === 0x45;
  if (mime === "image/svg+xml") return new TextDecoder().decode(buf.slice(0, 512)).includes("<svg");
  return false;
}

// Upload d'image → BLOB D1, servie ensuite via GET /api/images/[id].
// Formats acceptés : PNG, JPG, WebP, SVG — 5 Mo max.
export async function POST(req: NextRequest) {
  // L'upload suit le droit de la section cible : projet → "projects", membre → "team".
  const kind = req.nextUrl.searchParams.get("for");
  const section = kind === "project" ? "projects" : kind === "member" ? "team" : null;
  if (!section) {
    return NextResponse.json({ error: "Paramètre 'for' requis (project|member)." }, { status: 400 });
  }
  const session = await requireAdmin(req, section);
  if (!session.ok) return session.response;
  const fd = await req.formData().catch(() => null);
  const file = fd?.get("file");
  if (!(file instanceof File) || !ALLOWED.has(file.type)) {
    return NextResponse.json({ error: "Formats acceptés : PNG, JPG, WebP, SVG" }, { status: 400 });
  }
  if (file.size > MAX_SIZE) {
    return NextResponse.json({ error: "Image trop lourde (5 Mo max)" }, { status: 413 });
  }
  const buf = await file.arrayBuffer();
  if (!sniff(new Uint8Array(buf), file.type)) {
    return NextResponse.json({ error: "Le contenu du fichier ne correspond pas à son format" }, { status: 400 });
  }
  const r = await db()
    .prepare(`INSERT INTO images (mime, data) VALUES (?, ?)`)
    .bind(file.type, buf)
    .run();
  return NextResponse.json({ ok: true, url: `/api/images/${r.meta.last_row_id}` });
}
