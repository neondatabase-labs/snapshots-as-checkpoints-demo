"use server";

import invariant from "tiny-invariant";

export async function applySnapshot(snapshotId: string): Promise<void> {
  console.log("Applying snapshot", snapshotId);
  const apiKey = process.env.NEON_API_KEY;
  const projectId = process.env.NEON_PROJECT_ID || process.env.PROJECT_ID;
  invariant(apiKey, "NEON_API_KEY is required");
  invariant(projectId, "NEON_PROJECT_ID or PROJECT_ID is required");

  const res = await fetch(
    `https://console.neon.tech/api/v2/projects/${projectId}/snapshots/${snapshotId}/restore`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      // One-step restore with finalize to move computes so connection remains intact
      body: JSON.stringify({
        name: `restored_${Date.now()}`,
        finalize_restore: true,
      }),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(
      `Failed to apply snapshot ${snapshotId}: ${res.status} ${text}`,
    );
  }
}
