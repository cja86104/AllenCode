// @ts-check
import { describe, expect, it } from 'vitest';
import { roadAt, roadBetween } from '../src/world/roadPath.js';

/** A road over a hill (Chris, 2026-11-16: turns and hills): x, z and the ground's height. */
const HILL = { origin: /** @type {[number, number]} */ ([0, 0]), path: /** @type {Array<[number, number, number]>} */ ([[0, 0, 0], [0, -10, 2], [0, -20, 0]]) };

describe('the ground’s height along the road', () => {
  it('is the height between the path’s points, by distance along it', () => {
    expect(roadAt(HILL, 0).height).toBeCloseTo(0, 9);
    expect(roadAt(HILL, 5).height).toBeCloseTo(1, 9);
    expect(roadAt(HILL, 10).height).toBeCloseTo(2, 9);
    expect(roadAt(HILL, 15).height).toBeCloseTo(1, 9);
    expect(roadAt(HILL, 5).point).toEqual([0, -5]);
  });

  it('carries the height into a stretch of the road', () => {
    const stretch = roadBetween(HILL, 2, 18);
    expect(stretch).toHaveLength(3);
    expect(stretch[0][2]).toBeCloseTo(0.4, 9);
    expect(stretch[1]).toEqual([0, -10, 2]);
    expect(stretch[2][2]).toBeCloseTo(0.4, 9);
  });

  it('is 0 on a flat road of plain points', () => {
    const flat = { origin: /** @type {[number, number]} */ ([0, 0]), path: /** @type {Array<[number, number]>} */ ([[0, 0], [0, -10]]) };
    expect(roadAt(flat, 4).height).toBe(0);
    expect(roadBetween(flat, 1, 9).map((p) => p[2])).toEqual([0, 0]);
  });
});
