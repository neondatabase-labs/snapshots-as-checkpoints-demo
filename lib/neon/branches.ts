"use server";

import invariant from "tiny-invariant";

export type Branch = {
  id: string;
  name?: string;
  created_at?: string;
  parent_id?: string;
};

export async function getAllBranches(): Promise<Branch[]> {
  const apiKey = process.env.NEON_API_KEY;
  const projectId = process.env.NEON_PROJECT_ID || process.env.PROJECT_ID;
  invariant(apiKey, "NEON_API_KEY is required");
  invariant(projectId, "NEON_PROJECT_ID or PROJECT_ID is required");

  const url = `https://console.neon.tech/api/v2/projects/${projectId}/branches`;
  const res = await fetch(url, {
    method: "GET",
    headers: {
      Accept: "application/json",
      Authorization: `Bearer ${apiKey}`,
    },
    cache: "no-store",
  });

  if (!res.ok) {
    const text = await res.text();
    throw new Error(`Failed to list branches: ${res.status} ${text}`);
  }

  const json = (await res.json()) as unknown;
  const items: any[] = Array.isArray(json)
    ? json
    : (json as any).branches || (json as any).items || (json as any).data || [];

  return items
    .map((b: any) => ({
      id: b.id ?? b.branch?.id,
      name: b.name ?? b.branch?.name,
      created_at: b.created_at ?? b.branch?.created_at,
      parent_id: b.parent_id ?? b.branch?.parent_id,
    }))
    .filter((b: Branch) => Boolean(b.id));
}

export async function getProductionBranch(): Promise<Branch | undefined> {
  const branches = await getAllBranches();
  return branches.find((b) => b.name === "production");
}

export { getProductionBranch as default };


