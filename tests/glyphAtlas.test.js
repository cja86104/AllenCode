// @ts-check
import { afterEach, describe, expect, it, vi } from 'vitest';
import { collectGlyphs, createGlyphAtlas, loadAtlasFont } from '../src/field/glyphAtlas.js';

/** A canvas stand-in that records what is drawn (jsdom has no 2D canvas). */
function fakeCanvasFactory() {
  /** @type {{ char: string, x: number, y: number }[]} */
  const calls = [];
  const ctx = {
    font: '',
    textAlign: '',
    textBaseline: '',
    fillStyle: '',
    clearRect() {},
    /** @param {string} char @param {number} x @param {number} y */
    fillText(char, x, y) {
      calls.push({ char, x, y });
    },
  };
  /** @param {number} width @param {number} height */
  const createCanvas = (width, height) =>
    /** @type {HTMLCanvasElement} */ (/** @type {unknown} */ ({ width, height, getContext: () => ctx }));
  return { calls, ctx, createCanvas };
}

describe('collectGlyphs', () => {
  it('collectGlyphs drops whitespace and duplicates', () => {
    expect(collectGlyphs(['const a = 1;\n', '\tconst b'])).toEqual(['c', 'o', 'n', 's', 't', 'a', '=', '1', ';', 'b']);
  });
});

describe('createGlyphAtlas', () => {
  const chars = 'abcdefghijklmnopqrstu'.split('');

  it('atlas has 16 columns and enough rows', () => {
    const { createCanvas } = fakeCanvasFactory();
    const atlas = createGlyphAtlas(chars, { cell: 32, font: '20px "JetBrains Mono"', createCanvas });
    expect(atlas.columns).toBe(16);
    expect(atlas.rows).toBe(2);
    expect(atlas.canvas.width).toBe(16 * 32);
    expect(atlas.canvas.height).toBe(2 * 32);
  });

  it('indexOf maps each character to its draw position and returns -1 for unknown characters', () => {
    const { createCanvas } = fakeCanvasFactory();
    const atlas = createGlyphAtlas(chars, { cell: 32, font: '20px "JetBrains Mono"', createCanvas });
    expect(atlas.indexOf('a')).toBe(0);
    expect(atlas.indexOf('q')).toBe(16);
    expect(atlas.indexOf('Z')).toBe(-1);
  });

  it('each character is drawn centered in its cell with the given font', () => {
    const { calls, ctx, createCanvas } = fakeCanvasFactory();
    createGlyphAtlas(chars, { cell: 32, font: '20px "JetBrains Mono"', createCanvas });
    expect(ctx.font).toBe('20px "JetBrains Mono"');
    expect(calls[0]).toEqual({ char: 'a', x: 16, y: 16 });
    expect(calls[16]).toEqual({ char: 'q', x: 16, y: 48 });
    expect(calls).toHaveLength(chars.length);
  });
});

describe('loadAtlasFont', () => {
  afterEach(() => {
    vi.useRealTimers();
    vi.unstubAllGlobals();
  });

  it('resolves true once the font face loads', async () => {
    vi.stubGlobal('document', { fonts: { load: () => Promise.resolve([{}]) } });
    await expect(loadAtlasFont('JetBrains Mono')).resolves.toBe(true);
  });

  it('loadAtlasFont resolves false when the font never loads', async () => {
    vi.useFakeTimers();
    vi.stubGlobal('document', { fonts: { load: () => new Promise(() => {}) } });
    const result = loadAtlasFont('JetBrains Mono');
    await vi.advanceTimersByTimeAsync(3000);
    await expect(result).resolves.toBe(false);
  });

  it('resolves false when loading fails', async () => {
    vi.stubGlobal('document', { fonts: { load: () => Promise.reject(new Error('blocked')) } });
    await expect(loadAtlasFont('JetBrains Mono')).resolves.toBe(false);
  });
});
