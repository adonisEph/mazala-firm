import { NextRequest, NextResponse } from "next/server";
import { getRequestContext } from "@cloudflare/next-on-pages";
import { z } from "zod";
import { db } from "@/lib/db";

export const runtime = "edge";

const schema = z.object({
  name: z.string().trim().min(1).max(150),
  email: z.string().trim().email().max(200),
  message: z.string().trim().min(1).max(5000),
  website: z.string().max(0).optional(), // honeypot anti-bot
});

const MAX_FILE = 5 * 1024 * 1024; // 5 Mo
// Extensions acceptées → vérificateur de magic bytes (le type MIME client peut mentir).
const FILE_CHECKS: Record<string, (b: Uint8Array) => boolean> = {
  pdf: (b) => b[0] === 0x25 && b[1] === 0x50 && b[2] === 0x44 && b[3] === 0x46, // %PDF
  doc: (b) => b[0] === 0xd0 && b[1] === 0xcf, // OLE2
  xls: (b) => b[0] === 0xd0 && b[1] === 0xcf,
  ppt: (b) => b[0] === 0xd0 && b[1] === 0xcf,
  docx: (b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03, // conteneur ZIP
  xlsx: (b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03,
  pptx: (b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03,
  zip: (b) => b[0] === 0x50 && b[1] === 0x4b && b[2] === 0x03,
  png: (b) => b[0] === 0x89 && b[1] === 0x50,
  jpg: (b) => b[0] === 0xff && b[1] === 0xd8,
  jpeg: (b) => b[0] === 0xff && b[1] === 0xd8,
  webp: (b) => b[0] === 0x52 && b[8] === 0x57 && b[9] === 0x45, // RIFF…WE
  txt: () => true,
  md: () => true,
};

function safeName(name: string): string {
  const base = name.replace(/\\/g, "/").split("/").pop() ?? "fichier";
  return base.replace(/[^\w.() -]/g, "_").slice(0, 150) || "fichier";
}

function toBase64(buf: Uint8Array): string {
  let s = "";
  for (let i = 0; i < buf.length; i += 0x8000) s += String.fromCharCode(...buf.subarray(i, i + 0x8000));
  return btoa(s);
}

async function notifyByEmail(
  env: Record<string, string | undefined>,
  name: string,
  email: string,
  message: string,
  file?: { name: string; buf: Uint8Array }
) {
  const key = env.RESEND_API_KEY;
  if (!key) return; // notification silencieusement désactivée si non configurée
  const to = env.ADMIN_NOTIFY_EMAIL ?? "contact@mazala.com";
  try {
    await fetch("https://api.resend.com/emails", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        from: "Mazala Firm <contact@mazala.com>",
        to: [to],
        subject: `Nouveau message — ${name}`,
        text: `De : ${name} <${email}>\n\n${message}${file ? `\n\nPièce jointe : ${file.name}` : ""}`,
        ...(file ? { attachments: [{ filename: file.name, content: toBase64(file.buf) }] } : {}),
      }),
    });
  } catch {
    /* l'email ne doit jamais faire échouer le stockage du message */
  }
}

export async function POST(req: NextRequest) {
  try {
    const fd = await req.formData().catch(() => null);
    if (!fd) return NextResponse.json({ error: "Message invalide." }, { status: 400 });

    const body = schema.parse({
      name: String(fd.get("name") ?? ""),
      email: String(fd.get("email") ?? ""),
      message: String(fd.get("message") ?? ""),
      website: String(fd.get("website") ?? ""),
    });
    if (body.website) return NextResponse.json({ ok: true }); // bot piégé — succès silencieux

    // Pièce jointe facultative : extension whitelistée + magic bytes vérifiés.
    const file = fd.get("attachment");
    let att: { name: string; mime: string; buf: Uint8Array } | null = null;
    if (file instanceof File && file.size > 0) {
      if (file.size > MAX_FILE) {
        return NextResponse.json({ error: "Pièce jointe trop lourde (5 Mo max)" }, { status: 413 });
      }
      const ext = safeName(file.name).split(".").pop()?.toLowerCase() ?? "";
      const check = FILE_CHECKS[ext];
      const buf = new Uint8Array(await file.arrayBuffer());
      if (!check || !check(buf)) {
        return NextResponse.json(
          { error: "Format de pièce jointe refusé (pdf, office, txt, zip, images)" },
          { status: 400 }
        );
      }
      att = { name: safeName(file.name), mime: file.type || "application/octet-stream", buf };
    }

    const r = await db()
      .prepare(`INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)`)
      .bind(body.name, body.email, body.message)
      .run();

    if (att) {
      await db()
        .prepare(`INSERT INTO attachments (message_id, filename, mime, size, data) VALUES (?, ?, ?, ?, ?)`)
        .bind(r.meta.last_row_id, att.name, att.mime, att.buf.length, att.buf.buffer)
        .run();
    }

    const env = getRequestContext<CloudflareEnv>().env as Record<string, string | undefined>;
    await notifyByEmail(env, body.name, body.email, body.message, att ? { name: att.name, buf: att.buf } : undefined);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Message invalide." }, { status: 400 });
  }
}
