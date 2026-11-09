// @ts-check
import { describe, expect, it } from 'vitest';
import { resolveTransform } from '../src/field/resolveTransform.js';
import { IMAGE_COLOR_FLOOR } from '../src/field/layouts.js';
import { CODE_FONT_SIZE, editorSize } from '../src/field/editorMetrics.js';

/** A 2D canvas stand-in whose every pixel is opaque, so every landing place is kept. */
function opaqueCanvas(/** @type {number} */ width, /** @type {number} */ height) {
  const ctx = {
    font: '',
    textAlign: '',
    textBaseline: '',
    fillStyle: '',
    clearRect() {},
    fillText() {},
    getImageData: () => ({ data: new Uint8ClampedArray(width * height * 4).fill(255) }),
  };
  return /** @type {HTMLCanvasElement} */ (/** @type {unknown} */ ({ width, height, getContext: () => ctx }));
}

const code = 'const a = 1;\nexport default a;';
const chars = [...new Set(code.replace(/\s/g, ''))];
const atlas = { indexOf: (/** @type {string} */ c) => chars.indexOf(c) };

/** @type {import('../src/field/types.js').TransformSpec} */
const spec = {
  key: 'k',
  code,
  sourceBox: { x: 0, y: 0, ...editorSize(code) },
  target: { kind: 'text', text: 'Hi', font: '40px serif', color: [1, 1, 1] },
  targetBox: { x: 100, y: 100, w: 200, h: 100 },
  step: 10,
};

describe('resolveTransform', () => {
  it('lays the code out as an editor and lands on the text mask, within the budget', () => {
    const { transformation, sizes } = resolveTransform(spec, { atlas, budget: 150, createCanvas: opaqueCanvas });
    expect(transformation.count).toBe(150);
    expect(sizes).toEqual({ from: CODE_FONT_SIZE, to: 11.5 });
    const xs = [];
    for (let i = 0; i < transformation.count; i += 1) xs.push(transformation.end[i * 2]);
    expect(Math.min(...xs)).toBeGreaterThanOrEqual(100);
    expect(Math.max(...xs)).toBeLessThanOrEqual(300);
  });

  it('every particle is a character from the code', () => {
    const { transformation } = resolveTransform(spec, { atlas, budget: 10_000, createCanvas: opaqueCanvas });
    for (const g of transformation.glyph) expect(g).toBeGreaterThanOrEqual(0);
  });

  it('sparse landing text is sampled more densely so every original character is kept', () => {
    /** A mask where only one pixel in each 4x4 block is opaque, so a coarse step finds few places. */
    function sparseCanvas(/** @type {number} */ width, /** @type {number} */ height) {
      const data = new Uint8ClampedArray(width * height * 4);
      for (let y = 0; y < height; y += 4) for (let x = 0; x < width; x += 4) data[(y * width + x) * 4 + 3] = 255;
      const ctx = { font: '', textAlign: '', textBaseline: '', fillStyle: '', clearRect() {}, fillText() {}, getImageData: () => ({ data }) };
      return /** @type {HTMLCanvasElement} */ (/** @type {unknown} */ ({ width, height, getContext: () => ctx }));
    }
    const longCode = Array.from({ length: 12 }, (_, i) => `const value${i} = compute(${i});`).join('\n');
    const longChars = [...new Set(longCode.replace(/\s/g, ''))];
    const sparseSpec = { ...spec, code: longCode, sourceBox: { x: 0, y: 0, ...editorSize(longCode) }, targetBox: { x: 0, y: 0, w: 160, h: 80 }, step: 16 };
    const { transformation, sizes } = resolveTransform(sparseSpec, {
      atlas: { indexOf: (/** @type {string} */ c) => longChars.indexOf(c) },
      budget: 10_000,
      createCanvas: sparseCanvas,
    });
    const originals = transformation.original.reduce((sum, v) => sum + v, 0);
    expect(originals).toBe(longCode.replace(/\s/g, '').length);
    expect(sizes.to).toBeLessThan(16 * 1.15);
  });

  it('a code scale shrinks the editor layout and the starting character size', () => {
    const full = resolveTransform(spec, { atlas, budget: 10_000, createCanvas: opaqueCanvas }).transformation;
    const half = resolveTransform({ ...spec, codeScale: 0.5 }, { atlas, budget: 10_000, createCanvas: opaqueCanvas });
    expect(half.sizes.from).toBe(CODE_FONT_SIZE * 0.5);
    // The second character of the first line: padding plus 1.5 character widths, all scaled.
    expect(half.transformation.start[2]).toBeCloseTo(full.start[2] * 0.5);
  });

  it('an image target lands on the image, tinted by its pixels', () => {
    const width = 20;
    const height = 10;
    const data = new Uint8ClampedArray(width * height * 4);
    for (let i = 0; i < data.length; i += 4) data.set([255, 0, 0, 255], i);
    /** @type {import('../src/field/types.js').TransformSpec} */
    const imageSpec = { ...spec, target: { kind: 'image', src: '/media/x.jpg', alt: 'x' }, targetBox: { x: 0, y: 0, w: 200, h: 100 } };
    const { transformation } = resolveTransform(imageSpec, { atlas, budget: 10_000, image: { data, width, height } });
    expect(transformation.count).toBeGreaterThanOrEqual(code.replace(/\s/g, '').length * 2);
    const [r, g, b] = Array.from(transformation.dstColor.slice(0, 3));
    expect(r).toBeCloseTo(1);
    expect(g).toBeCloseTo(IMAGE_COLOR_FLOOR);
    expect(b).toBeCloseTo(IMAGE_COLOR_FLOOR);
  });

  it('an image target without its pixels is an error, not a silent empty flight', () => {
    /** @type {import('../src/field/types.js').TransformSpec} */
    const imageSpec = { ...spec, target: { kind: 'image', src: '/media/x.jpg', alt: 'x' } };
    expect(() => resolveTransform(imageSpec, { atlas, budget: 100 })).toThrow('image pixels');
  });
});

