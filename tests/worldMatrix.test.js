// @ts-check
import { describe, expect, it } from 'vitest';
import { lookAt, multiply, perspective, transformPoint } from '../src/world/matrix.js';
import { cameraAt } from '../src/world/camera.js';

describe('world camera matrices (Code world prototype, Task P2)', () => {
  it('puts the point the camera looks at in the centre of the screen, in front of it', () => {
    for (const progress of [0, 0.2, 0.45, 0.7, 1]) {
      const { eye, target, fov } = cameraAt(progress);
      const viewProjection = multiply(perspective(fov, 16 / 9, 0.1, 120), lookAt(eye, target));
      const [x, y, , w] = transformPoint(viewProjection, target);
      expect(w).toBeGreaterThan(0);
      expect(x / w).toBeCloseTo(0, 6);
      expect(y / w).toBeCloseTo(0, 6);
    }
  });

  it('keeps up as up: a point above the target lands above the centre', () => {
    const { eye, target, fov } = cameraAt(0);
    const viewProjection = multiply(perspective(fov, 1, 0.1, 120), lookAt(eye, target));
    const [, y, , w] = transformPoint(viewProjection, [target[0], target[1] + 1, target[2]]);
    expect(y / w).toBeGreaterThan(0);
  });

  it('puts a point behind the camera behind it (negative w)', () => {
    const viewProjection = multiply(perspective(50, 1, 0.1, 120), lookAt([0, 0, 0], [0, 0, -10]));
    expect(transformPoint(viewProjection, [0, 0, 5])[3]).toBeLessThan(0);
  });
});
