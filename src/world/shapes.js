// @ts-check
import { LANDMARK } from './landmark.js';
import { landedShape } from './worldFlight.js';
import { roadAt, roadBetween, roadHeadingAt, roadLength } from './roadPath.js';

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
 * `stream` (Chris, 2026-11-16), when present, gives each glyph a run forward along the road: its
 * direction (x, y, z: on a hill it runs up or down the slope) and the length of its loop, four floats
 * a glyph.
 * @typedef {{ positions: Float32Array, glyphs: Uint16Array, colors: Float32Array, size: number, tag?: number, sizes?: Float32Array, flow?: Float32Array, stream?: Float32Array }} Shape
 * @typedef {[number, number, number]} Vec3
 * @typedef {[number, number, number?]} Point2 A point on the ground: x and z, and the ground's height there
 *   (2026-11-16: hills), 0 when absent.
 * @typedef {'low' | 'mid' | 'high'} Tier
 */

/** Ember #f97316 and the pale code colour, as 0..1 rgb. */
const EMBER = [0xf9 / 255, 0x73 / 255, 0x16 / 255];
const PALE = [0.86, 0.86, 0.84];
const WHITE = [1, 1, 1];
/** Tailwind's sky-400 and green-400, as bright on the night as the ember (Chris, 2026-11-16). */
const SKY = [0x38 / 255, 0xbd / 255, 0xf8 / 255];
const GREEN = [0x4a / 255, 0xde / 255, 0x80 / 255];
/** The road's coloured characters: ember, sky blue and green, in even shares (Chris, 2026-11-16). */
export const ROAD_COLORS = Object.freeze([EMBER, SKY, GREEN]);
/** The share of the road's characters in colour; the rest are pale (Chris, 2026-11-16: "more of them"). */
const COLOURED_SHARE = 1 / 3;
/**
 * Each road character runs forward along its stretch of road in a loop this long, in world units,
 * fading in and out at its ends, so the road moves the way a stand's code rises (Chris, 2026-11-16).
 */
export const ROAD_FLOW_LOOP = 1.6;
/** The road's orange edges are this many lines wide, this far apart, inward from the edge (Chris, 2026-11-16). */
export const EDGE_LINES = 3;
const EDGE_GAP = 0.15;

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
 * characters taken from `code` in reading order, a third of them in colour (ember, sky blue, green,
 * in even shares) and the rest pale, each running forward along its stretch of the path (`stream`).
 * @param {string} code
 * @param {{ path: ReadonlyArray<Point2>, width: number, count: number }} options
 * @param {number} seed
 * @returns {Shape & { stream: Float32Array }}
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
  const stream = new Float32Array(count * 4);
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
    // On the ground beneath it (2026-11-16: hills), and running up or down the slope it stands on.
    const low = segment.from[2] ?? 0;
    const rise = (segment.to[2] ?? 0) - low;
    const run = Math.hypot(segment.length, rise) || 1;
    const pick = random();
    const colour = pick < COLOURED_SHARE ? ROAD_COLORS[Math.min(ROAD_COLORS.length - 1, Math.floor((pick / COLOURED_SHARE) * ROAD_COLORS.length))] : null;
    put(shape, i, x, low + rise * t + (random() - 0.5) * 0.2, z, ink[i % ink.length], colour ?? PALE, colour ? 0.9 : 0.45 + 0.45 * random());
    stream[i * 4] = (dx * segment.length) / run;
    stream[i * 4 + 1] = rise / run;
    stream[i * 4 + 2] = (dz * segment.length) / run;
    stream[i * 4 + 3] = ROAD_FLOW_LOOP;
  }
  return { ...shape, stream };
}

/** @param {ReadonlyArray<Readonly<Point2>>} path */
function pathLength(path) {
  return path.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - path[i][0], p[1] - path[i][1]), 0);
}

/**
 * How many scatter glyphs a stretch of road gets at a density, in glyphs per unit of ground.
 * @param {number} density
 * @param {ReadonlyArray<Readonly<Point2>>} path
 * @param {number} width
 */
export function scatterCount(density, path, width) {
  return Math.floor(density * width * pathLength(path));
}

/**
 * The road's edges: ember characters along each side of `path`, so the road reads as a road and not
 * a scatter (Chris, 2026-11-10), in `EDGE_LINES` lines a side (Chris, 2026-11-16: "three lines
 * wide"), the outer at half `width` from the centre and the others `EDGE_GAP` apart inside it, each
 * line's characters `spacing` apart and staggered a third of that from its neighbour's. They stay
 * still. The characters follow `code` in reading order.
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
  /** @type {Array<{ x: number, y: number, z: number, char: string, lit: boolean }>} */
  const placed = [];
  for (const side of [-1, 1]) {
    for (let line = 0; line < EDGE_LINES; line += 1) {
      for (let k = 0; k < perSide; k += 1) {
        const along = Math.min(total, from + k * spacing + (line * spacing) / EDGE_LINES);
        const segment = segments.find((s) => along <= s.start + s.length) ?? segments[segments.length - 1];
        const t = segment.length === 0 ? 0 : (along - segment.start) / segment.length;
        const dx = (segment.to[0] - segment.from[0]) / (segment.length || 1);
        const dz = (segment.to[1] - segment.from[1]) / (segment.length || 1);
        // A hair of jitter so the line looks drawn, never more than 2 cm off the edge.
        const offset = side * (width / 2 - line * EDGE_GAP) + (random() - 0.5) * 0.04;
        const x = segment.from[0] + (segment.to[0] - segment.from[0]) * t - dz * offset;
        const z = segment.from[1] + (segment.to[1] - segment.from[1]) * t + dx * offset;
        // On the ground beneath it (2026-11-16: hills).
        const y = (segment.from[2] ?? 0) + ((segment.to[2] ?? 0) - (segment.from[2] ?? 0)) * t;
        if (openings && openings.points.some(([px, pz]) => Math.hypot(x - px, z - pz) < openings.radius)) continue;
        const lit = highlights.some(([px, pz]) => Math.hypot(x - px, z - pz) <= HIGHLIGHT_RADIUS);
        placed.push({ x, y, z, char: ink[(k + (side > 0 ? 7 : 0) + line * 13) % ink.length], lit });
      }
    }
  }
  const shape = emptyShape(placed.length, size);
  const sizes = highlights.length > 0 ? new Float32Array(placed.length).fill(size) : null;
  placed.forEach(({ x, y, z, char, lit }, i) => {
    put(shape, i, x, y + 0.02, z, char, EMBER, lit ? 1 : 0.85);
    if (sizes && lit) sizes[i] = size * 1.6;
  });
  return sizes ? { ...shape, sizes } : shape;
}

/** How near a highlight point an edge character must be to light up. */
const HIGHLIGHT_RADIUS = 0.8;

/** Your idea's frame: its edge characters this far apart, and its faint grid inside. */
const FRAME_SPACING = 0.12;
const FRAME_GRID = 0.6;

/**
 * The frame your idea is sketched on (Code World W4): the road's characters in ember round the
 * landmark's edge and a faint grid of pale ones inside, waiting for the visitor's line. Exact: no
 * flight touches it; the sketch the visitor builds appears over it.
 * @param {string} roadCode
 * @param {import('./roadLayout.js').Landmark} landmark
 * @param {number} seed
 * @returns {Shape}
 */
export function sketchFrame(roadCode, landmark, seed) {
  const ink = inkOf(roadCode);
  const first = Math.floor(seeded(seed)() * ink.length);
  const halfW = landmark.width / 2;
  const halfH = landmark.height / 2;
  /** @type {Array<{ x: number, y: number, edge: boolean }>} */
  const points = [];
  const across = Math.round(landmark.width / FRAME_SPACING);
  const down = Math.round(landmark.height / FRAME_SPACING);
  for (let i = 0; i <= across; i += 1) {
    const x = -halfW + (landmark.width * i) / across;
    points.push({ x, y: halfH, edge: true }, { x, y: -halfH, edge: true });
  }
  for (let j = 1; j < down; j += 1) {
    const y = -halfH + (landmark.height * j) / down;
    points.push({ x: -halfW, y, edge: true }, { x: halfW, y, edge: true });
  }
  for (let x = -halfW + FRAME_GRID; x < halfW - 1e-9; x += FRAME_GRID) {
    for (let y = -halfH + FRAME_GRID; y < halfH - 1e-9; y += FRAME_GRID) points.push({ x, y, edge: false });
  }
  const shape = emptyShape(points.length, 0.1);
  const [cx, cy, cz] = landmark.center;
  points.forEach(({ x, y, edge }, i) => {
    put(shape, i, cx + x, cy + y, cz, ink[(first + i) % ink.length], edge ? EMBER : PALE, edge ? 0.9 : 0.25);
  });
  return orient(shape, landmark.center, landmark.facing);
}

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
 * A sign across the road (Chris, 2026-11-16: "a sign for our work"): the label in white on a board
 * above the road, its characters repeated up an ember post at each of the road's edges, facing back
 * up the road so the camera reads it as it drives under.
 * @param {string} label
 * @param {{ at: Point2, heading: Point2, halfWidth: number, ground?: number }} options Where on the road's centre line, which way it runs there, half its width, and the ground's height there (2026-11-16: hills; 0 when absent).
 * @param {number} seed
 * @returns {Shape}
 */
export function roadGateway(label, { at, heading, halfWidth, ground = 0 }, seed) {
  const random = seeded(seed);
  const ink = inkOf(label);
  const postGlyphs = 17;
  const shape = emptyShape(ink.length + postGlyphs * 2, 0.26);
  // Across the road, to the traveller's right.
  const right = [-heading[1], heading[0]];
  const place = (/** @type {number} */ across) => [at[0] + right[0] * across, at[1] + right[1] * across];
  // The label's letters keep their places, a space a letter wide, so "our work/" reads as two words.
  const slots = [...label];
  let i = 0;
  let k = 0;
  slots.forEach((slot, j) => {
    if (!slot.trim()) return;
    const [x, z] = place((j - (slots.length - 1) / 2) * 0.3);
    put(shape, i, x, ground + 3.3, z, ink[k], WHITE, 1);
    i += 1;
    k += 1;
  });
  for (const side of [-1, 1]) {
    for (let k = 0; k < postGlyphs; k += 1) {
      const [x, z] = place(side * halfWidth);
      put(shape, i, x + (random() - 0.5) * 0.001, ground + k * 0.19, z, ink[k % ink.length], EMBER, 0.55);
      i += 1;
    }
  }
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

/**
 * The road's edge characters' spacing along each of its `EDGE_LINES` lines, by tier, in world units.
 * One line was 0.35 apart (0.5 on the low tier once the business road grew, 2026-11-16). With three
 * lines a side, each staggered a third of the spacing from its neighbour (Chris, 2026-11-16), the band
 * reads three times as dense as one line: 0.5 on the high tier, 0.6 on the mid, 1 on the low ("three
 * lines, spaced out" on phones, Chris).
 */
export const EDGE_SPACING_BY_TIER = Object.freeze({ low: 1, mid: 0.6, high: 0.5 });

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
  const edgeSpacing = EDGE_SPACING_BY_TIER[tier];
  const editor = editorSlab(sources.gate, seed);
  const signs = forkSigns(['business/', 'family/'], { at: [0, 0, -40] }, seed + 1);
  const edges = {
    trunk: roadEdges(sources.road, { path: ROAD_PATHS.trunk, width: 4, spacing: edgeSpacing }, seed + 6),
    business: roadEdges(sources.road, { path: ROAD_PATHS.business, width: 3.2, spacing: edgeSpacing }, seed + 7),
    family: roadEdges(sources.road, { path: ROAD_PATHS.family, width: 3.2, spacing: edgeSpacing }, seed + 8),
  };
  const density = ROAD_DENSITY[tier];
  const scatter = {
    trunk: scatterCount(density, ROAD_PATHS.trunk, 4),
    business: scatterCount(density, ROAD_PATHS.business, 3.2),
    family: scatterCount(density, ROAD_PATHS.family, 3.2),
  };
  const fixed = [editor, signs, edges.trunk, edges.business, edges.family].reduce((sum, shape) => sum + shape.glyphs.length, 0);
  const rest = budgetFor(tier) - fixed - scatter.trunk - scatter.business - scatter.family;
  if (rest <= 0) throw new Error(`The ${tier} budget leaves no glyphs for the landmark.`);
  return [
    { name: 'editor', shape: editor },
    { name: 'trunk-road', shape: codeRoad(sources.road, { path: ROAD_PATHS.trunk, width: 4, count: scatter.trunk }, seed + 2) },
    { name: 'trunk-edges', shape: edges.trunk },
    { name: 'business-edges', shape: edges.business },
    { name: 'family-edges', shape: edges.family },
    { name: 'business-road', shape: codeRoad(sources.road, { path: ROAD_PATHS.business, width: 3.2, count: scatter.business }, seed + 3) },
    { name: 'family-road', shape: codeRoad(sources.road, { path: ROAD_PATHS.family, width: 3.2, count: scatter.family }, seed + 4) },
    { name: 'signs', shape: signs },
    {
      name: 'landmark',
      shape: screenSculpture(sources.landmark, { width: LANDMARK.width, height: LANDMARK.height, center: LANDMARK.center, count: rest }, seed + 5),
    },
  ];
}

/**
 * The road's scatter, in glyphs per unit of ground, on the opening (the trunk and both branches), by
 * tier (W3.1, Chris 2026-11-16: the business road looked thinner and dimmer than the family road,
 * which spent the whole budget on the road). The same density whichever door is taken; the road
 * between the landmarks has half of it, the run-on into the fog an eighth, and the screens take what
 * the budget leaves. On the low tier this is what the fixed parts and the screens at `SCREEN_FLOOR`
 * leave; a fuller phone road needs a larger low budget (`budgetFor`), not a larger density.
 */
export const ROAD_DENSITY = Object.freeze({ low: 12, mid: 26, high: 46 });
/**
 * A screen landmark never has fewer glyphs than this, by tier: the picture must still read. 300 on
 * the low tier (W4: with the workshop the business road has eleven landmarks, and a phone sees each
 * sculpture only briefly before its real picture takes over).
 */
export const SCREEN_FLOOR = Object.freeze({ low: 300, mid: 400, high: 400 });
/**
 * The road between the landmarks, as a share of `ROAD_DENSITY`, by tier (W3.1: a half; W4: a third
 * on the low tier; 2026-11-16, with two more services on the business road: a quarter on the low
 * tier and 0.45 on the mid; then, for the three-line edges (Chris, 2026-11-16): 0.15, 0.35 and 0.42,
 * measured so that on both roads and every tier the opening keeps its full density and the landmarks
 * at least nine tenths of their glyphs).
 */
export const BETWEEN_SHARE = Object.freeze({ low: 0.15, mid: 0.35, high: 0.42 });
/** Half the onward road's width, and half a side path's (R5). */
const ROAD_HALF = 1.6;
const SPUR_HALF = 0.8;

/**
 * The home's world with a road beyond the fork (Code World W2.3): the opening as `buildWorld` builds
 * it (without the prototype's lone landmark), the road running on past the branch with its ember
 * edges, a landmark per stop (a screen sculpture of its excerpt for products and services, the
 * audit's file as a slab, Crew Advisors' file unfinished with its cursor), how I work's commits lit on
 * the road's edge, a side path to each landmark and a stand under it (R5). Within the tier's budget:
 * the editor, signs, edges, slabs and stands are exact; the road's scatter is laid by `ROAD_DENSITY`
 * (W3.1: the same on every door); the screens share what is left, `SCREEN_FLOOR` each at least.
 * @param {Tier} tier
 * @param {{ gate: string, road: string, stops: Readonly<Record<string, string>> }} sources Approved
 *   code: the empty file's, the road's, and each stop's by excerpt id.
 * @param {number} seed
 * @param {{ stops: ReadonlyArray<import('./roads.js').RoadStop>, layout: ReturnType<typeof import('./roadLayout.js').layoutRoad>, budget?: number }} road
 *   `budget`: the glyphs the whole road may hold, `budgetFor(tier)` when absent; larger when the world is
 *   cut around the camera before it is drawn (2026-11-16, `surroundings.js`).
 * @param {Readonly<Record<string, { data: Uint8ClampedArray, width: number, height: number }>>} [landed] Each
 *   screen landmark's real screen, once loaded (R4): with one, the landmark's share is split between its
 *   code sculpture and its picture in characters, tagged so the renderer shows the picture once passed.
 * @returns {Array<{ name: string, shape: Shape, stopId?: string, cursor?: number }>}
 */
export function buildRoadWorld(tier, sources, seed, road, landed = {}) {
  const edgeSpacing = EDGE_SPACING_BY_TIER[tier];
  const { layout } = road;
  const branchEnd = ROAD_PATHS.business.length;
  const onward = /** @type {Point2[]} */ (layout.path.slice(branchEnd - 1));
  const editor = editorSlab(sources.gate, seed);
  const signs = forkSigns(['business/', 'family/'], { at: [0, 0, -40] }, seed + 1);
  const edges = {
    trunk: roadEdges(sources.road, { path: ROAD_PATHS.trunk, width: 4, spacing: edgeSpacing }, seed + 6),
    business: roadEdges(sources.road, { path: ROAD_PATHS.business, width: 3.2, spacing: edgeSpacing }, seed + 7),
    family: roadEdges(sources.road, { path: ROAD_PATHS.family, width: 3.2, spacing: edgeSpacing }, seed + 8),
  };
  // Each side path leaves the road at its edge: its mouth is where the main edge opens.
  const spurs = layout.spurs.map(({ stopId, path: [from, to] }) => {
    const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
    const mouth = /** @type {Point2} */ ([from[0] + ((to[0] - from[0]) / length) * ROAD_HALF, from[1] + ((to[1] - from[1]) / length) * ROAD_HALF]);
    return { stopId, path: [mouth, to], length: length - ROAD_HALF };
  });
  // The onward road's edges carry on at the branch's spacing, where the branch's last ones left off.
  const branchLength = ROAD_PATHS.business.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - ROAD_PATHS.business[i][0], p[1] - ROAD_PATHS.business[i][1]), 0);
  const carryOn = (Math.floor(branchLength / edgeSpacing + 1e-9) + 1) * edgeSpacing - branchLength;
  const onwardEdges = roadEdges(
    sources.road,
    {
      path: onward,
      width: ROAD_HALF * 2,
      spacing: edgeSpacing,
      from: carryOn,
      highlights: layout.commits,
      openings: { points: spurs.map((spur) => spur.path[0]), radius: SPUR_HALF + edgeSpacing / 2 },
    },
    seed + 9,
  );
  const spurEdges = spurs.map((spur, n) => roadEdges(sources.road, { path: spur.path, width: SPUR_HALF * 2, spacing: edgeSpacing }, seed + 40 + n));
  const stands = layout.landmarks.map((landmark, n) => landmarkStand(sources.road, landmark, seed + 60 + n));
  // The other road coming in to where the roads meet (W4): its edges and a little code, no landmarks.
  const other = /** @type {Point2[]} */ (layout.other ?? []);
  const otherEdges = other.length > 1 ? roadEdges(sources.road, { path: other, width: ROAD_HALF * 2, spacing: edgeSpacing }, seed + 13) : null;
  // Signs across the road ("our work/" before the products, 2026-11-16).
  const gateways = (layout.signs ?? []).map((sign, n) => {
    const { point, height } = roadAt(layout, sign.along);
    const heading = roadHeadingAt(layout, sign.along);
    return { name: `sign:${sign.label}`, shape: roadGateway(sign.label, { at: point, heading, halfWidth: ROAD_HALF, ground: height }, seed + 70 + n) };
  });

  /** @type {Array<{ name: string, shape: Shape, stopId?: string, cursor?: number }>} */
  const exact = [];
  /** @type {Array<{ stopId: string, landmark: import('./roadLayout.js').Landmark, code: string }>} */
  const screens = [];
  road.stops.forEach((stop, k) => {
    // How I work's commits light the road's edge; a stop of words (done for you, W3) has no landmark.
    if (stop.kind === 'commits' || stop.kind === 'words') return;
    const landmark = layout.landmarks.find((l) => l.stopId === stop.id);
    // Your idea's frame (W4): the road's own code, always drawn; the visitor's sketch appears over it.
    if (stop.kind === 'sketch' && landmark) {
      exact.push({ name: `landmark:${stop.id}`, shape: sketchFrame(sources.road, landmark, seed + 20 + k) });
      return;
    }
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

  const fixedShapes = [editor, signs, edges.trunk, edges.business, edges.family, onwardEdges, ...spurEdges, ...stands, ...(otherEdges ? [otherEdges] : []), ...gateways.map((g) => g.shape), ...exact.map((part) => part.shape)];
  const fixed = fixedShapes.reduce((sum, shape) => sum + shape.glyphs.length, 0);
  // The scatter by density: the opening, the road between the landmarks (to the last stop), the
  // run-on into the fog, and the side paths.
  const density = ROAD_DENSITY[tier];
  const lastAlong = layout.along.length > 0 ? layout.along[layout.along.length - 1] : 0;
  // Split by distance along the road, round the bend where the roads meet (W4).
  const between = roadBetween(layout, 0, lastAlong);
  const runOn = roadBetween(layout, lastAlong, roadLength(layout));
  const scatter = {
    trunk: scatterCount(density, ROAD_PATHS.trunk, 4),
    business: scatterCount(density, ROAD_PATHS.business, 3.2),
    family: scatterCount(density, ROAD_PATHS.family, 3.2),
    between: scatterCount(density * BETWEEN_SHARE[tier], between, ROAD_HALF * 2),
    runOn: scatterCount(density / 8, runOn, ROAD_HALF * 2),
    other: other.length > 1 ? scatterCount(density / 8, other, ROAD_HALF * 2) : 0,
    spurs: spurs.map((spur) => Math.max(1, scatterCount(density * BETWEEN_SHARE[tier], spur.path, SPUR_HALF * 2))),
  };
  const scattered = scatter.trunk + scatter.business + scatter.family + scatter.between + scatter.runOn + scatter.other + scatter.spurs.reduce((sum, n) => sum + n, 0);
  const budget = road.budget ?? budgetFor(tier);
  let remainder = budget - fixed - scattered;
  const floor = SCREEN_FLOOR[tier];
  if (screens.length > 0 && remainder < floor * screens.length) {
    // The budget, not the density, is the limit: the scatter gives way so every screen keeps its floor.
    const keep = Math.max(0, budget - fixed - floor * screens.length) / scattered;
    for (const key of /** @type {const} */ (['trunk', 'business', 'family', 'between', 'runOn', 'other'])) scatter[key] = Math.floor(scatter[key] * keep);
    scatter.spurs = scatter.spurs.map((n) => Math.max(1, Math.floor(n * keep)));
    remainder = floor * screens.length;
  }
  if (remainder <= 0) throw new Error(`The ${tier} budget leaves no glyphs for the road.`);
  const perScreen = screens.length > 0 ? Math.floor(remainder / screens.length) : 0;

  return [
    { name: 'editor', shape: editor },
    { name: 'trunk-road', shape: codeRoad(sources.road, { path: ROAD_PATHS.trunk, width: 4, count: scatter.trunk }, seed + 2) },
    { name: 'trunk-edges', shape: edges.trunk },
    { name: 'business-edges', shape: edges.business },
    { name: 'family-edges', shape: edges.family },
    { name: 'business-road', shape: codeRoad(sources.road, { path: ROAD_PATHS.business, width: 3.2, count: scatter.business }, seed + 3) },
    { name: 'family-road', shape: codeRoad(sources.road, { path: ROAD_PATHS.family, width: 3.2, count: scatter.family }, seed + 4) },
    { name: 'onward-road', shape: codeRoad(sources.road, { path: between, width: ROAD_HALF * 2, count: scatter.between }, seed + 11) },
    { name: 'run-on-road', shape: codeRoad(sources.road, { path: runOn, width: ROAD_HALF * 2, count: scatter.runOn }, seed + 12) },
    ...(otherEdges
      ? [
          { name: 'other-road', shape: codeRoad(sources.road, { path: other, width: ROAD_HALF * 2, count: scatter.other }, seed + 14) },
          { name: 'other-edges', shape: otherEdges },
        ]
      : []),
    { name: 'onward-edges', shape: onwardEdges },
    ...spurs.flatMap((spur, n) => [
      { name: `spur-road:${spur.stopId}`, shape: codeRoad(sources.road, { path: spur.path, width: SPUR_HALF * 2, count: scatter.spurs[n] }, seed + 50 + n) },
      { name: `spur-edges:${spur.stopId}`, shape: spurEdges[n] },
    ]),
    ...layout.landmarks.map((landmark, n) => ({ name: `stand:${landmark.stopId}`, shape: stands[n] })),
    { name: 'signs', shape: signs },
    ...gateways,
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
