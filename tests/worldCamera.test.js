// @ts-check
import { describe, expect, it } from 'vitest';
import { cameraAt, CAMERA_KEYS } from '../src/world/camera.js';

/** @param {[number, number, number]} a @param {[number, number, number]} b */
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe('cameraAt (Code world prototype, Task P1)', () => {
  it('moves smoothly: no jump over 0.5 world units between progress steps of 0.001', () => {
    let previous = cameraAt(0);
    for (let i = 1; i <= 1000; i += 1) {
      const next = cameraAt(i / 1000);
      expect(distance(previous.eye, next.eye)).toBeLessThanOrEqual(0.5);
      expect(distance(previous.target, next.target)).toBeLessThanOrEqual(0.5);
      previous = next;
    }
  });

  it('clamps progress outside 0..1', () => {
    expect(cameraAt(-1)).toEqual(cameraAt(0));
    expect(cameraAt(2)).toEqual(cameraAt(1));
  });

  it('passes through each stop at its progress', () => {
    for (const key of CAMERA_KEYS) {
      const at = cameraAt(key.at);
      expect(distance(at.eye, key.eye)).toBeLessThan(1e-9);
      expect(distance(at.target, key.target)).toBeLessThan(1e-9);
      expect(at.fov).toBeCloseTo(key.fov, 9);
    }
  });

  it('has the stops of the plan, in order: empty file, into the code, the road, the fork, the landmark', () => {
    expect(CAMERA_KEYS.map((k) => k.at)).toEqual([0, 0.15, 0.3, 0.45, 0.6, 0.75, 1]);
  });

  it('always looks somewhere other than where it stands', () => {
    for (let i = 0; i <= 100; i += 1) {
      const { eye, target } = cameraAt(i / 100);
      expect(distance(eye, target)).toBeGreaterThan(1);
    }
  });
});
