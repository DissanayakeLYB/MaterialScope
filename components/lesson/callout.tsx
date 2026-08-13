import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

type CalloutVariant = "info" | "tip" | "warning";

const variantStyles: Record<CalloutVariant, string> = {
  info: "border-sky-200 bg-sky-50 text-sky-900 dark:border-sky-900 dark:bg-sky-950 dark:text-sky-100",
  tip: "border-emerald-200 bg-emerald-50 text-emerald-900 dark:border-emerald-900 dark:bg-emerald-950 dark:text-emerald-100",
  warning:
    "border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900 dark:bg-amber-950 dark:text-amber-100",
};

interface CalloutProps {
  type?: CalloutVariant;
  title?: string;
  children: ReactNode;
}

/** A highlighted box for notes, tips, and warnings inside lesson MDX. */
export function Callout({ type = "info", title, children }: CalloutProps) {
  return (
    <aside
      className={cn("my-6 rounded-lg border-l-4 p-4", variantStyles[type])}
    >
      <p className="mb-1 text-xs font-semibold uppercase tracking-wide">
        {title ?? type}
      </p>
      <div className="text-sm leading-relaxed">{children}</div>
    </aside>
  );
}
