"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type PendingState =
  | "idle"
  | "create-project"
  | "restore-checkpoint"
  | "create-next-checkpoint";

interface UseCheckpointActionsReturn {
  pending: PendingState;
  createNewProject: () => Promise<void>;
  restoreCheckpoint: (targetId: string) => Promise<void>;
  createNextCheckpoint: (params: {
    nextStepId?: string;
    checkpointId?: string;
    targetId?: string;
  }) => Promise<void>;
}

export function useCheckpointActions(): UseCheckpointActionsReturn {
  const [pending, setPending] = useState<PendingState>("idle");
  const router = useRouter();

  const createNewProject = async () => {
    if (pending !== "idle") return;

    setPending("create-project");
    try {
      const response = await fetch("/api/create-new-project", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
      });

      const result = await response.json();

      if (result.success && result.checkpointId) {
        router.push(`/${result.checkpointId}`);
      } else {
        throw new Error(result.error || "Failed to create project");
      }
    } catch (error) {
      console.error("Error creating project:", error);
      // TODO: Add proper error handling/toast notifications
    } finally {
      setPending("idle");
    }
  };

  const restoreCheckpoint = async (targetId: string) => {
    if (pending !== "idle") return;

    setPending("restore-checkpoint");
    try {
      const response = await fetch("/api/restore-checkpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ targetId }),
      });

      const result = await response.json();

      if (result.success && result.checkpointId) {
        router.push(`/${result.checkpointId}`);
      } else {
        throw new Error(result.error || "Failed to restore checkpoint");
      }
    } catch (error) {
      console.error("Error restoring checkpoint:", error);
      // TODO: Add proper error handling/toast notifications
    } finally {
      setPending("idle");
    }
  };

  const createNextCheckpoint = async (params: {
    nextStepId?: string;
    checkpointId?: string;
    targetId?: string;
  }) => {
    if (pending !== "idle") return;

    setPending("create-next-checkpoint");
    try {
      const response = await fetch("/api/create-next-checkpoint", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(params),
      });

      const result = await response.json();

      if (result.success && result.checkpointId) {
        router.push(`/${result.checkpointId}`);
      } else {
        throw new Error(result.error || "Failed to create next checkpoint");
      }
    } catch (error) {
      console.error("Error creating next checkpoint:", error);
      // TODO: Add proper error handling/toast notifications
    } finally {
      setPending("idle");
    }
  };

  return {
    pending,
    createNewProject,
    restoreCheckpoint,
    createNextCheckpoint,
  };
}
