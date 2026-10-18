import { NextRequest } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { db } from "@/lib/db";

export const runtime = "edge";

// Balise visiteurs — appelée en sendBeacon à chaque page publique affichée.
// N'enregistre que les pages du site : admin, api et assets sont exclus.
const PUBLIC_PATH = /^\/(?!admin|api|_next|icons|images|fonts|sw\.js|offline\.html|manifest|favicon)/;

export async function POST(req: NextRequest) {
  try {
    const { p, v, r } = (await req.json()) as { p?: string; v?: string; r?: string };
    const path = String(p ?? "").split("?")[0].slice(0, 300);
    const visitor = String(v ?? "").slice(0, 64);
    // /team/<id> est une page publique — on la regroupe sous « /team/:id » pour les stats.
    const grouped = /^\/team\/\d+/.test(path) ? "/team/:id" : path;
    if (!path.startsWith("/") || !PUBLIC_PATH.test(path) || visitor.length < 8) {
      return new Response(null, { status: 204 });
    }
    const cf = getRequestContext<CloudflareEnv>().cf as { country?: string } | undefined;
    const country = (cf?.country ?? "XX").slice(0, 4);
    const referrer = String(r ?? "").slice(0, 300);
    await db()
      .prepare(`INSERT INTO visits (visitor_id, path, country, referrer) VALUES (?, ?, ?, ?)`)
      .bind(visitor, grouped, country, referrer)
      .run();
  } catch {
    /* une visite perdue ne doit jamais casser la page */
  }
  return new Response(null, { status: 204 });
}
