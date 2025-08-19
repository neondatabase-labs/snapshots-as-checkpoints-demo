"use client";

import { CheckpointButton } from "@/components/checkpoint-button";
import { useCheckpointActions } from "@/hooks/use-checkpoint-actions";

interface CheckpointNavigationProps {
  prevCheckpointId?: string;
  nextStep?: { id: string; prompt?: string | null };
  currentCheckpoint: {
    id: string;
    next_checkpoint_id?: string | null;
  };
}

export function CheckpointNavigation({
  prevCheckpointId,
  nextStep,
  currentCheckpoint,
}: CheckpointNavigationProps) {
  const { pending, restoreCheckpoint, createNextCheckpoint } =
    useCheckpointActions();

  const handleRevertBack = async () => {
    if (!prevCheckpointId) return;
    await restoreCheckpoint(prevCheckpointId);
  };

  const handleAdvanceNext = async () => {
    if (!nextStep) return;

    if (currentCheckpoint.next_checkpoint_id) {
      // Navigate to existing checkpoint
      await createNextCheckpoint({
        targetId: currentCheckpoint.next_checkpoint_id,
      });
    } else {
      // Create new checkpoint
      await createNextCheckpoint({
        checkpointId: currentCheckpoint.id,
        nextStepId: nextStep.id,
      });
    }
  };

  return (
    <div className="mt-4 flex items-center gap-4">
      {prevCheckpointId && (
        <CheckpointButton
          pending={pending === "restore-checkpoint"}
          onClick={handleRevertBack}
          pendingText="Reverting..."
          overlayTitle="Applying checkpoint to main branch"
          overlaySteps={[
            {
              label: "Apply checkpoint to main branch",
              active: true,
            },
          ]}
          variant="outline"
          className="rounded-full bg-transparent px-5 py-2.5 font-semibold tracking-tight text-[#0C0D0D] transition-colors duration-200 lg:px-7 lg:py-3 border border-[#E4E5E7] hover:bg-[#E4E5E7]/50 dark:text-white dark:border-[#303236]"
        >
          Revert back
        </CheckpointButton>
      )}

      {nextStep && (
        <CheckpointButton
          pending={pending === "create-next-checkpoint"}
          onClick={handleAdvanceNext}
          pendingText={
            currentCheckpoint.next_checkpoint_id
              ? "Applying snapshot..."
              : "Creating..."
          }
          overlayTitle={
            currentCheckpoint.next_checkpoint_id
              ? "Applying checkpoint"
              : "Creating next checkpoint"
          }
          overlaySteps={
            currentCheckpoint.next_checkpoint_id
              ? [{ label: "Apply snapshot to main branch", active: true }]
              : [
                  { label: "Applying changes to app DB", active: true },
                  { label: "Create snapshot", active: true },
                  { label: "Create checkpoint in DB", active: true },
                ]
          }
          className="rounded-full bg-[#00E599] px-5 py-2.5 font-semibold tracking-tight text-[#0C0D0D] transition-colors duration-200 hover:bg-[#00E5BF] lg:px-7 lg:py-3"
        >
          {currentCheckpoint.next_checkpoint_id
            ? "Next checkpoint"
            : "Create next checkpoint"}
        </CheckpointButton>
      )}
    </div>
  );
}
