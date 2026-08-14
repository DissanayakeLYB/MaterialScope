"use client";

import { lazy, Suspense } from "react";

import type { PhaseDiagramData } from "@/lib/charts";
import {
  ChartFrame,
  ChartSkeleton,
} from "@/components/visualizations/chart-ui";

// recharts is pulled in only when a diagram actually mounts, so lesson pages
// without charts never download the ~130 kB gzipped chart bundle.
const PhaseDiagramChart = lazy(
  () => import("@/components/visualizations/phase-diagram-chart")
);

export interface PhaseDiagramProps {
  data: PhaseDiagramData;
  /** Context rendered below the chart. */
  caption?: string;
}

/**
 * Binary phase diagram. Renders phase boundaries as line series with a
 * labeled-region overlay, an HTML legend, and value tooltips.
 *
 * Usage from lesson MDX:
 *
 *     <PhaseDiagram
 *       data={{ system, xName, xUnit, yName, yUnit, boundaries, regions }}
 *       caption="…"
 *     />
 */
export function PhaseDiagram({ data, caption }: PhaseDiagramProps) {
  const height = 440;
  return (
    <ChartFrame
      title={data.system}
      hint="Hover for values"
      height={height}
      caption={caption}
    >
      <Suspense fallback={<ChartSkeleton label={data.system} />}>
        <PhaseDiagramChart data={data} />
      </Suspense>
    </ChartFrame>
  );
}
