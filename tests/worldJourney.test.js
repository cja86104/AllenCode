// @ts-check
import { describe, expect, it } from 'vitest';
import { branchForGesture, buildJourney, commitsAt, handoverAt, typedAt } from '../src/world/journey.js';
import { cameraAt, frameCamera } from '../src/world/camera.js';
import { landmarkRect } from '../src/world/landmark.js';
import { businessRoadStops } from '../src/world/roads.js';
import { roadSizes } from '../src/world/roadLayout.js';
import { getExcerpt } from '../src/content/excerpts/index.js';
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

describe('the business road (Code World W2.2)', () => {
  const stops = businessRoadStops();
  /** @type {Record<string, string>} */
  const sources = {};
  for (const stop of stops) {
    const excerpt = stop.excerptId ? getExcerpt(stop.excerptId) : null;
    if (excerpt && stop.excerptId) sources[stop.excerptId] = excerpt.code;
  }
  const sizes = roadSizes(stops, sources);
  const journey = buildJourney('a', stops, sizes);
  const atScreens = (/** @type {number} */ screens) => screens / journey.screens;

  it('without road stops, and for each door before its road is built, is exactly W1’s journey', () => {
    expect(buildJourney(null, stops, sizes)).toEqual(buildJourney(null));
    expect(buildJourney('b')).toEqual(buildJourney('b', [], {}));
  });

  it('runs a stop of 1.5 screens per road stop after the turn, named in order', () => {
    expect(journey.screens).toBeCloseTo(6.8 + 9 * 1.5, 9);
    expect(journey.stops.map((s) => s.name)).toEqual([
      'Empty file',
      'Into the code',
      'The road',
      'The fork',
      'business/',
      ...stops.map((s) => s.name),
    ]);
    const business = journey.stops.find((s) => s.id === 'business-road');
    expect(business?.to).toBeCloseTo(atScreens(6.8), 9);
    journey.keys.slice(1).forEach((key, i) => expect(key.at).toBeGreaterThan(journey.keys[i].at));
    expect(journey.keys[journey.keys.length - 1].at).toBe(1);
  });

  it('moves smoothly all the way down the road', () => {
    let previous = cameraAt(0, journey.keys);
    for (let p = 0.001; p <= 1; p += 0.001) {
      const camera = cameraAt(p, journey.keys);
      expect(distance(camera.eye, previous.eye)).toBeLessThan(0.5);
      previous = camera;
    }
  });

  it('arrives square on to every landmark, in view, with room below for the words on a phone', () => {
    for (const landmark of journey.landmarks) {
      const stop = journey.stops.find((s) => s.id === landmark.stopId);
      if (!stop) throw new Error(`no stop for ${landmark.stopId}`);
      const arrive = stop.from + (0.6 / 1.5) * (stop.to - stop.from);
      for (const viewport of [
        { width: 1440, height: 900 },
        { width: 393, height: 852 },
      ]) {
        const camera = frameCamera(cameraAt(arrive, journey.keys), viewport.width / viewport.height);
        const rect = landmarkRect(camera, viewport, landmark);
        expect(rect.visible).toBe(true);
        expect(rect.width / rect.height).toBeCloseTo(landmark.width / landmark.height, 1);
        expect(Math.abs(rect.width / rect.height / (landmark.width / landmark.height) - 1)).toBeLessThan(0.02);
        expect(rect.left).toBeGreaterThanOrEqual(0);
        expect(rect.top).toBeGreaterThanOrEqual(0);
        expect(rect.left + rect.width).toBeLessThanOrEqual(viewport.width);
        if (viewport.width < viewport.height) expect(rect.top + rect.height).toBeLessThanOrEqual(0.55 * viewport.height);
        else expect(rect.top + rect.height).toBeLessThanOrEqual(viewport.height);
      }
    }
  });

  it('carries no sideways framing on any key (R1)', () => {
    for (const key of journey.keys) expect('aside' in key).toBe(false);
    expect('aside' in cameraAt(0.7, journey.keys)).toBe(false);
  });

  it('holds perfectly still from arriving at a landmark until it leaves', () => {
    for (const landmark of journey.landmarks) {
      const stop = journey.stops.find((s) => s.id === landmark.stopId);
      if (!stop) throw new Error(landmark.stopId);
      const at = (/** @type {number} */ screens) => stop.from + (screens / 1.5) * (stop.to - stop.from);
      const arrived = cameraAt(at(0.6), journey.keys);
      for (const screens of [0.7, 0.8, 0.9, 1.0]) {
        const camera = cameraAt(at(screens), journey.keys);
        camera.eye.forEach((v, i) => expect(v).toBeCloseTo(arrived.eye[i], 9));
        camera.target.forEach((v, i) => expect(v).toBeCloseTo(arrived.target[i], 9));
        expect(camera.fov).toBeCloseTo(arrived.fov, 9);
        expect(arrived.eye[1]).toBeCloseTo(1.6, 9);
      }
    }
  });

  it('hands over one landmark at a time, inside its own stop, fully at its hold', () => {
    /** @type {string[]} */
    const seen = [];
    let last = null;
    for (let p = 0; p <= 1; p += 0.0005) {
      const handover = handoverAt(journey, p);
      if (!handover) {
        last = null;
        continue;
      }
      const stop = journey.stops.find((s) => s.id === handover.stopId);
      expect(stop && p >= stop.from && p < stop.to).toBe(true);
      expect(handover.amount).toBeGreaterThanOrEqual(0);
      expect(handover.amount).toBeLessThanOrEqual(1);
      if (handover.stopId !== last) seen.push(handover.stopId);
      last = handover.stopId;
    }
    expect(seen).toEqual(stops.filter((s) => ['product', 'service', 'audit'].includes(s.kind)).map((s) => s.id));
    for (const stop of journey.stops.filter((s) => seen.includes(s.id))) {
      const hold = stop.from + (1 / 1.5) * (stop.to - stop.from);
      expect(handoverAt(journey, hold)).toEqual({ stopId: stop.id, amount: 1 });
    }
    for (const id of ['crew-advisors', 'how-i-work']) {
      const stop = journey.stops.find((s) => s.id === id);
      if (!stop) throw new Error(id);
      for (let p = stop.from; p < stop.to; p += 0.001) expect(handoverAt(journey, p)).toBeNull();
    }
  });

  it('answers the same for a jump as for a scroll', () => {
    const points = [0.93, 0.41, 0.77, 0.12, 0.6, 0.99, 0.5];
    const jumped = points.map((p) => [handoverAt(journey, p), typedAt(journey, p), commitsAt(journey, p)]);
    const again = [...points].reverse().map((p) => [handoverAt(journey, p), typedAt(journey, p), commitsAt(journey, p)]).reverse();
    expect(jumped).toEqual(again);
  });

  it('types Crew Advisors from 0.15 to 0.65 of its code across its stop, and only there', () => {
    const stop = journey.stops.find((s) => s.id === 'crew-advisors');
    if (!stop) throw new Error('crew-advisors');
    expect(typedAt(journey, stop.from)).toBeCloseTo(0.15, 9);
    expect(typedAt(journey, stop.to - 1e-9)).toBeCloseTo(0.65, 6);
    expect(typedAt(journey, stop.from - 0.001)).toBeNull();
    expect(typedAt(journey, stop.to + 0.001)).toBeNull();
    let previous = 0;
    for (let p = stop.from; p < stop.to; p += 0.001) {
      const typed = /** @type {number} */ (typedAt(journey, p));
      expect(typed).toBeGreaterThanOrEqual(previous);
      previous = typed;
    }
  });

  it('counts the commits of how I work as the camera passes them: none, then one, two, three', () => {
    const stop = journey.stops.find((s) => s.id === 'how-i-work');
    if (!stop) throw new Error('how-i-work');
    expect(commitsAt(journey, stop.from - 0.01)).toBe(0);
    /** @type {number[]} */
    const counts = [];
    for (let p = stop.from; p <= 1; p += 0.0005) {
      const n = commitsAt(journey, p);
      if (counts[counts.length - 1] !== n) counts.push(n);
    }
    expect(counts).toEqual([0, 1, 2, 3]);
    expect(commitsAt(journey, 1)).toBe(3);
  });
});
