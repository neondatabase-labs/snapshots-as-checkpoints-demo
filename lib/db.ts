import { neon } from "@neondatabase/serverless";
import invariant from "tiny-invariant";

export function getSql() {
  invariant(process.env.DATABASE_URL, "DATABASE_URL is required");
  return neon(process.env.DATABASE_URL);
}

export function getMetaSql() {
  const url = process.env.META_DATABASE_URL;
  invariant(url, "META_DATABASE_URL is required");
  return neon(url);
}
