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

import type {
  StressStrainAnnotation,
  StressStrainData,
} from "@/lib/charts";
import { formatNumber } from "@/lib/charts";
import { useChartPalette } from "@/components/visualizations/chart-ui";

/**
 * StressStrainCurve — engineering stress–strain curve.
 *
 * The curve renders in the brand cobalt. The optional yield / UTS / fracture
 * annotations are drawn as an HTML overlay (dashed guide line + colored
 * marker, positioned with the same plot-area offsets recharts derives from
 * margins + axis sizes) plus an exact-value readout strip below the plot.
 * Recharts' own ReferenceDot/ReferenceLine are deliberately NOT used: they
 * crash ("Cannot read properties of undefined (reading 'scale')") when the
 * chart renders a pass where the axis map isn't populated yet — a recharts
 * 2.x bug that takes down the whole page in React 18 dev mode.
 *
 * Rendered as a default export and imported via React.lazy by the
 * `stress-strain-curve.tsx` wrapper.
 */

const MARGINS = { top: 20, right: 24, bottom: 8, left: 8 };
const Y_AXIS_WIDTH = 52;
const X_AXIS_HEIGHT = 36;

/** Plot-area offsets, mirroring recharts' internal `calculateOffset`. */
const PLOT = {
  left: MARGINS.left + Y_AXIS_WIDTH,
  right: MARGINS.right,
  top: MARGINS.top,
  bottom: MARGINS.bottom + X_AXIS_HEIGHT,
};

interface AnnotationSpec {
  key: "yieldPoint" | "ultimateTensileStrength" | "fracture";
  marker: string;
}

function StressStrainTooltip({
  active,
  payload,
}: {
  active?: boolean;
  payload?: Array<{ value?: number; payload?: { strain?: number } }>;
}) {
  const entry = payload?.[0];
  if (!active || !entry) return null;
  return (
    <div className="rounded-md border bg-background px-3 py-2 text-xs shadow-md">
      <p className="font-medium text-foreground">Engineering stress–strain</p>
      <p className="mt-1 flex gap-3 font-mono tabular-nums text-muted-foreground">
        <span>ε = {formatNumber(Number(entry.payload?.strain), 2)}%</span>
        <span>σ = {formatNumber(Number(entry.value), 1)} MPa</span>
      </p>
    </div>
  );
}

/** Exact-value readout for the yield / UTS / fracture annotations. */
function AnnotationStrip({
  annotations,
  series,
  destructive,
}: {
  annotations: NonNullable<StressStrainData["annotations"]>;
  series: string[];
  destructive: string;
}) {
  const specs: AnnotationSpec[] = [
    { key: "yieldPoint", marker: series[1] },
    { key: "ultimateTensileStrength", marker: series[2] },
    { key: "fracture", marker: destructive },
  ];
  const items = specs.flatMap(
    (spec): Array<{ spec: AnnotationSpec; a: StressStrainAnnotation }> => {
      const a = annotations[spec.key];
      return a ? [{ spec, a }] : [];
    }
  );
  if (items.length === 0) return null;
  return (
    <div className="flex flex-wrap justify-center gap-x-5 gap-y-1 border-t bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
      {items.map(({ spec, a }) => (
        <span key={spec.key} className="flex items-center gap-1.5">
          <span
            className="inline-block h-2 w-2 rounded-full"
            style={{ backgroundColor: spec.marker }}
            aria-hidden="true"
          />
          <span className="font-medium text-foreground">{a.label}</span>
          <span className="font-mono tabular-nums">
            {formatNumber(a.stress, 1)} MPa @ ε = {formatNumber(a.strain, 2)}%
          </span>
        </span>
      ))}
    </div>
  );
}

export default function StressStrainChart({ data }: { data: StressStrainData }) {
  const palette = useChartPalette();

  const maxStrain = Math.max(...data.data.map((p) => p.strain), 0.001);
  const maxStress = Math.max(...data.data.map((p) => p.stress), 1);
  // Round to kill float noise (36 × 1.06 = 38.16000000000004 on the axis).
  const xDomain: [number, number] = [0, Number((maxStrain * 1.06).toFixed(4))];
  const yDomain: [number, number] = [0, Number((maxStress * 1.12).toFixed(4))];

  const annotations = data.annotations;
  const annotationSpecs: AnnotationSpec[] = [
    { key: "yieldPoint", marker: palette.series[1] },
    { key: "ultimateTensileStrength", marker: palette.series[2] },
    { key: "fracture", marker: palette.destructive },
  ];
  const annotationItems = annotations
    ? annotationSpecs.flatMap(
        (spec): Array<{ spec: AnnotationSpec; a: StressStrainAnnotation }> => {
          const a = annotations[spec.key];
          return a ? [{ spec, a }] : [];
        }
      )
    : [];

  return (
    <div className="flex h-full w-full flex-col">
      <div className="relative min-h-0 flex-1">
        <ResponsiveContainer width="100%" height="100%">
          <LineChart
            data={data.data}
            margin={MARGINS}
            role="img"
            aria-label={`${data.material}: stress (MPa) vs strain (%)`}
          >
            <CartesianGrid stroke={palette.grid} strokeDasharray="3 3" vertical={false} />
            <XAxis
              type="number"
              dataKey="strain"
              domain={xDomain}
              height={X_AXIS_HEIGHT}
              tick={{ fontSize: 11, fill: palette.muted }}
              tickLine={false}
              axisLine={{ stroke: palette.grid }}
              label={{
                value: "Strain (%)",
                position: "insideBottom",
                offset: -4,
                fontSize: 11,
                fill: palette.muted,
              }}
            />
            <YAxis
              type="number"
              domain={yDomain}
              width={Y_AXIS_WIDTH}
              tick={{ fontSize: 11, fill: palette.muted }}
              tickLine={false}
              axisLine={{ stroke: palette.grid }}
              label={{
                value: "Stress (MPa)",
                angle: -90,
                position: "insideLeft",
                offset: 8,
                fontSize: 11,
                fill: palette.muted,
                style: { textAnchor: "middle" },
              }}
            />
            <Tooltip
              cursor={{ stroke: palette.muted, strokeDasharray: "4 4" }}
              content={<StressStrainTooltip />}
              isAnimationActive={false}
            />
            <Line
              type="monotone"
              dataKey="stress"
              name="Stress"
              stroke={palette.series[0]}
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 5, fill: palette.series[0], strokeWidth: 0 }}
              isAnimationActive={false}
            />
          </LineChart>
        </ResponsiveContainer>

        {/* Annotation markers + guide lines. Percentage offsets resolve
            against the inner box (the plot area), exactly like the phase
            diagram's region labels. */}
        {annotationItems.length > 0 && (
          <div
            className="pointer-events-none absolute inset-0"
            style={{
              paddingLeft: PLOT.left,
              paddingRight: PLOT.right,
              paddingTop: PLOT.top,
              paddingBottom: PLOT.bottom,
            }}
          >
            <div className="relative h-full w-full">
              {annotationItems.map(({ spec, a }) => {
                const left = ((a.strain - xDomain[0]) / (xDomain[1] - xDomain[0])) * 100;
                const top =
                  (1 - (a.stress - yDomain[0]) / (yDomain[1] - yDomain[0])) * 100;
                return (
                  <div key={spec.key}>
                    {/* Dashed guide line from the marker to the axes. */}
                    <div
                      className="absolute top-0 h-full border-l border-dashed"
                      style={{
                        left: `${left}%`,
                        borderColor: palette.muted,
                        opacity: 0.6,
                      }}
                    />
                    {/* Marker with a background ring so it reads over the curve. */}
                    <span
                      className="absolute -translate-x-1/2 -translate-y-1/2 rounded-full"
                      style={{
                        left: `${left}%`,
                        top: `${top}%`,
                        width: 9,
                        height: 9,
                        backgroundColor: spec.marker,
                        border: "2px solid hsl(var(--background))",
                      }}
                    />
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>
      {annotations && (
        <AnnotationStrip
          annotations={annotations}
          series={palette.series}
          destructive={palette.destructive}
        />
      )}
    </div>
  );
}
