"use server";

import { getMetaSql } from "@/lib/db";
import { createSnapshot } from "@/lib/neon/create-snapshot";
import demo from "./demo";

export type ComponentVersion = "v1" | "v2" | "v3";

export type Checkpoint = {
  id: string;
  prompt: string;
  snapshot_id: string;
  next_checkpoint_id: string | null;
  created_at: string;
};

export async function createInitialCheckpoint(): Promise<Checkpoint> {
  const sql = getMetaSql();
  await sql`CREATE TABLE IF NOT EXISTS checkpoints (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    prompt TEXT NOT NULL,
    snapshot_id TEXT NOT NULL,
    next_checkpoint_id UUID NULL REFERENCES checkpoints(id) ON DELETE SET NULL,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
  )`;
  const step = demo[0];
  const { prompt, mutation } = step;
  await mutation();
  const snapshotId = await createSnapshot({ name: step.version });
  const inserted = (await sql`
    INSERT INTO checkpoints (prompt, snapshot_id)
    VALUES (${prompt}, ${snapshotId})
    RETURNING *
  `) as any[];
  return inserted[0] as Checkpoint;
}

export async function createNextCheckpoint(
  currentCheckpointId: string,
  step: (typeof demo)[number],
): Promise<Checkpoint> {
  const sql = getMetaSql();
  await step.mutation();
  const snapshotId = await createSnapshot({
    name: step.version,
  });
  const inserted = (await sql`
    INSERT INTO checkpoints (prompt, snapshot_id)
    VALUES (${step.prompt}, ${snapshotId})
    RETURNING *
  `) as any[];
  await sql`UPDATE checkpoints SET next_checkpoint_id = ${inserted[0].id} WHERE id = ${currentCheckpointId}`;
  return inserted[0] as Checkpoint;
}

export async function listCheckpoints(): Promise<Checkpoint[]> {
  const sql = getMetaSql();
  const rows =
    (await sql`SELECT * FROM checkpoints ORDER BY created_at ASC`) as any[];
  return rows as Checkpoint[];
}

export async function resetCheckpoints(): Promise<void> {
  const metaSql = getMetaSql();
  await metaSql`DROP TABLE IF EXISTS checkpoints`;
}

export async function updateCheckpointSnapshot(
  checkpointId: string,
  name?: string,
): Promise<Checkpoint> {
  const sql = getMetaSql();
  const snapshotId = await createSnapshot({ name });
  const updated = (await sql`
    UPDATE checkpoints
    SET snapshot_id = ${snapshotId}
    WHERE id = ${checkpointId}
    RETURNING *
  `) as any[];
  if (!updated || updated.length === 0) {
    throw new Error("Checkpoint not found");
  }
  return updated[0] as Checkpoint;
}
