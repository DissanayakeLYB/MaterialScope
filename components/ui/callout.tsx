import type { ReactNode } from "react";

import { FlaskConical, Info, TriangleAlert } from "lucide-react";

import { cn } from "@/lib/utils";

export type CalloutType = "note" | "warning" | "example";
/** Legacy aliases used by older lesson MDX (info→note, tip→example). */
type LegacyType = "info" | "tip";

const config: Record<
  CalloutType,
  { icon: typeof Info; label: string; styles: string }
> = {
  note: {
    icon: Info,
    label: "Note",
    styles:
      "border-primary/25 bg-brand-muted text-foreground dark:border-primary/30 dark:bg-brand-muted",
  },
  warning: {
    icon: TriangleAlert,
    label: "Warning",
    styles:
      "border-amber-300 bg-amber-50 text-amber-950 dark:border-amber-900 dark:bg-amber-950/50 dark:text-amber-100",
  },
  example: {
    icon: FlaskConical,
    label: "Example",
    styles:
      "border-emerald-300 bg-emerald-50 text-emerald-950 dark:border-emerald-900 dark:bg-emerald-950/50 dark:text-emerald-100",
  },
};

interface CalloutProps {
  type?: CalloutType | LegacyType;
  title?: string;
  children: ReactNode;
}

/** A highlighted admonition for lesson MDX: note, warning, or example. */
export function Callout({ type = "note", title, children }: CalloutProps) {
  const normalized: CalloutType =
    type === "info" ? "note" : type === "tip" ? "example" : type;
  const { icon: Icon, label, styles } = config[normalized];

  return (
    <aside
      className={cn(
        "my-6 rounded-r-lg border border-l-4 p-4 sm:p-5",
        styles
      )}
    >
      <p
        className={cn(
          "flex items-center gap-1.5 text-2xs font-semibold uppercase tracking-wider",
          normalized === "note" && "text-primary",
          normalized === "warning" && "text-amber-700 dark:text-amber-300",
          normalized === "example" && "text-emerald-700 dark:text-emerald-300"
        )}
      >
        <Icon className="h-3.5 w-3.5" aria-hidden="true" />
        {title ?? label}
      </p>
      <div className="mt-2 text-sm leading-relaxed">{children}</div>
    </aside>
  );
}
