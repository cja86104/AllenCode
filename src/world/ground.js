// @ts-check
import { ROAD_PATHS } from './shapes.js';

/**
 * The ground under the Code World (Chris, 2026-11-16: "can we add some kind of 'ground' … to give it
 * some structure"; "Grid that rolls with hills"), and the compiler ripples on it ("When the user moves
 * their cursor through the black space outside the road, let nearby invisible grid nodes … briefly
 * illuminate in dim orange before fading back to black"): the ground's height and the roads on it, the
 * mesh under a cut of the world, tracing the cursor's ray to the ground, and the trail of ripples.
 */

/** @typedef {[number, number, number?]} Point2 x and z, and the ground's height there (0 when absent). */
/**
 * A door's roads on the ground: its own road with its hills (one line, or near a cut the separate pieces
 * of it that pass near), and the flat roads only to keep the grid off them.
 * @typedef {{ hilly: ReadonlyArray<ReadonlyArray<Readonly<Point2>>>, flat: ReadonlyArray<{ path: ReadonlyArray<Readonly<Point2>>, half: number }>, half: number }} GroundRoads
 */
/** @typedef {[number, number, number]} Vec3 */

/** The ground's grid: a line every this many units, each way. */
export const GROUND_CELL = 2;
/** Beside the road the ground takes the road's height out to this distance from its centre line… */
const GROUND_SHOULDER = 4;
/** …easing down to flat at this distance. */
export const GROUND_FLAT = 28;
/** A ripple point is added only this far off the road's edge, and this far from the last. */
const RIPPLE_OFF_ROAD = 0.5;
export const RIPPLE_GAP = 0.75;
/** The ripple trail keeps this many points, each fading out over this long (ms). */
export const RIPPLE_MAX = 8;
export const RIPPLE_LIFE = 1200;
/** The cursor's ray is traced in steps this long, then narrowed down where it meets the ground. */
const TRACE_STEP = 0.25;

/** @param {number} a @param {number} b @param {number} x */
function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * The roads on a door's ground: its own road (the one with hills: branch, onward road, bend and shared
 * road), and the flat ones only to keep the grid off them: the trunk, both branches, the other road
 * coming in to the meeting, and the side paths. Before a door is taken (no layout), the opening's:
 * flat, with the trunk and both short branches kept clear.
 * @param {ReturnType<typeof import('./roadLayout.js').layoutRoad> | null} layout
 * @returns {GroundRoads}
 */
export function groundRoads(layout) {
  if (!layout) {
    return {
      hilly: [],
      flat: [
        { path: ROAD_PATHS.trunk, half: 2 },
        { path: ROAD_PATHS.business, half: 1.6 },
        { path: ROAD_PATHS.family, half: 1.6 },
      ],
      half: 1.6,
    };
  }
  return {
    hilly: [layout.path],
    flat: [
      { path: ROAD_PATHS.trunk, half: 2 },
      { path: ROAD_PATHS.business, half: 1.6 },
      { path: ROAD_PATHS.family, half: 1.6 },
      ...(layout.other.length > 1 ? [{ path: layout.other, half: 1.6 }] : []),
      ...layout.spurs.map((spur) => ({ path: spur.path, half: 0.8 })),
    ],
    half: 1.6,
  };
}

/**
 * The nearest point of a polyline to (x, z): its distance and the height there.
 * @param {ReadonlyArray<Readonly<Point2>>} path @param {number} x @param {number} z
 */
function nearest(path, x, z) {
  let best = Infinity;
  let height = 0;
  for (let i = 0; i < path.length - 1; i += 1) {
    const a = path[i];
    const b = path[i + 1];
    const dx = b[0] - a[0];
    const dz = b[1] - a[1];
    const length2 = dx * dx + dz * dz;
    const t = length2 === 0 ? 0 : Math.min(1, Math.max(0, ((x - a[0]) * dx + (z - a[1]) * dz) / length2));
    const d = Math.hypot(x - (a[0] + dx * t), z - (a[1] + dz * t));
    if (d < best) {
      best = d;
      height = (a[2] ?? 0) + ((b[2] ?? 0) - (a[2] ?? 0)) * t;
    }
  }
  return { distance: best, height };
}

/**
 * The ground at (x, z): its height (the road's beside the road, easing to flat `GROUND_FLAT` away from
 * it), and how far off the nearest road's edge the point is (negative on a road).
 * @param {GroundRoads} roads @param {number} x @param {number} z
 * @returns {{ height: number, offRoad: number }}
 */
export function groundAt(roads, x, z) {
  let own = { distance: Infinity, height: 0 };
  for (const line of roads.hilly) {
    const here = nearest(line, x, z);
    if (here.distance < own.distance) own = here;
  }
  const height = Number.isFinite(own.distance) ? own.height * (1 - smoothstep(GROUND_SHOULDER, GROUND_FLAT, own.distance)) : 0;
  let offRoad = own.distance - roads.half;
  for (const line of roads.flat) offRoad = Math.min(offRoad, nearest(line.path, x, z).distance - line.half);
  return { height, offRoad };
}

/**
 * The roads near a point only: each road's pieces that come within `reach` of it, so the ground under a
 * cut is worked out without walking the whole road.
 * @param {GroundRoads} roads @param {[number, number]} center @param {number} reach
 * @returns {GroundRoads}
 */
function near(roads, [cx, cz], reach) {
  /** @param {ReadonlyArray<Readonly<Point2>>} path */
  const pieces = (path) => {
    /** @type {Array<Readonly<Point2>>} */
    const kept = [];
    for (let i = 0; i < path.length - 1; i += 1) {
      const a = path[i];
      const b = path[i + 1];
      const d = nearest([a, b], cx, cz).distance;
      if (d > reach) continue;
      // A gap between kept pieces would join them; keep them as their own two-point lines instead.
      kept.push(a, b, [Number.NaN, Number.NaN]);
    }
    return kept;
  };
  /** @param {ReadonlyArray<Readonly<Point2>>} path */
  const split = (path) => {
    /** @type {Array<Array<Readonly<Point2>>>} */
    const lines = [];
    let line = /** @type {Array<Readonly<Point2>>} */ ([]);
    for (const p of pieces(path)) {
      if (Number.isNaN(p[0])) {
        if (line.length > 1) lines.push(line);
        line = [];
      } else line.push(p);
    }
    return lines;
  };
  return {
    // The road's own pieces near the point, each a line of its own (never joined across a gap).
    hilly: roads.hilly.flatMap((line) => split(line)),
    flat: roads.flat.flatMap((line) => split(line.path).map((path) => ({ path, half: line.half }))),
    half: roads.half,
  };
}

/**
 * The ground's mesh under a cut of the world: a grid of points `GROUND_CELL` apart on the grid's own
 * lines (so they hold still from cut to cut), covering `radius` around `center` and a cell beyond, each
 * at the ground's height with how far off the road it is, and two triangles a cell.
 * @param {GroundRoads} roads @param {[number, number]} center @param {number} radius
 * @returns {{ positions: Float32Array, offRoad: Float32Array, indices: Uint16Array | Uint32Array }}
 */
export function groundMesh(roads, center, radius) {
  const local = near(roads, center, radius * Math.SQRT2 + GROUND_FLAT + GROUND_CELL);
  const x0 = Math.floor((center[0] - radius) / GROUND_CELL) * GROUND_CELL;
  const z0 = Math.floor((center[1] - radius) / GROUND_CELL) * GROUND_CELL;
  const cols = Math.ceil((center[0] + radius - x0) / GROUND_CELL) + 1;
  const rows = Math.ceil((center[1] + radius - z0) / GROUND_CELL) + 1;
  const positions = new Float32Array(cols * rows * 3);
  const offRoad = new Float32Array(cols * rows);
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const i = r * cols + c;
      const x = x0 + c * GROUND_CELL;
      const z = z0 + r * GROUND_CELL;
      const ground = groundAt(local, x, z);
      positions[i * 3] = x;
      positions[i * 3 + 1] = ground.height;
      positions[i * 3 + 2] = z;
      offRoad[i] = Math.min(ground.offRoad, 1e3);
    }
  }
  const indices = cols * rows > 65535 ? new Uint32Array((cols - 1) * (rows - 1) * 6) : new Uint16Array((cols - 1) * (rows - 1) * 6);
  let k = 0;
  for (let r = 0; r < rows - 1; r += 1) {
    for (let c = 0; c < cols - 1; c += 1) {
      const a = r * cols + c;
      indices.set([a, a + 1, a + cols, a + 1, a + cols + 1, a + cols], k);
      k += 6;
    }
  }
  return { positions, offRoad, indices };
}

/**
 * The camera's ray through a point on the screen (`nx`, `ny` from −1 to 1, up positive), as a unit
 * direction in the world. The field of view is vertical, as the renderer's.
 * @param {{ eye: Vec3, target: Vec3, fov: number }} camera @param {number} aspect @param {number} nx @param {number} ny
 * @returns {Vec3}
 */
export function rayThrough(camera, aspect, nx, ny) {
  const f = normalize([camera.target[0] - camera.eye[0], camera.target[1] - camera.eye[1], camera.target[2] - camera.eye[2]]);
  const r = normalize([-f[2], 0, f[0]]);
  const u = [r[1] * f[2] - r[2] * f[1], r[2] * f[0] - r[0] * f[2], r[0] * f[1] - r[1] * f[0]];
  const t = Math.tan((camera.fov * Math.PI) / 360);
  return normalize([f[0] + nx * t * aspect * r[0] + ny * t * u[0], f[1] + nx * t * aspect * r[1] + ny * t * u[1], f[2] + nx * t * aspect * r[2] + ny * t * u[2]]);
}

/** @param {ReadonlyArray<number>} v @returns {Vec3} */
function normalize(v) {
  const length = Math.hypot(v[0], v[1], v[2]) || 1;
  return [v[0] / length, v[1] / length, v[2] / length];
}

/**
 * Where a ray from `eye` first meets the ground, within `reach` of it: stepped along, then narrowed
 * down, so a hill's near slope stops it before the ground behind. Null if it never comes down to the
 * ground within reach.
 * @param {GroundRoads} roads @param {Vec3} eye @param {Vec3} direction @param {number} reach
 * @returns {{ point: Vec3, offRoad: number } | null}
 */
export function traceGround(roads, eye, direction, reach) {
  const d = normalize(direction);
  const local = near(roads, [eye[0], eye[2]], reach + GROUND_FLAT);
  /** @param {number} t */
  const above = (t) => eye[1] + d[1] * t - groundAt(local, eye[0] + d[0] * t, eye[2] + d[2] * t).height;
  let before = 0;
  for (let t = TRACE_STEP; t <= reach; t += TRACE_STEP) {
    if (above(t) > 0) {
      before = t;
      continue;
    }
    let low = before;
    let high = t;
    for (let i = 0; i < 12; i += 1) {
      const mid = (low + high) / 2;
      if (above(mid) > 0) low = mid;
      else high = mid;
    }
    const x = eye[0] + d[0] * high;
    const z = eye[2] + d[2] * high;
    const ground = groundAt(local, x, z);
    return { point: [x, ground.height, z], offRoad: ground.offRoad };
  }
  return null;
}

/**
 * The trail of ripples the cursor leaves: a point only off the road and `RIPPLE_GAP` from the last,
 * the last `RIPPLE_MAX` kept, each lit for `RIPPLE_LIFE` ms.
 */
export function createRippleTrail() {
  /** @type {Array<{ x: number, z: number, at: number }>} */
  const points = [];
  return {
    /** @param {{ point: Vec3, offRoad: number }} hit @param {number} now @returns {boolean} Whether it was added. */
    add(hit, now) {
      if (hit.offRoad < RIPPLE_OFF_ROAD) return false;
      const last = points[points.length - 1];
      if (last && Math.hypot(hit.point[0] - last.x, hit.point[2] - last.z) < RIPPLE_GAP) return false;
      points.push({ x: hit.point[0], z: hit.point[2], at: now });
      if (points.length > RIPPLE_MAX) points.shift();
      return true;
    },
    /** The points still lit, with how long ago each was left. @param {number} now */
    active(now) {
      return points.filter((p) => now - p.at < RIPPLE_LIFE).map((p) => ({ x: p.x, z: p.z, age: now - p.at }));
    },
  };
}
