/**
 * Crystal structure geometry for the 3D viewer.
 *
 * Everything here is pure math (no three.js) so it can be unit-tested and so
 * every value shown in the viewer's info panel is *derived* from the geometry
 * rather than hardcoded:
 *
 * - `atomsPerCell`        = Σ of each displayed site's fractional contribution
 * - `apf`                 = atomsPerCell · (4/3)πR³ / cellVolume
 * - `coordinationNumber`  = nearest-neighbor count from a replicated lattice
 * - `latticeCoefficient`  = 1 / atomRadius  (a = coefficient · R, with a = 1)
 *
 * All positions are in "cell units": the lattice parameter a = 1 and the unit
 * cell is centered at the origin. The HCP cell uses its ideal c/a = √(8/3).
 */

export type StructureType = "sc" | "bcc" | "fcc" | "hcp";

export const STRUCTURE_TYPES: StructureType[] = ["sc", "bcc", "fcc", "hcp"];

export type AtomRole = "corner" | "body" | "face" | "interior";

export interface AtomSite {
  /** Position in cell units (a = 1), unit cell centered at the origin. */
  position: [number, number, number];
  /** Display role, used to color atoms in the viewer. */
  role: AtomRole;
  /** Fraction of this site that belongs to the unit cell (1/8 corner, etc.). */
  fraction: number;
}

export interface StructureConfig {
  type: StructureType;
  name: string;
  /** Atom radius in units of a (a = 1). */
  atomRadius: number;
  /** Symbolic lattice-parameter relation, e.g. "a = 4R/√3". */
  latticeRelation: string;
  /** Ideal c/a ratio (HCP only). */
  cOverA?: number;
  /** Atomic sites drawn in the viewer. */
  sites: AtomSite[];
  /** Unit cell corner vertices (centered at the origin). */
  cellVertices: [number, number, number][];
  /** Pairs of indices into cellVertices forming the wireframe edges. */
  cellEdges: [number, number][];
}

/* ------------------------------------------------------------------ */
/* Unit cell scaffolding                                              */
/* ------------------------------------------------------------------ */

const HCP_C_OVER_A = Math.sqrt(8 / 3); // ≈ 1.6330

const cubeCorners: [number, number, number][] = [];
for (const x of [-0.5, 0.5]) {
  for (const y of [-0.5, 0.5]) {
    for (const z of [-0.5, 0.5]) {
      cubeCorners.push([x, y, z]);
    }
  }
}

/** Edge between any two cube corners that differ in exactly one coordinate. */
function cubeEdges(
  vertices: [number, number, number][]
): [number, number][] {
  const edges: [number, number][] = [];
  for (let i = 0; i < vertices.length; i++) {
    for (let j = i + 1; j < vertices.length; j++) {
      let differing = 0;
      for (let k = 0; k < 3; k++) {
        if (Math.abs(vertices[i][k] - vertices[j][k]) > 1e-9) differing++;
      }
      if (differing === 1) edges.push([i, j]);
    }
  }
  return edges;
}

/** Hexagonal prism (HCP) vertices: 6 bottom, 6 top. */
const hcpVertices: [number, number, number][] = [];
for (let k = 0; k < 6; k++) {
  const angle = (k * Math.PI) / 3;
  hcpVertices.push([Math.cos(angle), Math.sin(angle), -HCP_C_OVER_A / 2]);
}
for (let k = 0; k < 6; k++) {
  const angle = (k * Math.PI) / 3;
  hcpVertices.push([Math.cos(angle), Math.sin(angle), HCP_C_OVER_A / 2]);
}

const hcpEdges: [number, number][] = [];
for (let k = 0; k < 6; k++) {
  hcpEdges.push([k, (k + 1) % 6]); // bottom hexagon
  hcpEdges.push([k + 6, ((k + 1) % 6) + 6]); // top hexagon
  hcpEdges.push([k, k + 6]); // verticals
}

/* ------------------------------------------------------------------ */
/* Coordination number via replicated primitive cells                  */
/* ------------------------------------------------------------------ */

interface PrimitiveCell {
  /** Lattice vectors (cell units). */
  vectors: [number, number, number][];
  /** Basis atom positions (cell units). */
  basis: [number, number, number][];
}

const PRIMITIVE_CELLS: Record<StructureType, PrimitiveCell> = {
  sc: {
    vectors: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    basis: [[0, 0, 0]],
  },
  bcc: {
    vectors: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    basis: [
      [0, 0, 0],
      [0.5, 0.5, 0.5],
    ],
  },
  fcc: {
    vectors: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    basis: [
      [0, 0, 0],
      [0.5, 0.5, 0],
      [0.5, 0, 0.5],
      [0, 0.5, 0.5],
    ],
  },
  hcp: {
    vectors: [
      [1, 0, 0],
      [-0.5, Math.sqrt(3) / 2, 0],
      [0, 0, HCP_C_OVER_A],
    ],
    basis: [
      [0, 0, 0],
      [0, Math.sqrt(3) / 3, HCP_C_OVER_A / 2],
    ],
  },
};

function addVectors(
  a: [number, number, number],
  b: [number, number, number]
): [number, number, number] {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}

/**
 * Replicate the primitive cell 3×3×3 and count how many distinct atoms sit at
 * the nearest-neighbor distance (2R) from the central basis atoms. Returns the
 * consistent count (all central atoms must agree).
 */
function computeCoordinationNumber(
  type: StructureType,
  atomRadius: number
): number {
  const cell = PRIMITIVE_CELLS[type];
  const tolerance = atomRadius * 0.02;
  const counts: number[] = [];

  for (const origin of cell.basis) {
    const seen = new Set<string>();
    let count = 0;

    for (let i = -1; i <= 1; i++) {
      for (let j = -1; j <= 1; j++) {
        for (let k = -1; k <= 1; k++) {
          const shift = addVectors(
            addVectors(
              scaleVector(cell.vectors[0], i),
              scaleVector(cell.vectors[1], j)
            ),
            scaleVector(cell.vectors[2], k)
          );
          for (const site of cell.basis) {
            const p = addVectors(addVectors(origin, site), shift);
            const dist = Math.hypot(
              p[0] - origin[0],
              p[1] - origin[1],
              p[2] - origin[2]
            );
            if (dist < 1e-9) continue; // self
            if (Math.abs(dist - 2 * atomRadius) > tolerance) continue;
            const key = p.map((v) => v.toFixed(6)).join(",");
            if (!seen.has(key)) {
              seen.add(key);
              count++;
            }
          }
        }
      }
    }
    counts.push(count);
  }

  if (counts.length === 0) return 0;
  // Every central atom must report the same coordination number.
  const first = counts[0];
  if (!counts.every((c) => c === first)) {
    throw new Error(`Inconsistent coordination numbers for ${type}: ${counts}`);
  }
  return first;
}

function scaleVector(
  v: [number, number, number],
  factor: number
): [number, number, number] {
  return [v[0] * factor, v[1] * factor, v[2] * factor];
}

/* ------------------------------------------------------------------ */
/* Structure definitions                                              */
/* ------------------------------------------------------------------ */

const corner = (p: [number, number, number]): AtomSite => ({
  position: p,
  role: "corner",
  fraction: 1 / 8,
});
const body = (p: [number, number, number]): AtomSite => ({
  position: p,
  role: "body",
  fraction: 1,
});
const face = (p: [number, number, number]): AtomSite => ({
  position: p,
  role: "face",
  fraction: 1 / 2,
});
const interior = (p: [number, number, number]): AtomSite => ({
  position: p,
  role: "interior",
  fraction: 1,
});
/** Hexagonal-prism corners are shared by six cells (not eight). */
const hcpCorner = (p: [number, number, number]): AtomSite => ({
  position: p,
  role: "corner",
  fraction: 1 / 6,
});

function cubicConfig(
  type: StructureType,
  name: string,
  atomRadius: number,
  latticeRelation: string,
  extra: AtomSite[]
): StructureConfig {
  const sites = [...cubeCorners.map(corner), ...extra];
  return {
    type,
    name,
    atomRadius,
    latticeRelation,
    sites,
    cellVertices: cubeCorners,
    cellEdges: cubeEdges(cubeCorners),
  };
}

const HCP_FACE = Math.sqrt(3) / 6; // ≈ 0.2887
const HCP_SIDE = Math.sqrt(3) / 3; // ≈ 0.5774

function hcpConfig(): StructureConfig {
  const sites: AtomSite[] = [
    ...hcpVertices.map(hcpCorner),
    face([0, 0, -HCP_C_OVER_A / 2]),
    face([0, 0, HCP_C_OVER_A / 2]),
    // Middle layer (z = 0): the ABAB registry — atoms above the three
    // upward-pointing triangles that share the central basal atom.
    interior([0, HCP_SIDE, 0]),
    interior([0.5, -HCP_FACE, 0]),
    interior([-0.5, -HCP_FACE, 0]),
  ];
  return {
    type: "hcp",
    name: "Hexagonal close-packed",
    atomRadius: 0.5,
    latticeRelation: "a = 2R, c = √(8/3)·a",
    cOverA: HCP_C_OVER_A,
    sites,
    cellVertices: hcpVertices,
    cellEdges: hcpEdges,
  };
}

const STRUCTURE_CONFIGS: Record<StructureType, StructureConfig> = {
  sc: cubicConfig("sc", "Simple cubic", 0.5, "a = 2R", []),
  bcc: cubicConfig(
    "bcc",
    "Body-centered cubic",
    Math.sqrt(3) / 4,
    "a = 4R/√3",
    [body([0, 0, 0])]
  ),
  fcc: cubicConfig(
    "fcc",
    "Face-centered cubic",
    1 / (2 * Math.sqrt(2)),
    "a = 2√2R",
    [
      face([0.5, 0, 0]),
      face([-0.5, 0, 0]),
      face([0, 0.5, 0]),
      face([0, -0.5, 0]),
      face([0, 0, 0.5]),
      face([0, 0, -0.5]),
    ]
  ),
  hcp: hcpConfig(),
};

export interface DerivedStructureConfig extends StructureConfig {
  /** Number of atoms per unit cell (n in the density formula). */
  atomsPerCell: number;
  /** Fraction of the cell volume occupied by atoms. */
  apf: number;
  /** a/R coefficient, numerically derived (a = coefficient · R). */
  latticeCoefficient: number;
  /** Number of nearest neighbors, derived from replicated geometry. */
  coordinationNumber: number;
  /** Cell volume in units of a³. */
  cellVolume: number;
}

export function getStructureConfig(
  type: string | undefined
): DerivedStructureConfig | undefined {
  if (!type || !(type in STRUCTURE_CONFIGS)) return undefined;
  const config = STRUCTURE_CONFIGS[type as StructureType];

  // n = Σ of each displayed site's fractional contribution to the cell.
  const atomsPerCell = config.sites.reduce(
    (sum, site) => sum + site.fraction,
    0
  );

  // Cell volume in units of a³: a³ for the cubic cells, (3√3/2)a²c for HCP.
  const cellVolume =
    config.type === "hcp"
      ? (3 * Math.sqrt(3) / 2) * HCP_C_OVER_A
      : 1;

  const apf =
    (atomsPerCell * (4 / 3) * Math.PI * config.atomRadius ** 3) / cellVolume;

  return {
    ...config,
    atomsPerCell,
    cellVolume,
    apf,
    latticeCoefficient: 1 / config.atomRadius,
    coordinationNumber: computeCoordinationNumber(
      config.type,
      config.atomRadius
    ),
  };
}
