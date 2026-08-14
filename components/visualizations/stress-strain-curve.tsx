"use client";

import { lazy, Suspense } from "react";

import type { StressStrainData } from "@/lib/charts";
import {
  ChartFrame,
  ChartSkeleton,
} from "@/components/visualizations/chart-ui";

// recharts is pulled in only when a chart actually mounts.
const StressStrainChart = lazy(
  () => import("@/components/visualizations/stress-strain-chart")
);

export interface StressStrainCurveProps {
  data: StressStrainData;
  /** Context rendered below the chart. */
  caption?: string;
}

/**
 * Engineering stress–strain curve. Optionally annotate the yield point,
 * ultimate tensile strength, and fracture point — each draws a colored
 * marker, a dashed guide line, and an exact-value readout below the plot.
 *
 * Usage from lesson MDX:
 *
 *     <StressStrainCurve
 *       data={{
 *         material: "Annealed 1018 steel",
 *         data: [{ strain, stress }, …],
 *         annotations: {
 *           yieldPoint: { strain, stress, label: "Yield" },
 *           ultimateTensileStrength: { strain, stress, label: "UTS" },
 *           fracture: { strain, stress, label: "Fracture" },
 *         },
 *       }}
 *       caption="…"
 *     />
 */
export function StressStrainCurve({ data, caption }: StressStrainCurveProps) {
  const height = 380;
  return (
    <ChartFrame
      title={`${data.material} — stress–strain`}
      hint="Hover for values"
      height={height}
      caption={caption}
    >
      <Suspense fallback={<ChartSkeleton label={data.material} />}>
        <StressStrainChart data={data} />
      </Suspense>
    </ChartFrame>
  );
}
