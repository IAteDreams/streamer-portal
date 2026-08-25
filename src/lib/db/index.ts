import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";

import * as schema from "@/lib/db/schema";

type Database = ReturnType<typeof createClient>;

/**
 * The Vercel/Supabase integration does not always use the same variable names,
 * so resolve in order of preference. `POSTGRES_URL` is the pooled connection
 * (pgBouncer, port 6543) and is what the app should use; the non-pooling URL is
 * for migrations, which pgBouncer's transaction mode cannot run.
 */
export function resolveDatabaseUrl(): string {
  const url =
    process.env.POSTGRES_URL ??
    process.env.DATABASE_URL ??
    process.env.POSTGRES_URL_NON_POOLING;

  if (!url) {
    throw new Error(
      "No database URL. Set POSTGRES_URL (or DATABASE_URL) in .env.local - " +
        "run `vercel env pull .env.development.local` if this project is linked.",
    );
  }

  return url;
}

function createClient() {
  const client = postgres(resolveDatabaseUrl(), { prepare: false });
  return drizzle(client, { schema });
}

declare global {
  var __streamerPortalDb: Database | undefined;
}

function getDb(): Database {
  // Cached on globalThis so Next's dev server does not open a new pool on every
  // hot reload.
  globalThis.__streamerPortalDb ??= createClient();
  return globalThis.__streamerPortalDb;
}

/**
 * Lazy on purpose. Connecting at module-evaluation time would make `next build`
 * fail while collecting page data, since no database is reachable at build
 * time - the connection is only needed when a request actually runs a query.
 */
export const db = new Proxy({} as Database, {
  get(_target, property, receiver) {
    return Reflect.get(getDb(), property, receiver) as unknown;
  },
});
