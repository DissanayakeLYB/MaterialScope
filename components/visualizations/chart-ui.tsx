"use client";

import { useEffect, useState, type ReactNode } from "react";

/**
 * Resolved chart palette.
 *
 * Colors come from the design-system CSS variables in app/globals.css
 * (--chart-1 … --chart-5, plus foreground/muted/border), read at runtime
 * because recharts draws SVG with concrete color strings — it can't consume
 * `hsl(var(--chart-1))` the way Tailwind utilities can. The values are
 * re-read when the `class` attribute of <html> changes, so a dark-mode
 * toggle re-colors charts live.
 */
export interface ChartPalette {
  series: string[]; // chart-1..5 → cobalt, copper, emerald, amber, slate
  foreground: string;
  muted: string;
  grid: string;
  border: string;
  destructive: string;
}

/** Fallbacks used only if the CSS variables are missing. */
const FALLBACK: ChartPalette = {
  series: ["#1E3A8A", "#C05621", "#059669", "#D97706", "#64748B"],
  foreground: "#0F172A",
  muted: "#64748B",
  grid: "#E2E8F0",
  border: "#E2E8F0",
  destructive: "#DC2626",
};

function readPalette(): ChartPalette {
  if (typeof window === "undefined") return FALLBACK;
  const style = getComputedStyle(document.documentElement);

  const read = (variable: string): string => {
    const raw = style.getPropertyValue(variable).trim();
    if (!raw) return "";
    const parts = raw.split(/\s+/).filter(Boolean);
    if (parts.length < 3) return "";
    return `hsl(${parts[0]} ${parts[1]}% ${parts[2]}%)`;
  };

  const series = [1, 2, 3, 4, 5].map((i) => read(`--chart-${i}`));
  return {
    series: series.map((c, i) => c || FALLBACK.series[i]),
    foreground: read("--foreground") || FALLBACK.foreground,
    muted: read("--muted-foreground") || FALLBACK.muted,
    grid: read("--border") || FALLBACK.grid,
    border: read("--border") || FALLBACK.border,
    destructive: read("--destructive") || FALLBACK.destructive,
  };
}

export function useChartPalette(): ChartPalette {
  const [palette, setPalette] = useState<ChartPalette>(FALLBACK);

  useEffect(() => {
    setPalette(readPalette());
    // Re-resolve when the theme class changes (light ⇄ dark).
    const observer = new MutationObserver(() => setPalette(readPalette()));
    observer.observe(document.documentElement, { attributes: true, attributeFilter: ["class"] });
    return () => observer.disconnect();
  }, []);

  return palette;
}

/* ------------------------------------------------------------------ */
/* Figure chrome                                                       */
/* ------------------------------------------------------------------ */

/**
 * Card frame shared by all chart visualizations: title bar, the chart
 * itself (fixed height, children fill it), and the `caption` below —
 * matching the visual language of the crystal viewer figure.
 */
export function ChartFrame({
  title,
  hint,
  height,
  caption,
  children,
}: {
  title: string;
  hint?: string;
  height: number;
  caption?: string;
  children: ReactNode;
}) {
  return (
    <figure className="my-6 overflow-hidden rounded-xl border bg-card">
      <div className="flex items-center justify-between gap-3 border-b bg-muted/40 px-4 py-2.5">
        <span className="text-xs font-semibold tracking-tight text-foreground">
          {title}
        </span>
        {hint && (
          <span className="hidden items-center gap-1.5 text-2xs font-medium uppercase tracking-wider text-muted-foreground sm:flex">
            {hint}
          </span>
        )}
      </div>
      <div className="relative w-full" style={{ height }}>
        {children}
      </div>
      {caption && (
        <figcaption className="border-t bg-muted/40 px-4 py-2 text-xs leading-relaxed text-muted-foreground">
          {caption}
        </figcaption>
      )}
    </figure>
  );
}

/** Shown while the recharts chunk loads (SSR / first paint / slow nets). */
export function ChartSkeleton({ label }: { label?: string }) {
  return (
    <div
      className="flex h-full w-full flex-col items-center justify-center gap-2 px-6 text-center"
      role="status"
      aria-label={label ? `Loading ${label}` : "Loading chart"}
    >
      <span className="h-4 w-24 animate-pulse rounded bg-muted" aria-hidden="true" />
      <span className="h-3 w-40 animate-pulse rounded bg-muted" aria-hidden="true" />
      <p className="text-xs text-muted-foreground">Loading chart…</p>
    </div>
  );
}
