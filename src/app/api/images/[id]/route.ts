import { NextRequest } from "next/server";
import { db } from "@/lib/db";

export const runtime = "edge";

// Sert publiquement une image stockée en D1 (immuable → cache agressif).
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const row = await db()
    .prepare(`SELECT mime, data FROM images WHERE id = ?`)
    .bind(Number(id))
    .first<{ mime: string; data: ArrayBuffer | Uint8Array | number[] }>();
  if (!row) return new Response("Not found", { status: 404 });
  // La D1 émulée (next dev) renvoie les BLOBs en tableau d'octets, la vraie D1 en ArrayBuffer.
  const bytes = row.data instanceof ArrayBuffer ? row.data : new Uint8Array(row.data);
  return new Response(bytes, {
    headers: {
      "Content-Type": row.mime,
      "Cache-Control": "public, max-age=31536000, immutable",
      "X-Content-Type-Options": "nosniff",
      // Un SVG uploadé pourrait embarquer du script — neutralisé à la lecture.
      "Content-Security-Policy": "script-src 'none'",
    },
  });
}
