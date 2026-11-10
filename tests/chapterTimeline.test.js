// @ts-check
import { describe, expect, it } from 'vitest';
import { auditTimeline, chapterTimeline, commitTimeline } from '../src/scenes/chapterTimeline.js';

describe('chapterTimeline', () => {
  it('holds the code still for the first 15 percent, then flies to the end', () => {
    expect(chapterTimeline(0.15).flight).toBe(0);
    expect(chapterTimeline(0.5).flight).toBeCloseTo(0.5);
    expect(chapterTimeline(0.85).flight).toBe(1);
  });

  it('hands off to the real screen over the last 12 percent of the flight', () => {
    expect(chapterTimeline(0.15 + 0.7 * 0.88).handoff).toBeCloseTo(0);
    expect(chapterTimeline(1).handoff).toBe(1);
  });
});

describe('auditTimeline', () => {
  it('checks lines one by one between 10 and 90 percent of the section', () => {
    expect(auditTimeline(0.1, 20)).toBe(0);
    expect(auditTimeline(0.5, 20)).toBe(10);
    expect(auditTimeline(0.9, 20)).toBe(20);
    expect(auditTimeline(1, 20)).toBe(20);
  });
});

describe('commitTimeline', () => {
  it('nothing is committed before 8 percent; everything is shipped by 88 percent', () => {
    expect(commitTimeline(0, 3)).toEqual(Array(3).fill({ typed: 0, body: 0, shipped: false }));
    expect(commitTimeline(0.88, 3)).toEqual(Array(3).fill({ typed: 1, body: 1, shipped: true }));
    expect(commitTimeline(1, 3)).toEqual(Array(3).fill({ typed: 1, body: 1, shipped: true }));
  });

  it('commits one principle at a time: the first ships before the second starts typing', () => {
    const third = 0.08 + 0.8 / 3;
    const [first, second, last] = commitTimeline(third, 3);
    expect(first).toEqual({ typed: 1, body: 1, shipped: true });
    expect(second.typed).toBeCloseTo(0);
    expect(last).toEqual({ typed: 0, body: 0, shipped: false });
  });

  it('within one principle, the title types before the text slides in', () => {
    const [first] = commitTimeline(0.08 + (0.8 / 3) * 0.3, 3);
    expect(first.typed).toBeGreaterThan(0.5);
    expect(first.body).toBe(0);
    expect(first.shipped).toBe(false);
  });
});
