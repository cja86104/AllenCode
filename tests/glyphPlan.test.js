// @ts-check
import { describe, expect, it } from 'vitest';
import { glyphPlan } from '../src/scenes/layers/glyphPlan.js';

const SHORT = 'const a = 1;\n  b(a);\n}';
const LONG = Array.from({ length: 30 }, (_, i) => `  line_${i}: value_${i} + other_${i},`).join('\n');

describe('the characters in flight (Living Source Phase 4)', () => {
  it('takes the code’s own characters, spaces left out, in order', () => {
    const plan = glyphPlan(SHORT, { max: 200, aspect: 16 / 10 });
    expect(plan.map((g) => g.ch).join('')).toBe(SHORT.replace(/\s/g, ''));
  });

  it('starts each at its column and line, as shares of the plane', () => {
    const plan = glyphPlan(SHORT, { max: 200, aspect: 16 / 10 });
    const widest = 'const a = 1;'.length;
    expect(plan[0]).toMatchObject({ x0: 0, y0: 0 });
    const b = plan.find((g) => g.ch === 'b');
    expect(b?.x0).toBeCloseTo(2 / widest);
    expect(b?.y0).toBeCloseTo(1 / 3);
  });

  it('keeps to max on a long excerpt, first and last characters kept', () => {
    const plan = glyphPlan(LONG, { max: 80, aspect: 16 / 10 });
    const chars = LONG.replace(/\s/g, '');
    expect(plan.length).toBeLessThanOrEqual(80);
    expect(plan[0].ch).toBe(chars[0]);
    expect(plan[plan.length - 1].ch).toBe(chars[chars.length - 1]);
  });

  it('stays inside the plane, staggers by line, and is the same every time', () => {
    const plan = glyphPlan(LONG, { max: 220, aspect: 16 / 10 });
    for (const g of plan) {
      for (const v of [g.x0, g.y0, g.x1, g.y1]) {
        expect(v).toBeGreaterThanOrEqual(0);
        expect(v).toBeLessThanOrEqual(1);
      }
      expect(g.d).toBeGreaterThanOrEqual(0);
      expect(g.d).toBeLessThanOrEqual(0.4);
    }
    expect(plan[0].d).toBe(0);
    expect(glyphPlan(LONG, { max: 220, aspect: 16 / 10 })).toEqual(plan);
  });
});
