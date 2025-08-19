"use client";

import { useFormStatus } from "react-dom";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type Step = { label: string; active?: boolean };

export function PendingOverlay({
  title,
  steps,
}: {
  title: string;
  steps: Step[];
}) {
  const { pending } = useFormStatus();
  if (!pending) return null;
  return (
    <Dialog open>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="sr-only">{title}</DialogTitle>
        </DialogHeader>
        <h2 className="text-xl font-semibold tracking-tight">{title}</h2>
        <div className="mt-3 space-y-2">
          {steps.map((s, i) => (
            <div key={i} className="flex items-center gap-2 text-sm">
              <div
                className={`size-2 shrink-0 rounded-full ${s.active ? "bg-[#00E599]" : "bg-[#E4E5E7] dark:bg-[#303236]"}`}
              />
              <span className={s.active ? "font-medium" : "opacity-70"}>
                {s.label}
              </span>
            </div>
          ))}
        </div>
        <div className="mt-6 h-1 w-full overflow-hidden rounded bg-[#E4E5E7] dark:bg-[#303236]">
          <div className="h-full w-1/3 animate-[loading_1.2s_infinite] bg-[#00E599]" />
        </div>
        <style>{`@keyframes loading {0%{transform:translateX(-100%)}50%{transform:translateX(50%)}100%{transform:translateX(200%)}}`}</style>
      </DialogContent>
    </Dialog>
  );
}
