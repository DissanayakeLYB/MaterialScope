"use client";

import { lazy, Suspense, useEffect, useMemo, useState } from "react";

import {
  getStructureConfig,
  type DerivedStructureConfig,
} from "@/lib/crystal-structures";

// three.js / drei are pulled in only when a viewer actually mounts, so lesson
// pages without a viewer never download the ~250 kB 3D bundle.
const CrystalCanvas = lazy(() => import("@/components/visualizations/crystal-canvas"));

interface CrystalViewerProps {
  /**
   * Structure to display. Lesson MDX passes these as strings; anything other
   * than sc/bcc/fcc/hcp gets a graceful "not available" fallback.
   */
  structure?: string;
  /** Whether to draw the unit cell wireframe. Defaults to true. */
  showUnitCell?: boolean;
  /** Optional defect label to surface in the info panel (e.g. "vacancy"). */
  defect?: string;
  /** Optional plane label to surface in the info panel (e.g. "(111)"). */
  plane?: string;
}

function supportsWebGL(): boolean {
  if (typeof window === "undefined") return false;
  try {
    const canvas = document.createElement("canvas");
    return !!(
      window.WebGLRenderingContext &&
      (canvas.getContext("webgl2") ||
        canvas.getContext("webgl") ||
        canvas.getContext("experimental-webgl"))
    );
  } catch {
    return false;
  }
}

/** Camera distance derived from the widest atom extent + its radius. */
function computeCameraPosition(config: DerivedStructureConfig) {
  let extent = 0;
  for (const site of config.sites) {
    extent = Math.max(
      extent,
      Math.hypot(site.position[0], site.position[1], site.position[2]) +
        config.atomRadius
    );
  }
  const d = extent * 2.7;
  return [d * 0.75, d * 0.55, d * 0.95] as [number, number, number];
}

function InfoPanel({
  config,
  defect,
  plane,
}: {
  config: DerivedStructureConfig;
  defect?: string;
  plane?: string;
}) {
  return (
    <div
      className="pointer-events-none absolute left-3 top-3 rounded-lg border bg-background/85 px-3 py-2 text-xs shadow-sm backdrop-blur"
      data-structure={config.type}
      data-cn={config.coordinationNumber}
      data-atoms={config.atomsPerCell}
      data-apf={config.apf.toFixed(3)}
      data-lattice={config.latticeCoefficient.toFixed(3)}
    >
      <p className="font-semibold text-foreground">{config.name}</p>
      <dl className="mt-1 space-y-0.5 text-muted-foreground">
        <div className="flex justify-between gap-6">
          <dt>Coordination</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {config.coordinationNumber}
          </dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt>Atoms / cell</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {config.atomsPerCell}
          </dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt>APF</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {config.apf.toFixed(3)}
          </dd>
        </div>
        <div className="flex justify-between gap-6">
          <dt>Lattice</dt>
          <dd className="font-medium tabular-nums text-foreground">
            {config.type === "hcp"
              ? `a = 2R · c/a = ${config.cOverA?.toFixed(3)}`
              : `a = ${config.latticeCoefficient.toFixed(3)}R`}
          </dd>
        </div>
        {(defect || plane) && (
          <div className="border-t pt-1 text-muted-foreground">
            {plane && <p>Plane: {plane}</p>}
            {defect && <p>Defect: {defect}</p>}
          </div>
        )}
      </dl>
    </div>
  );
}

const FALLBACK_CLASSES =
  "flex h-80 w-full items-center justify-center rounded-xl border bg-card px-6 text-center text-sm text-muted-foreground";

/**
 * Interactive 3D crystal structure viewer (react-three-fiber + drei).
 *
 * Atoms render as one instanced mesh; the unit cell wireframe as one line
 * mesh; orbit controls rotate/zoom with mouse and touch. Falls back to a
 * static card when WebGL is unavailable or the structure isn't supported.
 */
export function CrystalViewer({
  structure = "sc",
  showUnitCell = true,
  defect,
  plane,
}: CrystalViewerProps) {
  const config = getStructureConfig(structure);
  const [ready, setReady] = useState(false);
  const [webglAvailable, setWebglAvailable] = useState(false);

  useEffect(() => {
    setReady(true);
    setWebglAvailable(supportsWebGL());
  }, []);

  const cameraPosition = useMemo<[number, number, number]>(
    () => (config ? computeCameraPosition(config) : [3.2, 2.4, 3.6]),
    [config]
  );

  // Unsupported structure (e.g. "diamond" from older lesson content).
  if (!config) {
    return (
      <div className={FALLBACK_CLASSES} role="img" aria-label="Crystal viewer">
        <p>
          The <code className="font-mono">{structure}</code> structure isn&apos;t
          supported by the 3D viewer yet.
        </p>
      </div>
    );
  }

  // First render / SSR: static placeholder so hydration matches.
  if (!ready) {
    return (
      <div className={FALLBACK_CLASSES} role="img" aria-label="Crystal viewer">
        <p>Loading 3D viewer…</p>
      </div>
    );
  }

  // No WebGL: show the structure's facts instead of crashing.
  if (!webglAvailable) {
    return (
      <div
        className={FALLBACK_CLASSES}
        role="img"
        aria-label={`${config.name} unit cell`}
      >
        <div className="max-w-md space-y-1">
          <p className="font-medium text-foreground">{config.name}</p>
          <p>
            {config.coordinationNumber} nearest neighbors · {config.atomsPerCell}{" "}
            atoms per cell · APF {config.apf.toFixed(3)}
          </p>
          <p className="text-xs">
            The interactive 3D view needs WebGL, which isn&apos;t available in
            this browser.
          </p>
        </div>
      </div>
    );
  }

  return (
    <figure className="overflow-hidden rounded-xl border bg-card">
      <div className="relative h-80 w-full">
        <Suspense
          fallback={
            <div className={FALLBACK_CLASSES}>
              <p>Loading 3D viewer…</p>
            </div>
          }
        >
          <CrystalCanvas
            structure={config.type}
            showUnitCell={showUnitCell}
            cameraPosition={cameraPosition}
          />
        </Suspense>
        <InfoPanel config={config} defect={defect} plane={plane} />
      </div>
      <figcaption className="flex flex-wrap items-center justify-between gap-2 border-t bg-muted/40 px-4 py-2 text-xs text-muted-foreground">
        <span className="flex items-center gap-3">
          <span className="font-medium text-foreground">{config.name}</span>
          <span className="flex items-center gap-1.5">
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "#1e3a8a" }}
              aria-hidden="true"
            />
            corner
            <span
              className="inline-block h-2.5 w-2.5 rounded-full"
              style={{ backgroundColor: "#c05621" }}
              aria-hidden="true"
            />
            {config.type === "hcp" ? "middle" : "center / face"}
          </span>
        </span>
        <span>Drag to rotate · scroll to zoom</span>
      </figcaption>
    </figure>
  );
}
