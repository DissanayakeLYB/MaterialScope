/**
 * Independent verification of the crystal-structure geometry in
 * lib/crystal-structures.ts.
 *
 * The reference data below is written from first principles (textbook
 * definitions of each structure) and does NOT reuse any internals of the
 * library, so the checks genuinely cross-validate the derived values:
 * displayed atom counts, atoms per cell, APF, coordination numbers, and
 * nearest-neighbor geometry.
 *
 * Run: tsc (see scripts/tsconfig.verify.json) then `node verify-crystals.js`.
 */

import { getStructureConfig, type StructureType } from "../lib/crystal-structures";

type Vec3 = [number, number, number];

interface Reference {
  sites: number;
  atomsPerCell: number;
  apf: number;
  coordinationNumber: number;
  /** Primitive-cell basis (independent definition). */
  basis: Vec3[];
  /** Lattice vectors (independent definition). */
  vectors: Vec3[];
  /** Nearest-neighbor distance in units of a. */
  nnDistance: number;
}

const HCP_C = Math.sqrt(8 / 3);

const REFERENCE: Record<StructureType, Reference> = {
  sc: {
    sites: 8,
    atomsPerCell: 1,
    apf: Math.PI / 6, // 0.5236
    coordinationNumber: 6,
    basis: [[0, 0, 0]],
    vectors: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    nnDistance: 1,
  },
  bcc: {
    sites: 9,
    atomsPerCell: 2,
    apf: (Math.sqrt(3) * Math.PI) / 8, // 0.6802
    coordinationNumber: 8,
    basis: [
      [0, 0, 0],
      [0.5, 0.5, 0.5],
    ],
    vectors: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    nnDistance: Math.sqrt(3) / 2, // 0.8660
  },
  fcc: {
    sites: 14,
    atomsPerCell: 4,
    apf: Math.PI / (3 * Math.sqrt(2)), // 0.7405
    coordinationNumber: 12,
    basis: [
      [0, 0, 0],
      [0.5, 0.5, 0],
      [0.5, 0, 0.5],
      [0, 0.5, 0.5],
    ],
    vectors: [
      [1, 0, 0],
      [0, 1, 0],
      [0, 0, 1],
    ],
    nnDistance: 1 / Math.sqrt(2), // 0.7071
  },
  hcp: {
    sites: 17,
    atomsPerCell: 6,
    apf: Math.PI / (3 * Math.sqrt(2)), // 0.7405
    coordinationNumber: 12,
    basis: [
      [0, 0, 0],
      [0, Math.sqrt(3) / 3, HCP_C / 2],
    ],
    vectors: [
      [1, 0, 0],
      [-0.5, Math.sqrt(3) / 2, 0],
      [0, 0, HCP_C],
    ],
    nnDistance: 1,
  },
};

function add(a: Vec3, b: Vec3): Vec3 {
  return [a[0] + b[0], a[1] + b[1], a[2] + b[2]];
}
function scale(a: Vec3, f: number): Vec3 {
  return [a[0] * f, a[1] * f, a[2] * f];
}
function dist(a: Vec3, b: Vec3): number {
  return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
}
function key(p: Vec3): string {
  return p.map((v) => v.toFixed(6)).join(",");
}

/** Replicate the primitive cell 3×3×3 around the origin. */
function replicate(ref: Reference): Vec3[] {
  const atoms: Vec3[] = [];
  for (let i = -1; i <= 1; i++) {
    for (let j = -1; j <= 1; j++) {
      for (let k = -1; k <= 1; k++) {
        const shift = add(
          add(scale(ref.vectors[0], i), scale(ref.vectors[1], j)),
          scale(ref.vectors[2], k)
        );
        for (const site of ref.basis) {
          atoms.push(add(shift, site));
        }
      }
    }
  }
  return atoms;
}

/** Distinct atoms within `radius` of the origin. */
function neighborhood(ref: Reference, radius: number): Vec3[] {
  const seen = new Map<string, Vec3>();
  for (const atom of replicate(ref)) {
    if (dist(atom, [0, 0, 0]) <= radius) seen.set(key(atom), atom);
  }
  return Array.from(seen.values());
}

let failures = 0;

function check(label: string, actual: number, expected: number, tol = 1e-3) {
  const ok = Math.abs(actual - expected) <= tol;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label.padEnd(52)} got ${actual.toFixed(6)}  want ${expected.toFixed(6)}`
  );
}

function checkEq(label: string, actual: number, expected: number, tol = 1e-9) {
  const ok = Math.abs(actual - expected) <= tol;
  if (!ok) failures++;
  console.log(
    `${ok ? "PASS" : "FAIL"}  ${label.padEnd(52)} got ${actual.toFixed(6)}  want ${expected.toFixed(6)}`
  );
}

for (const type of Object.keys(REFERENCE) as StructureType[]) {
  const ref = REFERENCE[type];
  const config = getStructureConfig(type);
  console.log(`\n=== ${type.toUpperCase()} ===`);

  if (!config) {
    failures++;
    console.log(`FAIL  config missing for ${type}`);
    continue;
  }

  // Displayed atom counts.
  checkEq(`displayed atom sites`, config.sites.length, ref.sites);

  // Atoms per unit cell (derived from fractional contributions).
  checkEq(`atoms per unit cell`, config.atomsPerCell, ref.atomsPerCell);

  // Atomic packing factor.
  check(`APF`, config.apf, ref.apf, 1e-4);

  // Lattice coefficient must equal 1/R (a = coefficient · R with a = 1).
  checkEq(`lattice coefficient = 1/R`, config.latticeCoefficient, 1 / config.atomRadius);

  // Independent coordination number: count neighbors at nnDistance in the
  // replicated primitive lattice.
  const tol = config.atomRadius * 0.02;
  const counts: number[] = [];
  for (const origin of ref.basis) {
    let count = 0;
    for (const atom of replicate(ref)) {
      const d = dist(atom, origin);
      if (d < 1e-9) continue;
      if (Math.abs(d - ref.nnDistance) <= tol) count++;
    }
    counts.push(count);
  }
  const independentCn = counts[0];
  checkEq(
    `independent coordination number (${counts.join(",")})`,
    independentCn,
    ref.coordinationNumber
  );
  checkEq(
    `lib coordination number agrees`,
    config.coordinationNumber,
    ref.coordinationNumber
  );

  // Nearest-neighbor geometry: in the replicated lattice the minimum
  // inter-atomic distance must equal the touching distance 2R, and nothing
  // may be closer (no overlapping spheres).
  const atoms = neighborhood(ref, 4);
  let minDist = Infinity;
  for (let i = 0; i < atoms.length; i++) {
    for (let j = i + 1; j < atoms.length; j++) {
      const d = dist(atoms[i], atoms[j]);
      if (d > 1e-9 && d < minDist) minDist = d;
    }
  }
  const twoR = 2 * config.atomRadius;
  checkEq(`min inter-atomic distance = 2R (${twoR.toFixed(4)})`, minDist, twoR, 1e-6);

  // Every displayed site must coincide with a lattice atom, up to the cell's
  // centering offset (the viewer centers the cell at the origin; cubic SC
  // corners land on lattice + (½,½,½), HCP corners on lattice + (0,0,−c/2)).
  const latticeAtoms = neighborhood(ref, 3);
  const candidateOffsets: Vec3[] =
    type === "hcp"
      ? [[0, 0, HCP_C / 2]]
      : [
          [0, 0, 0],
          [0.5, 0.5, 0.5],
        ];
  let offsetFound = false;
  for (const offset of candidateOffsets) {
    const orphans = config.sites.filter((site) => {
      const shifted = add(site.position, offset);
      return !latticeAtoms.some(
        (atom) => dist(atom, shifted) <= 1e-6
      );
    });
    if (orphans.length === 0) {
      offsetFound = true;
      console.log(
        `PASS  all ${config.sites.length} displayed sites are lattice atoms (offset ${offset.map((v) => v.toFixed(2)).join(",")})`
      );
      break;
    }
  }
  if (!offsetFound) {
    failures++;
    console.log(`FAIL  displayed sites are not a lattice cell (checked offsets ${candidateOffsets.length})`);
  }

  // Every displayed site must have at least one neighbor at exactly 2R.
  const detached = config.sites.filter((site) => {
    return !config.sites.some((other) => {
      if (other === site) return false;
      const d = dist(site.position, other.position);
      return Math.abs(d - twoR) <= tol;
    });
  });
  if (detached.length === 0) {
    console.log(`PASS  every displayed site touches a neighbor at 2R`);
  } else {
    failures++;
    console.log(
      `FAIL  sites with no touching neighbor in display:`,
      detached.map((s) => s.position)
    );
  }
}

// HCP c/a ratio must be the ideal √(8/3).
const hcp = getStructureConfig("hcp")!;
checkEq(`hcp c/a = √(8/3)`, hcp.cOverA ?? 0, Math.sqrt(8 / 3));
checkEq(
  `hcp cell volume = (3√3/2)a²c`,
  hcp.cellVolume,
  (3 * Math.sqrt(3) / 2) * HCP_C,
  1e-9
);

console.log(`\n${failures === 0 ? "ALL CHECKS PASSED" : `${failures} CHECK(S) FAILED`}`);
process.exit(failures === 0 ? 0 : 1);
