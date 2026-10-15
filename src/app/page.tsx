import { getRequestContext } from "@cloudflare/next-on-pages";
import MazalaPage, { type CmsMember, type CmsProject } from "@/components/MazalaPage";

export const runtime = "edge";

interface ProjectRow extends CmsProject { sort_order: number }
interface MemberRow extends CmsMember { sort_order: number }

// Contenu piloté par la D1 — le back-office /admin peut modifier
// projets et membres sans toucher au code.
async function getCmsContent() {
  try {
    const db = getRequestContext<CloudflareEnv>().env.DB as D1Database;
    const [projects, members] = await Promise.all([
      db.prepare(`SELECT id, title, description_fr, description_en, techs, image_url, sort_order FROM projects ORDER BY sort_order`).all<ProjectRow>(),
      db.prepare(`SELECT id, name, role_fr, role_en, bio_fr, bio_en, photo_url, linkedin, sort_order FROM team_members ORDER BY sort_order`).all<MemberRow>(),
    ]);
    return { projects: projects.results, members: members.results };
  } catch {
    return { projects: [], members: [] };
  }
}

export default async function Home() {
  const { projects, members } = await getCmsContent();
  return <MazalaPage projects={projects} members={members} />;
}
