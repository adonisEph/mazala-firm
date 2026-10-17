import { getRequestContext } from "@cloudflare/next-on-pages";

// Traduit une description FR→EN à la sauvegarde admin.
// Priorité : Workers AI (@cf/meta/m2m100-1.2b) quand la binding existe,
// sinon fallback MyMemory (dev local), sinon texte source en dernier recours.
export async function translateFrToEn(text: string): Promise<string> {
  const source = text.trim();
  if (!source) return "";
  try {
    const env = getRequestContext<CloudflareEnv>().env;
    if (env.AI) {
      const res = (await env.AI.run("@cf/meta/m2m100-1.2b", {
        text: source,
        source_lang: "french",
        target_lang: "english",
      })) as { translated_text?: string };
      if (res?.translated_text?.trim()) return res.translated_text.trim();
    }
  } catch {
    // Binding AI absente (dev) ou indisponible → fallback API externe
  }
  try {
    const r = await fetch(
      `https://api.mymemory.translated.net/get?q=${encodeURIComponent(source)}&langpair=fr|en`
    );
    const data = (await r.json()) as { responseData?: { translatedText?: string } };
    const translated = data?.responseData?.translatedText?.trim();
    if (translated) return translated;
  } catch {
    // Hors-ligne ou API indisponible → on garde le texte source
  }
  return source;
}
