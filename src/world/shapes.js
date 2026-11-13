// @ts-check
import { LANDMARK } from './landmark.js';
import { landedShape } from './worldFlight.js';

/**
 * The prototype world, generated in code from real approved excerpts (no models, nothing invented).
 * Every shape is a set of glyphs: a position (x, y, z), the character drawn (its UTF-16 code), an
 * rgba colour, and one glyph size in world units for the whole shape. Deterministic for a seed.
 * `tag`, for a screen landmark on the road (R4): its place among the landmarks plus one for its code
 * sculpture, minus that for its picture; the renderer draws one or the other by how many landmarks
 * the visitor has passed. Untagged shapes are always drawn.
 * `sizes` (R5), when present, gives each glyph its own size in place of `size`. `flow` (R5), when
 * present, is one float per glyph: 0 stands still; above 0, the glyph rises up a column that height
 * from the ground, wrapping (the stands' code between their posts).
 * @typedef {{ positions: Float32Array, glyphs: Uint16Array, colors: Float32Array, size: number, tag?: number, sizes?: Float32Array, flow?: Float32Array }} Shape
 * @typedef {[number, number, number]} Vec3
 * @typedef {[number, number]} Point2 A point on the ground: x and z.
 * @typedef {'low' | 'mid' | 'high'} Tier
 */

/** Ember #f97316 and the pale code colour, as 0..1 rgb. */
const EMBER = [0xf9 / 255, 0x73 / 255, 0x16 / 255];
const PALE = [0.86, 0.86, 0.84];
const WHITE = [1, 1, 1];

/**
 * A small seeded random generator (mulberry32), so the same seed always builds the same world.
 * @param {number} seed
 * @returns {() => number} values in [0, 1)
 */
export function seeded(seed) {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * The characters of `code` that draw something (whitespace never does), in reading order.
 * @param {string} code
 * @returns {string[]}
 */
function inkOf(code) {
  const chars = [...code].filter((c) => c.trim() !== '' && c.charCodeAt(0) <= 0xffff && c.length === 1);
  if (chars.length === 0) throw new Error('A world shape needs code with at least one visible character.');
  return chars;
}

/** @param {number} count @param {number} size */
function emptyShape(count, size) {
  return { positions: new Float32Array(count * 3), glyphs: new Uint16Array(count), colors: new Float32Array(count * 4), size };
}

/**
 * @param {Shape} shape @param {number} i @param {number} x @param {number} y @param {number} z
 * @param {string} char @param {number[]} rgb @param {number} alpha
 */
function put(shape, i, x, y, z, char, rgb, alpha) {
  shape.positions.set([x, y, z], i * 3);
  shape.glyphs[i] = char.charCodeAt(0);
  shape.colors.set([rgb[0], rgb[1], rgb[2], Math.min(1, Math.max(0, alpha))], i * 4);
}

/**
 * Turns a shape built facing +z (straight back up the road) to face `facing` instead, about the
 * vertical axis through `center`: what was across the face runs across the new face, what was in
 * front of it stays in front. Facing +z leaves the shape exactly as built.
 * @param {Shape} shape @param {Vec3} center @param {Vec3} facing A unit direction on the ground.
 * @returns {Shape}
 */
function orient(shape, center, facing) {
  if (facing[0] === 0 && facing[2] === 1) return shape;
  // The face's right-hand direction, seen from in front (as `landmarkRect` takes it).
  const rx = facing[2];
  const rz = -facing[0];
  for (let i = 0; i < shape.glyphs.length; i += 1) {
    const across = shape.positions[i * 3] - center[0];
    const ahead = shape.positions[i * 3 + 2] - center[2];
    shape.positions[i * 3] = center[0] + across * rx + ahead * facing[0];
    shape.positions[i * 3 + 2] = center[2] + across * rz + ahead * facing[2];
  }
  return shape;
}

/** The editor's cursor, drawn after the last character typed. */
export const CURSOR = '▌';

/** The way a shape faces unless told otherwise: straight back up the road. */
const FACING_BACK = /** @type {Vec3} */ ([0, 0, 1]);

/** A slab's character spacing and line height, in world units: the empty file's, and every slab's. */
export const SLAB_METRICS = Object.freeze({ charWidth: 0.06, lineHeight: 0.145 });

/**
 * A slab's code laid out exactly as the file reads (line and column), on a plane facing `facing`
 * (the camera's way by default): one glyph per visible character.
 * @param {string} code
 * @param {number} seed Unused by the layout, which is exact; kept so every shape is built alike.
 * @param {{ center?: Vec3, charWidth?: number, lineHeight?: number, facing?: Vec3 }} [options]
 * @returns {Shape}
 */
export function editorSlab(
  code,
  seed,
  { center = [0, 1.6, 0], charWidth = SLAB_METRICS.charWidth, lineHeight = SLAB_METRICS.lineHeight, facing = FACING_BACK } = {},
) {
  void seed;
  const lines = code.split('\n');
  const columns = Math.max(...lines.map((line) => line.length));
  const left = center[0] - (columns * charWidth) / 2;
  const top = center[1] + ((lines.length - 1) * lineHeight) / 2;
  const shape = emptyShape(inkOf(code).length, charWidth * 1.6);
  let i = 0;
  lines.forEach((line, row) => {
    [...line].forEach((char, column) => {
      if (char.trim() === '' || char.length !== 1) return;
      put(shape, i, left + column * charWidth, top - row * lineHeight, center[2], char, PALE, 0.92);
      i += 1;
    });
  });
  return orient(shape, center, facing);
}

/**
 * A file still being written (Crew Advisors, coming soon): its slab, then one ember cursor glyph `▌`
 * at the end, which the renderer moves to where the typing has reached (`slabCaret`). `cursor` is
 * that glyph's index in the shape.
 * @param {string} code
 * @param {{ center: Vec3, facing?: Vec3 }} options
 * @param {number} seed
 * @returns {Shape & { cursor: number }}
 */
export function unfinishedSlab(code, { center, facing = FACING_BACK }, seed) {
  const slab = editorSlab(code, seed, { center, facing });
  const count = slab.glyphs.length + 1;
  const shape = emptyShape(count, slab.size);
  shape.positions.set(slab.positions);
  shape.glyphs.set(slab.glyphs);
  shape.colors.set(slab.colors);
  const caret = slabCaret(code, 0, { center, facing });
  put(shape, count - 1, caret[0], caret[1], caret[2], CURSOR, EMBER, 1);
  return { ...shape, cursor: count - 1 };
}


/**
 * Where the cursor stands in a slab after `typed` characters of `code` (a count of the string's
 * characters, as `EditorPanel` types it): in the column after the last one typed, on its line.
 * @param {string} code
 * @param {number} typed
 * @param {{ center: Vec3, facing?: Vec3, charWidth?: number, lineHeight?: number }} options
 * @returns {Vec3}
 */
export function slabCaret(code, typed, { center, facing = FACING_BACK, charWidth = SLAB_METRICS.charWidth, lineHeight = SLAB_METRICS.lineHeight }) {
  const lines = code.split('\n');
  const columns = Math.max(...lines.map((line) => line.length));
  const done = code.slice(0, Math.max(0, Math.min(code.length, Math.round(typed))));
  const row = done.split('\n').length - 1;
  const column = done.length - (done.lastIndexOf('\n') + 1);
  const across = -(columns * charWidth) / 2 + column * charWidth;
  const y = center[1] + ((lines.length - 1) * lineHeight) / 2 - row * lineHeight;
  // Across the face, turned as `orient` turns a slab.
  const rx = facing[2];
  const rz = -facing[0];
  return [center[0] + across * rx, y, center[2] + across * rz];
}

/**
 * How many glyphs a slab draws for the first `typed` characters of `code` (whitespace draws none),
 * so the renderer can hide the rest.
 * @param {string} code
 * @param {number} typed
 */
export function inkBefore(code, typed) {
  return [...code.slice(0, Math.max(0, Math.round(typed)))].filter((c) => c.trim() !== '' && c.length === 1 && c.charCodeAt(0) <= 0xffff).length;
}

/**
 * Distance on the ground from a point to a path (a polyline of ground points).
 * @param {Point2} point
 * @param {ReadonlyArray<Point2>} path
 */
export function distanceToPath(point, path) {
  let best = Infinity;
  for (let i = 0; i < path.length - 1; i += 1) {
    const [ax, az] = path[i];
    const [bx, bz] = path[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const lengthSq = dx * dx + dz * dz;
    const t = lengthSq === 0 ? 0 : Math.min(1, Math.max(0, ((point[0] - ax) * dx + (point[1] - az) * dz) / lengthSq));
    best = Math.min(best, Math.hypot(point[0] - (ax + t * dx), point[1] - (az + t * dz)));
  }
  return best;
}

/**
 * A road of code: `count` glyphs scattered on the ground within half `width` of `path`, its
 * characters taken from `code` in reading order, mostly pale with a few ember sparks.
 * @param {string} code
 * @param {{ path: ReadonlyArray<Point2>, width: number, count: number }} options
 * @param {number} seed
 * @returns {Shape}
 */
export function codeRoad(code, { path, width, count }, seed) {
  const ink = inkOf(code);
  const random = seeded(seed);
  const segments = [];
  let total = 0;
  for (let i = 0; i < path.length - 1; i += 1) {
    const length = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]);
    segments.push({ from: path[i], to: path[i + 1], start: total, length });
    total += length;
  }
  const shape = emptyShape(count, 0.09);
  for (let i = 0; i < count; i += 1) {
    const along = random() * total;
    const segment = segments.find((s) => along <= s.start + s.length) ?? segments[segments.length - 1];
    const t = segment.length === 0 ? 0 : (along - segment.start) / segment.length;
    const dx = (segment.to[0] - segment.from[0]) / (segment.length || 1);
    const dz = (segment.to[1] - segment.from[1]) / (segment.length || 1);
    // Denser toward the middle of the road, never past its edges.
    const offset = ((random() + random()) / 2 - 0.5) * width;
    const x = segment.from[0] + (segment.to[0] - segment.from[0]) * t - dz * offset;
    const z = segment.from[1] + (segment.to[1] - segment.from[1]) * t + dx * offset;
    const spark = random() < 0.07;
    put(shape, i, x, (random() - 0.5) * 0.2, z, ink[i % ink.length], spark ? EMBER : PALE, spark ? 0.9 : 0.25 + 0.45 * random());
  }
  return shape;
}

/**
 * The road's edges: a line of ember characters along each side of `path`, `spacing` apart, at half
 * `width` from its centre, so the road reads as a road and not a scatter (Chris, 2026-11-10). The
 * characters follow `code` in reading order.
 * - `from`: the first characters stand this far along the path (R5: a road that carries on from
 *   another's end keeps its spacing instead of doubling the joint).
 * - `highlights`: edge characters within `HIGHLIGHT_RADIUS` of one of these points are drawn at full
 *   alpha and 1.6 times the size (How I work's commits on the edge, R5).
 * - `openings`: no edge characters within `radius` of these points (where a side path joins, R5).
 * @param {string} code
 * @param {{
 *   path: ReadonlyArray<Point2>, width: number, spacing: number, from?: number,
 *   highlights?: ReadonlyArray<Point2>, openings?: { points: ReadonlyArray<Point2>, radius: number },
 * }} options
 * @param {number} seed
 * @returns {Shape}
 */
export function roadEdges(code, { path, width, spacing, from = 0, highlights = [], openings }, seed) {
  const ink = inkOf(code);
  const random = seeded(seed);
  const segments = [];
  let total = 0;
  for (let i = 0; i < path.length - 1; i += 1) {
    const length = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]);
    segments.push({ from: path[i], to: path[i + 1], start: total, length });
    total += length;
  }
  const size = 0.1;
  const perSide = total >= from ? Math.floor((total - from) / spacing) + 1 : 0;
  /** @type {Array<{ x: number, z: number, char: string, lit: boolean }>} */
  const placed = [];
  for (const side of [-1, 1]) {
    for (let k = 0; k < perSide; k += 1) {
      const along = Math.min(total, from + k * spacing);
      const segment = segments.find((s) => along <= s.start + s.length) ?? segments[segments.length - 1];
      const t = segment.length === 0 ? 0 : (along - segment.start) / segment.length;
      const dx = (segment.to[0] - segment.from[0]) / (segment.length || 1);
      const dz = (segment.to[1] - segment.from[1]) / (segment.length || 1);
      // A hair of jitter so the line looks drawn, never more than 2 cm off the edge.
      const offset = side * (width / 2) + (random() - 0.5) * 0.04;
      const x = segment.from[0] + (segment.to[0] - segment.from[0]) * t - dz * offset;
      const z = segment.from[1] + (segment.to[1] - segment.from[1]) * t + dx * offset;
      if (openings && openings.points.some(([px, pz]) => Math.hypot(x - px, z - pz) < openings.radius)) continue;
      const lit = highlights.some(([px, pz]) => Math.hypot(x - px, z - pz) <= HIGHLIGHT_RADIUS);
      placed.push({ x, z, char: ink[(k + (side > 0 ? 7 : 0)) % ink.length], lit });
    }
  }
  const shape = emptyShape(placed.length, size);
  const sizes = highlights.length > 0 ? new Float32Array(placed.length).fill(size) : null;
  placed.forEach(({ x, z, char, lit }, i) => {
    put(shape, i, x, 0.02, z, char, EMBER, lit ? 1 : 0.85);
    if (sizes && lit) sizes[i] = size * 1.6;
  });
  return sizes ? { ...shape, sizes } : shape;
}

/** How near a highlight point an edge character must be to light up. */
const HIGHLIGHT_RADIUS = 0.8;

/** A stand's posts stand this far either side of its landmark's centre, across the face. */
const POST_OFFSET = 0.35;
/** The stand's three columns of flowing code, this far apart. */
const COLUMN_GAP = 0.12;

/**
 * What a road landmark stands on (Chris, 2026-11-12: "a double post under it with the code running
 * in between… set up nice"): two ember posts of the road's characters, one every line height, square
 * under the landmark at `POST_OFFSET` either side of its centre, from the ground to its bottom edge;
 * and between them three columns of the road's characters, pale, flowing up (`flow`: the column's
 * height; the posts' 0). It is the road's code, separate from the landmark's own code, which flies
 * into its picture; a flight never touches it.
 * @param {string} roadCode
 * @param {import('./roadLayout.js').Landmark} landmark
 * @param {number} seed
 * @returns {Shape & { flow: Float32Array }}
 */
export function landmarkStand(roadCode, landmark, seed) {
  const ink = inkOf(roadCode);
  const first = Math.floor(seeded(seed)() * ink.length);
  const bottom = landmark.center[1] - landmark.height / 2;
  const step = SLAB_METRICS.lineHeight;
  const postGlyphs = bottom >= 0 ? Math.floor(bottom / step + 1e-9) + 1 : 0;
  const columnGlyphs = bottom >= step ? Math.round(bottom / step) : 0;
  const count = postGlyphs * 2 + columnGlyphs * 3;
  const shape = emptyShape(count, 0.1);
  const flow = new Float32Array(count);
  // Across the face, as `orient` turns a shape facing +z.
  const rx = landmark.facing[2];
  const rz = -landmark.facing[0];
  const [cx, , cz] = landmark.center;
  let i = 0;
  for (const side of [-1, 1]) {
    for (let k = 0; k < postGlyphs; k += 1) {
      const across = side * POST_OFFSET;
      put(shape, i, cx + across * rx, Math.min(bottom, k * step), cz + across * rz, ink[(first + i) % ink.length], EMBER, 0.9);
      i += 1;
    }
  }
  [-1, 0, 1].forEach((column) => {
    const across = column * COLUMN_GAP;
    for (let k = 0; k < columnGlyphs; k += 1) {
      // Evenly round the column's height, each column a third of a step behind the last, so the three
      // never rise in lockstep.
      const y = (((k + (column + 1) / 3) * bottom) / columnGlyphs) % bottom;
      put(shape, i, cx + across * rx, y, cz + across * rz, ink[(first + i) % ink.length], PALE, 0.75);
      flow[i] = bottom;
      i += 1;
    }
  });
  return { ...shape, flow };
}

/**
 * The fork's two signposts, built from their own labels: each label across a board in white, and
 * its characters repeated down an ember post. The first label stands on the left, the second on
 * the right.
 * @param {ReadonlyArray<string>} labels
 * @param {{ at: Vec3 }} options Where the road forks, on the ground.
 * @param {number} seed
 * @returns {Shape}
 */
export function forkSigns(labels, { at }, seed) {
  const random = seeded(seed);
  const postGlyphs = 11;
  const count = labels.reduce((sum, label) => sum + inkOf(label).length + postGlyphs, 0);
  const shape = emptyShape(count, 0.26);
  let i = 0;
  labels.forEach((label, n) => {
    const ink = inkOf(label);
    const side = n === 0 ? -1 : 1;
    const x0 = at[0] + side * 3.2;
    const z0 = at[2] - 1;
    ink.forEach((char, j) => {
      // White, so the words read against the dark (Chris, 2026-11-10: ember letters "get washed out").
      put(shape, i, x0 + (j - (ink.length - 1) / 2) * 0.3, at[1] + 2.2, z0, char, WHITE, 1);
      i += 1;
    });
    for (let k = 0; k < postGlyphs; k += 1) {
      put(shape, i, x0 + (random() - 0.5) * 0.04, at[1] + k * 0.19, z0, ink[k % ink.length], EMBER, 0.55);
      i += 1;
    }
  });
  return shape;
}

/**
 * A landmark: a screen-shaped sculpture of `code`, its frame drawn densely and its face filled,
 * which resolves into the product's real screen when the camera arrives (Task P4).
 * @param {string} code
 * @param {{ width: number, height: number, center: Vec3, count: number, facing?: Vec3 }} options
 * @param {number} seed
 * @returns {Shape}
 */
export function screenSculpture(code, { width, height, center, count, facing = FACING_BACK }, seed) {
  const ink = inkOf(code);
  const random = seeded(seed);
  const shape = emptyShape(count, 0.07);
  for (let i = 0; i < count; i += 1) {
    let u = random() - 0.5;
    let v = random() - 0.5;
    const frame = random() < 0.4;
    if (frame) {
      // Snap to one of the four edges.
      if (random() < 0.5) u = u < 0 ? -0.5 : 0.5;
      else v = v < 0 ? -0.5 : 0.5;
    }
    put(shape, i, center[0] + u * width, center[1] + v * height, center[2] + (random() - 0.5) * 0.4, ink[i % ink.length], frame ? EMBER : PALE, frame ? 0.85 : 0.35 + 0.4 * random());
  }
  return orient(shape, center, facing);
}

/**
 * Most glyphs the world may draw on a device tier (the renderer's governor picks the tier).
 * @param {Tier} tier
 */
export function budgetFor(tier) {
  return { low: 12000, mid: 24000, high: 40000 }[tier];
}

/** Distance between the characters lining the road's edges, in world units. */
const EDGE_SPACING = 0.35;

/** The road's centre lines: the trunk to the fork, then a branch each way. */
export const ROAD_PATHS = Object.freeze({
  trunk: /** @type {Array<Point2>} */ ([[0, -3], [0, -40]]),
  business: /** @type {Array<Point2>} */ ([[0, -40], [-3, -48], [-6, -55]]),
  family: /** @type {Array<Point2>} */ ([[0, -40], [3, -48], [6, -55]]),
});

/**
 * The whole prototype stretch for a tier, within its budget: the empty file, the road and its two
 * branches with their ember edges, the signposts, and the UnderFire landmark at the end of the
 * business road. The editor, signs and edges are exact; the rest of the budget is split between
 * the road's scatter and the landmark.
 * @param {Tier} tier
 * @param {{ gate: string, road: string, landmark: string }} sources Approved excerpt code.
 * @param {number} seed
 * @returns {Array<{ name: string, shape: Shape }>}
 */
export function buildWorld(tier, sources, seed) {
  const editor = editorSlab(sources.gate, seed);
  const signs = forkSigns(['business/', 'family/'], { at: [0, 0, -40] }, seed + 1);
  const edges = {
    trunk: roadEdges(sources.road, { path: ROAD_PATHS.trunk, width: 4, spacing: EDGE_SPACING }, seed + 6),
    business: roadEdges(sources.road, { path: ROAD_PATHS.business, width: 3.2, spacing: EDGE_SPACING }, seed + 7),
    family: roadEdges(sources.road, { path: ROAD_PATHS.family, width: 3.2, spacing: EDGE_SPACING }, seed + 8),
  };
  const fixed = [editor, signs, edges.trunk, edges.business, edges.family].reduce((sum, shape) => sum + shape.glyphs.length, 0);
  const rest = budgetFor(tier) - fixed;
  if (rest <= 0) throw new Error(`The ${tier} budget leaves no glyphs for the road.`);
  const share = (/** @type {number} */ fraction) => Math.floor(rest * fraction);
  return [
    { name: 'editor', shape: editor },
    { name: 'trunk-road', shape: codeRoad(sources.road, { path: ROAD_PATHS.trunk, width: 4, count: share(0.4) }, seed + 2) },
    { name: 'trunk-edges', shape: edges.trunk },
    { name: 'business-edges', shape: edges.business },
    { name: 'family-edges', shape: edges.family },
    { name: 'business-road', shape: codeRoad(sources.road, { path: ROAD_PATHS.business, width: 3.2, count: share(0.2) }, seed + 3) },
    { name: 'family-road', shape: codeRoad(sources.road, { path: ROAD_PATHS.family, width: 3.2, count: share(0.15) }, seed + 4) },
    { name: 'signs', shape: signs },
    {
      name: 'landmark',
      shape: screenSculpture(
        sources.landmark,
        { width: LANDMARK.width, height: LANDMARK.height, center: LANDMARK.center, count: share(0.25) },
        seed + 5,
      ),
    },
  ];
}

/** Shares of what the budget leaves after the exact parts: the road's scatter, then the screens. */
// R5: the onward road runs on into the fog, so it takes 0.05 more of the scatter from the trunk, which
// is still by far the densest stretch.
const ROAD_SCATTER = Object.freeze({ trunk: 0.15, business: 0.08, family: 0.07, onward: 0.15 });
const SCREEN_SHARE = 0.55;
/** Half the onward road's width, and half a side path's (R5). */
const ROAD_HALF = 1.6;
const SPUR_HALF = 0.8;

/**
 * The home's world with a road beyond the fork (Code World W2.3): the opening as `buildWorld` builds
 * it (without the prototype's lone landmark), the road running on past the branch with its ember
 * edges, a landmark per stop (a screen sculpture of its excerpt for products and services, the
 * audit's file as a slab, Crew Advisors' file unfinished with its cursor), how I work's commits lit on
 * the road's edge, a side path to each landmark and a stand under it (R5). Within the tier's budget:
 * the editor, signs, edges, slabs and stands are exact; the rest goes to the road's scatter (the side
 * paths share the onward road's, by area, so the ground reads as one surface) and the screens.
 * @param {Tier} tier
 * @param {{ gate: string, road: string, stops: Readonly<Record<string, string>> }} sources Approved
 *   code: the empty file's, the road's, and each stop's by excerpt id.
 * @param {number} seed
 * @param {{ stops: ReadonlyArray<import('./roads.js').RoadStop>, layout: ReturnType<typeof import('./roadLayout.js').layoutRoad> }} road
 * @param {Readonly<Record<string, { data: Uint8ClampedArray, width: number, height: number }>>} [landed] Each
 *   screen landmark's real screen, once loaded (R4): with one, the landmark's share is split between its
 *   code sculpture and its picture in characters, tagged so the renderer shows the picture once passed.
 * @returns {Array<{ name: string, shape: Shape, stopId?: string, cursor?: number }>}
 */
export function buildRoadWorld(tier, sources, seed, road, landed = {}) {
  const { layout } = road;
  const branchEnd = ROAD_PATHS.business.length;
  const onward = /** @type {Point2[]} */ (layout.path.slice(branchEnd - 1));
  const editor = editorSlab(sources.gate, seed);
  const signs = forkSigns(['business/', 'family/'], { at: [0, 0, -40] }, seed + 1);
  const edges = {
    trunk: roadEdges(sources.road, { path: ROAD_PATHS.trunk, width: 4, spacing: EDGE_SPACING }, seed + 6),
    business: roadEdges(sources.road, { path: ROAD_PATHS.business, width: 3.2, spacing: EDGE_SPACING }, seed + 7),
    family: roadEdges(sources.road, { path: ROAD_PATHS.family, width: 3.2, spacing: EDGE_SPACING }, seed + 8),
  };
  // Each side path leaves the road at its edge: its mouth is where the main edge opens.
  const spurs = layout.spurs.map(({ stopId, path: [from, to] }) => {
    const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const mouth = /** @type {Point2} */ ([from[0] + ((to[0] - from[0]) / length) * ROAD_HALF, from[1] + ((to[1] - from[1]) / length) * ROAD_HALF]);
    return { stopId, path: [mouth, to], length: length - ROAD_HALF };
  });
  // The onward road's edges carry on at the branch's spacing, where the branch's last ones left off.
  const branchLength = ROAD_PATHS.business.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - ROAD_PATHS.business[i][0], p[1] - ROAD_PATHS.business[i][1]), 0);
  const carryOn = (Math.floor(branchLength / EDGE_SPACING + 1e-9) + 1) * EDGE_SPACING - branchLength;
  const onwardEdges = roadEdges(
    sources.road,
    {
      path: onward,
      width: ROAD_HALF * 2,
      spacing: EDGE_SPACING,
      from: carryOn,
      highlights: layout.commits,
      openings: { points: spurs.map((spur) => spur.path[0]), radius: SPUR_HALF + EDGE_SPACING / 2 },
    },
    seed + 9,
  );
  const spurEdges = spurs.map((spur, n) => roadEdges(sources.road, { path: spur.path, width: SPUR_HALF * 2, spacing: EDGE_SPACING }, seed + 40 + n));
  const stands = layout.landmarks.map((landmark, n) => landmarkStand(sources.road, landmark, seed + 60 + n));

  /** @type {Array<{ name: string, shape: Shape, stopId?: string, cursor?: number }>} */
  const exact = [];
  /** @type {Array<{ stopId: string, landmark: import('./roadLayout.js').Landmark, code: string }>} */
  const screens = [];
  road.stops.forEach((stop, k) => {
    if (stop.kind === 'commits') return;
    const landmark = layout.landmarks.find((l) => l.stopId === stop.id);
    const code = stop.excerptId ? sources.stops[stop.excerptId] : undefined;
    if (!landmark || code === undefined) throw new Error(`The road has no landmark or code for ${stop.id}.`);
    if (stop.kind === 'unfinished') {
      const shape = unfinishedSlab(code, { center: landmark.center, facing: landmark.facing }, seed + 20 + k);
      exact.push({ name: `landmark:${stop.id}`, shape, stopId: stop.id, cursor: shape.cursor });
    } else if (stop.kind === 'audit') {
      exact.push({ name: `landmark:${stop.id}`, shape: editorSlab(code, seed + 20 + k, { center: landmark.center, facing: landmark.facing }), stopId: stop.id });
    } else {
      screens.push({ stopId: stop.id, landmark, code });
    }
  });

  const fixedShapes = [editor, signs, edges.trunk, edges.business, edges.family, onwardEdges, ...spurEdges, ...stands, ...exact.map((part) => part.shape)];
  const fixed = fixedShapes.reduce((sum, shape) => sum + shape.glyphs.length, 0);
  const rest = budgetFor(tier) - fixed;
  if (rest <= 0) throw new Error(`The ${tier} budget leaves no glyphs for the road.`);
  const share = (/** @type {number} */ fraction) => Math.floor(rest * fraction);
  const perScreen = screens.length > 0 ? Math.floor(share(SCREEN_SHARE) / screens.length) : 0;
  // The onward road's scatter, shared with the side paths by area.
  const onwardLength = onward.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - onward[i][0], p[1] - onward[i][1]), 0);
  const areas = { onward: onwardLength * ROAD_HALF * 2, spurs: spurs.map((spur) => spur.length * SPUR_HALF * 2) };
  const totalArea = areas.onward + areas.spurs.reduce((sum, a) => sum + a, 0);
  const scatterFor = (/** @type {number} */ area) => Math.floor((share(ROAD_SCATTER.onward) * area) / totalArea);

  return [
    { name: 'editor', shape: editor },
    { name: 'trunk-road', shape: codeRoad(sources.road, { path: ROAD_PATHS.trunk, width: 4, count: share(ROAD_SCATTER.trunk) }, seed + 2) },
    { name: 'trunk-edges', shape: edges.trunk },
    { name: 'business-edges', shape: edges.business },
    { name: 'family-edges', shape: edges.family },
    { name: 'business-road', shape: codeRoad(sources.road, { path: ROAD_PATHS.business, width: 3.2, count: share(ROAD_SCATTER.business) }, seed + 3) },
    { name: 'family-road', shape: codeRoad(sources.road, { path: ROAD_PATHS.family, width: 3.2, count: share(ROAD_SCATTER.family) }, seed + 4) },
    { name: 'onward-road', shape: codeRoad(sources.road, { path: onward, width: ROAD_HALF * 2, count: scatterFor(areas.onward) }, seed + 11) },
    { name: 'onward-edges', shape: onwardEdges },
    ...spurs.flatMap((spur, n) => [
      { name: `spur-road:${spur.stopId}`, shape: codeRoad(sources.road, { path: spur.path, width: SPUR_HALF * 2, count: Math.max(1, scatterFor(areas.spurs[n])) }, seed + 50 + n) },
      { name: `spur-edges:${spur.stopId}`, shape: spurEdges[n] },
    ]),
    ...layout.landmarks.map((landmark, n) => ({ name: `stand:${landmark.stopId}`, shape: stands[n] })),
    { name: 'signs', shape: signs },
    ...screens.flatMap(({ stopId, landmark, code }, n) => {
      const image = landed[stopId];
      const place = layout.landmarks.indexOf(landmark) + 1;
      const count = image ? Math.floor(perScreen / 2) : perScreen;
      const sculpture = screenSculpture(code, { width: landmark.width, height: landmark.height, center: landmark.center, count, facing: landmark.facing }, seed + 30 + n);
      if (!image) return [{ name: `landmark:${stopId}`, stopId, shape: sculpture }];
      // The picture's grid step, in the image's pixels, for about the other half of the share.
      const step = Math.max(1, Math.sqrt((image.width * image.height) / Math.max(1, perScreen - count)));
      return [
        { name: `landmark:${stopId}`, stopId, shape: { ...sculpture, tag: place } },
        { name: `landed:${stopId}`, stopId, shape: { ...landedShape(image, landmark, code, step), tag: -place } },
      ];
    }),
    ...exact,
  ];
}
