// @ts-check
import { SYNTAX_COLORS, tokenizeLine } from './syntax.js';

/** @typedef {import('./types.js').Box} Box */
/** @typedef {import('./types.js').GlyphPoint} GlyphPoint */
/** @typedef {import('./types.js').TargetPoint} TargetPoint */

/**
 * Lays code out as an editor: one point per non-whitespace character, colored by syntax.
 *
 * @param {string} code
 * @param {Box} box
 * @param {{ charWidth: number, lineHeight: number, padding: number }} metrics
 * @returns {GlyphPoint[]}
 */
export function codeLayout(code, box, { charWidth, lineHeight, padding }) {
  /** @type {GlyphPoint[]} */
  const points = [];
  code.split('\n').forEach((line, row) => {
    let col = 0;
    for (const token of tokenizeLine(line)) {
      for (const char of token.text) {
        if (char.trim() !== '') {
          points.push({
            x: box.x + padding + (col + 0.5) * charWidth,
            y: box.y + padding + (row + 0.5) * lineHeight,
            char,
            color: SYNTAX_COLORS[token.kind],
          });
        }
        col += 1;
      }
    }
  });
  return points;
}

/**
 * How far every sampled image color is lifted toward white. Product screens are mostly dark UI on a
 * dark page; without a floor their characters land near-black and the screen never visibly forms
 * before the real image takes over. Brighter parts stay brighter, so the screen's layout still reads.
 */
export const IMAGE_COLOR_FLOOR = 0.3;

/**
 * @param {number} byte 0..255
 * @returns {number} 0..1, lifted to at least IMAGE_COLOR_FLOOR
 */
function lift(byte) {
  return IMAGE_COLOR_FLOOR + (1 - IMAGE_COLOR_FLOOR) * (byte / 255);
}

/**
 * Samples an image on a grid inside the box, row by row, with colors lifted to IMAGE_COLOR_FLOOR.
 *
 * @param {{ data: Uint8ClampedArray, width: number, height: number }} image RGBA pixels.
 * @param {Box} box
 * @param {number} step Grid spacing in CSS pixels.
 * @returns {TargetPoint[]}
 */
export function imageLayout(image, box, step) {
  const cols = Math.floor(box.w / step);
  const rows = Math.floor(box.h / step);
  /** @type {TargetPoint[]} */
  const points = [];
  for (let r = 0; r < rows; r += 1) {
    for (let c = 0; c < cols; c += 1) {
      const ix = Math.min(image.width - 1, Math.floor(((c + 0.5) / cols) * image.width));
      const iy = Math.min(image.height - 1, Math.floor(((r + 0.5) / rows) * image.height));
      const o = (iy * image.width + ix) * 4;
      points.push({
        x: box.x + (c + 0.5) * step,
        y: box.y + (r + 0.5) * step,
        color: [lift(image.data[o]), lift(image.data[o + 1]), lift(image.data[o + 2])],
      });
    }
  }
  return points;
}

/**
 * Normalized (0..1) x, y pairs for every sampled pixel whose alpha is above 128.
 *
 * @param {Uint8ClampedArray} alpha One byte per pixel.
 * @param {number} width
 * @param {number} height
 * @param {number} step
 * @returns {Float32Array}
 */
export function pointsFromAlpha(alpha, width, height, step) {
  /** @type {number[]} */
  const out = [];
  for (let y = 0; y < height; y += step) {
    for (let x = 0; x < width; x += step) {
      if (alpha[y * width + x] > 128) out.push((x + step / 2) / width, (y + step / 2) / height);
    }
  }
  return new Float32Array(out);
}

/**
 * Landing places for a line of display text, from its rendered alpha mask, mapped into the box.
 *
 * @param {{ alpha: Uint8ClampedArray, width: number, height: number }} mask
 * @param {Box} box
 * @param {number} step
 * @param {[number, number, number]} color
 * @returns {TargetPoint[]}
 */
export function textLayout(mask, box, step, color) {
  const normalized = pointsFromAlpha(mask.alpha, mask.width, mask.height, step);
  /** @type {TargetPoint[]} */
  const points = [];
  for (let i = 0; i < normalized.length; i += 2) {
    points.push({ x: box.x + normalized[i] * box.w, y: box.y + normalized[i + 1] * box.h, color });
  }
  return points;
}

/** @typedef {import('../scenes/sketchBlocks.js').SketchBlock} SketchBlock */
/** @typedef {import('../scenes/sketchBlocks.js').BlockKind} BlockKind */
/** @typedef {'line' | 'fill' | 'accent'} SketchTone */
/** @typedef {{ x: number, y: number, w: number, h: number, tone: SketchTone }} SketchShape */

/** Landed colors per tone: outlines warm grey, text bars light, buttons and the logo orange. */
/** @type {Readonly<Record<SketchTone, [number, number, number]>>} */
export const SKETCH_COLORS = Object.freeze({
  line: [0.55, 0.54, 0.52],
  fill: [0.82, 0.81, 0.78],
  accent: [0.976, 0.451, 0.086],
});

/** Relative height of each block in the sketch. */
/** @type {Readonly<Record<BlockKind, number>>} */
const BLOCK_WEIGHTS = Object.freeze({
  header: 0.6,
  hero: 2.2,
  calendar: 1.6,
  grid: 1.6,
  gallery: 1.6,
  list: 1.6,
  posts: 1.6,
  cta: 1.2,
});

/**
 * The shapes of one block, as fractions of its box: [x, y, w, h, tone].
 * @param {BlockKind} kind
 * @returns {Array<[number, number, number, number, SketchTone]>}
 */
function blockParts(kind) {
  switch (kind) {
    case 'header':
      return [
        [0, 0, 1, 1, 'line'],
        [0.03, 0.3, 0.06, 0.4, 'accent'],
        [0.6, 0.42, 0.08, 0.16, 'fill'],
        [0.71, 0.42, 0.08, 0.16, 'fill'],
        [0.82, 0.42, 0.08, 0.16, 'fill'],
      ];
    case 'hero':
      return [
        [0.06, 0.16, 0.56, 0.14, 'fill'],
        [0.06, 0.36, 0.42, 0.14, 'fill'],
        [0.06, 0.58, 0.48, 0.06, 'fill'],
        [0.06, 0.74, 0.18, 0.14, 'accent'],
        [0.7, 0.12, 0.24, 0.76, 'line'],
      ];
    case 'calendar': {
      /** @type {Array<[number, number, number, number, SketchTone]>} */
      const parts = [[0, 0, 1, 1, 'line'], [0.04, 0.08, 0.3, 0.12, 'fill']];
      for (let row = 0; row < 3; row += 1) {
        for (let col = 0; col < 7; col += 1) {
          parts.push([0.04 + col * 0.134, 0.3 + row * 0.22, 0.11, 0.16, row === 1 && col === 3 ? 'accent' : 'line']);
        }
      }
      return parts;
    }
    case 'grid': {
      /** @type {Array<[number, number, number, number, SketchTone]>} */
      const parts = [];
      for (let col = 0; col < 4; col += 1) {
        parts.push([0.02 + col * 0.245, 0.06, 0.225, 0.88, 'line'], [0.04 + col * 0.245, 0.72, 0.15, 0.1, 'fill']);
      }
      return parts;
    }
    case 'gallery': {
      /** @type {Array<[number, number, number, number, SketchTone]>} */
      const parts = [];
      for (let col = 0; col < 4; col += 1) {
        parts.push([0.02 + col * 0.245, 0.06 + (col % 2) * 0.08, 0.225, 0.8, 'fill']);
      }
      return parts;
    }
    case 'list': {
      /** @type {Array<[number, number, number, number, SketchTone]>} */
      const parts = [];
      for (let row = 0; row < 4; row += 1) {
        parts.push([0.04, 0.08 + row * 0.23, 0.5, 0.1, 'fill'], [0.8, 0.08 + row * 0.23, 0.16, 0.1, 'line']);
      }
      return parts;
    }
    case 'posts': {
      /** @type {Array<[number, number, number, number, SketchTone]>} */
      const parts = [];
      for (let col = 0; col < 3; col += 1) {
        const x = 0.02 + col * 0.33;
        parts.push([x, 0.06, 0.3, 0.88, 'line'], [x + 0.03, 0.18, 0.22, 0.12, 'fill'], [x + 0.03, 0.42, 0.24, 0.06, 'fill'], [x + 0.03, 0.56, 0.18, 0.06, 'fill']);
      }
      return parts;
    }
    case 'cta':
      return [
        [0, 0, 1, 1, 'line'],
        [0.3, 0.22, 0.4, 0.18, 'fill'],
        [0.4, 0.55, 0.2, 0.25, 'accent'],
      ];
    default:
      return [];
  }
}

/**
 * Where each block of a sketch sits in the box, stacked top to bottom with even gaps, and the
 * shapes inside it. Proportional to the box, so the DOM sketch and the landing places agree at any size.
 *
 * @param {readonly SketchBlock[]} blocks
 * @param {Box} box
 * @returns {Array<{ block: SketchBlock, box: Box, shapes: SketchShape[] }>}
 */
export function sketchShapes(blocks, box) {
  const pad = Math.min(box.w, box.h) * 0.04;
  const gap = box.h * 0.025;
  const inner = { x: box.x + pad, y: box.y + pad, w: box.w - pad * 2, h: box.h - pad * 2 };
  const total = blocks.reduce((sum, block) => sum + BLOCK_WEIGHTS[block.kind], 0);
  const available = inner.h - gap * Math.max(0, blocks.length - 1);
  let y = inner.y;
  return blocks.map((block) => {
    const h = total > 0 ? (available * BLOCK_WEIGHTS[block.kind]) / total : 0;
    const area = { x: inner.x, y, w: inner.w, h };
    y += h + gap;
    const shapes = blockParts(block.kind).map(([fx, fy, fw, fh, tone]) => ({
      x: area.x + fx * area.w,
      y: area.y + fy * area.h,
      w: fw * area.w,
      h: fh * area.h,
      tone,
    }));
    return { block, box: area, shapes };
  });
}

/**
 * Landing places for a sketch: outlines traced every `step` pixels, filled shapes sampled on a
 * `step` grid, each tinted by its tone.
 *
 * @param {readonly SketchBlock[]} blocks
 * @param {Box} box
 * @param {number} [step]
 * @returns {TargetPoint[]}
 */
export function sketchLayout(blocks, box, step = 6) {
  /** @type {TargetPoint[]} */
  const points = [];
  for (const { shapes } of sketchShapes(blocks, box)) {
    for (const shape of shapes) {
      const color = SKETCH_COLORS[shape.tone];
      if (shape.tone === 'line') {
        const cols = Math.max(1, Math.round(shape.w / step));
        const rows = Math.max(1, Math.round(shape.h / step));
        for (let c = 0; c <= cols; c += 1) {
          const x = shape.x + (c / cols) * shape.w;
          points.push({ x, y: shape.y, color }, { x, y: shape.y + shape.h, color });
        }
        for (let r = 1; r < rows; r += 1) {
          const y = shape.y + (r / rows) * shape.h;
          points.push({ x: shape.x, y, color }, { x: shape.x + shape.w, y, color });
        }
      } else {
        for (let y = shape.y + step / 2; y < shape.y + shape.h; y += step) {
          for (let x = shape.x + step / 2; x < shape.x + shape.w; x += step) points.push({ x, y, color });
        }
      }
    }
  }
  return points;
}
