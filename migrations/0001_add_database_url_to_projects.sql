ALTER TABLE "projects" ADD COLUMN IF NOT EXISTS "database_url" text NOT NULL DEFAULT '';
-- Backfill note: If existing rows exist, update them with correct URLs before dropping default
ALTER TABLE "projects" ALTER COLUMN "database_url" DROP DEFAULT;

