"use server";

import { redirect } from "next/navigation";
import { stackServerApp } from "@/lib/stack";
import { resetProject, createInitialCheckpoint } from "@/lib/checkpoints";

export async function startDemoAction() {
  const user = await stackServerApp.getUser({ or: "redirect" });
  const project = await resetProject(
    user.id,
    `snapshot-agent-use-case-demo-${user.id}`,
  );
  const firstCheckpoint = await createInitialCheckpoint(
    project.id,
    project.databaseUrl,
  );
  redirect(`/${firstCheckpoint.id}`);
}
