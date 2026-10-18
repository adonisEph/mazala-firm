"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";

// Envoie une balise à /api/track à chaque navigation publique (sendBeacon :
// non bloquant, survit au changement de page). Id visiteur anonyme en localStorage.
export default function VisitorTracker() {
  const pathname = usePathname();

  useEffect(() => {
    if (!pathname || pathname.startsWith("/admin")) return;
    try {
      let v = localStorage.getItem("mz-vid");
      if (!v) {
        v = crypto.randomUUID();
        localStorage.setItem("mz-vid", v);
      }
      navigator.sendBeacon(
        "/api/track",
        new Blob([JSON.stringify({ p: pathname, v, r: document.referrer })], { type: "application/json" })
      );
    } catch {
      /* localStorage indisponible (mode privé strict) → pas de suivi */
    }
  }, [pathname]);

  return null;
}
