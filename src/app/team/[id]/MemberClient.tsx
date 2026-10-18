"use client";

import SubPage from "@/components/SubPage";
import { SocialIcon, parseSocials, SOCIAL_LABELS } from "@/components/SocialIcons";
import { T } from "@/lib/i18n";
import { httpUrl } from "@/lib/url";
import { useLang } from "@/lib/useLang";
import type { CmsMember } from "@/components/MazalaPage";

export default function MemberClient({ member }: { member: CmsMember }) {
  const [lang] = useLang();
  const t = T[lang];
  const socials = parseSocials(member.socials);

  return (
    <SubPage>
      <section className="px-4 md:px-10 lg:px-24 mt-40 lg:mt-28 pb-20 flex flex-col items-center">
        <a
          href="/#team"
          className="self-start mb-10 inline-flex items-center gap-2 text-text-sec font-semibold transition-colors hover:text-ternary group"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5 transition-transform group-hover:-translate-x-1">
            <path d="M19 12H5m7-7-7 7 7 7" />
          </svg>
          {t.team.back}
        </a>

        <div
          className="w-52 h-52 md:w-64 md:h-64 rounded-full bg-top bg-cover shadow-2xl"
          style={{ backgroundImage: `url(${member.photo_url})` }}
        >
          <div
            className="rounded-full w-full h-full opacity-70"
            style={{ background: "linear-gradient(rgb(var(--secondary) / 0.4), rgb(var(--secondary-light) / 0.4))" }}
          />
        </div>
        <h1 className="font-title text-3xl md:text-4xl text-secondary mt-8 text-center">{member.name}</h1>
        <p className="text-ternary font-semibold text-lg mt-1">{lang === "fr" ? member.role_fr : member.role_en}</p>

        {socials.length ? (
          <div className="flex flex-wrap justify-center gap-3 mt-5">
            {socials.map((s, i) => (
              <a
                key={i}
                href={httpUrl(s.url)}
                target="_blank"
                rel="noreferrer"
                title={SOCIAL_LABELS[s.type]}
                className="w-11 h-11 rounded-full shadow-lg block hover:scale-110 transition-transform"
              >
                <SocialIcon type={s.type} className="block h-full w-full" />
              </a>
            ))}
          </div>
        ) : null}

        <p className="mt-10 max-w-2xl text-center text-lg leading-relaxed text-text-sec whitespace-pre-line">
          {lang === "fr" ? member.bio_fr : member.bio_en}
        </p>
      </section>
    </SubPage>
  );
}
