"use client";

import { useEffect, useRef, useState } from "react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import Glide from "@glidejs/glide";
import "@glidejs/glide/dist/css/glide.core.min.css";
import { HERO_SVG } from "./hero-illustration";
import { T, type Lang } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";

export interface CmsProject {
  id: number;
  title: string;
  description_fr: string;
  description_en: string;
  techs: string;
  image_url: string;
}

export interface CmsMember {
  id: number;
  name: string;
  role_fr: string;
  role_en: string;
  bio_fr: string;
  bio_en: string;
  photo_url: string;
  linkedin: string;
}

gsap.registerPlugin(ScrollTrigger);

const LINKEDIN_SVG = (
  <svg viewBox="0 0 291.319 291.319" style={{ enableBackground: "new 0 0 291.319 291.319" } as React.CSSProperties}>
    <g>
      <path style={{ fill: "#0E76A8" }} d="M145.659,0c80.45,0,145.66,65.219,145.66,145.66s-65.21,145.659-145.66,145.659S0,226.1,0,145.66S65.21,0,145.659,0z" />
      <path style={{ fill: "#FFFFFF" }} d="M82.079,200.136h27.275v-90.91H82.079V200.136z M188.338,106.077c-13.237,0-25.081,4.834-33.483,15.504v-12.654H127.48v91.21h27.375v-49.324c0-10.424,9.55-20.593,21.512-20.593s14.912,10.169,14.912,20.338v49.57h27.275v-51.6C218.553,112.686,201.584,106.077,188.338,106.077z M95.589,100.141c7.538,0,13.656-6.118,13.656-13.656S103.127,72.83,95.589,72.83s-13.656,6.118-13.656,13.656S88.051,100.141,95.589,100.141z" />
    </g>
  </svg>
);

const SERVICE_IMAGES = ["/images/ui-design.svg", "/images/service-web.svg", "/images/service-mobile.svg"];

export default function MazalaPage({ projects, members }: { projects: CmsProject[]; members: CmsMember[] }) {
  const [lang, setLang] = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const [sending, setSending] = useState(false);
  const [sentMsg, setSentMsg] = useState("");
  const formRef = useRef<HTMLFormElement>(null);
  const t = T[lang];

  // ── Animations GSAP — reprise fidèle de js/index.js ──
  useEffect(() => {
    const ctx = gsap.context(() => {
      if (window.screen.width > 500) {
        const tl = gsap.timeline({ repeat: 0, repeatDelay: 1 });
        tl.from("#desktopNavBar", { y: -200, duration: 0.8 })
          .from("#description_text", { opacity: 0, y: 50, duration: 0.5 })
          .from("#illustration_img", { opacity: 0, x: 50, duration: 1, ease: "elastic" })
          .from("#desktop", { y: -50, opacity: 0, duration: 0.7 }, "-=.6")
          .from("#desktop-screen", { x: -100, opacity: 0, duration: 0.5 })
          .from("#desktop-screen-contents", { opacity: 0, duration: 1 })
          .from("#tablet", { y: -50, opacity: 0, duration: 0.5 }, "-=.3")
          .from("#mobile", { y: -50, opacity: 0, duration: 0.5 }, "-=.3");

        const tl2 = gsap.timeline({ scrollTrigger: { trigger: "#services", start: "+=10px" } });
        tl2.from("#firstService", { opacity: 0, y: 100, duration: 0.7 })
          .from("#secondService", { opacity: 0, y: -100, duration: 0.7 })
          .from("#thirdService", { opacity: 0, y: 100, duration: 0.7 });
      } else {
        const tl = gsap.timeline();
        tl.from("#mobileNavBar", { y: -200, duration: 1 })
          .from("#description_text", { opacity: 0, duration: 2 })
          .from("#illustration_img", { opacity: 0, y: 50, duration: 1 }, "-=3")
          .from("#desktop", { y: -50, opacity: 0, duration: 0.7 }, "-=2.4")
          .from("#desktop-screen", { x: -100, opacity: 0, duration: 0.5 }, "-=2")
          .from("#desktop-screen-contents", { opacity: 0, duration: 1 }, "-=1.5");
      }

      projects.forEach((_, i) => {
        gsap.from(`#project-${i + 1}`, {
          scrollTrigger: { trigger: `#project-${i + 1}`, start: "top center" },
          opacity: 0,
          y: 80,
          duration: 0.8,
        });
      });
      members.forEach((_, i) => {
        gsap.from(`#picture-member-${i + 1}`, {
          scrollTrigger: { trigger: `#picture-member-${i + 1}`, start: "top center" },
          opacity: 0,
          x: -60,
          duration: 0.8,
        });
        gsap.from(`#desc-member-${i + 1}`, {
          scrollTrigger: { trigger: `#desc-member-${i + 1}`, start: "top center" },
          opacity: 0,
          x: 60,
          duration: 0.8,
        });
      });
      gsap.from("#contact-form", {
        scrollTrigger: { trigger: "#contact-form", start: "top center" },
        y: 100,
        opacity: 0,
        duration: 0.8,
      });
    });
    return () => ctx.revert();
  }, [projects.length, members.length]);

  // ── Glide (slider équipe) ──
  useEffect(() => {
    if (members.length === 0) return;
    const glide = new Glide(".glide", { type: "carousel", animationDuration: 8000, autoplay: 4000, hoverpause: true });
    glide.mount();
    return () => glide.destroy();
  }, [members.length]);

  async function submitContact(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();
    const fd = new FormData(e.currentTarget);
    setSending(true);
    setSentMsg("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: String(fd.get("name") ?? ""),
          email: String(fd.get("email") ?? ""),
          message: String(fd.get("message") ?? ""),
        }),
      });
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
      {/* ── Navbar mobile ── */}
      <nav id="mobileNavBar" className="fixed md:hidden z-10 top-0 left-0 w-full shadow-md bg-ternary">
        <div className="flex px-4 justify-between items-center py-4 text-lg bg-white">
          <span className="font-logo text-xl text-ternary"><a href="/">Mazala</a></span>
          <div className="flex items-center gap-3">
            <LangToggle lang={lang} setLang={setLang} />
            <button id="toogleNavBtn" onClick={() => setMenuOpen((v) => !v)} className="h-full block focus:outline-none text-center" aria-label="Menu">
              <svg viewBox="0 0 121 73" className="h-5">
                <g transform="translate(-119 -378)">
                  <g>
                    <rect width="121" height="19" rx="9.5" transform="translate(119 378)" fill="#c80" />
                    <rect width="121" height="19" rx="9.5" transform="translate(119 405)" fill="#c80" />
                    <rect width="121" height="19" rx="9.5" transform="translate(119 432)" fill="#c80" />
                  </g>
                </g>
              </svg>
            </button>
          </div>
        </div>
        <ul
          id="mobileLinks"
          className={`${menuOpen ? "" : "hidden"} flex flex-col items-center space-y-6 py-10 font-title text-gray-100 shadow-2xl`}
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
      <nav id="desktopNavBar" className="hidden md:flex mt-6 justify-between text-xl items-center py-2 text-lg w-full bg-paper">
        <span className="font-logo text-3xl text-ternary"><a href="/">Mazala</a></span>
        <ul className="font-title flex space-x-8 text-text-sec items-center">
          {navLinks.map((l) => (
            <li key={l.href}><a href={l.href}>{l.label}</a></li>
          ))}
          <li><LangToggle lang={lang} setLang={setLang} /></li>
        </ul>
        <div>
          <a href="#contact" className="bg-ternary text-white px-5 py-2 rounded-full text-lg shadow-2xl">
            {t.nav.contact}
          </a>
        </div>
      </nav>

      {/* ── Hero : description + illustration ── */}
      <div className="flex flex-col md:flex-row space-y-10 lg:space-y-0 md:space-x-2 px-4 lg:px-0 py-28 md:py-8">
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
          {/* Bouton flip */}
          <div className="flip hidden md:block">
            <a href="#contact">
              <div className="front">{t.hero.flipFront}</div>
              <div className="back">{t.hero.flipBack}</div>
            </a>
          </div>
        </div>

        {/* Illustration — SVG fidèle, ids conservés pour GSAP */}
        <div id="illustration_img" className="w-full md:w-1/2" dangerouslySetInnerHTML={{ __html: HERO_SVG }} />
      </div>
      </header>

      {/* ── Services ── */}
      <section id="services" className="px-4 lg:px-24 py-20 lg:py-40 flex flex-col items-center bg-secondary">
        <h2 id="services-title" className="font-title text-3xl lg:text-5xl text-ternary-light">{t.services.title}</h2>
        <div className="text-lg lg:text-xl text-gray-200 text-center">{t.services.subtitle}</div>
        <div className="mt-14 grid grid-cols-1 md:grid-cols-3 lg:gap-x-8 gap-y-4 md:gap-y-0 items-start">
          {t.services.items.map((s, i) => (
            <div key={i} id={["firstService", "secondService", "thirdService"][i]} className="flex flex-col items-center justify-center space-y-4">
              <div>
                <div className="w-56 h-56 lg:w-72 lg:h-72 rounded-full flex justify-center items-center shadow-2xl">
                  <img src={SERVICE_IMAGES[i]} alt={s.title} className={`${i === 0 ? "w-1/2" : "w-2/3 h-2/3"} object-contain`} />
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

      {/* ── Portfolio (CMS) ── */}
      <section id="portfolio" className="z-50 flex flex-col items-center justify-center px-2 lg:px-10 py-20">
        <h2 className="font-title text-3xl lg:text-4xl text-ternary">{t.portfolio.title}</h2>
        <div className="text-lg lg:text-xl mt-2 text-text-sec mb-20 text-center">{t.portfolio.subtitle}</div>
        <div className="space-y-6 flex flex-col items-center px-4 w-full">
          {projects.map((p, i) => (
            <div
              key={p.id}
              id={`project-${i + 1}`}
              className="flex relative flex-col-reverse md:flex-row items-center justify-center bg-secondary text-white rounded-xl md:rounded-3xl lg:space-x-4 w-full md:w-5/6 lg:w-2/3 pb-4 md:pb-0 shadow-2xl"
            >
              <div className="w-full lg:w-1/2 space-y-2 px-4 mt-4 md:mt-0">
                <h3 className="font-title text-2xl lg:text-3xl">{p.title}</h3>
                <p className="md:text-lg text-gray-200">{lang === "fr" ? p.description_fr : p.description_en}</p>
                <div className="flex flex-wrap gap-y-1 gap-x-1 items-center">
                  {p.techs.split(",").filter(Boolean).map((tech, ti) => (
                    <div key={`${p.id}-${ti}`} className="px-4 text-sm py-2 text-white inline-block rounded-full flex justify-center items-center bg-ternary">
                      {tech.trim()}
                    </div>
                  ))}
                </div>
              </div>
              <div className="w-full lg:w-1/2 h-72 md:h-96 rounded-t-xl md:rounded-t-none md:rounded-r-2xl flex justify-center items-center bg-ternary overflow-hidden">
                {p.image_url ? (
                  <img src={p.image_url} alt={p.title} className="w-full h-full object-cover" />
                ) : null}
              </div>
            </div>
          ))}
          <div className="w-2/3 md:w-5/6 lg:w-2/3 flex justify-center md:justify-end pt-10">
            <button className="text-white rounded-full bg-ternary py-2 px-6">
              {t.portfolio.viewAll}
            </button>
          </div>
        </div>
      </section>

      {/* ── Équipe — slider Glide (CMS) ── */}
      <section id="team" className="py-20 md:py-40 bg-secondary px-4 md:px-10">
        <h3 className="text-ternary font-title text-3xl md:text-4xl text-center">{t.team.title}</h3>
        <div className="glide md:px-12">
          <div className="glide__track" data-glide-el="track">
            <ul className="glide__slides">
              {members.map((m, i) => (
                <li key={m.id} className="glide__slide">
                  <div className="flex flex-col md:flex-row mx-auto md:space-x-4 justify-center items-center space-y-4 md:space-y-0 mt-20">
                    <div
                      id={`picture-member-${i + 1}`}
                      className="w-56 h-56 md:w-72 md:h-72 lg:w-96 lg:h-96 rounded-full bg-top bg-cover shadow-lg"
                      style={{ backgroundImage: `url(${m.photo_url})` }}
                    >
                      <div
                        className="rounded-full md:w-72 md:h-72 w-56 h-56 lg:w-96 lg:h-96 opacity-70"
                        style={{ background: "linear-gradient(hsla(244, 45%, 22%, 0.4), hsla(244, 54%, 35%, 0.4))" }}
                      />
                    </div>
                    <div id={`desc-member-${i + 1}`} className="w-full md:w-1/2 h-full text-gray-100 text-xl flex flex-col space-y-4">
                      <div className="flex flex-col justify-center items-center md:items-start">
                        <span className="font-bold">{m.name}</span>
                        <span className="text-sm text-gray-200">{lang === "fr" ? m.role_fr : m.role_en}</span>
                      </div>
                      <div className="text-center md:text-left">
                        <p className="text-base md:text-lg text-center md:text-left px-6 md:pr-24 md:pl-0">
                          {lang === "fr" ? m.bio_fr : m.bio_en}
                        </p>
                      </div>
                      <div className="flex justify-center md:justify-start">
                        {m.linkedin && (
                          <div className="w-12 h-12 rounded-full shadow-2xl">
                            <a href={m.linkedin} target="_blank" rel="noreferrer">{LINKEDIN_SVG}</a>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </li>
              ))}
            </ul>
          </div>
          {/* Contrôles Glide */}
          {members.length > 1 && (
            <div className="flex justify-center mt-16">
              <div className="glide__bullets flex space-x-2" data-glide-el="controls[nav]">
                {members.map((_, i) => (
                  <button
                    key={i}
                    className="glide__bullet w-4 h-4 rounded-full bg-yellow-600 text-white p-6 flex items-center justify-center text-xl focus:outline-none"
                    data-glide-dir={`=${i}`}
                  >
                    {i === 0 ? "←" : "→"}
                  </button>
                ))}
                {/* fidèle à la maquette : ← → */}
              </div>
            </div>
          )}
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
              <input className="w-full rounded bg-gray-50 text-gray-800" type="file" name="attachment" aria-label={t.contact.fileLabel} />
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
        <div className="hidden md:block absolute bottom-6 right-8">
          <ul className="flex space-x-4 text-text-sec">
            <li><a href="/about">{t.nav.about}</a></li>
            <li><a href="/policies">{t.footer.policies}</a></li>
          </ul>
        </div>
        <div className="flex space-x-3 justify-center">
          {[
            { href: "https://facebook.com", icon: "/images/facebook.svg", alt: "Facebook" },
            { href: "https://wa.me/", icon: "/images/WhatsappColor.svg", alt: "WhatsApp" },
            { href: "https://t.me/", icon: "/images/telegram_app.svg", alt: "Telegram" },
            { href: "https://www.linkedin.com/", icon: "/images/linkedin.svg", alt: "LinkedIn" },
          ].map((s) => (
            <a key={s.alt} href={s.href} target="_blank" rel="noreferrer" className="w-10 h-10 rounded-full block hover:scale-110 transition-transform">
              <img src={s.icon} alt={s.alt} className="w-full h-full" />
            </a>
          ))}
        </div>
        <div className="flex justify-center text-gray-700 text-sm font-title mt-6">{t.footer.location}</div>
        <div className="flex md:hidden justify-center mt-4">
          <ul className="flex space-x-3 text-sm">
            <li><a className="text-[#ffa500]" href="/about">{t.nav.about}</a></li>
            <li><a className="text-[#ffa500]" href="/policies">{t.footer.policies}</a></li>
          </ul>
        </div>
        <div className="flex justify-center text-gray-600 mt-6 text-xs">{t.footer.copyright}</div>
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
