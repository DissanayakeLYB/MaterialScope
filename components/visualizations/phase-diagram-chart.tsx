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

  // Rows keyed by composition; each boundary's temperature lands in its own
  // column so recharts can draw one Line per boundary over shared x values.
  const rows = new Map<number, Record<string, number | string>>();
  data.boundaries.forEach((boundary, index) => {
    for (const point of boundary.points) {
      const row = rows.get(point.composition) ?? { composition: point.composition };
      row[`b${index}`] = point.temperature;
      rows.set(point.composition, row);
    }
  });
  const chartData = Array.from(rows.values()).sort(
    (a, b) => Number(a.composition) - Number(b.composition)
  );

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
                dot={{ r: 2.5, fill: color, strokeWidth: 0 }}
                activeDot={{ r: 4, fill: color, strokeWidth: 0 }}
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
