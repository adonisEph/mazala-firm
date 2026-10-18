// Normalise une URL saisie à la main : sans schéma, le navigateur la traite
// comme un chemin relatif → 404. On préfixe https:// si absent.
export function httpUrl(v: string): string {
  const s = v.trim();
  if (!s) return "";
  if (/^https?:\/\//i.test(s)) return s;
  if (s.startsWith("//")) return `https:${s}`;
  return `https://${s}`;
}
