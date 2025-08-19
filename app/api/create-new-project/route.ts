import { NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { resetProject, createInitialCheckpoint } from "@/lib/checkpoints";

export async function POST() {
  const user = await stackServerApp.getUser({ or: "redirect" });

  try {
    const project = await resetProject(
      user.id,
      `snapshot-agent-use-case-demo-${user.id}`,
    );
    const firstCheckpoint = await createInitialCheckpoint(project.id);

    return NextResponse.json({
      success: true,
      checkpointId: firstCheckpoint.id,
    });
  } catch (error) {
    console.error("Error creating new project:", error);
    return NextResponse.json(
      { success: false, error: "Failed to create new project" },
      { status: 500 },
    );
  }
}
