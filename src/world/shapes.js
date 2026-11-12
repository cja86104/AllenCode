// @ts-check
import { LANDMARK } from './landmark.js';

/**
 * The prototype world, generated in code from real approved excerpts (no models, nothing invented).
 * Every shape is a set of glyphs: a position (x, y, z), the character drawn (its UTF-16 code), an
 * rgba colour, and one glyph size in world units for the whole shape. Deterministic for a seed.
 * @typedef {{ positions: Float32Array, glyphs: Uint16Array, colors: Float32Array, size: number }} Shape
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
 * @param {string} code
 * @param {{ path: ReadonlyArray<Point2>, width: number, spacing: number }} options
 * @param {number} seed
 * @returns {Shape}
 */
export function roadEdges(code, { path, width, spacing }, seed) {
  const ink = inkOf(code);
  const random = seeded(seed);
  const segments = [];
  let total = 0;
  for (let i = 0; i < path.length - 1; i += 1) {
    const length = Math.hypot(path[i + 1][0] - path[i][0], path[i + 1][1] - path[i][1]);
    segments.push({ from: path[i], to: path[i + 1], start: total, length });
    total += length;
  }
  const perSide = Math.floor(total / spacing) + 1;
  const shape = emptyShape(perSide * 2, 0.1);
  let i = 0;
  for (const side of [-1, 1]) {
    for (let k = 0; k < perSide; k += 1) {
      const along = Math.min(total, k * spacing);
      const segment = segments.find((s) => along <= s.start + s.length) ?? segments[segments.length - 1];
      const t = segment.length === 0 ? 0 : (along - segment.start) / segment.length;
      const dx = (segment.to[0] - segment.from[0]) / (segment.length || 1);
      const dz = (segment.to[1] - segment.from[1]) / (segment.length || 1);
      // A hair of jitter so the line looks drawn, never more than 2 cm off the edge.
      const offset = side * (width / 2) + (random() - 0.5) * 0.04;
      const x = segment.from[0] + (segment.to[0] - segment.from[0]) * t - dz * offset;
      const z = segment.from[1] + (segment.to[1] - segment.from[1]) * t + dx * offset;
      put(shape, i, x, 0.02, z, ink[(k + (side > 0 ? 7 : 0)) % ink.length], EMBER, 0.85);
      i += 1;
    }
  }
  return shape;
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

/** Glyphs in each commit's cluster on the road's edge. */
const COMMIT_GLYPHS = 24;

/**
 * How I work's commits on the road's edge: a tight ember cluster of the road's own characters at
 * each point, low on the ground, as the edge's line thickening where a commit landed.
 * @param {string} code
 * @param {ReadonlyArray<Point2>} points
 * @param {number} seed
 * @returns {Shape}
 */
export function commitMarks(code, points, seed) {
  const ink = inkOf(code);
  const random = seeded(seed);
  const shape = emptyShape(points.length * COMMIT_GLYPHS, 0.12);
  let i = 0;
  for (const [x, z] of points) {
    for (let k = 0; k < COMMIT_GLYPHS; k += 1) {
      const angle = random() * Math.PI * 2;
      const radius = 0.35 * Math.sqrt(random());
      put(shape, i, x + Math.cos(angle) * radius, 0.05 + random() * 0.5, z + Math.sin(angle) * radius, ink[(i * 5) % ink.length], EMBER, 0.75 + 0.25 * random());
      i += 1;
    }
  }
  return shape;
}

/** Shares of what the budget leaves after the exact parts: the road's scatter, then the screens. */
const ROAD_SCATTER = Object.freeze({ trunk: 0.2, business: 0.08, family: 0.07, onward: 0.1 });
const SCREEN_SHARE = 0.55;

/**
 * The home's world with a road beyond the fork (Code World W2.3): the opening as `buildWorld` builds
 * it (without the prototype's lone landmark), the road running on past the branch with its ember
 * edges, a landmark per stop (a screen sculpture of its excerpt for products and services, the
 * audit's file as a slab, Crew Advisors' file unfinished with its cursor) and how I work's commit
 * marks. Within the tier's budget: the editor, signs, edges, slabs and marks are exact; the rest goes
 * to the road's scatter (45 %) and the screens (55 %, shared equally).
 * @param {Tier} tier
 * @param {{ gate: string, road: string, stops: Readonly<Record<string, string>> }} sources Approved
 *   code: the empty file's, the road's, and each stop's by excerpt id.
 * @param {number} seed
 * @param {{ stops: ReadonlyArray<import('./roads.js').RoadStop>, layout: ReturnType<typeof import('./roadLayout.js').layoutRoad> }} road
 * @returns {Array<{ name: string, shape: Shape, stopId?: string, cursor?: number }>}
 */
export function buildRoadWorld(tier, sources, seed, road) {
  const { layout } = road;
  const branchEnd = ROAD_PATHS.business.length;
  const onward = /** @type {Point2[]} */ (layout.path.slice(branchEnd - 1));
  const editor = editorSlab(sources.gate, seed);
  const signs = forkSigns(['business/', 'family/'], { at: [0, 0, -40] }, seed + 1);
  const edges = {
    trunk: roadEdges(sources.road, { path: ROAD_PATHS.trunk, width: 4, spacing: EDGE_SPACING }, seed + 6),
    business: roadEdges(sources.road, { path: ROAD_PATHS.business, width: 3.2, spacing: EDGE_SPACING }, seed + 7),
    family: roadEdges(sources.road, { path: ROAD_PATHS.family, width: 3.2, spacing: EDGE_SPACING }, seed + 8),
    onward: roadEdges(sources.road, { path: onward, width: 3.2, spacing: EDGE_SPACING }, seed + 9),
  };
  const commits = layout.commits.length > 0 ? commitMarks(sources.road, layout.commits, seed + 10) : null;

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

  const fixedShapes = [editor, signs, edges.trunk, edges.business, edges.family, edges.onward, ...exact.map((part) => part.shape), ...(commits ? [commits] : [])];
  const fixed = fixedShapes.reduce((sum, shape) => sum + shape.glyphs.length, 0);
  const rest = budgetFor(tier) - fixed;
  if (rest <= 0) throw new Error(`The ${tier} budget leaves no glyphs for the road.`);
  const share = (/** @type {number} */ fraction) => Math.floor(rest * fraction);
  const perScreen = screens.length > 0 ? Math.floor(share(SCREEN_SHARE) / screens.length) : 0;

  return [
    { name: 'editor', shape: editor },
    { name: 'trunk-road', shape: codeRoad(sources.road, { path: ROAD_PATHS.trunk, width: 4, count: share(ROAD_SCATTER.trunk) }, seed + 2) },
    { name: 'trunk-edges', shape: edges.trunk },
    { name: 'business-edges', shape: edges.business },
    { name: 'family-edges', shape: edges.family },
    { name: 'business-road', shape: codeRoad(sources.road, { path: ROAD_PATHS.business, width: 3.2, count: share(ROAD_SCATTER.business) }, seed + 3) },
    { name: 'family-road', shape: codeRoad(sources.road, { path: ROAD_PATHS.family, width: 3.2, count: share(ROAD_SCATTER.family) }, seed + 4) },
    { name: 'onward-road', shape: codeRoad(sources.road, { path: onward, width: 3.2, count: share(ROAD_SCATTER.onward) }, seed + 11) },
    { name: 'onward-edges', shape: edges.onward },
    { name: 'signs', shape: signs },
    ...screens.map(({ stopId, landmark, code }, n) => ({
      name: `landmark:${stopId}`,
      stopId,
      shape: screenSculpture(code, { width: landmark.width, height: landmark.height, center: landmark.center, count: perScreen, facing: landmark.facing }, seed + 30 + n),
    })),
    ...exact,
    ...(commits ? [{ name: 'commits', shape: commits }] : []),
  ];
}
