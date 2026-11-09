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
