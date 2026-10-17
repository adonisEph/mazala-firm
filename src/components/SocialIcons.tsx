import React from "react";

// Réseaux sociaux des membres — types supportés, parsing du JSON D1,
// et rendu d'icônes uniformisé (48px rond).
export const SOCIAL_TYPES = [
  "linkedin",
  "github",
  "x",
  "facebook",
  "instagram",
  "telegram",
  "whatsapp",
  "website",
] as const;
export type SocialType = (typeof SOCIAL_TYPES)[number];
export interface SocialLink {
  type: SocialType;
  url: string;
}

export const SOCIAL_LABELS: Record<SocialType, string> = {
  linkedin: "LinkedIn",
  github: "GitHub",
  x: "X / Twitter",
  facebook: "Facebook",
  instagram: "Instagram",
  telegram: "Telegram",
  whatsapp: "WhatsApp",
  website: "Site web",
};

export function parseSocials(json: string | null | undefined): SocialLink[] {
  if (!json) return [];
  try {
    const arr = JSON.parse(json);
    return Array.isArray(arr)
      ? arr.filter(
          (s): s is SocialLink =>
            s && SOCIAL_TYPES.includes(s.type) && typeof s.url === "string" && s.url.length > 0
        )
      : [];
  } catch {
    return [];
  }
}

// Icônes déjà présentes en assets pour 4 plateformes ; les autres sont
// dessinées en SVG inline (même encombrement 48×48 arrondi).
const IMG_ICONS: Partial<Record<SocialType, string>> = {
  linkedin: "/images/linkedin.svg",
  facebook: "/images/facebook.svg",
  whatsapp: "/images/WhatsappColor.svg",
  telegram: "/images/telegram_app.svg",
};

const INLINE_ICONS: Partial<Record<SocialType, React.JSX.Element>> = {
  github: (
    <svg viewBox="0 0 24 24" className="w-12 h-12">
      <rect width="24" height="24" rx="12" fill="#24292e" />
      <path
        fill="#fff"
        transform="translate(4.5 4.5) scale(0.625)"
        d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12"
      />
    </svg>
  ),
  x: (
    <svg viewBox="0 0 24 24" className="w-12 h-12">
      <rect width="24" height="24" rx="12" fill="#000" />
      <path
        fill="#fff"
        transform="translate(4 4) scale(0.667)"
        d="M18.901 1.153h3.68l-8.04 9.19L24 22.846h-7.406l-5.8-7.584-6.638 7.584H.474l8.6-9.83L0 1.154h7.594l5.243 6.932ZM17.61 20.644h2.039L6.486 3.24H4.298Z"
      />
    </svg>
  ),
  instagram: (
    <svg viewBox="0 0 24 24" className="w-12 h-12">
      <defs>
        <linearGradient id="ig-grad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor="#feda75" />
          <stop offset="0.5" stopColor="#d62976" />
          <stop offset="1" stopColor="#962fbf" />
        </linearGradient>
      </defs>
      <rect width="24" height="24" rx="12" fill="url(#ig-grad)" />
      <rect x="5" y="5" width="14" height="14" rx="4" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="12" cy="12" r="3.2" fill="none" stroke="#fff" strokeWidth="1.8" />
      <circle cx="16.6" cy="7.4" r="1.2" fill="#fff" />
    </svg>
  ),
  website: (
    <svg viewBox="0 0 24 24" className="w-12 h-12">
      <rect width="24" height="24" rx="12" fill="#CC8800" />
      <g fill="none" stroke="#fff" strokeWidth="1.6" transform="translate(5 5) scale(0.583)">
        <circle cx="12" cy="12" r="10" />
        <path d="M2 12h20M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
      </g>
    </svg>
  ),
};

export function SocialIcon({ type }: { type: SocialType }) {
  const img = IMG_ICONS[type];
  if (img) return <img src={img} alt={SOCIAL_LABELS[type]} className="w-12 h-12" />;
  return INLINE_ICONS[type] ?? null;
}
