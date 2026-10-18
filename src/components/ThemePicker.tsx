"use client";

import { useEffect, useRef, useState } from "react";
import { THEMES, THEME_STORAGE_KEY, DEFAULT_THEME_ID } from "@/lib/themes";
import { T } from "@/lib/i18n";
import { useLang } from "@/lib/useLang";

/** Bouton flottant bas-droite — sélecteur de thème persisté en localStorage (clé mz-theme). */
export default function ThemePicker() {
  const [lang] = useLang();
  const label = T[lang].nav.theme;
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(DEFAULT_THEME_ID);
  const ref = useRef<HTMLDivElement>(null);

  // État initial lu depuis le DOM (posé par le script inline du layout avant paint).
  useEffect(() => {
    setActive(document.documentElement.dataset.theme || DEFAULT_THEME_ID);
  }, []);

  // Fermeture : clic dehors / Échap.
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!ref.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  function pick(id: string) {
    setActive(id);
    if (id === DEFAULT_THEME_ID) document.documentElement.removeAttribute("data-theme");
    else document.documentElement.dataset.theme = id;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, id);
    } catch {}
    // La couleur de la barre système PWA/navigateur suit l'accent du thème.
    document
      .querySelector('meta[name="theme-color"]')
      ?.setAttribute("content", THEMES.find((t) => t.id === id)?.sw[1] ?? "#D97706");
    setOpen(false);
  }

  return (
    <div ref={ref} className="fixed bottom-[max(1.25rem,env(safe-area-inset-bottom))] right-5 z-[60]">
      {open && (
        <div className="absolute bottom-[3.75rem] right-0 w-44 rounded-xl bg-white shadow-2xl border border-gray-100 p-1.5">
          {THEMES.map((th) => (
            <button
              key={th.id}
              type="button"
              onClick={() => pick(th.id)}
              className={`w-full flex items-center gap-2.5 rounded-lg px-2.5 py-2 text-sm text-left transition-colors ${
                active === th.id ? "bg-secondary/5 font-semibold" : "hover:bg-gray-50"
              }`}
            >
              <span className="flex -space-x-1 shrink-0">
                <span className="w-4 h-4 rounded-full border border-white shadow" style={{ background: th.sw[0] }} />
                <span className="w-4 h-4 rounded-full border border-white shadow" style={{ background: th.sw[1] }} />
              </span>
              <span className="flex-1 text-secondary">{th.label}</span>
              {active === th.id && <span className="text-ternary font-bold" aria-hidden>✓</span>}
            </button>
          ))}
        </div>
      )}

      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="w-12 h-12 rounded-full bg-ternary text-white shadow-2xl flex items-center justify-center transition-all duration-300 hover:bg-ternary-light hover:scale-110"
        aria-label={label}
        aria-expanded={open}
        title={label}
      >
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className="w-5 h-5" aria-hidden>
          <path d="M12 3a9 9 0 1 0 0 18c1.5 0 2-.8 2-1.7 0-.5-.2-.9-.5-1.2-.3-.3-.5-.7-.5-1.1 0-.9.7-1.6 1.7-1.6h2.1A4.2 4.2 0 0 0 21 11.2C21 6.6 17 3 12 3Z" />
          <circle cx="7.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="12" cy="7.5" r="1" fill="currentColor" stroke="none" />
          <circle cx="16.5" cy="10.5" r="1" fill="currentColor" stroke="none" />
        </svg>
      </button>
    </div>
  );
}
