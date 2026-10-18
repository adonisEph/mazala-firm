"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { HERO_SVG } from "./hero-illustration";
import { ProjectCard } from "./ProjectCard";
import { SocialIcon, type SocialType } from "./SocialIcons";
import { T, type Lang } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";

export interface CmsProject {
  id: number;
  title: string;
  description_fr: string;
  description_en: string;
  techs: string;
  image_url: string;
  project_url: string;
  platform: "" | "web" | "mobile" | "desktop";
}

export interface CmsMember {
  id: number;
  name: string;
  role_fr: string;
  role_en: string;
  bio_fr: string;
  bio_en: string;
  photo_url: string;
  socials: string; // JSON : [{ type, url }]
}

gsap.registerPlugin(ScrollTrigger);


const SERVICE_IMAGES = ["/images/ui-design.svg", "/images/service-web.svg", "/images/service-mobile.svg"];
// Nombre max de projets « non vedettes » affichés dans la grille de la home —
// le reste est visible sur /projects.
const HOME_GRID_MAX = 6;

export default function MazalaPage({ projects, members }: { projects: CmsProject[]; members: CmsMember[] }) {
  const [lang, setLang] = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const t = T[lang];

  // ── Animations GSAP — matchMedia : breakpoint aligné sur la nav (lg=1024),
  //    désactivées sous prefers-reduced-motion ──
  useEffect(() => {
    const mm = gsap.matchMedia();
    mm.add(
      {
        isDesktop: "(min-width: 1024px)",
        isMobile: "(max-width: 1023.98px)",
        motionOk: "(prefers-reduced-motion: no-preference)",
      },
      (ctx) => {
        const { isDesktop, isMobile, motionOk } = ctx.conditions as {
          isDesktop: boolean;
          isMobile: boolean;
          motionOk: boolean;
        };
        if (!motionOk) return; // tout reste visible, aucune animation

        if (isDesktop) {
          const tl = gsap.timeline({ repeat: 0, repeatDelay: 1 });
          tl.from("#desktopNavBar", { y: -200, duration: 0.8 })
            .from("#description_text", { opacity: 0, y: 50, duration: 0.5 })
            .from("#illustration_img", { opacity: 0, x: 50, duration: 1, ease: "elastic" })
            .from("#desktop", { y: -50, opacity: 0, duration: 0.7 }, "-=.6")
            .from("#desktop-screen", { x: -100, opacity: 0, duration: 0.5 })
            .from("#desktop-screen-contents", { opacity: 0, duration: 1 })
            .from("#tablet", { y: -50, opacity: 0, duration: 0.5 }, "-=.3")
            .from("#mobile", { y: -50, opacity: 0, duration: 0.5 }, "-=.3");
        }
        if (isMobile) {
          const tl = gsap.timeline();
          tl.from("#mobileNavBar", { y: -200, duration: 1 })
            .from("#description_text", { opacity: 0, duration: 2 })
            .from("#illustration_img", { opacity: 0, y: 50, duration: 1 }, "-=3")
            .from("#desktop", { y: -50, opacity: 0, duration: 0.7 }, "-=2.4")
            .from("#desktop-screen", { x: -100, opacity: 0, duration: 0.5 }, "-=2")
            .from("#desktop-screen-contents", { opacity: 0, duration: 1 }, "-=1.5")
            .from("#tablet", { y: -50, opacity: 0, duration: 0.5 }, "-=.8")
            .from("#mobile", { y: -50, opacity: 0, duration: 0.5 }, "-=.5");
        }

        const tl2 = gsap.timeline({ scrollTrigger: { trigger: "#services", start: "top 80%" } });
        tl2.from("#firstService", { opacity: 0, y: 100, duration: 0.7 })
          .from("#secondService", { opacity: 0, y: -100, duration: 0.7 })
          .from("#thirdService", { opacity: 0, y: 100, duration: 0.7 });

        projects.forEach((_, i) => {
          gsap.from(`#grid-project-${i + 1}`, {
            scrollTrigger: { trigger: `#grid-project-${i + 1}`, start: "top 80%" },
            opacity: 0,
            y: 60,
            duration: 0.7,
          });
        });
        members.forEach((_, i) => {
          gsap.from(`#picture-member-${i + 1}`, {
            scrollTrigger: { trigger: `#picture-member-${i + 1}`, start: "top 80%" },
            opacity: 0,
            x: -60,
            duration: 0.8,
          });
          gsap.from(`#desc-member-${i + 1}`, {
            scrollTrigger: { trigger: `#desc-member-${i + 1}`, start: "top 80%" },
            opacity: 0,
            x: 60,
            duration: 0.8,
          });
        });
        gsap.from("#contact-form", {
          scrollTrigger: { trigger: "#contact-form", start: "top 80%" },
          y: 100,
          opacity: 0,
          duration: 0.8,
        });
      }
    );
    return () => mm.revert();
  }, [projects.length, members.length]);



  async function submitContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSending(true);
    setSentMsg("");
    try {
      const res = await fetch("/api/contact", { method: "POST", body: fd });
      const data = (await res.json()) as { ok?: boolean };
      setSentMsg(res.ok && data.ok ? t.contact.sent : t.contact.error);
      if (res.ok) formRef.current?.reset();
    } catch {
      setSentMsg(t.contact.error);
    } finally {
      setSending(false);
    }
  }

  const navLinks = [
    { href: "#services-title", label: t.nav.services },
    { href: "#portfolio", label: t.nav.portfolio },
    { href: "#team", label: t.nav.team },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <div className="bg-paper min-h-screen overflow-x-hidden">
      <header className="md:px-10 lg:px-24 flex flex-col items-center">
      {/* ── Navbar mobile/tablette ── */}
      <nav id="mobileNavBar" className="fixed lg:hidden z-50 top-0 left-0 w-full shadow-md bg-paper">
        <div className="flex px-4 justify-between items-center py-4 pt-[max(1rem,env(safe-area-inset-top))] text-lg bg-paper">
          <span className="font-logo text-xl text-ternary"><a href="/">Mazala</a></span>
          <div className="flex items-center gap-3">
            <LangToggle lang={lang} setLang={setLang} />
            <button
              id="toogleNavBtn"
              onClick={() => setMenuOpen((v) => !v)}
              className="p-2 -m-1 block focus:outline-none text-center"
              aria-label="Menu"
              aria-expanded={menuOpen}
              aria-controls="mobileLinks"
            >
              <svg viewBox="0 0 121 73" className="h-5 text-ternary">
                <g transform="translate(-119 -378)">
                  <g>
                    <rect width="121" height="19" rx="9.5" transform="translate(119 378)" fill="currentColor" />
                    <rect width="121" height="19" rx="9.5" transform="translate(119 405)" fill="currentColor" />
                    <rect width="121" height="19" rx="9.5" transform="translate(119 432)" fill="currentColor" />
                  </g>
                </g>
              </svg>
            </button>
          </div>
        </div>
        <ul
          id="mobileLinks"
          className={`${menuOpen ? "" : "hidden"} flex flex-col items-center space-y-6 py-10 font-title text-gray-100 shadow-2xl bg-ternary max-h-[80vh] overflow-y-auto`}
        >
          {navLinks.map((l) => (
            <li key={l.href}><a href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a></li>
          ))}
          <li className="mt-10">
            <a href="#contact" onClick={() => setMenuOpen(false)} className="bg-white text-ternary px-5 py-2 rounded-full text-lg shadow-2xl">
              {t.nav.contact}
            </a>
          </li>
        </ul>
      </nav>

      {/* ── Navbar desktop ── */}
      <nav id="desktopNavBar" className="hidden lg:flex fixed top-0 left-0 z-50 w-full justify-between text-xl items-center py-4 px-10 lg:px-24 bg-paper/95 backdrop-blur-sm shadow-sm">
        <span className="font-logo text-3xl text-ternary"><a href="/" className="hover:opacity-80 transition-opacity">Mazala</a></span>
        <ul className="font-title flex space-x-8 text-text-sec items-center">
          {navLinks.map((l) => (
            <li key={l.href}>
              <a
                href={l.href}
                className="relative transition-colors duration-300 hover:text-ternary after:absolute after:left-0 after:-bottom-1.5 after:h-[3px] after:w-0 after:rounded-full after:bg-ternary after:transition-all after:duration-300 hover:after:w-full"
              >
                {l.label}
              </a>
            </li>
          ))}
          <li><LangToggle lang={lang} setLang={setLang} /></li>
        </ul>
        <div>
          <a href="#contact" className="inline-block bg-ternary text-white px-5 py-2 rounded-full text-lg shadow-2xl transition-all duration-300 hover:bg-ternary-light hover:scale-105">
            {t.nav.contact}
          </a>
        </div>
      </nav>

      {/* ── Hero : description + illustration ── */}
      <div className="flex flex-col md:flex-row space-y-10 lg:space-y-0 md:space-x-2 lg:space-x-6 px-4 lg:px-0 pt-28 pb-14 lg:pt-32 lg:pb-16">
        <div id="description_text" className="w-full md:w-1/2 space-y-10 flex flex-col justify-center items-center md:items-start">
          <div className="lg:w-5/6">
            <h2 className="font-title text-text-sec text-center md:text-left leading-10">
              <span className="text-3xl lg:text-5xl leading-tight text-center">
                {t.hero.line1a} <span className="text-ternary">{t.hero.mobile}</span>,{" "}
                <span className="text-ternary">{t.hero.web}</span> <span className="font-logo">& </span>
                <span className="text-ternary">{t.hero.desktop}</span>
              </span>
              <span className="font-body text-lg lg:text-3xl leading-3">{t.hero.line2}</span>
            </h2>
          </div>
          {/* Bouton flip (desktop) / CTA simple (mobile) */}
          <div className="flip hidden md:block">
            <a href="#contact">
              <div className="front">{t.hero.flipFront}</div>
              <div className="back">{t.hero.flipBack}</div>
            </a>
          </div>
          <a href="#contact" className="md:hidden bg-ternary text-white px-6 py-3 rounded-full text-lg shadow-2xl">
            {t.nav.contact}
          </a>
        </div>

        {/* Illustration — SVG fidèle, ids conservés pour GSAP */}
        <div id="illustration_img" className="w-full md:w-1/2" dangerouslySetInnerHTML={{ __html: HERO_SVG }} />
      </div>
      </header>

      {/* ── Services ── */}
      <section id="services" className="px-4 md:px-10 lg:px-24 py-20 lg:py-40 flex flex-col items-center bg-secondary">
        <h2 id="services-title" className="font-title text-3xl md:text-4xl lg:text-5xl text-ternary-light">{t.services.title}</h2>
        <div className="text-lg lg:text-xl text-gray-200 text-center">{t.services.subtitle}</div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 gap-y-8 md:gap-y-0 md:gap-x-4 lg:gap-x-8 items-start">
          {t.services.items.map((s, i) => (
            <div key={i} id={["firstService", "secondService", "thirdService"][i]} className="flex flex-col items-center justify-center space-y-4">
              <div>
                <div className="w-56 h-56 lg:w-72 lg:h-72 rounded-full flex justify-center items-center shadow-2xl">
                  <img src={SERVICE_IMAGES[i]} alt={s.title} loading="lazy" decoding="async" className={`${i === 0 ? "w-1/2" : "w-2/3 h-2/3"} object-contain`} />
                </div>
              </div>
              <div>
                <div className="flex flex-col justify-center items-center space-y-1">
                  <h3 className="text-ternary-light text-2xl lg:text-3xl">{s.title}</h3>
                  <p className="text-lg lg:text-xl text-gray-200 text-center">{s.desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Portfolio (CMS) : grille uniforme, toutes les cartes identiques ── */}
      <section id="portfolio" className="flex flex-col items-center justify-center px-4 md:px-10 py-20">
        <h2 className="font-title text-3xl md:text-4xl text-ternary">{t.portfolio.title}</h2>
        <div className="text-lg lg:text-xl mt-2 text-text-sec mb-20 text-center">{t.portfolio.subtitle}</div>
        <div className="flex flex-col items-center px-4 w-full">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 w-full max-w-6xl">
            {projects.slice(0, HOME_GRID_MAX).map((p, i) => (
              <ProjectCard key={p.id} p={p} lang={lang} id={`grid-project-${i + 1}`} />
            ))}
          </div>
          <div className="w-full max-w-6xl flex justify-center md:justify-end pt-10">
            <a href="/projects" className="text-white rounded-full bg-ternary py-2 px-6 transition-all duration-300 hover:bg-ternary-light hover:scale-105 inline-block">
              {t.portfolio.viewAll}
            </a>
          </div>
        </div>
      </section>

      {/* ── Équipe — grille responsive (CMS), s'adapte au nombre de membres ── */}
      <section id="team" className="py-20 md:py-40 bg-secondary px-4 md:px-10">
        <h3 className="text-ternary font-title text-3xl md:text-4xl text-center">{t.team.title}</h3>
        <div className="mt-16 md:mt-20 flex flex-wrap justify-center gap-x-12 gap-y-14 max-w-6xl mx-auto">
          {members.map((m, i) => (
            <div key={m.id} className="w-full max-w-xs flex flex-col items-center space-y-5">
              <div
                id={`picture-member-${i + 1}`}
                className="w-52 h-52 md:w-60 md:h-60 lg:w-64 lg:h-64 rounded-full bg-top bg-cover shadow-lg"
                style={{ backgroundImage: `url(${m.photo_url})` }}
              >
                <div
                  className="rounded-full w-full h-full opacity-70"
                  style={{ background: "linear-gradient(rgb(var(--secondary) / 0.4), rgb(var(--secondary-light) / 0.4))" }}
                />
              </div>
              <div id={`desc-member-${i + 1}`} className="w-full text-gray-100 flex flex-col items-center space-y-3">
                <div className="flex flex-col items-center">
                  <span className="font-bold text-xl">{m.name}</span>
                  <span className="text-sm text-gray-200">{lang === "fr" ? m.role_fr : m.role_en}</span>
                </div>
                <a
                  href={`/team/${m.id}`}
                  className="text-white rounded-full bg-ternary py-1.5 px-6 text-sm font-semibold transition-all duration-300 hover:bg-ternary-light hover:scale-105"
                >
                  {t.team.bio}
                </a>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── Contact ── */}
      <section id="contact" className="flex flex-col justify-center items-center px-4 md:px-10 py-20">
        <h3 className="text-ternary font-title text-3xl md:text-4xl text-center">{t.contact.title}</h3>
        <div className="text-xl mt-2 text-text-sec text-center">{t.contact.subtitle}</div>
        <div id="contact-form" className="mt-10 bg-secondary px-4 py-8 md:p-20 rounded-lg w-full max-w-3xl">
          <div className="flex flex-col justify-center items-center">
            <span className="text-ternary font-title text-xl md:text-2xl text-center">
              contact<span className="font-logo">@</span>mazala.com
            </span>
            <div className="w-full flex justify-between items-center my-6">
              <hr className="flex-1" />
              <div className="mx-2 text-center text-white">{t.contact.orForm}</div>
              <hr className="flex-1" />
            </div>
          </div>
          <form ref={formRef} onSubmit={submitContact} className="space-y-4 md:text-lg">
            <div className="flex flex-col md:flex-row space-y-2 md:space-y-0 md:space-x-2 justify-between">
              <input
                placeholder={t.contact.namePh}
                type="text"
                name="name"
                required
                className="w-full md:w-1/2 px-3 py-2 rounded bg-gray-50 text-gray-800"
              />
              <input
                placeholder={t.contact.emailPh}
                type="email"
                name="email"
                required
                className="w-full md:w-1/2 px-3 py-2 rounded bg-gray-50 text-gray-800"
              />
            </div>
            <div className="space-y-4">
              <input
                className="w-full rounded bg-gray-50 text-gray-800"
                type="file"
                name="attachment"
                accept=".pdf,.doc,.docx,.xls,.xlsx,.ppt,.pptx,.txt,.md,.zip,.png,.jpg,.jpeg,.webp"
                aria-label={t.contact.fileLabel}
              />
              <textarea
                placeholder={t.contact.messagePh}
                className="w-full rounded p-3 bg-gray-50 text-gray-800"
                name="message"
                required
                cols={30}
                rows={6}
              />
            </div>
            {/* honeypot anti-bot */}
            <input type="text" name="website" className="hidden" tabIndex={-1} autoComplete="off" />
            <div className="flex justify-center">
              <button
                type="submit"
                disabled={sending}
                className="bg-ternary flex items-center justify-center shadow-2xl text-white px-6 md:px-8 text-lg md:text-xl font-semibold py-2 rounded-full disabled:opacity-60"
              >
                {sending ? t.contact.sending : t.contact.submit}
              </button>
            </div>
            {sentMsg && <p className="text-center text-white pt-2">{sentMsg}</p>}
          </form>
        </div>
      </section>

      {/* ── Footer + réseaux — fidèle (fond clair) ── */}
      <footer className="pt-24 pb-16 relative">

        <div className="flex space-x-3 justify-center">
          {([
            { href: "https://facebook.com", type: "facebook" },
            { href: "https://wa.me/", type: "whatsapp" },
            { href: "https://t.me/", type: "telegram" },
            { href: "https://www.linkedin.com/", type: "linkedin" },
          ] as { href: string; type: SocialType }[]).map((s) => (
            <a key={s.type} href={s.href} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full block hover:scale-110 transition-transform">
              <SocialIcon type={s.type} className="block h-full w-full" />
            </a>
          ))}
        </div>
        <div className="flex justify-center text-text-sec text-sm font-title mt-6">{t.footer.location}</div>
        <div className="flex justify-center mt-4">
          <ul className="flex space-x-4 text-sm text-text-sec">
            <li><a className="hover:text-ternary transition-colors" href="/about">{t.nav.about}</a></li>
            <li><a className="hover:text-ternary transition-colors" href="/policies">{t.footer.policies}</a></li>
          </ul>
        </div>
        <div className="flex justify-center text-text-sec/70 mt-6 text-xs">{t.footer.copyright}</div>
      </footer>
    </div>
  );
}

function LangToggle({ lang, setLang }: { lang: Lang; setLang: (l: Lang) => void }) {
  return (
    <div className="flex rounded-full border border-text-sec/40 overflow-hidden">
      {(["en", "fr"] as Lang[]).map((l) => (
        <button
          key={l}
          onClick={() => setLang(l)}
          className={`px-3 py-1 text-xs font-semibold uppercase transition-colors ${lang === l ? "bg-ternary text-white" : "text-text-sec hover:text-ternary"}`}
        >
          {l}
        </button>
      ))}
    </div>
  );
}
