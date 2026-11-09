// @ts-check

/** @typedef {import('./types.js').GlyphPoint} GlyphPoint */
/** @typedef {import('./types.js').TargetPoint} TargetPoint */

/**
 * GPU-ready buffers for one source-to-screen transformation. Index i describes particle i.
 *
 * @typedef {object} Transformation
 * @property {number} count
 * @property {Float32Array} start x, y where the character starts (in the editor).
 * @property {Float32Array} end x, y where it lands.
 * @property {Float32Array} glyph Atlas index of the character.
 * @property {Float32Array} original 1 for a character shown in the file, 0 for a copy that emerges as it lifts.
 * @property {Float32Array} seed 0..1 per-particle variation.
 * @property {Float32Array} row 0..1 vertical position in the file, used to stagger the lift top line first.
 * @property {Float32Array} srcColor r, g, b in the editor.
 * @property {Float32Array} dstColor r, g, b where it lands.
 */

/** Spread of copies around the character they duplicate, in CSS pixels. */
const COPY_JITTER = 6;

/**
 * Deterministic pseudo-random numbers (Park-Miller), so a page always animates the same way.
 * @param {number} seed
 * @returns {() => number}
 */
function random(seed) {
  let state = Math.max(1, Math.floor(seed) % 2147483647);
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

/**
 * Keeps at most `budget` targets, evenly spaced, in their original (row-major) order.
 * @param {TargetPoint[]} targets
 * @param {number} budget
 * @returns {TargetPoint[]}
 */
function downsample(targets, budget) {
  if (targets.length <= budget) return targets;
  return Array.from({ length: budget }, (_, i) => targets[Math.floor((i * targets.length) / budget)]);
}

/**
 * Pairs a code layout with a target layout, following the approved prototype: the file's own
 * characters take evenly spaced targets in reading order, and every other particle is a copy of a
 * real character from the file, starting on that character. Characters missing from the atlas are
 * dropped.
 *
 * @param {{ source: GlyphPoint[], targets: TargetPoint[], budget: number, seed: number, indexOf: (char: string) => number }} opts
 * @returns {Transformation}
 */
export function createTransformation({ source, targets, budget, seed, indexOf }) {
  const chars = source.filter((point) => indexOf(point.char) >= 0);
  const landing = chars.length === 0 ? [] : downsample(targets, Math.max(0, Math.floor(budget)));
  const count = landing.length;

  const t = {
    count,
    start: new Float32Array(count * 2),
    end: new Float32Array(count * 2),
    glyph: new Float32Array(count),
    original: new Float32Array(count),
    seed: new Float32Array(count),
    row: new Float32Array(count),
    srcColor: new Float32Array(count * 3),
    dstColor: new Float32Array(count * 3),
  };
  if (count === 0) return t;

  const rnd = random(seed);
  const originals = Math.min(chars.length, count);
  const originalTargets = Array.from({ length: originals }, (_, i) => Math.floor((i * count) / originals));
  const taken = new Set(originalTargets);
  const rest = landing.map((_, i) => i).filter((i) => !taken.has(i));
  for (let i = rest.length - 1; i > 0; i -= 1) {
    const j = Math.floor(rnd() * (i + 1));
    [rest[i], rest[j]] = [rest[j], rest[i]];
  }

  const top = Math.min(...chars.map((p) => p.y));
  const span = Math.max(...chars.map((p) => p.y)) - top || 1;

  for (let i = 0; i < count; i += 1) {
    const isOriginal = i < originals;
    const from = chars[i % chars.length];
    const to = landing[isOriginal ? originalTargets[i] : rest[i - originals]];
    const jitterX = isOriginal ? 0 : (rnd() - 0.5) * COPY_JITTER;
    const jitterY = isOriginal ? 0 : (rnd() - 0.5) * COPY_JITTER;

    t.start.set([from.x + jitterX, from.y + jitterY], i * 2);
    t.end.set([to.x, to.y], i * 2);
    t.glyph[i] = indexOf(from.char);
    t.original[i] = isOriginal ? 1 : 0;
    t.seed[i] = rnd();
    t.row[i] = (from.y - top) / span;
    t.srcColor.set(from.color, i * 3);
    t.dstColor.set(to.color, i * 3);
  }
  return t;
}
