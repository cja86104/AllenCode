// @ts-check
import { describe, expect, it } from 'vitest';
import { branchForGesture, buildJourney } from '../src/world/journey.js';
import { cameraAt } from '../src/world/camera.js';
import { transformPoint, viewProjectionFor } from '../src/world/matrix.js';

/** @param {[number, number, number]} a @param {[number, number, number]} b */
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe('buildJourney (Code World W1.1)', () => {
  it('without a road taken, the journey ends at the split, looking down both branches', () => {
    const journey = buildJourney(null);
    expect(journey.splitAt).toBe(1);
    const last = journey.keys[journey.keys.length - 1];
    expect(last.at).toBe(1);
    const viewProjection = viewProjectionFor(last, 16 / 9);
    for (const point of /** @type {Array<[number, number, number]>} */ ([
      [-3, 0, -48],
      [3, 0, -48],
    ])) {
      const [x, y, , w] = transformPoint(viewProjection, point);
      expect(w).toBeGreaterThan(0);
      expect(Math.abs(x / w)).toBeLessThan(0.9);
      expect(Math.abs(y / w)).toBeLessThan(0.9);
    }
    expect(journey.stops.map((s) => s.name)).toEqual(['Empty file', 'Into the code', 'The road', 'The fork']);
  });

  it('both roads share every step up to the split, then turn left (business) or right (family)', () => {
    const none = buildJourney(null);
    const business = buildJourney('a');
    const family = buildJourney('b');
    const splitScreens = none.screens;
    for (const journey of [business, family]) {
      for (const key of none.keys) {
        const same = journey.keys.find((k) => Math.abs(k.at * journey.screens - key.at * splitScreens) < 1e-9);
        expect(same, `key at ${key.at * splitScreens} screens`).toBeDefined();
        expect(same?.eye).toEqual(key.eye);
        expect(same?.target).toEqual(key.target);
      }
      expect(journey.splitAt).toBeCloseTo(splitScreens / journey.screens, 9);
    }
    const end = (/** @type {ReturnType<typeof buildJourney>} */ j) => j.keys[j.keys.length - 1];
    expect(end(business).target[0]).toBeLessThan(-3);
    expect(end(family).target[0]).toBeGreaterThan(3);
    expect(business.stops.map((s) => s.name)).toEqual(['Empty file', 'Into the code', 'The road', 'The fork', 'business/']);
    expect(family.stops.map((s) => s.name)).toEqual(['Empty file', 'Into the code', 'The road', 'The fork', 'family/']);
  });

  it('moves smoothly on every road: no jump over 0.5 units between progress steps of 0.001', () => {
    for (const door of /** @type {const} */ ([null, 'a', 'b'])) {
      const { keys } = buildJourney(door);
      let previous = cameraAt(0, keys);
      for (let i = 1; i <= 1000; i += 1) {
        const next = cameraAt(i / 1000, keys);
        expect(distance(previous.eye, next.eye), `${door} at ${i}`).toBeLessThanOrEqual(0.5);
        previous = next;
      }
    }
  });

  it('a road taken makes the journey longer, and its stops cover 0 to 1 in order', () => {
    expect(buildJourney('a').screens).toBeGreaterThan(buildJourney(null).screens);
    for (const door of /** @type {const} */ ([null, 'a', 'b'])) {
      const { stops } = buildJourney(door);
      expect(stops[0].from).toBe(0);
      for (let i = 1; i < stops.length; i += 1) expect(stops[i].from).toBeCloseTo(stops[i - 1].to, 12);
      expect(stops[stops.length - 1].to).toBe(1);
    }
  });

  it('keeps the lab’s camera exactly as it was when no journey is given', () => {
    expect(cameraAt(0.5)).toEqual(cameraAt(0.5, undefined));
  });
});

describe('branchForGesture (Code World W1.1): dx is where the visitor steers, negative to the left', () => {
  it('takes a road only for a clear sideways movement', () => {
    expect(branchForGesture({ dx: -60, dy: 5 })).toBe('a');
    expect(branchForGesture({ dx: 60, dy: 5 })).toBe('b');
    expect(branchForGesture({ dx: 30, dy: 0 })).toBeNull();
    expect(branchForGesture({ dx: 60, dy: 50 })).toBeNull();
    expect(branchForGesture({ dx: 0, dy: -200 })).toBeNull();
  });
});
