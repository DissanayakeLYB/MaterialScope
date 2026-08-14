"use client";

import {
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import type { PhaseBoundary, PhaseDiagramData, PhaseRegion } from "@/lib/charts";
import { formatNumber } from "@/lib/charts";
import { useChartPalette } from "@/components/visualizations/chart-ui";

/**
 * PhaseDiagram — interactive binary (or simplified) phase diagram.
 *
 * Boundaries render as line series of `{composition, temperature}` anchor
 * points; regions are labeled by overlaying HTML text positioned with the
 * *same* plot-area offsets recharts derives from margins + axis sizes, so
 * labels sit exactly where the data coordinates say they should.
 *
 * Rendered as a default export and imported via React.lazy by the
 * `phase-diagram.tsx` wrapper so recharts only downloads on pages that
 * actually contain a diagram.
 */

/** Shared between this chart and the region-label overlay. */
export const MARGINS = { top: 16, right: 24, bottom: 8, left: 8 };
export const Y_AXIS_WIDTH = 56;
export const X_AXIS_HEIGHT = 36;

/** Plot-area offsets, mirroring recharts' internal `calculateOffset`. */
const PLOT = {
  left: MARGINS.left + Y_AXIS_WIDTH,
  right: MARGINS.right,
  top: MARGINS.top,
  bottom: MARGINS.bottom + X_AXIS_HEIGHT,
};

/**
 * Linear interpolation of a boundary's points at a given composition.
 * Returns null outside the boundary's span.
 */
function interpolateBoundary(
  points: PhaseBoundary["points"],
  x: number
): number | null {
  if (x < points[0].composition || x > points[points.length - 1].composition) {
    return null;
  }
  for (let i = 0; i < points.length - 1; i++) {
    const a = points[i];
    const b = points[i + 1];
    if (x >= a.composition && x <= b.composition) {
      if (a.composition === b.composition) return a.temperature;
      const t = (x - a.composition) / (b.composition - a.composition);
      return a.temperature + t * (b.temperature - a.temperature);
    }
  }
  return null;
}

/** Default axis domains derived from the boundary points, with padding. */
function defaultDomain(points: { composition: number; temperature: number }[]): {
  xDomain: [number, number];
  yDomain: [number, number];
} {
  let xMin = Infinity;
  let xMax = -Infinity;
  let yMin = Infinity;
  let yMax = -Infinity;
  for (const p of points) {
    xMin = Math.min(xMin, p.composition);
    xMax = Math.max(xMax, p.composition);
    yMin = Math.min(yMin, p.temperature);
    yMax = Math.max(yMax, p.temperature);
  }
  const xPad = xMax - xMin === 0 ? 1 : (xMax - xMin) * 0.05;
  const yPad = (yMax - yMin) * 0.05;
  return {
    xDomain: [xMin - xPad, xMax + xPad],
    yDomain: [Math.max(0, yMin - yPad), yMax + yPad],
  };
}

interface TooltipEntry {
  name?: string;
  value?: number | string;
  color?: string;
  stroke?: string;
}

function PhaseDiagramTooltip({
  active,
  payload,
  label,
  data,
}: {
  active?: boolean;
  payload?: TooltipEntry[];
  label?: number;
  data: PhaseDiagramData;
}) {
  if (!active || !payload || payload.length === 0) return null;
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">
        {data.xName}:{" "}
        <span className="font-mono tabular-nums">
          {formatNumber(Number(label))}
        </span>{" "}
        {data.xUnit}
      </p>
      <ul className="mt-1 space-y-0.5">
        {payload.map((entry) => (
          <li
            key={entry.name}
            className="flex items-center justify-between gap-3 text-muted-foreground"
          >
            <span className="flex items-center gap-1.5">
              <span
                className="inline-block h-2 w-2 rounded-full"
                style={{ backgroundColor: entry.color || entry.stroke }}
                aria-hidden="true"
              />
              {entry.name}
            </span>
            <span className="font-mono tabular-nums text-foreground">
              {formatNumber(Number(entry.value))} {data.yUnit}
            </span>
          </li>
        ))}
      </ul>
    </div>
  );
}

function RegionLabels({
  regions,
  xDomain,
  yDomain,
}: {
  regions: PhaseRegion[];
  xDomain: [number, number];
  yDomain: [number, number];
}) {
  const [x0, x1] = xDomain;
  const [y0, y1] = yDomain;
  return (
    <div
      className="pointer-events-none absolute inset-0"
      style={{
        paddingLeft: PLOT.left,
        paddingRight: PLOT.right,
        paddingTop: PLOT.top,
        paddingBottom: PLOT.bottom,
      }}
    >
      {/* Inner relative box sized to the *content* area: percentage offsets
          on the labels resolve against this, so they land exactly on the
          data coordinates (percentages against the padded outer box would
          be measured from the padding box and drift). */}
      <div className="relative h-full w-full">
        {regions.map((region) => {
          const left = ((region.x - x0) / (x1 - x0)) * 100;
          const top = (1 - (region.y - y0) / (y1 - y0)) * 100;
          return (
            <span
              key={`${region.label}@${region.x},${region.y}`}
              className="absolute -translate-x-1/2 -translate-y-1/2 whitespace-nowrap rounded-sm bg-background/70 px-1.5 py-px text-[10px] font-semibold uppercase tracking-[0.08em] text-muted-foreground"
              style={{ left: `${left}%`, top: `${top}%` }}
            >
              {region.label}
            </span>
          );
        })}
      </div>
    </div>
  );
}

/** Assign palette colors to boundaries (index-based, honor overrides). */
function boundaryColor(boundary: PhaseBoundary, index: number, series: string[]) {
  return boundary.color ?? series[index % series.length];
}

export default function PhaseDiagramChart({ data }: { data: PhaseDiagramData }) {
  const palette = useChartPalette();
  const { xDomain, yDomain } =
    data.xDomain && data.yDomain
      ? { xDomain: data.xDomain, yDomain: data.yDomain }
      : defaultDomain(data.boundaries.flatMap((b) => b.points));

  // Densify every boundary onto a shared x-grid so the tooltip can read
  // ALL boundaries at any hovered composition (values are the same linear
  // interpolation the lines draw). Without this, a tooltip only shows the
  // boundaries that happen to have an anchor point at that exact x.
  const GRID_POINTS = 240;
  const grid = Array.from({ length: GRID_POINTS }, (_, i) => {
    const t = i / (GRID_POINTS - 1);
    return xDomain[0] + t * (xDomain[1] - xDomain[0]);
  });
  const chartData = grid.map((x) => {
    const row: Record<string, number | string> = { composition: x };
    data.boundaries.forEach((boundary, index) => {
      const value = interpolateBoundary(boundary.points, x);
      if (value !== null) row[`b${index}`] = value;
    });
    return row;
  });

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
        <LineChart
          data={chartData}
          margin={MARGINS}
          role="img"
          aria-label={`${data.system}: ${data.yName} vs ${data.xName}`}
        >
          <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
          <XAxis
            type="number"
            dataKey="composition"
            domain={xDomain}
            ticks={data.xTicks}
            height={X_AXIS_HEIGHT}
            tick={{ fontSize: 11, fill: palette.muted }}
            tickLine={false}
            axisLine={{ stroke: palette.grid }}
            label={{
              value: `${data.xName} (${data.xUnit})`,
              position: "insideBottom",
              offset: -4,
              fontSize: 11,
              fill: palette.muted,
            }}
          />
          <YAxis
            type="number"
            domain={yDomain}
            ticks={data.yTicks}
            width={Y_AXIS_WIDTH}
            tick={{ fontSize: 11, fill: palette.muted }}
            tickLine={false}
            axisLine={{ stroke: palette.grid }}
            label={{
              value: `${data.yName} (${data.yUnit})`,
              angle: -90,
              position: "insideLeft",
              offset: 10,
              fontSize: 11,
              fill: palette.muted,
              style: { textAnchor: "middle" },
            }}
          />
          <Tooltip
            cursor={{ stroke: palette.muted, strokeDasharray: "4 4" }}
            content={<PhaseDiagramTooltip data={data} />}
            isAnimationActive={false}
          />
          {data.boundaries.map((boundary, index) => {
            const color = boundaryColor(boundary, index, palette.series);
            return (
              <Line
                key={boundary.label}
                type="linear"
                dataKey={`b${index}`}
                name={boundary.label}
                stroke={color}
                strokeWidth={1.75}
                strokeDasharray={boundary.dashed ? "5 4" : undefined}
                dot={false}
                activeDot={false}
                isAnimationActive={false}
                connectNulls={false}
              />
            );
          })}
        </LineChart>
        </ResponsiveContainer>

        {/* Region labels — aligned to the plot area via the same offsets
            recharts uses, so the text lands on the exact data coordinates. */}
        <RegionLabels regions={data.regions} xDomain={xDomain} yDomain={yDomain} />
      </div>

      {/* Legend (HTML, so it wraps nicely and never overlaps the plot). */}
      <div className="flex flex-wrap justify-center gap-x-3 gap-y-0.5 px-4 pb-2 pt-1">
        {data.boundaries.map((boundary, index) => (
          <span
            key={boundary.label}
            className="flex items-center gap-1 text-2xs text-muted-foreground"
          >
            <span
              className="inline-block h-0.5 w-4 rounded-full"
              style={{
                backgroundColor: boundaryColor(boundary, index, palette.series),
              }}
              aria-hidden="true"
            />
            {boundary.label}
          </span>
        ))}
      </div>
    </div>
  );
}
