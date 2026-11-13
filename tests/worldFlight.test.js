// @ts-check
import { describe, expect, it } from 'vitest';
import { flightBudgetFor, landedShape, toWorldFlight } from '../src/world/worldFlight.js';
import { viewProjectionFor, transformPoint } from '../src/world/matrix.js';
import { restPose } from '../src/world/restPose.js';
import { IMAGE_COLOR_FLOOR } from '../src/field/layouts.js';

/** @typedef {[number, number, number]} Vec3 */

/**
 * A transformation as `resolveTransform` gives it, with particles at the given pixels.
 * @param {Array<[number, number]>} starts @param {Array<[number, number]>} ends
 */
function transformation(starts, ends) {
  const count = starts.length;
  return {
    count,
    start: new Float32Array(starts.flat()),
    end: new Float32Array(ends.flat()),
    glyph: new Float32Array(count).fill(5),
    original: new Float32Array(count).fill(1),
    seed: new Float32Array(count).fill(0.5),
    row: new Float32Array(count).fill(0.25),
    srcColor: new Float32Array(count * 3).fill(0.8),
    dstColor: new Float32Array(count * 3).fill(0.4),
  };
}

/** Projects a world point to CSS pixels. @param {Vec3} p */
function project(p, /** @type {{ eye: Vec3, target: Vec3, fov: number }} */ camera, /** @type {{ width: number, height: number }} */ viewport) {
  const [x, y, , w] = transformPoint(viewProjectionFor(camera, viewport.width / viewport.height), p);
  return [((x / w + 1) / 2) * viewport.width, ((1 - y / w) / 2) * viewport.height];
}

const viewport = { width: 1440, height: 900 };
const pixels = /** @type {Array<[number, number]>} */ ([
  [100, 120],
  [720, 450],
  [1300, 800],
  [900, 200],
]);

describe('toWorldFlight: a flight placed on a plane in the world (Code World R3)', () => {
  for (const facing of /** @type {Vec3[]} */ ([
    [0, 0, 1],
    [0.394, 0, 0.919],
    [1, 0, 0],
  ])) {
    it(`unprojects every pixel onto the plane and back within half a pixel (facing ${facing.join(', ')})`, () => {
      const landmark = { center: /** @type {Vec3} */ ([2, 2.5, -40]), facing, width: 6 };
      const camera = restPose(landmark, { x: 650, y: 150, w: 700, h: 437 }, viewport);
      const flight = toWorldFlight(
        { transformation: transformation(pixels, [...pixels].reverse()), sizes: { from: 13, to: 7 } },
        { camera, viewport, plane: { point: landmark.center, normal: facing } },
      );
      expect(flight.count).toBe(4);
      pixels.forEach((pixel, i) => {
        const back = project(/** @type {Vec3} */ ([...flight.start.subarray(i * 3, i * 3 + 3)]), camera, viewport);
        expect(Math.abs(back[0] - pixel[0])).toBeLessThan(0.5);
        expect(Math.abs(back[1] - pixel[1])).toBeLessThan(0.5);
        const p = /** @type {Vec3} */ ([...flight.start.subarray(i * 3, i * 3 + 3)]);
        const offset = (p[0] - landmark.center[0]) * facing[0] + (p[1] - landmark.center[1]) * facing[1] + (p[2] - landmark.center[2]) * facing[2];
        expect(Math.abs(offset)).toBeLessThan(1e-4);
      });
      // Sizes: a world size projected at the plane's depth is the CSS size.
      // The plane's depth along the view: square on, the eye-to-target distance.
      const depth = Math.hypot(camera.eye[0] - camera.target[0], camera.eye[1] - camera.target[1], camera.eye[2] - camera.target[2]);
      const pxPerWorld = viewport.height / 2 / Math.tan((camera.fov * Math.PI) / 360) / depth;
      expect(Math.abs((flight.sizeFrom * pxPerWorld) / 13 - 1)).toBeLessThan(0.02);
      expect(Math.abs((flight.sizeTo * pxPerWorld) / 7 - 1)).toBeLessThan(0.02);
      // The arc lifts toward the camera.
      const toCamera = [camera.eye[0] - landmark.center[0], camera.eye[1] - landmark.center[1], camera.eye[2] - landmark.center[2]];
      expect(flight.normal[0] * toCamera[0] + flight.normal[1] * toCamera[1] + flight.normal[2] * toCamera[2]).toBeGreaterThan(0);
    });
  }
});

describe('landedShape: a landmark’s picture in characters (Code World R3)', () => {
  const width = 40;
  const height = 25;
  const data = new Uint8ClampedArray(width * height * 4);
  for (let i = 0; i < width * height; i += 1) data.set([i % 256, 0, 255, 255], i * 4);
  const landmark = { stopId: 'x', kind: /** @type {'product'} */ ('product'), center: /** @type {Vec3} */ ([5, 2.5, -30]), facing: /** @type {Vec3} */ ([1, 0, 0]), width: 6, height: 3.75 };
  const code = 'const a = 1;\nreturn a;';
  const shape = landedShape({ data, width, height }, landmark, code, 2);

  it('lies flat on the landmark, inside its rect', () => {
    expect(shape.glyphs.length).toBeGreaterThan(100);
    for (let i = 0; i < shape.glyphs.length; i += 1) {
      const [x, y, z] = shape.positions.subarray(i * 3, i * 3 + 3);
      expect(Math.abs(x - 5)).toBeLessThan(1e-5);
      expect(Math.abs(z + 30)).toBeLessThanOrEqual(3 + 1e-5);
      expect(Math.abs(y - 2.5)).toBeLessThanOrEqual(1.875 + 1e-5);
    }
  });

  it('uses only the code’s characters, in the image’s colours lifted as a landed flight’s are', () => {
    const allowed = new Set([...code].filter((c) => c.trim()));
    for (let i = 0; i < shape.glyphs.length; i += 1) {
      expect(allowed.has(String.fromCharCode(shape.glyphs[i]))).toBe(true);
      expect(shape.colors[i * 4 + 1]).toBeCloseTo(IMAGE_COLOR_FLOOR, 5);
      expect(shape.colors[i * 4 + 2]).toBeCloseTo(1, 5);
    }
  });
});

describe('flightBudgetFor (Code World R3)', () => {
  it('gives a flight the field’s budget for the world’s tier', () => {
    expect(flightBudgetFor('low')).toBe(1200);
    expect(flightBudgetFor('mid')).toBe(2500);
    expect(flightBudgetFor('high')).toBe(4000);
  });
});
