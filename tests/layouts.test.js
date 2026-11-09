// @ts-check
import { describe, expect, it } from 'vitest';
import { IMAGE_COLOR_FLOOR, codeLayout, imageLayout, pointsFromAlpha, textLayout } from '../src/field/layouts.js';
import { SYNTAX_COLORS } from '../src/field/syntax.js';

const box = { x: 100, y: 50, w: 400, h: 300 };
const metrics = { charWidth: 8, lineHeight: 20, padding: 10 };

describe('codeLayout', () => {
  it('codeLayout skips whitespace and places row 2 column 4 exactly', () => {
    const points = codeLayout('ab\n\n    x', box, metrics);
    expect(points.map((p) => p.char)).toEqual(['a', 'b', 'x']);
    const x = points[2];
    expect(x.x).toBe(100 + 10 + 4.5 * 8);
    expect(x.y).toBe(50 + 10 + 2.5 * 20);
  });

  it('codeLayout colors a keyword orange', () => {
    const [first] = codeLayout('const a', box, metrics);
    expect(first.char).toBe('c');
    expect(first.color).toEqual(SYNTAX_COLORS.keyword);
  });
});

describe('imageLayout', () => {
  it('imageLayout returns floor(w/step) by floor(h/step) samples with 0..1 colors', () => {
    const width = 2;
    const height = 2;
    const data = new Uint8ClampedArray([255, 0, 0, 255, 0, 255, 0, 255, 0, 0, 255, 255, 255, 255, 255, 255]);
    const points = imageLayout({ data, width, height }, { x: 0, y: 0, w: 45, h: 30 }, 10);
    expect(points).toHaveLength(4 * 3);
    expect(points[0]).toMatchObject({ x: 5, y: 5 });
    expect(points.at(-1)?.color).toEqual([1, 1, 1]);
    for (const p of points) for (const c of p.color) expect(c).toBeGreaterThanOrEqual(0);
  });

  it('lifts dark pixels to a visible floor so a dark screen still lands as readable characters', () => {
    const black = imageLayout({ data: new Uint8ClampedArray([0, 0, 0, 255]), width: 1, height: 1 }, { x: 0, y: 0, w: 10, h: 10 }, 10);
    for (const c of black[0].color) expect(c).toBeCloseTo(IMAGE_COLOR_FLOOR);
    const red = imageLayout({ data: new Uint8ClampedArray([255, 0, 0, 255]), width: 1, height: 1 }, { x: 0, y: 0, w: 10, h: 10 }, 10);
    expect(red[0].color[0]).toBeCloseTo(1);
    expect(red[0].color[1]).toBeCloseTo(IMAGE_COLOR_FLOOR);
    const gray = imageLayout({ data: new Uint8ClampedArray([64, 64, 64, 255]), width: 1, height: 1 }, { x: 0, y: 0, w: 10, h: 10 }, 10);
    expect(gray[0].color[0]).toBeGreaterThan(black[0].color[0]);
    expect(gray[0].color[0]).toBeLessThan(1);
  });
});

describe('pointsFromAlpha and textLayout', () => {
  it('a fully opaque 4x4 mask with step 2 yields 4 points', () => {
    const points = pointsFromAlpha(new Uint8ClampedArray(16).fill(255), 4, 4, 2);
    expect(Array.from(points)).toEqual([0.25, 0.25, 0.75, 0.25, 0.25, 0.75, 0.75, 0.75]);
  });

  it('a fully transparent mask yields none', () => {
    expect(pointsFromAlpha(new Uint8ClampedArray(16), 4, 4, 2)).toHaveLength(0);
  });

  it('textLayout keeps only opaque samples and maps them into the box', () => {
    const alpha = new Uint8ClampedArray(16);
    alpha[0] = 255;
    const points = textLayout({ alpha, width: 4, height: 4 }, box, 2, [1, 1, 1]);
    expect(points).toEqual([{ x: 100 + 0.25 * 400, y: 50 + 0.25 * 300, color: [1, 1, 1] }]);
  });
});
