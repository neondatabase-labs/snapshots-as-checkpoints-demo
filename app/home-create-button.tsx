"use client";

import { CheckpointButton } from "@/components/checkpoint-button";
import { useCheckpointActions } from "@/hooks/use-checkpoint-actions";

export function HomeCreateButton() {
  const { pending, createNewProject } = useCheckpointActions();

  return (
    <CheckpointButton
      pending={pending === "create-project"}
      onClick={createNewProject}
      pendingText="Starting..."
      overlayTitle="Creating app"
      overlaySteps={[
        {
          label: "Cleaning up existing demo project for user",
          active: true,
        },
        { label: "Creating new Neon project", active: true },
        { label: "Waiting for Neon main branch to be queryable", active: true },
        { label: "Initializing project and first checkpoint", active: true },
      ]}
      className="rounded-full bg-[#00E599] px-5 py-2.5 font-semibold tracking-tight text-[#0C0D0D] transition-colors duration-200 hover:bg-[#00E5BF] lg:px-7 lg:py-3"
    >
      Create app
    </CheckpointButton>
  );
}
