import "dotenv/config";
import { defineConfig, env } from "prisma/config";

// Disable advisory locking for migrations to prevent timeouts on connection-pooled databases (e.g. Neon)
process.env.PRISMA_SCHEMA_DISABLE_ADVISORY_LOCK = "1";

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    seed: "tsx prisma/seed.ts",
  },
  datasource: {
    url: env("DATABASE_URL"),
  },
});
