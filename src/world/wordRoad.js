// @ts-check
import { COLOURED_SHARE, emptyShape, inkOf, PALE, put, ROAD_COLORS, seeded } from './shapes.js';

/**
 * An inner page's road spelling its page (Chris, 2026-11-17: "the moving text in the road using
 * multiple small to make bigger letters and i want it to spell out what it is … running forward"):
 * big dot-matrix letters lying on the road, each lit dot a cluster of the road's own characters, the
 * first letter farthest so the word reads top to bottom on the screen, all moving forward together.
 */

/** @typedef {import('./shapes.js').Shape} Shape */

/** The letters' grid: columns across the road, rows along it. */
export const LETTER_COLS = 5;
export const LETTER_ROWS = 7;
/** Each lit dot is a WORD_SUB by WORD_SUB cluster of characters (4: at 3 the strokes broke up). */
export const WORD_SUB = 4;

/**
 * A classic 5 by 7 dot-matrix alphabet: for each letter of `FONT_LETTERS`, seven rows top first, each
 * one character of base 32 whose five bits are the row's dots, left to right (`letterRows` reads it).
 */
const FONT_LETTERS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ ';
const FONT = 'ehhvhhhuhhuhhuehgggheuhhhhhuvgguggvvggugggehgnhhfhhhvhhhe44444e72222ichikokihggggggvhrllhhhhhpljhhehhhhheuhhugggehhhliduhhukihfgge11uv444444hhhhhhehhhhha4hhhlllahha4ahhhha4444v1248gv0000000';

/**
 * A letter's rows, top first: `#` lit, `.` dark.
 * @param {string} char One capital letter, or a space.
 * @returns {ReadonlyArray<string>}
 */
export function letterRows(char) {
  const at = FONT_LETTERS.indexOf(char);
  if (at < 0 || char.length !== 1) throw new Error(`No letter for "${char}" on the road.`);
  return [...FONT.slice(at * LETTER_ROWS, (at + 1) * LETTER_ROWS)].map((digit) => parseInt(digit, 32).toString(2).padStart(LETTER_COLS, '0').replace(/1/g, '#').replace(/0/g, '.'));
}
/** A letter's length along the road, its width across it, and the gap after it, before any shrinking (world units; stretched along the road, like a painted road marking, to read from eye height). */
const LETTER = Object.freeze({ length: 3.2, width: 2.6, gap: 0.9 });

/**
 * Where each letter of `word` lies in the region: the first letter at the far end, the rest after it
 * toward the near end, all one size; shrunk together if the word is too long for the region.
 * @param {string} word
 * @param {{ near: number, far: number, width: number }} region Along -z: from `near` to `far` (`far` < `near`), and the road's width.
 * @returns {Array<{ char: string, far: number, near: number, width: number }>}
 */
export function wordLayout(word, { near, far, width }) {
  const chars = [...word];
  const room = near - far;
  const natural = chars.length * LETTER.length + (chars.length - 1) * LETTER.gap;
  const scale = Math.min(1, room / natural, (width - 0.6) / LETTER.width);
  const length = LETTER.length * scale;
  const gap = LETTER.gap * scale;
  return chars.map((char, i) => {
    const from = far + i * (length + gap);
    return { char, far: from, near: from + length, width: LETTER.width * scale };
  });
}

/**
 * The word as road: each lit dot of each letter a `WORD_SUB` by `WORD_SUB` cluster of the road's
 * characters, about a third in the road's colours, all on one belt (a negative loop in the stream:
 * the renderer moves them together, forward down the road, wrapping at the region's ends, where its
 * distance along the road is a whole number of loops, so `near` is 0).
 * @param {string} word
 * @param {{ near: number, far: number, width: number }} region
 * @param {string} code The road's code: the characters it is made of.
 * @param {number} seed
 * @returns {Shape & { stream: Float32Array }}
 */
export function wordRoad(word, region, code, seed) {
  const boxes = wordLayout(word, region);
  const ink = inkOf(code);
  const random = seeded(seed);
  /** @type {Array<[number, number]>} */
  const dots = [];
  for (const box of boxes) {
    const rows = letterRows(box.char);
    const across = box.width / LETTER_COLS;
    const along = (box.near - box.far) / LETTER_ROWS;
    rows.forEach((row, r) => {
      [...row].forEach((cell, c) => {
        if (cell !== '#') return;
        for (let i = 0; i < WORD_SUB; i += 1) {
          for (let j = 0; j < WORD_SUB; j += 1) {
            dots.push([-box.width / 2 + (c + (i + 0.5) / WORD_SUB) * across, box.far + (r + (j + 0.5) / WORD_SUB) * along]);
          }
        }
      });
    });
  }
  const size = Math.min(boxes[0]?.width ?? 1, 1) * 0.085;
  const shape = emptyShape(dots.length, size);
  const stream = new Float32Array(dots.length * 4);
  const loop = region.near - region.far;
  dots.forEach(([x, z], i) => {
    const pick = random();
    const colour = pick < COLOURED_SHARE ? ROAD_COLORS[Math.min(ROAD_COLORS.length - 1, Math.floor((pick / COLOURED_SHARE) * ROAD_COLORS.length))] : null;
    put(shape, i, x, 0.02, z, ink[i % ink.length], colour ?? PALE, colour ? 0.95 : 0.85);
    stream.set([0, 0, -1, -loop], i * 4);
  });
  return { ...shape, stream };
}
