import invariant from "tiny-invariant";
import { drizzle } from "drizzle-orm/neon-http";
import { neon } from "@neondatabase/serverless";
import { config } from "dotenv";
config({ path: ".env" });

export function getSql(databaseUrl: string) {
  return neon(databaseUrl);
}

export function getMetaDb() {
  invariant(process.env.DATABASE_URL, "DATABASE_URL is required");
  const sql = neon(process.env.DATABASE_URL);
  return drizzle({ client: sql });
}
