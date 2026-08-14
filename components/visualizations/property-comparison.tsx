"use client";

import { lazy, Suspense } from "react";

import type { PropertyComparisonData } from "@/lib/charts";
import {
  ChartFrame,
  ChartSkeleton,
} from "@/components/visualizations/chart-ui";

// recharts is pulled in only when a chart actually mounts.
const PropertyComparisonChartImpl = lazy(
  () => import("@/components/visualizations/property-comparison-chart")
);

export interface PropertyComparisonChartProps {
  data: PropertyComparisonData;
  /** Context rendered below the chart. */
  caption?: string;
}

/**
 * Bar chart comparing a named property across materials. Use `logScale`
 * when values span several orders of magnitude.
 *
 * Usage from lesson MDX:
 *
 *     <PropertyComparisonChart
 *       data={{
 *         property: "Young's modulus",
 *         unit: "GPa",
 *         logScale: true,
 *         data: [{ material: "Steel", value: 207 }, …],
 *       }}
 *       caption="…"
 *     />
 */
export function PropertyComparisonChart({
  data,
  caption,
}: PropertyComparisonChartProps) {
  const height = 340;
  return (
    <ChartFrame
      title={`${data.property} by material`}
      hint="Hover for values"
      height={height}
      caption={caption}
    >
      <Suspense fallback={<ChartSkeleton label={data.property} />}>
        <PropertyComparisonChartImpl data={data} />
      </Suspense>
    </ChartFrame>
  );
}
