"use client";

import { Instance, Instances, Line, OrbitControls } from "@react-three/drei";

import { getStructureConfig, type AtomRole, type StructureType } from "@/lib/crystal-structures";

/**
 * Role-based atom coloring: corner atoms in the brand cobalt, interior/body
 * and face atoms in copper, so the structure reads at a glance.
 */
const ROLE_COLORS: Record<AtomRole, string> = {
  corner: "#1e3a8a",
  body: "#c05621",
  face: "#c05621",
  interior: "#c05621",
};

const EDGE_COLOR = "#94a3b8";

interface CrystalSceneProps {
  structure: StructureType;
  showUnitCell: boolean;
}

/**
 * The three.js scene for one crystal structure. Atoms are drawn as a single
 * instanced mesh (one draw call regardless of site count), so several viewers
 * can sit on one page without jank. The unit cell wireframe is one Line2 mesh.
 */
export function CrystalScene({ structure, showUnitCell }: CrystalSceneProps) {
  const config = getStructureConfig(structure);
  if (!config) return null;

  return (
    <>
      <ambientLight intensity={0.85} />
      <directionalLight position={[6, 8, 6]} intensity={1.1} />
      <directionalLight position={[-6, -4, -6]} intensity={0.35} />

      <Instances limit={config.sites.length} frustumCulled={false}>
        <sphereGeometry args={[config.atomRadius, 28, 28]} />
        <meshStandardMaterial roughness={0.3} metalness={0.08} />
        {config.sites.map((site, index) => (
          <Instance
            key={index}
            position={site.position}
            color={ROLE_COLORS[site.role]}
          />
        ))}
      </Instances>

      {showUnitCell && (
        <Line
          segments
          points={config.cellEdges
            .flatMap(([a, b]) => [
              config.cellVertices[a],
              config.cellVertices[b],
            ])
            .flat()}
          color={EDGE_COLOR}
          lineWidth={1.25}
          transparent
          opacity={0.9}
        />
      )}

      <OrbitControls
        makeDefault
        enablePan={false}
        minDistance={1.5}
        maxDistance={14}
      />
    </>
  );
}
