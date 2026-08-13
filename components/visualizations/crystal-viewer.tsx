"use client";

import { useState } from "react";

import { cn } from "@/lib/utils";

const CUBE_SIZE = 160; // px

const faces = [
  { transform: "rotateY(0deg) translateZ(80px)", className: "bg-sky-400/50" },
  { transform: "rotateY(90deg) translateZ(80px)", className: "bg-sky-500/40" },
  { transform: "rotateY(180deg) translateZ(80px)", className: "bg-sky-400/50" },
  { transform: "rotateY(270deg) translateZ(80px)", className: "bg-sky-500/40" },
  { transform: "rotateX(90deg) translateZ(80px)", className: "bg-sky-300/50" },
  { transform: "rotateX(-90deg) translateZ(80px)", className: "bg-sky-600/50" },
];

/**
 * Placeholder interactive crystal viewer built with CSS 3D transforms.
 * Swap the cube for a real WebGL (three.js) unit-cell renderer later —
 * the interface (rotation control, canvas slot) should stay the same.
 */
export function CrystalViewer() {
  const [rotation, setRotation] = useState(15);

  return (
    <figure className="flex flex-col items-center gap-4">
      <div className="[perspective:900px]">
        <div
          className="relative [transform-style:preserve-3d]"
          style={{
            width: CUBE_SIZE,
            height: CUBE_SIZE,
            transform: `rotateX(${rotation}deg) rotateY(${rotation * 1.3}deg)`,
            transition: "transform 150ms linear",
          }}
        >
          {faces.map((face, index) => (
            <div
              key={index}
              className={cn(
                "absolute inset-0 border border-sky-200/70",
                face.className
              )}
              style={{ transform: face.transform }}
            />
          ))}
        </div>
      </div>
      <label className="flex items-center gap-3 text-sm text-muted-foreground">
        <span>Rotate</span>
        <input
          type="range"
          min={-180}
          max={180}
          value={rotation}
          onChange={(event) => setRotation(Number(event.target.value))}
          className="w-48 accent-sky-500"
          aria-label="Rotate crystal viewer"
        />
      </label>
      <figcaption className="text-center text-xs text-muted-foreground">
        Placeholder interactive crystal viewer — swap in a WebGL (three.js)
        unit-cell scene here.
      </figcaption>
    </figure>
  );
}
