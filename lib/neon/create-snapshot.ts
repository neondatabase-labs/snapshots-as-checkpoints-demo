"use server";

import invariant from "tiny-invariant";

type CreateSnapshotOptions = {
  name?: string;
  timestamp?: string; // RFC 3339; defaults to now
};

export async function createSnapshot(
  options: CreateSnapshotOptions = {},
): Promise<string> {
  const apiKey = process.env.NEON_API_KEY;
  const projectId = process.env.NEON_PROJECT_ID || process.env.PROJECT_ID;
  const branchId = process.env.NEON_BRANCH_ID || process.env.BRANCH_ID;
  invariant(apiKey, "NEON_API_KEY is required");
  invariant(projectId, "NEON_PROJECT_ID or PROJECT_ID is required");
  invariant(branchId, "NEON_BRANCH_ID or BRANCH_ID is required");

  const timestamp = options.timestamp ?? new Date().toISOString();

  const res = await fetch(
    `https://console.neon.tech/api/v2/projects/${projectId}/branches/${branchId}/snapshot`,
    {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${apiKey}`,
        Accept: "application/json",
      },
      body: JSON.stringify({
        timestamp,
        name: options.name,
      }),
      cache: "no-store",
    },
  );

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to create snapshot: ${res.status} ${text}`);
  }

  const json = (await res.json()) as unknown as { snapshot?: { id?: string } } & { id?: string };
  const snapshotId: string | undefined = json?.snapshot?.id ?? json?.id;
  invariant(snapshotId, "Snapshot ID missing in response");
  return snapshotId;
}
