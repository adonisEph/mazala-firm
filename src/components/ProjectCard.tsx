"use client";

import { T, type Lang } from "@/lib/i18n";
import { httpUrl } from "@/lib/url";
import type { CmsProject } from "./MazalaPage";

const PLATFORM_ICONS: Record<string, React.JSX.Element> = {
  web: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
      <circle cx="12" cy="12" r="10" />
      <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
    </svg>
  ),
  mobile: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
      <rect x="5" y="2" width="14" height="20" rx="2" />
      <path d="M12 18h.01" />
    </svg>
  ),
  desktop: (
    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
      <rect x="2" y="3" width="20" height="14" rx="2" />
      <path d="M8 21h8m-4-4v4" />
    </svg>
  ),
};

function PlatformBadge({ platform, lang }: { platform: CmsProject["platform"]; lang: Lang }) {
  if (!platform) return null;
  return (
    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-white/10 text-ternary-light text-xs font-semibold uppercase tracking-wider whitespace-nowrap">
      {PLATFORM_ICONS[platform]}
      {T[lang].portfolio.platform[platform]}
    </span>
  );
}

function TechBadges({ techs, max = 4 }: { techs: string; max?: number }) {
  const list = techs.split(",").map((t) => t.trim()).filter(Boolean);
  const shown = list.slice(0, max);
  return (
    <div className="flex flex-wrap gap-1.5 items-center">
      {shown.map((tech, i) => (
        <span key={i} className="px-3 py-1.5 text-xs text-white rounded-full bg-ternary">
          {tech}
        </span>
      ))}
      {list.length > max && (
        <span className="px-2 py-1 text-xs text-gray-300">+{list.length - max}</span>
      )}
    </div>
  );
}

/** Carte projet uniforme — grille responsive home + page /projects. */
export function ProjectCard({ p, lang, id }: { p: CmsProject; lang: Lang; id?: string }) {
  const t = T[lang];
  return (
    <article
      id={id}
      className="group flex flex-col bg-secondary rounded-2xl overflow-hidden shadow-xl text-white transition-transform duration-300 hover:-translate-y-1.5 hover:shadow-2xl"
    >
      <div className="h-44 bg-ternary overflow-hidden shrink-0">
        {p.image_url ? (
          <img
            src={p.image_url}
            alt={p.title}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <span className="w-full h-full flex items-center justify-center font-logo text-5xl text-white/50 select-none">{p.title.charAt(0)}</span>
        )}
      </div>
      <div className="flex flex-col gap-2.5 p-5 flex-1">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-title text-xl leading-tight">{p.title}</h3>
          <PlatformBadge platform={p.platform} lang={lang} />
        </div>
        <p className="text-sm text-gray-200 line-clamp-3">{lang === "fr" ? p.description_fr : p.description_en}</p>
        <div className="mt-auto pt-1 space-y-2.5">
          <TechBadges techs={p.techs} />
          {p.project_url ? (
            <a
              href={httpUrl(p.project_url)}
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-ternary text-white text-sm font-semibold transition-all hover:bg-ternary-light hover:scale-105 w-fit"
            >
              {t.portfolio.viewProject}
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="w-3.5 h-3.5">
                <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6" />
                <path d="M15 3h6v6m-11 5L21 3" />
              </svg>
            </a>
          ) : null}
        </div>
      </div>
    </article>
  );
}
