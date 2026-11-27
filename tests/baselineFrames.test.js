/** @vitest-environment node */
// @ts-check
import { describe, expect, it } from 'vitest';
import { frameOffsets } from '../tools/baseline/frames.mjs';

describe('frameOffsets', () => {
  it('steps a viewport height at a time and ends at the bottom', () => {
    expect(frameOffsets(2000, 900)).toEqual([0, 900, 1100]);
  });

  it('does not repeat the bottom when the height is an exact multiple', () => {
    expect(frameOffsets(1800, 900)).toEqual([0, 900]);
  });

  it('is a single frame for a page no taller than the viewport', () => {
    expect(frameOffsets(900, 900)).toEqual([0]);
    expect(frameOffsets(500, 900)).toEqual([0]);
  });
});
