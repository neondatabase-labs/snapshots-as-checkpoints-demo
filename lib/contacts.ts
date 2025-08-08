"use server";

import { getSql } from "@/lib/db";
import type { ComponentVersion } from "./checkpoints";
import { revalidatePath } from "next/cache";

export type ContactV1 = { id: string; name: string; email: string };
export type ContactV2 = ContactV1 & {
  role: string | null;
  company: string | null;
};
export type ContactV3 = ContactV2 & { tags: string[] | null };

export async function resetContacts() {
  const sql = getSql();
  await sql`DROP TABLE IF EXISTS contacts`;
}

export async function updateDatabaseV1() {
  const sql = getSql();
  await sql`CREATE TABLE IF NOT EXISTS contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    email TEXT NOT NULL UNIQUE
  )`;
  await sql`INSERT INTO contacts (id, name, email) VALUES (gen_random_uuid(), 'Ada Lovelace', 'ada@example.com') ON CONFLICT (email) DO NOTHING`;
  await sql`INSERT INTO contacts (id, name, email) VALUES (gen_random_uuid(), 'Alan Turing', 'alan@example.com') ON CONFLICT (email) DO NOTHING`;
  await sql`INSERT INTO contacts (id, name, email) VALUES (gen_random_uuid(), 'Grace Hopper', 'grace@example.com') ON CONFLICT (email) DO NOTHING`;
}

export async function updateDatabaseV2() {
  const sql = getSql();
  await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS role TEXT, ADD COLUMN IF NOT EXISTS company TEXT;`;
}

export async function updateDatabaseV3() {
  const sql = getSql();
  await sql`ALTER TABLE contacts ADD COLUMN IF NOT EXISTS tags TEXT[] DEFAULT '{}'::text[];`;
}

export async function fetchContactsV1(): Promise<ContactV1[]> {
  const sql = getSql();
  return (await sql`SELECT id, name, email FROM contacts ORDER BY name ASC`) as any;
}

export async function fetchContactsV2(): Promise<ContactV2[]> {
  const sql = getSql();
  return (await sql`SELECT id, name, email, role, company FROM contacts ORDER BY name ASC`) as any;
}

export async function fetchContactsV3(): Promise<ContactV3[]> {
  const sql = getSql();
  return (await sql`SELECT id, name, email, role, company, tags FROM contacts ORDER BY name ASC`) as any;
}

export async function fetchContactsByVersion(version: ComponentVersion) {
  if (version === "v1") return fetchContactsV1();
  if (version === "v2") return fetchContactsV2();
  return fetchContactsV3();
}

// Server Actions: Create / Update / Delete

export async function createContactV1Action(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const path = String(formData.get("path") || "/");
  if (!name || !email) return;
  const sql = getSql();
  await sql`INSERT INTO contacts (id, name, email) VALUES (gen_random_uuid(), ${name}, ${email}) ON CONFLICT (email) DO NOTHING`;
  revalidatePath(path);
}

export async function updateContactV1Action(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const path = String(formData.get("path") || "/");
  if (!id) return;
  const sql = getSql();
  await sql`UPDATE contacts SET name = ${name}, email = ${email} WHERE id = ${id}`;
  revalidatePath(path);
}

export async function createContactV2Action(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = formData.get("role");
  const company = formData.get("company");
  const path = String(formData.get("path") || "/");
  if (!name || !email) return;
  const sql = getSql();
  await sql`INSERT INTO contacts (id, name, email, role, company) VALUES (gen_random_uuid(), ${name}, ${email}, ${role}, ${company}) ON CONFLICT (email) DO NOTHING`;
  revalidatePath(path);
}

export async function updateContactV2Action(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = formData.get("role");
  const company = formData.get("company");
  const path = String(formData.get("path") || "/");
  if (!id) return;
  const sql = getSql();
  await sql`UPDATE contacts SET name = ${name}, email = ${email}, role = ${role}, company = ${company} WHERE id = ${id}`;
  revalidatePath(path);
}

export async function createContactV3Action(formData: FormData) {
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = formData.get("role");
  const company = formData.get("company");
  const tagsRaw = String(formData.get("tags") || "");
  const path = String(formData.get("path") || "/");
  if (!name || !email) return;
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const sql = getSql();
  await sql`INSERT INTO contacts (id, name, email, role, company, tags) VALUES (gen_random_uuid(), ${name}, ${email}, ${role}, ${company}, ${tags}) ON CONFLICT (email) DO NOTHING`;
  revalidatePath(path);
}

export async function updateContactV3Action(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const name = String(formData.get("name") || "").trim();
  const email = String(formData.get("email") || "").trim();
  const role = formData.get("role");
  const company = formData.get("company");
  const tagsRaw = String(formData.get("tags") || "");
  const path = String(formData.get("path") || "/");
  if (!id) return;
  const tags = tagsRaw
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  const sql = getSql();
  await sql`UPDATE contacts SET name = ${name}, email = ${email}, role = ${role}, company = ${company}, tags = ${tags} WHERE id = ${id}`;
  revalidatePath(path);
}

export async function deleteContactAction(formData: FormData) {
  const id = String(formData.get("id") || "").trim();
  const path = String(formData.get("path") || "/");
  if (!id) return;
  const sql = getSql();
  await sql`DELETE FROM contacts WHERE id = ${id}`;
  revalidatePath(path);
}
