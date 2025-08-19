"use server";

import { redirect } from "next/navigation";
import { stackServerApp } from "@/lib/stack";
import {
  createNextCheckpoint,
  getLatestProjectForUser,
  listCheckpoints,
} from "@/lib/checkpoints";
import getProductionBranch from "@/lib/neon/branches";
import { applySnapshot } from "@/lib/neon/apply-snapshot";

export async function advanceToAction(formData: FormData) {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const project = await getLatestProjectForUser(user.id);
  if (!project) redirect("/");

  const targetId = formData.get("targetId");
  if (typeof targetId !== "string") return;

  const [allCheckpoints, prodBranch] = await Promise.all([
    listCheckpoints(project.id),
    getProductionBranch(project.neonProjectId),
  ]);
  if (!prodBranch) throw new Error("Production branch not found");
  const target = allCheckpoints.find((c) => c.id === targetId);
  if (!target) return;
  await applySnapshot(project.neonProjectId, target.snapshot_id, prodBranch.id);
  redirect(`/${target.id}`);
}

export async function advanceToNext(formData: FormData) {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const project = await getLatestProjectForUser(user.id);
  if (!project) redirect("/");

  const nextStepId = formData.get("nextStepId");
  const targetId = formData.get("targetId");
  const checkpointId = formData.get("checkpointId");

  if (typeof nextStepId === "string" && typeof checkpointId === "string") {
    const created = await createNextCheckpoint(checkpointId, nextStepId);
    redirect(`/${created.id}`);
  }

  if (typeof targetId === "string") {
    const [allCheckpoints, prodBranch] = await Promise.all([
      listCheckpoints(project.id),
      getProductionBranch(project.neonProjectId),
    ]);
    if (!prodBranch) throw new Error("Production branch not found");
    const target = allCheckpoints.find((c) => c.id === targetId);
    if (!target) throw new Error("Target checkpoint not found");
    await applySnapshot(
      project.neonProjectId,
      target.snapshot_id,
      prodBranch.id,
    );
    redirect(`/${target.id}`);
  }

  throw new Error("Invalid next action");
}
