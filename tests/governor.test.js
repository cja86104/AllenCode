// @ts-check
import { describe, expect, it } from 'vitest';
import { createGovernor } from '../src/field/governor.js';

/**
 * @param {{ sample(frameMs: number): number }} governor
 * @param {number} frameMs
 * @param {number} frames
 */
function feed(governor, frameMs, frames) {
  let count = 0;
  for (let i = 0; i < frames; i += 1) count = governor.sample(frameMs);
  return count;
}

describe('createGovernor', () => {
  it('starts at the base count', () => {
    expect(createGovernor({ base: 1000 }).sample(16)).toBe(1000);
  });

  it('holds steady for 23 slow frames, then cuts 15 percent on the 24th', () => {
    const governor = createGovernor({ base: 1000 });
    expect(feed(governor, 30, 23)).toBe(1000);
    expect(governor.sample(30)).toBe(850);
  });

  it('governor cuts 15 percent after 24 slow frames', () => {
    expect(feed(createGovernor({ base: 1000 }), 30, 24)).toBe(850);
  });

  it('governor never drops below 40 percent of base', () => {
    expect(feed(createGovernor({ base: 1000 }), 50, 24 * 20)).toBe(400);
  });

  it('governor restores 5 percent after 24 fast frames and never exceeds base', () => {
    const governor = createGovernor({ base: 1000 });
    feed(governor, 30, 24);
    expect(feed(governor, 10, 24)).toBe(900);
    expect(feed(governor, 10, 24 * 10)).toBe(1000);
  });

  it('frame times between 14 and 22 ms change nothing', () => {
    expect(feed(createGovernor({ base: 1000 }), 18, 24 * 5)).toBe(1000);
  });

  it('ignores non-finite and negative frame times', () => {
    const governor = createGovernor({ base: 1000 });
    feed(governor, Number.NaN, 24);
    feed(governor, -5, 24);
    feed(governor, Number.POSITIVE_INFINITY, 24);
    expect(feed(governor, 18, 1)).toBe(1000);
  });
});
