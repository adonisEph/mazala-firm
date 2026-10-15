import { getRequestContext } from "@cloudflare/next-on-pages";

export function db(): D1Database {
  return getRequestContext<CloudflareEnv>().env.DB;
}
