"use server";

import { asc, desc, eq } from "drizzle-orm";
import { getMetaDb } from "@/lib/db";
import { checkpointsTable, projectsTable } from "@/lib/schema";
import { createSnapshot } from "@/lib/neon/create-snapshot";
import { createNeonProject, deleteNeonProject } from "@/lib/neon/projects";
import demo from "./demo";

export type ComponentVersion = "v1" | "v2" | "v3";

export type Checkpoint = {
  id: string;
  prompt: string;
  snapshot_id: string;
  next_checkpoint_id: string | null;
  created_at: string;
};

export async function createInitialCheckpoint(
  projectId: string,
): Promise<Checkpoint> {
  const db = getMetaDb();
  const step = demo[0];
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, projectId));
  if (!project) throw new Error("Project not found");
  const snapshotId = await createSnapshot(project.neonProjectId, {
    name: step.version,
  });
  const [row] = await db
    .insert(checkpointsTable)
    .values({ prompt: step.prompt || "", snapshotId, projectId })
    .returning();
  return {
    id: row.id,
    prompt: row.prompt,
    snapshot_id: row.snapshotId,
    next_checkpoint_id: row.nextCheckpointId ?? null,
    created_at: row.createdAt?.toISOString?.() ?? String(row.createdAt),
  };
}

export async function createNextCheckpoint(
  currentCheckpointId: string,
  nextStepId: string,
): Promise<Checkpoint> {
  const db = getMetaDb();
  const step = demo.find((s) => s.id === nextStepId);
  if (!step) throw new Error("Next step not found");
  // Lookup project URL to apply the mutation in the correct app DB
  const [current] = await db
    .select()
    .from(checkpointsTable)
    .where(eq(checkpointsTable.id, currentCheckpointId));
  if (!current) throw new Error("Current checkpoint not found");
  const [project] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.id, current.projectId));
  if (!project) throw new Error("Project not found for checkpoint");
  if (step.mutation) {
    await step.mutation(project.databaseUrl);
  }
  const snapshotId = await createSnapshot(project.neonProjectId, {
    name: step.version,
  });
  const [inserted] = await db
    .insert(checkpointsTable)
    .values({
      prompt: step.prompt || "",
      snapshotId,
      projectId: current.projectId,
    })
    .returning();
  await db
    .update(checkpointsTable)
    .set({ nextCheckpointId: inserted.id })
    .where(eq(checkpointsTable.id, currentCheckpointId));
  return {
    id: inserted.id,
    prompt: inserted.prompt,
    snapshot_id: inserted.snapshotId,
    next_checkpoint_id: inserted.nextCheckpointId ?? null,
    created_at:
      inserted.createdAt?.toISOString?.() ?? String(inserted.createdAt),
  };
}

export async function listCheckpoints(
  projectId: string,
): Promise<Checkpoint[]> {
  const db = getMetaDb();
  const rows = await db
    .select()
    .from(checkpointsTable)
    .where(eq(checkpointsTable.projectId, projectId))
    .orderBy(asc(checkpointsTable.createdAt));
  return rows.map((r) => ({
    id: r.id,
    prompt: r.prompt,
    snapshot_id: r.snapshotId,
    next_checkpoint_id: r.nextCheckpointId ?? null,
    created_at: r.createdAt?.toISOString?.() ?? String(r.createdAt),
  }));
}

export async function getLatestProjectForUser(ownerUserId: string) {
  const db = getMetaDb();
  const rows = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.ownerUserId, ownerUserId))
    .orderBy(desc(projectsTable.createdAt));
  return rows[0] ?? null;
}

// Reset flow for a project:
// - delete Neon project
// - delete checkpoints for the project
// - delete project row
// - create new Neon project
// - save new project row
export async function resetProject(ownerUserId: string, projectName: string) {
  const db = getMetaDb();
  // Find existing project for this user (assume single active project per user)
  const [existing] = await db
    .select()
    .from(projectsTable)
    .where(eq(projectsTable.ownerUserId, ownerUserId))
    .orderBy(desc(projectsTable.createdAt));

  if (existing) {
    // Delete Neon project
    await deleteNeonProject(existing.neonProjectId);
    // Drizzle cascades will remove checkpoints when project is deleted due to FK on cascade
    await db.delete(projectsTable).where(eq(projectsTable.id, existing.id));
  }

  // Create new Neon project
  const { neonProjectId, databaseUrl } = await createNeonProject(projectName);
  // Save new project row
  const [project] = await db
    .insert(projectsTable)
    .values({ neonProjectId, databaseUrl, ownerUserId })
    .returning();
  return project;
}
