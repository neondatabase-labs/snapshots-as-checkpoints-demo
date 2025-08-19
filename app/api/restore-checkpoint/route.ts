import { NextRequest, NextResponse } from "next/server";
import { stackServerApp } from "@/lib/stack";
import { getLatestProjectForUser, listCheckpoints } from "@/lib/checkpoints";
import getProductionBranch from "@/lib/neon/branches";
import { applySnapshot } from "@/lib/neon/apply-snapshot";

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { targetId } = body;

  if (typeof targetId !== "string") {
    return NextResponse.json(
      { success: false, error: "targetId is required" },
      { status: 400 },
    );
  }

  const user = await stackServerApp.getUser({ or: "redirect" });
  const project = await getLatestProjectForUser(user.id);

  if (!project) {
    return NextResponse.json(
      { success: false, error: "No project found for user" },
      { status: 404 },
    );
  }

  try {
    const [allCheckpoints, prodBranch] = await Promise.all([
      listCheckpoints(project.id),
      getProductionBranch(project.neonProjectId),
    ]);

    if (!prodBranch) {
      throw new Error("Production branch not found");
    }

    const target = allCheckpoints.find((c) => c.id === targetId);
    if (!target) {
      return NextResponse.json(
        { success: false, error: "Target checkpoint not found" },
        { status: 404 },
      );
    }

    await applySnapshot(
      project.neonProjectId,
      target.snapshot_id,
      prodBranch.id,
    );

    return NextResponse.json({
      success: true,
      checkpointId: target.id,
    });
  } catch (error) {
    console.error("Error restoring checkpoint:", error);
    return NextResponse.json(
      { success: false, error: "Failed to restore checkpoint" },
      { status: 500 },
    );
  }
}
