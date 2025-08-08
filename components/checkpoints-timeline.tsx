import React from "react";
import { SubmitButton } from "@/components/submit-button";
import { cn } from "@/lib/utils";
import demo from "@/lib/demo";
import invariant from "tiny-invariant";

export type TimelineItem = {
  id: string;
  snapshot_id: string | null;
  isCurrent: boolean;
};

function getVersion(items: TimelineItem[], id: string) {
  const index = items.findIndex((i) => i.id === id);
  const step = demo[index];
  invariant(step, "Step not found");
  return step.version;
}

export default function CheckpointsTimeline({
  items,
  action,
  className,
}: {
  items: TimelineItem[];
  action: (formData: FormData) => Promise<void>;
  className?: string;
}) {
  return (
    <nav
      className={cn(
        "flex flex-wrap items-center gap-2 rounded-lg border border-[#E4E5E7] p-2 dark:border-[#303236]",
        className,
      )}
    >
      {items.map((i, idx) => (
        <React.Fragment key={i.id}>
          <form action={action}>
            <input type="hidden" name="targetId" value={i.id} />
            <SubmitButton
              pendingText={
                <span className="flex items-center gap-1">
                  {getVersion(items, i.id)}
                </span>
              }
              className={`rounded-full px-3 py-1.5 text-xs font-semibold transition-colors ${
                i.isCurrent
                  ? "bg-[#00E599]/20 text-[#1a8c66] dark:text-[#00E599]"
                  : "hover:bg-[#E4E5E7]/50 dark:hover:bg-[#303236]/50"
              }`}
              variant="ghost"
              size="sm"
            >
              <span>{getVersion(items, i.id)}</span>
            </SubmitButton>
          </form>
          {idx < items.length - 1 && <span className="opacity-30">→</span>}
        </React.Fragment>
      ))}
    </nav>
  );
}
