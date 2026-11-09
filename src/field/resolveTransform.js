// @ts-check
import { codeLayout, textLayout } from './layouts.js';
import { createTransformation } from './transformation.js';
import { CODE_CHAR_WIDTH, CODE_FONT_SIZE, CODE_LINE_HEIGHT, EDITOR_PADDING } from './editorMetrics.js';

/** @typedef {import('./types.js').TransformSpec} TransformSpec */
/** @typedef {import('./transformation.js').Transformation} Transformation */

/** Landed characters are drawn a little larger than their spacing so the shape reads as solid. */
const LANDED_SIZE = 1.15;
/** Landing places per code character the sampling aims for, so every original character lands. */
const DENSITY = 2;
/** Finest landing spacing in CSS pixels. */
const MIN_STEP = 3;

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
 * Turns a scene's request into GPU-ready buffers: the code laid out as an editor in its box, and
 * landing places sampled from the text drawn in the target box. `spec.step` is the coarsest spacing;
 * sparse text is sampled more finely until there are twice as many places as code characters.
 *
 * @param {TransformSpec} spec
 * @param {{ atlas: { indexOf: (char: string) => number }, budget: number, createCanvas?: (width: number, height: number) => HTMLCanvasElement }} opts
 * @returns {{ transformation: Transformation, sizes: { from: number, to: number } }}
 */
export function resolveTransform(spec, { atlas, budget, createCanvas = defaultCanvas }) {
  const source = codeLayout(spec.code, spec.sourceBox, {
    charWidth: CODE_CHAR_WIDTH,
    lineHeight: CODE_LINE_HEIGHT,
    padding: EDITOR_PADDING,
  });

  const width = Math.max(1, Math.round(spec.targetBox.w));
  const height = Math.max(1, Math.round(spec.targetBox.h));
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not create a 2D canvas for the landing text.');
  ctx.clearRect(0, 0, width, height);
  ctx.font = spec.font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  const lines = spec.text.split('\n');
  lines.forEach((line, i) => ctx.fillText(line, width / 2, ((i + 0.5) * height) / lines.length));

  const rgba = ctx.getImageData(0, 0, width, height).data;
  const alpha = new Uint8ClampedArray(width * height);
  for (let i = 0; i < alpha.length; i += 1) alpha[i] = rgba[i * 4 + 3];
  let step = spec.step;
  let targets = textLayout({ alpha, width, height }, spec.targetBox, step, spec.color);
  while (targets.length < source.length * DENSITY && step > MIN_STEP) {
    step -= 1;
    targets = textLayout({ alpha, width, height }, spec.targetBox, step, spec.color);
  }

  return {
    transformation: createTransformation({ source, targets, budget, seed: 7, indexOf: atlas.indexOf }),
    sizes: { from: CODE_FONT_SIZE, to: step * LANDED_SIZE },
  };
}
