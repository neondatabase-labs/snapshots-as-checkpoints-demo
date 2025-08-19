"use client";

import * as React from "react";
import { useFormStatus } from "react-dom";
import { Button, type ButtonProps } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";

type SubmitButtonProps = ButtonProps & {
  pendingText?: React.ReactNode;
  overlayTitle?: string;
  overlaySteps?: { label: string; active?: boolean }[];
};

function Spinner() {
  return (
    <svg
      className="h-4 w-4 animate-spin text-current"
      viewBox="0 0 24 24"
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      aria-hidden="true"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v4a4 4 0 00-4 4H4z"
      />
    </svg>
  );
}

export function SubmitButton({
  children,
  pendingText,
  overlayTitle,
  overlaySteps,
  ...props
}: SubmitButtonProps) {
  const { pending } = useFormStatus();
  return (
    <>
      <Button
        type="submit"
        disabled={pending}
        aria-disabled={pending}
        {...props}
      >
        {pending && <Spinner />}
        {pending ? (pendingText ?? children) : children}
      </Button>
      {pending && overlayTitle && (
        <Dialog open>
          <DialogContent className="sm:max-w-md">
            <DialogHeader>
              <DialogTitle className="sr-only">{overlayTitle}</DialogTitle>
            </DialogHeader>
            <h2 className="text-xl font-semibold tracking-tight">
              {overlayTitle}
            </h2>
            {Array.isArray(overlaySteps) && overlaySteps.length > 0 && (
              <div className="mt-3 space-y-2">
                {overlaySteps.map((s, i) => (
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
            )}
            <div className="mt-6 h-1 w-full overflow-hidden rounded bg-[#E4E5E7] dark:bg-[#303236]">
              <div className="h-full w-1/3 animate-[loading_1.2s_infinite] bg-[#00E599]" />
            </div>
            <style>{`@keyframes loading {0%{transform:translateX(-100%)}50%{transform:translateX(50%)}100%{transform:translateX(200%)}}`}</style>
          </DialogContent>
        </Dialog>
      )}
    </>
  );
}
