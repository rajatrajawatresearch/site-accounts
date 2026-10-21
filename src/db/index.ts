import * as schema from "./schema";
import type { NeonHttpDatabase } from "drizzle-orm/neon-http";
import type { PgliteDatabase } from "drizzle-orm/pglite";

type Db = NeonHttpDatabase<typeof schema> | PgliteDatabase<typeof schema>;
const g = globalThis as unknown as { __db?: Db };

function create(): Db {
  const url = process.env.DATABASE_URL;
  if (url) {
    // Production / any real Postgres (Neon). Uses HTTP driver: works on Vercel serverless & edge.
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { drizzle } = require("drizzle-orm/neon-http") as typeof import("drizzle-orm/neon-http");
    // eslint-disable-next-line @typescript-eslint/no-require-imports
    const { neon } = require("@neondatabase/serverless") as typeof import("@neondatabase/serverless");
    return drizzle(neon(url), { schema });
  }
  // Local dev: embedded Postgres (PGlite) stored in ./data/pglite. Zero setup.
  // eslint-disable-next-line @typescript-eslint/no-require-imports
  const { drizzle } = require("drizzle-orm/pglite") as typeof import("drizzle-orm/pglite");
  return drizzle("./data/pglite", { schema });
}

export const db: Db = g.__db ?? (g.__db = create());
