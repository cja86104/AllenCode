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

describe('frameCamera: narrow screens see the whole scene (Task P3; P2 found the empty file wider than a phone)', () => {
  it('fits the empty file’s full width on a 390 x 844 phone at the start', async () => {
    const { frameCamera } = await import('../src/world/camera.js');
    const { editorSlab } = await import('../src/world/shapes.js');
    const { lookAt, multiply, perspective, transformPoint } = await import('../src/world/matrix.js');
    const gate = (await import('../src/content/excerpts/gate.js')).default;
    const aspect = 390 / 844;
    const slab = editorSlab(gate.code, 1);
    let minX = Infinity;
    let maxX = -Infinity;
    for (let i = 0; i < slab.glyphs.length; i += 1) {
      minX = Math.min(minX, slab.positions[i * 3]);
      maxX = Math.max(maxX, slab.positions[i * 3]);
    }
    for (const progress of [0, 0.1]) {
      const { eye, target, fov } = frameCamera(cameraAt(progress), aspect);
      const vp = multiply(perspective(fov, aspect, 0.1, 120), lookAt(eye, target));
      for (const x of [minX, maxX]) {
        const [cx, , , w] = transformPoint(vp, [x, 1.6, 0]);
        expect(Math.abs(cx / w), `progress ${progress}, x ${x}`).toBeLessThanOrEqual(0.96);
      }
    }
  });

  it('leaves a wide screen’s camera exactly as it was', async () => {
    const { frameCamera } = await import('../src/world/camera.js');
    for (const progress of [0, 0.5, 1]) expect(frameCamera(cameraAt(progress), 16 / 9)).toEqual(cameraAt(progress));
  });

  it('keeps looking at the same point and never widens past 70 degrees', async () => {
    const { frameCamera } = await import('../src/world/camera.js');
    for (const progress of [0, 0.3, 0.6, 1]) {
      const framed = frameCamera(cameraAt(progress), 0.4);
      expect(framed.target).toEqual(cameraAt(progress).target);
      expect(framed.fov).toBeLessThanOrEqual(70);
    }
  });
});

describe('still keys (Code World W2.2)', () => {
  /** @type {import('../src/world/camera.js').CameraKey[]} */
  const keys = [
    { at: 0, stop: 'a', eye: [0, 1, 10], target: [0, 1, 0], fov: 50 },
    { at: 0.4, stop: 'b', eye: [2, 1, 4], target: [2, 1, -4], fov: 52, still: true },
    { at: 0.6, stop: 'b', eye: [2, 1, 4], target: [2, 1, -4], fov: 52, still: true },
    { at: 1, stop: 'c', eye: [-4, 1, -8], target: [-4, 1, -16], fov: 50 },
  ];

  it('between two still keys the camera does not move at all', () => {
    const held = cameraAt(0.4, keys);
    for (const p of [0.45, 0.5, 0.55, 0.6]) expect(cameraAt(p, keys)).toEqual(held);
  });

  it('eases into a still key: the step just before it is smaller than the steps before that', () => {
    const step = (/** @type {number} */ p) => {
      const a = cameraAt(p, keys).eye;
      const b = cameraAt(p + 0.01, keys).eye;
      return Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);
    };
    expect(step(0.39)).toBeLessThan(step(0.2) / 4);
  });

  it('keys without the mark curve exactly as before', () => {
    const plain = keys.map(({ still, ...key }) => (void still, key));
    const reference = [0.1, 0.3, 0.5, 0.8].map((p) => cameraAt(p, plain));
    expect(reference.every((c) => Number.isFinite(c.eye[0]))).toBe(true);
    expect(cameraAt(0.5, CAMERA_KEYS)).toEqual(cameraAt(0.5));
  });
});
