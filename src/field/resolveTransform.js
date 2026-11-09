// @ts-check
import { codeLayout, imageLayout, textLayout } from './layouts.js';
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
 * @param {number} width
 * @param {number} height
 * @param {TransformSpec['target'] & { kind: 'text' }} target
 * @param {(width: number, height: number) => HTMLCanvasElement} createCanvas
 * @returns {{ alpha: Uint8ClampedArray, width: number, height: number }}
 */
function textMask(width, height, target, createCanvas) {
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext('2d', { willReadFrequently: true });
  if (!ctx) throw new Error('Could not create a 2D canvas for the landing text.');
  ctx.clearRect(0, 0, width, height);
  ctx.font = target.font;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffffff';
  const lines = target.text.split('\n');
  lines.forEach((line, i) => ctx.fillText(line, width / 2, ((i + 0.5) * height) / lines.length));
  const rgba = ctx.getImageData(0, 0, width, height).data;
  const alpha = new Uint8ClampedArray(width * height);
  for (let i = 0; i < alpha.length; i += 1) alpha[i] = rgba[i * 4 + 3];
  return { alpha, width, height };
}

/**
 * Turns a scene's request into GPU-ready buffers: the code laid out as an editor in its box, and
 * landing places on the target (text drawn in the target box, or the image's pixels). `spec.step`
 * is the coarsest spacing; a sparse target is sampled more finely until there are twice as many
 * places as code characters. Image targets need their pixels in `opts.image` (FieldStage loads them).
 *
 * @param {TransformSpec} spec
 * @param {{ atlas: { indexOf: (char: string) => number }, budget: number, image?: { data: Uint8ClampedArray, width: number, height: number }, createCanvas?: (width: number, height: number) => HTMLCanvasElement }} opts
 * @returns {{ transformation: Transformation, sizes: { from: number, to: number } }}
 */
export function resolveTransform(spec, { atlas, budget, image, createCanvas = defaultCanvas }) {
  const scale = spec.codeScale ?? 1;
  const source = codeLayout(spec.code, spec.sourceBox, {
    charWidth: CODE_CHAR_WIDTH * scale,
    lineHeight: CODE_LINE_HEIGHT * scale,
    padding: EDITOR_PADDING * scale,
  });

  /** @type {(step: number) => import('./types.js').TargetPoint[]} */
  let sample;
  const target = spec.target;
  if (target.kind === 'image') {
    if (!image) throw new Error(`resolveTransform needs the image pixels for ${target.src}.`);
    sample = (step) => imageLayout(image, spec.targetBox, step);
  } else {
    const width = Math.max(1, Math.round(spec.targetBox.w));
    const height = Math.max(1, Math.round(spec.targetBox.h));
    const mask = textMask(width, height, target, createCanvas);
    sample = (step) => textLayout(mask, spec.targetBox, step, target.color);
  }

  let step = spec.step;
  let targets = sample(step);
  while (targets.length < source.length * DENSITY && step > MIN_STEP) {
    step -= 1;
    targets = sample(step);
  }

  return {
    transformation: createTransformation({ source, targets, budget, seed: 7, indexOf: atlas.indexOf }),
    sizes: { from: CODE_FONT_SIZE * scale, to: step * LANDED_SIZE },
  };
}
