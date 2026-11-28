// @ts-check

/**
 * One character in flight: the character, where it starts (its place in the code) and where it lands (a
 * point over the screen), as shares of the plane, and its delay (0 to 0.4) by line.
 * @typedef {{ ch: string, x0: number, y0: number, x1: number, y1: number, d: number }} Glyph
 */

/** A small seeded generator (Park–Miller), so the same excerpt always flies the same way. @param {number} seed */
function seeded(seed) {
  let s = seed % 2147483647 || 1;
  return () => {
    s = (s * 16807) % 2147483647;
    return s / 2147483647;
  };
}

/** @param {number} x */
const clamp01 = (x) => Math.min(1, Math.max(0, x));

/**
 * The excerpt's own characters for the middle plane of C's stack (Living Source Phase 4; Chris, 2026-11-28:
 * "Characters travel in the stack"): every non-space character starts at its column and line, scaled so the
 * widest line and every line fit the plane, and lands on a jittered grid over the screen's aspect. At most
 * `max`, spread evenly through the code, the first and the last always kept.
 * @param {string} code
 * @param {{ max: number, aspect: number }} opts
 * @returns {Glyph[]}
 */
export function glyphPlan(code, { max, aspect }) {
  const lines = code.split('\n');
  const widest = Math.max(1, ...lines.map((line) => line.length));
  /** @type {Array<{ ch: string, line: number, col: number }>} */
  const all = [];
  lines.forEach((line, row) => {
    [...line].forEach((ch, col) => {
      if (!/\s/.test(ch)) all.push({ ch, line: row, col });
    });
  });
  const count = Math.min(max, all.length);
  const chosen =
    all.length <= max ? all : Array.from({ length: count }, (_, k) => all[Math.round((k * (all.length - 1)) / Math.max(1, count - 1))]);
  const cols = Math.max(1, Math.ceil(Math.sqrt(count * aspect)));
  const rows = Math.max(1, Math.ceil(count / cols));
  const rnd = seeded(count * 31 + lines.length);
  return chosen.map(({ ch, line, col }, k) => ({
    ch,
    x0: col / widest,
    y0: line / lines.length,
    x1: clamp01(((k % cols) + 0.5 + (rnd() - 0.5) * 0.6) / cols),
    y1: clamp01((Math.floor(k / cols) + 0.5 + (rnd() - 0.5) * 0.6) / rows),
    d: lines.length > 1 ? (0.4 * line) / (lines.length - 1) : 0,
  }));
}
