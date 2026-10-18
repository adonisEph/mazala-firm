import { NextRequest } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export const runtime = "edge";

// Téléchargement des pièces jointes — réservé aux admins ayant le droit "messages".
// Content-Disposition: attachment → aucun contenu n'est exécuté inline.
export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const session = await requireAdmin(req, "messages");
  if (!session.ok) return session.response;

  const { id } = await params;
  const row = await db()
    .prepare(`SELECT filename, mime, data FROM attachments WHERE id = ?`)
    .bind(Number(id))
    .first<{ filename: string; mime: string; data: ArrayBuffer | Uint8Array | number[] }>();
  if (!row) return new Response("Not found", { status: 404 });

  // La D1 émulée (next dev) renvoie les BLOBs en tableau d'octets, la vraie D1 en ArrayBuffer.
  const bytes = row.data instanceof ArrayBuffer ? row.data : new Uint8Array(row.data);
  const ascii = row.filename.replace(/[^\x20-\x7e]/g, "_").replace(/"/g, "'");
  return new Response(bytes, {
    headers: {
      "Content-Type": row.mime || "application/octet-stream",
      "Content-Disposition": `attachment; filename="${ascii}"; filename*=UTF-8''${encodeURIComponent(row.filename)}`,
      "X-Content-Type-Options": "nosniff",
      "Cache-Control": "private, no-store",
    },
  });
}
