// @ts-check
import { describe, expect, it } from 'vitest';
import { auditTimeline, chapterTimeline } from '../src/scenes/chapterTimeline.js';

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
