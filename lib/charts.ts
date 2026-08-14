/**
 * Shared data contracts for the MaterialScope chart visualizations.
 *
 * These types are pure (no React, no recharts) so lesson MDX can pass data
 * objects inline and both the lazy-loading wrappers and the recharts
 * implementations agree on the shape. Units are carried explicitly so the
 * charts can format tooltips and axis labels without parsing strings.
 */

/* ------------------------------------------------------------------ */
/* PhaseDiagram                                                        */
/* ------------------------------------------------------------------ */

/** A single point on a phase boundary: composition vs. temperature. */
export interface PhasePoint {
  composition: number;
  temperature: number;
}

/**
 * One phase boundary (liquidus, solidus, solvus, invariant line…).
 * `points` is an ordered array of `{composition, temperature}` anchor
 * points; the chart connects them in order. Optionally override the color
 * (falls back to the design-system chart palette by index) or mark the
 * boundary as dashed (used for solvus / invariant lines in the lesson
 * data).
 */
export interface PhaseBoundary {
  label: string;
  points: PhasePoint[];
  color?: string;
  dashed?: boolean;
}

/**
 * A labeled phase region. `x`/`y` are the anchor coordinates (in the same
 * units as the axes) at which the region's label is centered.
 */
export interface PhaseRegion {
  label: string;
  x: number;
  y: number;
}

export interface PhaseDiagramData {
  /** Diagram title, shown in the figure header. */
  system: string;
  /** Axis / tooltip labels. Units are kept separate so tooltips can
   *  format values exactly (e.g. "30 wt% Ni", "1260 °C"). */
  xName: string;
  xUnit: string;
  yName: string;
  yUnit: string;
  /** Plot domains. Defaults are derived from the boundary points when
   *  omitted, with small padding. */
  xDomain?: [number, number];
  yDomain?: [number, number];
  /** Optional explicit tick positions (e.g. [0, 1, 2, 3, 4, 5, 6] for a
   *  0–6.7 wt% C axis). Recharts auto-generates ticks when omitted. */
  xTicks?: number[];
  yTicks?: number[];
  boundaries: PhaseBoundary[];
  regions: PhaseRegion[];
}

/* ------------------------------------------------------------------ */
/* StressStrainCurve                                                   */
/* ------------------------------------------------------------------ */

/** A single point on an engineering stress–strain curve. Strain is in
 *  percent, stress in MPa. */
export interface StressStrainPoint {
  strain: number;
  stress: number;
}

/** Optional annotations: yield point, ultimate tensile strength, and
 *  fracture. Each is drawn as a marker + a dashed guide line to the axes,
 *  with the given label. */
export interface StressStrainAnnotation {
  strain: number;
  stress: number;
  label: string;
}

export interface StressStrainAnnotations {
  yieldPoint?: StressStrainAnnotation;
  ultimateTensileStrength?: StressStrainAnnotation;
  fracture?: StressStrainAnnotation;
}

export interface StressStrainData {
  /** Curve title, shown in the figure header (e.g. the material name). */
  material: string;
  /** Representative data, engineering stress–strain. */
  data: StressStrainPoint[];
  annotations?: StressStrainAnnotations;
}

/* ------------------------------------------------------------------ */
/* PropertyComparisonChart                                             */
/* ------------------------------------------------------------------ */

export interface PropertyValue {
  material: string;
  value: number;
}

export interface PropertyComparisonData {
  /** Property name, used in the figure header and tooltips. */
  property: string;
  unit: string;
  /** Materials sorted however the author likes; bars render top-to-bottom
   *  in the given order. */
  data: PropertyValue[];
  /** Use a logarithmic value axis (values span several orders of
   *  magnitude, e.g. Young's modulus across metals/ceramics/polymers). */
  logScale?: boolean;
  /** Optional value-axis domain (e.g. [0.5, 1200] with logScale). */
  xDomain?: [number, number];
  /** Optional explicit value-axis ticks (recharts' log auto-ticks are
   *  dense); e.g. [1, 10, 100, 1000]. */
  xTicks?: number[];
}

/* ------------------------------------------------------------------ */
/* Formatting helpers                                                  */
/* ------------------------------------------------------------------ */

/** Format a number for tooltips/ticks: up to `maxDigits` decimals, no
 *  trailing zeros (1147 → "1147", 4.3 → "4.3"). */
export function formatNumber(value: number, maxDigits = 2): string {
  if (!Number.isFinite(value)) return "—";
  return value.toLocaleString("en-US", {
    maximumFractionDigits: maxDigits,
  });
}

/** True when `value` is within `[min, max]` (inclusive). */
export function inDomain(value: number, domain: [number, number]): boolean {
  return value >= domain[0] && value <= domain[1];
}
