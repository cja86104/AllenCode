// @ts-check

/**
 * @typedef {object} Atlas
 * @property {HTMLCanvasElement} canvas One cell per character, white on transparent.
 * @property {number} columns
 * @property {number} rows
 * @property {number} cell Cell size in pixels.
 * @property {(char: string) => number} indexOf Draw position of a character, or -1 if it is not in the atlas.
 */

const COLUMNS = 16;
const FONT_TIMEOUT_MS = 3000;

/**
 * Unique non-whitespace characters across the given texts, in first-seen order.
 * @param {string[]} texts
 * @returns {string[]}
 */
export function collectGlyphs(texts) {
  /** @type {Set<string>} */
  const seen = new Set();
  for (const text of texts) {
    for (const char of text) {
      if (char.trim() !== '') seen.add(char);
    }
  }
  return [...seen];
}

/**
 * @param {number} width
 * @param {number} height
 * @returns {HTMLCanvasElement}
 */
function defaultCanvas(width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  return canvas;
}

/**
 * Draws every character into one texture, 16 per row, each centered in its cell.
 *
 * @param {string[]} chars
 * @param {{ cell: number, font: string, createCanvas?: (width: number, height: number) => HTMLCanvasElement }} opts
 * @returns {Atlas}
 */
export function createGlyphAtlas(chars, { cell, font, createCanvas = defaultCanvas }) {
  const rows = Math.max(1, Math.ceil(chars.length / COLUMNS));
  const canvas = createCanvas(COLUMNS * cell, rows * cell);
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Could not create a 2D canvas for the glyph atlas.');

  ctx.clearRect(0, 0, canvas.width, canvas.height);
  ctx.font = font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';

  /** @type {Map<string, number>} */
  const positions = new Map();
  chars.forEach((char, index) => {
    positions.set(char, index);
    ctx.fillText(char, ((index % COLUMNS) + 0.5) * cell, (Math.floor(index / COLUMNS) + 0.5) * cell);
  });

  return {
    canvas,
    columns: COLUMNS,
    rows,
    cell,
    indexOf: (char) => positions.get(char) ?? -1,
  };
}

/**
 * Waits for a web font so the atlas is never drawn in a fallback face. Resolves false (never
 * rejects) when the font fails or takes longer than 3 seconds.
 *
 * @param {string} family
 * @returns {Promise<boolean>}
 */
export function loadAtlasFont(family) {
  if (typeof document === 'undefined' || !document.fonts) return Promise.resolve(false);
  /** @type {Promise<boolean>} */
  const timeout = new Promise((resolve) => {
    setTimeout(() => resolve(false), FONT_TIMEOUT_MS);
  });
  const load = document.fonts
    .load(`16px "${family}"`)
    .then((faces) => faces.length > 0)
    .catch(() => false);
  return Promise.race([load, timeout]);
}

/** Atlas cell size and the font size drawn in it; the renderer scales points by their ratio. */
export const ATLAS_CELL = 48;
export const ATLAS_FONT_SIZE = 32;
export const ATLAS_FONT_FAMILY = 'JetBrains Mono';
export const ATLAS_FONT = `500 ${ATLAS_FONT_SIZE}px "${ATLAS_FONT_FAMILY}"`;
