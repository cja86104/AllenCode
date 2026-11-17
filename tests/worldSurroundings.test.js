// @ts-check
import { describe, expect, it } from 'vitest';
import { cutWorld, worldBudgetFor, WINDOW_RADIUS, RECUT_AFTER } from '../src/world/surroundings.js';
import { budgetFor, buildRoadWorld, codeRoad, ROAD_PATHS } from '../src/world/shapes.js';
import { routeFor } from '../src/world/route.js';
import { roadAt, roadLength } from '../src/world/roadLayout.js';
import gate from '../src/content/excerpts/gate.js';
import ambient from '../src/content/excerpts/ambient.js';

/**
 * The world cut around the camera (Chris, 2026-11-16: "Build around the camera"): the camera never sees
 * past the fog's far edge, so only what stands within reach of it is drawn, and a road of any length
 * fits the tier's budget.
 */

const TIERS = /** @type {const} */ (['low', 'mid', 'high']);
const FOG_FAR = 46;

/** A plain grey picture, standing in for a read screen (the most a landmark can cost). @param {number} w @param {number} h */
const picture = (w, h) => ({ data: new Uint8ClampedArray(w * h * 4).fill(128), width: w, height: h });

/** @param {'a' | 'b'} door @param {'low' | 'mid' | 'high'} tier */
function world(door, tier) {
  const road = routeFor(door).road;
  if (!road) throw new Error('no road');
  const landed = Object.fromEntries(road.stops.map((s) => [s.id, picture(320, 200)]));
  const parts = buildRoadWorld(tier, { gate: gate.code, road: ambient.code, stops: road.sources }, 1, { stops: road.stops, layout: road.layout, budget: worldBudgetFor(door, tier) }, landed);
  return { road, parts };
}

/** Points every `step` units along a polyline. @param {ReadonlyArray<Readonly<[number, number, number?]>>} line @param {number} step */
function along(line, step) {
  /** @type {Array<[number, number]>} */
  const points = [];
  for (let i = 0; i < line.length - 1; i += 1) {
    const [ax, az] = line[i];
    const [bx, bz] = line[i + 1];
    const length = Math.hypot(bx - ax, bz - az);
    for (let d = 0; d < length; d += step) points.push([ax + ((bx - ax) * d) / length, az + ((bz - az) * d) / length]);
  }
  return points;
}

describe('cutting the world around the camera', () => {
  it('reaches past the fog by as far as the camera travels before the next cut', () => {
    expect(WINDOW_RADIUS).toBe(FOG_FAR + RECUT_AFTER);
  });

  it('keeps exactly a road part’s glyphs within reach, with their colours, runs and sizes', () => {
    const road = codeRoad(ambient.code, { path: [[0, 0], [0, -200]], width: 3.2, count: 2000 }, 3);
    const [cut] = cutWorld([{ name: 'onward-road', shape: road }], [0, -100], 30);
    /** @type {number[]} */
    const kept = [];
    for (let i = 0; i < 2000; i += 1) {
      if (Math.hypot(road.positions[i * 3], road.positions[i * 3 + 2] + 100) <= 30) kept.push(i);
    }
    expect(cut.shape.glyphs.length).toBe(kept.length);
    kept.forEach((i, j) => {
      expect(cut.shape.glyphs[j]).toBe(road.glyphs[i]);
      expect([...cut.shape.positions.subarray(j * 3, j * 3 + 3)]).toEqual([...road.positions.subarray(i * 3, i * 3 + 3)]);
      expect([...cut.shape.colors.subarray(j * 4, j * 4 + 4)]).toEqual([...road.colors.subarray(i * 4, i * 4 + 4)]);
      expect([...(cut.shape.stream ?? new Float32Array(0)).subarray(j * 4, j * 4 + 4)]).toEqual([...road.stream.subarray(i * 4, i * 4 + 4)]);
    });
  });

  it('keeps any other part whole while any of it is within reach, and leaves it out whole otherwise, in the same order', () => {
    const { parts } = world('a', 'mid');
    const landmark = parts.find((p) => p.name === 'landmark:mvp-sprints');
    if (!landmark) throw new Error('no landmark');
    const [x, , z] = [landmark.shape.positions[0], 0, landmark.shape.positions[2]];
    const near = cutWorld(parts, [x + 10, z], WINDOW_RADIUS);
    const far = cutWorld(parts, [x + 2000, z], WINDOW_RADIUS);
    expect(near.map((p) => p.name)).toEqual(parts.map((p) => p.name));
    expect(near.find((p) => p.name === 'landmark:mvp-sprints')?.shape.glyphs.length).toBe(landmark.shape.glyphs.length);
    expect(far.find((p) => p.name === 'landmark:mvp-sprints')?.shape.glyphs.length).toBe(0);
    // Its tag, and an unfinished file's cursor, travel with it.
    expect(near.find((p) => p.name === 'landmark:mvp-sprints')?.shape.tag).toBe(landmark.shape.tag);
    const crew = parts.find((p) => p.name === 'landmark:crew-advisors');
    expect(cutWorld(parts, [crew?.shape.positions[0] ?? 0, crew?.shape.positions[2] ?? 0], WINDOW_RADIUS).find((p) => p.name === 'landmark:crew-advisors')?.cursor).toBe(crew?.cursor);
  });
});

describe('the budget, cut by cut', () => {
  it('the long family road (2026-11-17) keeps each landmark’s glyphs from the short road, within 2%, and the opening full', () => {
    // Each family landmark's glyphs on the 14-unit road, measured at the commit before the change.
    const before = { low: 348, mid: 565, high: 885 };
    for (const tier of TIERS) {
      const { parts } = world('b', tier);
      for (const part of parts.filter((p) => p.name.startsWith('landmark:') && p.name !== 'landmark:your-idea')) {
        expect(Math.abs(part.shape.glyphs.length / before[tier] - 1), `${tier} ${part.name}`).toBeLessThan(0.02);
      }
      expect(parts.find((p) => p.name === 'trunk-road')?.shape.glyphs.length, tier).toBe({ low: 1776, mid: 3848, high: 6808 }[tier]);
    }
  });

  for (const door of /** @type {const} */ (['a', 'b'])) {
    for (const tier of TIERS) {
      it(`door ${door}, ${tier}: no cut anywhere along the road holds more than the tier’s budget`, () => {
        const { road, parts } = world(door, tier);
        const branch = door === 'a' ? ROAD_PATHS.business : ROAD_PATHS.family;
        /** @type {Array<[number, number]>} */
        const centres = [...along(ROAD_PATHS.trunk, 2), ...along(branch, 2)];
        for (let d = 0; d <= roadLength(road.layout); d += 2) {
          const { point } = roadAt(road.layout, d);
          centres.push([point[0], point[1]]);
        }
        // Where the camera rests, in front of each landmark.
        for (const l of road.layout.landmarks) centres.push([l.center[0] + l.facing[0] * 8, l.center[2] + l.facing[2] * 8]);
        let most = 0;
        for (const centre of centres) {
          const count = cutWorld(parts, centre, WINDOW_RADIUS).reduce((sum, p) => sum + p.shape.glyphs.length, 0);
          most = Math.max(most, count);
        }
        expect(most).toBeLessThanOrEqual(budgetFor(tier));
      });
    }
  }

  it('the business road keeps the opening at its full density, and its landmarks about the family road’s', () => {
    for (const tier of TIERS) {
      // The workshop: a screen landmark on both roads (slabs are their code's exact size, so compare a sculpture).
      const most = (/** @type {'a' | 'b'} */ door) => world(door, tier).parts.find((p) => p.name === 'landmark:workshop')?.shape.glyphs.length ?? 0;
      const trunk = world('a', tier).parts.find((p) => p.name === 'trunk-road')?.shape.glyphs.length ?? 0;
      expect(trunk, tier).toBe({ low: 1776, mid: 3848, high: 6808 }[tier]);
      expect(Math.abs(most('a') / most('b') - 1), tier).toBeLessThan(0.1);
    }
  });
});
