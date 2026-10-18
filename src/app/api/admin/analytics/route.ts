import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/session";

export const runtime = "edge";

// Tableau de bord visiteurs : ouvert à tout admin authentifié (sans droit de section).
// ?days=7|14|30 — série journalière + tops pages/pays + compteurs du jour.
export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session.ok) return session.response;

  const days = [7, 14, 30].includes(Number(req.nextUrl.searchParams.get("days")))
    ? Number(req.nextUrl.searchParams.get("days"))
    : 30;
  const since = `-${days - 1} days`;

  const [today, range, daily, topPages, topCountries] = await Promise.all([
    db()
      .prepare(`SELECT COUNT(*) views, COUNT(DISTINCT visitor_id) visitors FROM visits WHERE date(created_at) = date('now')`)
      .first<{ views: number; visitors: number }>(),
    db()
      .prepare(`SELECT COUNT(*) views, COUNT(DISTINCT visitor_id) visitors FROM visits WHERE created_at >= datetime('now', ?)`)
      .bind(since)
      .first<{ views: number; visitors: number }>(),
    db()
      .prepare(
        `SELECT date(created_at) d, COUNT(*) views, COUNT(DISTINCT visitor_id) visitors
         FROM visits WHERE created_at >= datetime('now', ?) GROUP BY d ORDER BY d`
      )
      .bind(since)
      .all<{ d: string; views: number; visitors: number }>(),
    db()
      .prepare(
        `SELECT path, COUNT(*) views, COUNT(DISTINCT visitor_id) visitors
         FROM visits WHERE created_at >= datetime('now', ?) GROUP BY path ORDER BY views DESC LIMIT 8`
      )
      .bind(since)
      .all<{ path: string; views: number; visitors: number }>(),
    db()
      .prepare(
        `SELECT country, COUNT(*) views, COUNT(DISTINCT visitor_id) visitors
         FROM visits WHERE created_at >= datetime('now', ?) GROUP BY country ORDER BY visitors DESC LIMIT 8`
      )
      .bind(since)
      .all<{ country: string; views: number; visitors: number }>(),
  ]);

  return NextResponse.json({
    days,
    today: today ?? { views: 0, visitors: 0 },
    range: range ?? { views: 0, visitors: 0 },
    daily: daily.results,
    topPages: topPages.results,
    topCountries: topCountries.results,
  });
}
