"use client";

import { useState } from "react";
import { T, type Lang } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";

/** En-tête + pied communs aux sous-pages (/about, /policies) — fidèle à la maquette. */
export default function SubPage({ children, active }: { children: React.ReactNode; active?: "about" | "policies" }) {
  const [lang, setLang] = useLang();
  const [menuOpen, setMenuOpen] = useState(false);
  const t = T[lang];

  const navLinks = [
    { href: "/#services-title", label: t.nav.services },
    { href: "/#portfolio", label: t.nav.portfolio },
    { href: "/#team", label: t.nav.team },
    { href: "/about", label: t.nav.about },
  ];

  return (
    <div className="bg-paper min-h-screen">
      <header className="lg:px-24 flex flex-col items-center">
        {/* Mobile nav */}
        <nav className="fixed lg:hidden z-10 top-0 left-0 w-full shadow-xl bg-ternary">
          <div className="flex px-4 justify-between items-center py-4 text-lg bg-white">
            <span className="font-logo text-xl text-ternary"><a href="/">Mazala</a></span>
            <div className="flex items-center gap-3">
              <LangToggle lang={lang} setLang={setLang} />
              <button onClick={() => setMenuOpen((v) => !v)} className="h-full block focus:outline-none text-center" aria-label="Menu">
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
          <ul className={`${menuOpen ? "" : "hidden"} flex flex-col items-center space-y-6 py-10 font-title text-gray-100 shadow-2xl`}>
            {navLinks.map((l) => (
              <li key={l.href}><a href={l.href} onClick={() => setMenuOpen(false)}>{l.label}</a></li>
            ))}
            <li className="mt-10">
              <a href="/#contact" onClick={() => setMenuOpen(false)} className="bg-white text-ternary px-5 py-2 rounded-full text-lg shadow-2xl">{t.nav.contact}</a>
            </li>
          </ul>
        </nav>
        {/* Desktop nav */}
        <nav className="hidden lg:flex mt-6 justify-between text-xl items-center py-2 text-lg w-full bg-paper">
          <div><span className="font-logo text-3xl text-ternary"><a href="/">Mazala</a></span></div>
          <ul className="font-title flex space-x-8 text-text-sec items-center">
            {navLinks.map((l) => (
              <li key={l.href} className={l.href === "/about" && active === "about" ? "border-b-4 border-yellow-500" : ""}>
                <a href={l.href}>{l.label}</a>
              </li>
            ))}
            <li><LangToggle lang={lang} setLang={setLang} /></li>
          </ul>
          <div>
            <a href="/#contact" className="bg-ternary text-white px-5 py-2 rounded-full text-lg shadow-2xl">{t.nav.contact}</a>
          </div>
        </nav>
      </header>

      <main>{children}</main>

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
            <a key={s.alt} href={s.href} target="_blank" rel="noreferrer" className="w-12 h-12 rounded-full block hover:scale-110 transition-transform">
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
