import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth/session";

export const runtime = "edge";

export async function GET(req: NextRequest) {
  const session = await requireAdmin(req);
  if (!session.ok) return session.response;
  return NextResponse.json({ user: session.user });
}
