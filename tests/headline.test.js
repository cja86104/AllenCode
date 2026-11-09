// @ts-check
import { describe, expect, it } from 'vitest';
import { HEADLINE_TEXT, headlineLayout } from '../src/scenes/headline.js';

describe('headline', () => {
  it('is the approved headline, verbatim', () => {
    expect(HEADLINE_TEXT).toBe('We build software that ships.');
  });

  it('sizes the text by the smaller of width and height and centers two lines', () => {
    const { fontPx, targetBox } = headlineLayout(1280, 800);
    expect(fontPx).toBeCloseTo(Math.min(1280 / 8.5, 800 / 4.2));
    expect(targetBox.h).toBeCloseTo(fontPx * 1.1 * 2);
    expect(targetBox.y + targetBox.h / 2).toBeCloseTo(400);
    expect(targetBox.x + targetBox.w / 2).toBeCloseTo(640);
  });

  it('never samples coarser than the glyph size can carry', () => {
    expect(headlineLayout(390, 844).step).toBeGreaterThanOrEqual(6);
  });
});
