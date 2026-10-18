import { getRequestContext } from "@cloudflare/next-on-pages";
import { notFound } from "next/navigation";
import MemberClient from "./MemberClient";
import { DEV_MEMBERS } from "@/lib/dev-fixtures";
import type { CmsMember } from "@/components/MazalaPage";

export const runtime = "edge";

// Profil public d'un membre : biographie complète pilotée par le CMS.
async function getMember(id: number) {
  try {
    const db = getRequestContext<CloudflareEnv>().env.DB as D1Database;
    return await db
      .prepare(`SELECT id, name, role_fr, role_en, bio_fr, bio_en, photo_url, socials FROM team_members WHERE id = ?`)
      .bind(id)
      .first<CmsMember>();
  } catch {
    if (process.env.NODE_ENV === "development") return DEV_MEMBERS.find((m) => m.id === id) ?? null;
    return null;
  }
}

export default async function MemberPage({ params }: { params: Promise<{ id: string }> }) {
  const id = Number((await params).id);
  const member = Number.isInteger(id) ? await getMember(id) : null;
  if (!member) notFound();
  return <MemberClient member={member} />;
}
