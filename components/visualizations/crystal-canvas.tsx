"use client";

import { Suspense } from "react";
import { Canvas } from "@react-three/fiber";

import { CrystalScene } from "@/components/visualizations/crystal-scene";
import type { StructureType } from "@/lib/crystal-structures";

interface CrystalCanvasProps {
  structure: StructureType;
  showUnitCell: boolean;
  cameraPosition: [number, number, number];
}

/**
 * The heavy three.js canvas. Imported lazily (React.lazy in crystal-viewer)
 * so lesson pages without a crystal viewer never download the three.js
 * bundle. Kept separate from the viewer wrapper for that reason.
 */
export default function CrystalCanvas({
  structure,
  showUnitCell,
  cameraPosition,
}: CrystalCanvasProps) {
  return (
    <Canvas
      camera={{ position: cameraPosition, fov: 45 }}
      dpr={[1, 2]}
      gl={{ antialias: true, alpha: true, preserveDrawingBuffer: true }}
      className="h-full w-full"
    >
      <Suspense fallback={null}>
        <CrystalScene structure={structure} showUnitCell={showUnitCell} />
      </Suspense>
    </Canvas>
  );
}
