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

async function notifyByEmail(env: Record<string, string | undefined>, name: string, email: string, message: string) {
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
        text: `De : ${name} <${email}>\n\n${message}`,
      }),
    });
  } catch {
    /* l'email ne doit jamais faire échouer le stockage du message */
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = schema.parse(await req.json());
    if (body.website) return NextResponse.json({ ok: true }); // bot piégé — succès silencieux

    await db()
      .prepare(`INSERT INTO contact_messages (name, email, message) VALUES (?, ?, ?)`)
      .bind(body.name, body.email, body.message)
      .run();

    const env = getRequestContext<CloudflareEnv>().env as Record<string, string | undefined>;
    await notifyByEmail(env, body.name, body.email, body.message);

    return NextResponse.json({ ok: true });
  } catch {
    return NextResponse.json({ error: "Message invalide." }, { status: 400 });
  }
}
