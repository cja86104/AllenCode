// @ts-check
import { describe, expect, it } from 'vitest';
import { NO_WORDS, WORDS_DIM, WORDS_PAD, wordsRectNdc } from '../src/world/wordsRect.js';

describe('the words’ box, for dimming a flight behind them (2026-11-26, Phase 2: code crossed MVP Sprints’ list)', () => {
  const viewport = { width: 1000, height: 800 };

  it('is the box in clip space, padded, with y up', () => {
    const [x0, y0, x1, y1] = wordsRectNdc({ left: 100, top: 200, width: 300, height: 400 }, viewport);
    expect(x0).toBeCloseTo(((100 - WORDS_PAD) / 1000) * 2 - 1, 9);
    expect(x1).toBeCloseTo(((400 + WORDS_PAD) / 1000) * 2 - 1, 9);
    // The box's bottom (600 px down) is its lowest point in clip space.
    expect(y0).toBeCloseTo(1 - ((600 + WORDS_PAD) / 800) * 2, 9);
    expect(y1).toBeCloseTo(1 - ((200 - WORDS_PAD) / 800) * 2, 9);
    expect(x0).toBeLessThan(x1);
    expect(y0).toBeLessThan(y1);
  });

  it('dims nothing for no box, an empty box, or a box off screen', () => {
    expect(wordsRectNdc(null, viewport)).toEqual(NO_WORDS);
    expect(wordsRectNdc({ left: 10, top: 10, width: 0, height: 50 }, viewport)).toEqual(NO_WORDS);
    expect(wordsRectNdc({ left: 10, top: -900, width: 300, height: 50 }, viewport)).toEqual(NO_WORDS);
    expect(wordsRectNdc({ left: 1200, top: 10, width: 300, height: 50 }, viewport)).toEqual(NO_WORDS);
    // Nothing on screen lies inside it: every clip-space point is within -1..1.
    expect(NO_WORDS[0]).toBeGreaterThan(1);
  });

  it('dims to a quarter: the code still moves behind the words, faintly', () => {
    expect(WORDS_DIM).toBe(0.25);
  });
});
