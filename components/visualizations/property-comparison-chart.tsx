"use client";

import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PropertyComparisonData } from "@/lib/charts";
import { formatNumber } from "@/lib/charts";
import { useChartPalette } from "@/components/visualizations/chart-ui";

/**
 * PropertyComparisonChart — horizontal bar chart comparing a property
 * (e.g. Young's modulus) across materials. Horizontal bars keep long
 * material names readable; the value axis is linear by default and can be
 * switched to logarithmic (`logScale`) when values span orders of
 * magnitude. Bars cycle the design-system chart palette.
 *
 * Rendered as a default export and imported via React.lazy by the
 * `property-comparison.tsx` wrapper.
 */

const MARGINS = { top: 12, right: 24, bottom: 8, left: 8 };
const Y_AXIS_WIDTH = 92;
const X_AXIS_HEIGHT = 36;

function PropertyTooltip({
  active,
  payload,
  unit,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: { material?: string } }>;
  unit: string;
}) {
  const entry = payload?.[0];
  if (!active || !entry) return null;
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">{entry.payload?.material}</p>
      <p className="mt-0.5 font-mono tabular-nums text-muted-foreground">
        {formatNumber(Number(entry.value), 1)} {unit}
      </p>
    </div>
  );
}

export default function PropertyComparisonChart({
  data,
}: {
  data: PropertyComparisonData;
}) {
  const palette = useChartPalette();

  // Log scale needs strictly positive values; fall back to linear otherwise.
  const logScale =
    !!data.logScale && data.data.every((d) => Number.isFinite(d.value) && d.value > 0);

  return (
    <div className="relative h-full w-full">
      <ResponsiveContainer width="100%" height="100%">
        <BarChart
          layout="vertical"
          data={data.data}
          margin={MARGINS}
          role="img"
          aria-label={`${data.property} (${data.unit}) across materials`}
        >
          <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" horizontal={false} />
          <XAxis
            type="number"
            scale={logScale ? "log" : "auto"}
            domain={data.xDomain ?? (logScale ? ["auto", "auto"] : [0, "auto"])}
            ticks={data.xTicks}
            height={X_AXIS_HEIGHT}
            tick={{ fontSize: 11, fill: palette.muted }}
            tickLine={false}
            axisLine={{ stroke: palette.grid }}
            label={{
              value: logScale
                ? `${data.property} (${data.unit}, log scale)`
                : `${data.property} (${data.unit})`,
              position: "insideBottom",
              offset: -4,
              fontSize: 11,
              fill: palette.muted,
            }}
          />
          <YAxis
            type="category"
            dataKey="material"
            width={Y_AXIS_WIDTH}
            tick={{ fontSize: 11, fill: palette.muted }}
            tickLine={false}
            axisLine={{ stroke: palette.grid }}
          />
          <Tooltip
            cursor={{ fill: palette.grid, opacity: 0.5 }}
            content={<PropertyTooltip unit={data.unit} />}
            isAnimationActive={false}
          />
          <Bar
            dataKey="value"
            radius={[0, 4, 4, 0]}
            isAnimationActive={false}
            maxBarSize={26}
          >
            {data.data.map((entry, index) => (
              <Cell key={entry.material} fill={palette.series[index % palette.series.length]} />
            ))}
          </Bar>
        </BarChart>
      </ResponsiveContainer>
    </div>
  );
}
