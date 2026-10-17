/// <reference types="@cloudflare/workers-types" />

interface CloudflareEnv {
  [key: string]: unknown;
  DB: D1Database;
  AI?: Ai;
  JWT_SECRET?: string;
  RESEND_API_KEY?: string;
  ADMIN_NOTIFY_EMAIL?: string;
}

declare module "@glidejs/glide";
