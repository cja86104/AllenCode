// @ts-check
import { describe, expect, it } from 'vitest';
import { LANDMARK, landmarkRect, resolveAt } from '../src/world/landmark.js';
import { cameraAt, frameCamera } from '../src/world/camera.js';
import { packShapes } from '../src/world/worldRenderer.js';

describe('the landmark resolves into its real screen (Code world prototype, Task P4)', () => {
  it('resolves from 0.80 to 0.92 of the journey: none before, all after, never backwards', () => {
    expect(resolveAt(0)).toBe(0);
    expect(resolveAt(0.8)).toBe(0);
    expect(resolveAt(0.92)).toBe(1);
    expect(resolveAt(1)).toBe(1);
    let previous = 0;
    for (let p = 0.8; p <= 0.92; p += 0.005) {
      expect(resolveAt(p)).toBeGreaterThanOrEqual(previous);
      previous = resolveAt(p);
    }
  });

  it('is the shape of the real screen: 16:10, like the 1280 x 800 poster', () => {
    expect(LANDMARK.width / LANDMARK.height).toBeCloseTo(1280 / 800, 6);
  });

  it('at the end, on desktop, the screen is in view, large, and keeps its 16:10 shape', () => {
    const viewport = { width: 1440, height: 900 };
    const rect = landmarkRect(frameCamera(cameraAt(1), 1440 / 900), viewport);
    expect(rect.visible).toBe(true);
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.top).toBeGreaterThanOrEqual(0);
    expect(rect.left + rect.width).toBeLessThanOrEqual(viewport.width);
    expect(rect.top + rect.height).toBeLessThanOrEqual(viewport.height);
    expect(rect.width / viewport.width).toBeGreaterThan(0.3);
    expect(rect.width / rect.height).toBeCloseTo(1.6, 1);
  });

  it('at the end, on a phone, the screen fits across it', () => {
    const viewport = { width: 390, height: 844 };
    const rect = landmarkRect(frameCamera(cameraAt(1), 390 / 844), viewport);
    expect(rect.visible).toBe(true);
    expect(rect.left).toBeGreaterThanOrEqual(0);
    expect(rect.left + rect.width).toBeLessThanOrEqual(viewport.width);
  });

  it('far down the road the screen is small, and behind the camera it is not shown', () => {
    const viewport = { width: 1440, height: 900 };
    expect(landmarkRect(cameraAt(0.3), viewport).width / viewport.width).toBeLessThan(0.15);
    const lookingAway = { eye: /** @type {[number, number, number]} */ ([-6, 1.8, -70]), target: /** @type {[number, number, number]} */ ([-6, 1.8, -80]), fov: 50 };
    expect(landmarkRect(lookingAway, viewport).visible).toBe(false);
  });
});

describe('packShapes tells where each shape sits in the buffer (Task P4: the landmark fades on its own)', () => {
  it('returns each shape’s first glyph and count, skipping characters the atlas lacks', () => {
    /** @param {string} chars @returns {import('../src/world/shapes.js').Shape} */
    const shape = (chars) => ({
      positions: new Float32Array(chars.length * 3),
      glyphs: Uint16Array.from([...chars].map((c) => c.charCodeAt(0))),
      colors: new Float32Array(chars.length * 4),
      size: 0.1,
    });
    const known = 'abc';
    const { count, ranges } = packShapes([shape('ab?c'), shape('??'), shape('cab')], (c) => known.indexOf(c));
    expect(count).toBe(6);
    expect(ranges).toEqual([
      { start: 0, count: 3 },
      { start: 3, count: 0 },
      { start: 3, count: 3 },
    ]);
  });
});

describe('landmarkRect for any landmark (Code World W2.2)', () => {
  it('for a landmark facing straight back up the road, equals the prototype’s box', () => {
    const camera = frameCamera(cameraAt(1), 1440 / 900);
    const viewport = { width: 1440, height: 900 };
    expect(landmarkRect(camera, viewport, { ...LANDMARK, facing: [0, 0, 1] })).toEqual(landmarkRect(camera, viewport));
  });

  it('turns with the landmark: one facing along x, seen from along x, keeps its shape', () => {
    const landmark = { center: /** @type {[number, number, number]} */ ([10, 1.8, 0]), facing: /** @type {[number, number, number]} */ ([1, 0, 0]), width: 6, height: 3.75 };
    const camera = { eye: /** @type {[number, number, number]} */ ([17.5, 1.8, 0]), target: landmark.center, fov: 52 };
    const rect = landmarkRect(camera, { width: 1440, height: 900 }, landmark);
    expect(rect.visible).toBe(true);
    expect(rect.width / rect.height).toBeCloseTo(1.6, 2);
  });
});
