// @ts-check
import { describe, expect, it } from 'vitest';
import { driveAt, driveCamera, DRIVE_DISTANCE, DRIVE_MS } from '../src/world/drive.js';

/** The drive between pages (Code World W5b, Chris 2026-11-17: "Drive on ahead"). */
describe('the drive between pages', () => {
  it('lasts 0.6 s and covers 12 units each half', () => {
    expect(DRIVE_MS).toBe(600);
    expect(DRIVE_DISTANCE).toBe(12);
  });

  it('drives on ahead out of the old world, then in to the new road’s start, fading across the swap', () => {
    expect(driveAt(0)).toEqual({ half: 'out', u: 0, travel: 0, alpha: 1 });
    const late = driveAt(299);
    expect(late?.half).toBe('out');
    expect(late?.travel).toBeGreaterThan(11.8);
    expect(late?.alpha).toBeLessThan(0.01);
    expect(driveAt(300)).toEqual({ half: 'in', u: 0, travel: -12, alpha: 0 });
    const end = driveAt(599);
    expect(end?.half).toBe('in');
    expect(Math.abs(end?.travel ?? 1)).toBeLessThan(0.01);
    expect(end?.alpha).toBeGreaterThan(0.99);
    expect(driveAt(600)).toBeNull();
    expect(driveAt(5000)).toBeNull();
  });

  it('keeps its speed across the swap, so it reads as one drive', () => {
    const speed = (/** @type {number} */ a, /** @type {number} */ b) => ((driveAt(b)?.travel ?? 0) - (driveAt(a)?.travel ?? 0)) / (b - a);
    const before = speed(298, 299.9);
    const after = speed(300, 301.9);
    expect(Math.abs(after / before - 1)).toBeLessThan(0.02);
  });

  it('moves the camera along the way it looks, level, keeping its height and field of view', () => {
    const camera = { eye: /** @type {[number, number, number]} */ ([1, 1.6, 2]), target: /** @type {[number, number, number]} */ ([4, 1.2, -2]), fov: 52 };
    const moved = driveCamera(camera, 10);
    // Level look: (3, -4) over 5, so 10 units is (6, -8).
    expect(moved.eye).toEqual([7, 1.6, -6]);
    expect(moved.target).toEqual([10, 1.2, -10]);
    expect(moved.fov).toBe(52);
    expect(driveCamera(camera, -10).eye).toEqual([-5, 1.6, 10]);
  });
});
