import { getRequestContext } from "@cloudflare/next-on-pages";
import ProjectsClient from "./ProjectsClient";
import { DEV_PROJECTS } from "@/lib/dev-fixtures";
import type { CmsProject } from "@/components/MazalaPage";

export const runtime = "edge";

interface ProjectRow extends CmsProject { sort_order: number }

// Galerie complète : tous les projets du CMS, par ordre d'affichage.
async function getProjects() {
  try {
    const db = getRequestContext<CloudflareEnv>().env.DB as D1Database;
    const rows = await db
      .prepare(`SELECT id, title, description_fr, description_en, techs, image_url, project_url, platform, sort_order FROM projects ORDER BY sort_order`)
      .all<ProjectRow>();
    return rows.results;
  } catch {
    if (process.env.NODE_ENV === "development") return DEV_PROJECTS;
    return [];
  }
}

export default async function Projects() {
  const projects = await getProjects();
  return <ProjectsClient projects={projects} />;
}
