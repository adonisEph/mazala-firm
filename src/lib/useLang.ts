"use client";

import { useCallback, useEffect, useState } from "react";
import type { Lang } from "./i18n";

const KEY = "mz_lang";
const EVENT = "mz-lang-change";

/** Langue partagée via localStorage + évènement custom (même onglet). */
export function useLang(): [Lang, (l: Lang) => void] {
  const [lang, setLangState] = useState<Lang>("en");

  useEffect(() => {
    const read = () => {
      try {
        const s = window.localStorage.getItem(KEY);
        if (s === "fr" || s === "en") setLangState(s);
      } catch { /* noop */ }
    };
    read();
    window.addEventListener(EVENT, read);
    window.addEventListener("storage", read);
    return () => {
      window.removeEventListener(EVENT, read);
      window.removeEventListener("storage", read);
    };
  }, []);

  const setLang = useCallback((l: Lang) => {
    try {
      window.localStorage.setItem(KEY, l);
      window.dispatchEvent(new Event(EVENT));
    } catch { /* noop */ }
    setLangState(l);
  }, []);

  return [lang, setLang];
}
