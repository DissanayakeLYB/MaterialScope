import { cn } from "@/lib/utils";

interface LogoProps {
  className?: string;
}

/**
 * MaterialScope logo mark — an open unit-cell (crystal lattice) wireframe
 * with an atom node at its center, plus the wordmark.
 */
export function Logo({ className }: LogoProps) {
  return (
    <span className={cn("inline-flex items-center gap-2", className)}>
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth={1.8}
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5 shrink-0 text-primary"
        aria-hidden="true"
      >
        <path d="M12 2 21 6.5 12 11 3 6.5 12 2Z" />
        <path d="M12 11 21 15.5V6.5" />
        <path d="M12 11 3 15.5V6.5" />
        <circle cx="12" cy="6.5" r="1.5" fill="currentColor" stroke="none" />
      </svg>
      <span className="font-semibold tracking-tight text-foreground">
        MaterialScope
      </span>
    </span>
  );
}
