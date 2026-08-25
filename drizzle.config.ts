import { config } from "dotenv";
import { defineConfig } from "drizzle-kit";

// The CLI runs outside Next, so env files must be loaded explicitly.
config({ path: ".env.development.local" });
config({ path: ".env.local" });

// Migrations need the direct (non-pooled) connection; pgBouncer's transaction
// mode cannot run DDL.
const url =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_URL ??
  process.env.DATABASE_URL ??
  "";

export default defineConfig({
  schema: "./src/lib/db/schema.ts",
  out: "./drizzle",
  dialect: "postgresql",
  dbCredentials: { url },
});
