"use client";

import { cn } from "@/lib/utils";
import { type GenerationStage, useTambo } from "@tambo-ai/react";
import { AlertCircleIcon, Loader2Icon, XCircleIcon } from "lucide-react";
import * as React from "react";

/**
 * Represents the generation stage of a message
 * @property {string} className - Optional className for custom styling
 * @property {boolean} showLabel - Whether to show the label
 */

export interface GenerationStageProps extends React.HTMLAttributes<HTMLDivElement> {
  showLabel?: boolean;
}

export function MessageGenerationStage({
  className,
  showLabel = true,
  ...props
}: GenerationStageProps) {
  const { thread, isIdle } = useTambo();
  const stage = thread?.generationStage;

  // Only render if we have a generation stage
  if (!stage) {
    return null;
  }

  // Map stage names to more user-friendly labels
  const stageLabels: Record<GenerationStage, string> = {
    IDLE: "Idle",
    CHOOSING_COMPONENT: "Choosing component",
    FETCHING_CONTEXT: "Fetching context",
    HYDRATING_COMPONENT: "Preparing component",
    STREAMING_RESPONSE: "Generating response",
    COMPLETE: "Complete",
    ERROR: "Error",
    CANCELLED: "Cancelled",
  };

  const label =
    stageLabels[stage] || stage.charAt(0).toUpperCase() + stage.slice(1);

  if (isIdle) {
    return null;
  }

  const isErrorStage = stage === "ERROR";
  const isCancelledStage = stage === "CANCELLED";

  return (
    <div
      className={cn(
        "inline-flex items-center gap-2 px-2 py-1 text-xs rounded-md bg-transparent",
        isErrorStage
          ? "text-destructive"
          : isCancelledStage
            ? "text-muted-foreground"
            : "text-muted-foreground",
        className,
      )}
      {...props}
    >
      {isErrorStage ? (
        <AlertCircleIcon className="h-3 w-3" />
      ) : isCancelledStage ? (
        <XCircleIcon className="h-3 w-3" />
      ) : (
        <Loader2Icon className="h-3 w-3 animate-spin" />
      )}
      {showLabel && <span>{label}</span>}
    </div>
  );
}
