// @ts-check
import { describe, expect, it } from 'vitest';
import { createTransformation } from '../src/field/transformation.js';
import { codeLayout, imageLayout } from '../src/field/layouts.js';

const CODE = "export const week = await plan({ grade: 'K' });\nreturn week;";
const ATLAS = [...new Set(CODE.replace(/\s/g, ''))];
/** @param {string} char */
const indexOf = (char) => ATLAS.indexOf(char);
const source = codeLayout(CODE, { x: 0, y: 0, w: 600, h: 100 }, { charWidth: 8, lineHeight: 20, padding: 10 });
const image = { data: new Uint8ClampedArray(4 * 4 * 4).fill(200), width: 4, height: 4 };
const targets = imageLayout(image, { x: 100, y: 200, w: 300, h: 200 }, 10);

/** @param {Partial<Parameters<typeof createTransformation>[0]>} [overrides] */
const make = (overrides = {}) => createTransformation({ source, targets, budget: 10_000, seed: 42, indexOf, ...overrides });

describe('createTransformation', () => {
  it('count equals the target count capped at the budget', () => {
    expect(make().count).toBe(targets.length);
    expect(make({ budget: 100 }).count).toBe(100);
  });

  it('every glyph index is a character from the source code', () => {
    const t = make();
    const allowed = new Set(source.map((p) => indexOf(p.char)));
    for (const g of t.glyph) expect(allowed.has(g)).toBe(true);
  });

  it('original characters keep reading order (their target y never decreases)', () => {
    const t = make();
    let previous = -Infinity;
    let originals = 0;
    for (let i = 0; i < t.count; i += 1) {
      if (t.original[i] !== 1) continue;
      originals += 1;
      expect(t.end[i * 2 + 1]).toBeGreaterThanOrEqual(previous);
      previous = t.end[i * 2 + 1];
    }
    expect(originals).toBe(source.length);
  });

  it('original characters start exactly where the code shows them', () => {
    const t = make();
    expect([t.start[0], t.start[1]]).toEqual([source[0].x, source[0].y]);
  });

  it('characters not in the atlas are dropped', () => {
    const t = make({ indexOf: (char) => (char === 'e' ? -1 : indexOf(char)) });
    for (const g of t.glyph) expect(g).not.toBe(indexOf('e'));
  });

  it('the same seed gives identical buffers', () => {
    const a = make();
    const b = make();
    expect(Array.from(a.start)).toEqual(Array.from(b.start));
    expect(Array.from(a.end)).toEqual(Array.from(b.end));
    expect(Array.from(a.seed)).toEqual(Array.from(b.seed));
  });

  it('an empty source or empty targets gives count 0', () => {
    expect(make({ source: [] }).count).toBe(0);
    expect(make({ targets: [] }).count).toBe(0);
  });
});
