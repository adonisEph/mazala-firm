"use client";

import SubPage from "@/components/SubPage";
import { ProjectCard } from "@/components/ProjectCard";
import { T } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";
import type { CmsProject } from "@/components/MazalaPage";

export default function ProjectsClient({ projects }: { projects: CmsProject[] }) {
  const [lang] = useLang();
  const t = T[lang];

  return (
    <SubPage>
      <section className="px-4 md:px-10 lg:px-24 mt-40 lg:mt-28 pb-10 flex flex-col items-center">
        <a
          href="/#portfolio"
          className="self-start mb-6 inline-flex items-center gap-2 text-text-sec font-semibold transition-colors hover:text-ternary group"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 transition-transform group-hover:-translate-x-1">
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
          {t.portfolio.back}
        </a>
        <h1 className="font-title text-3xl md:text-4xl text-ternary">{t.portfolio.title}</h1>
        <p className="text-lg lg:text-xl mt-2 text-text-sec mb-16 text-center">{t.portfolio.subtitle}</p>
        {projects.length ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            {projects.map((p) => (
              <ProjectCard key={p.id} p={p} lang={lang} />
            ))}
          </div>
        ) : null}
      </section>
    </SubPage>
  );
}
