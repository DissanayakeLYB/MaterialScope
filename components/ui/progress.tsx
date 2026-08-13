import * as React from "react";

import { cn } from "@/lib/utils";

export interface ProgressProps extends React.HTMLAttributes<HTMLDivElement> {
  /** Completion percentage, 0–100. No backend yet — pass a static value. */
  value?: number;
  /** Bar thickness. */
  size?: "sm" | "default" | "lg";
  /** Render a small percentage label next to the bar. */
  showLabel?: boolean;
}

/**
 * Visual-only course completion bar. There is no progress backend yet, so
 * `value` is supplied by the caller (e.g. `0` until tracking lands).
 */
function Progress({
  value = 0,
  size = "default",
  showLabel = false,
  className,
  ...props
}: ProgressProps) {
  const clamped = Math.min(100, Math.max(0, value));

  return (
    <div className={cn("flex items-center gap-3", className)} {...props}>
      <div
        role="progressbar"
        aria-valuemin={0}
        aria-valuemax={100}
        aria-valuenow={clamped}
        aria-label="Course progress"
        className={cn(
          "relative w-full overflow-hidden rounded-full bg-secondary",
          size === "sm" && "h-1.5",
          size === "default" && "h-2",
          size === "lg" && "h-3"
        )}
      >
        <div
          className="h-full rounded-full bg-primary transition-[width] duration-500 ease-out"
          style={{ width: `${clamped}%` }}
        />
      </div>
      {showLabel && (
        <span className="shrink-0 text-xs font-medium tabular-nums text-muted-foreground">
          {clamped}%
        </span>
      )}
    </div>
  );
}

export { Progress };
