// @ts-check
import { describe, expect, it } from 'vitest';
import { routeFor } from '../src/world/route.js';
import { LATERAL, ROAD_SHAPE, ROAD_STEP, BEND_AFTER, BUSINESS_STEP, roadAt } from '../src/world/roadLayout.js';
import { distanceToPath, ROAD_PATHS } from '../src/world/shapes.js';

/**
 * Each road's shape (Chris, 2026-11-16: "A with C on business, B with C on family"): the business road
 * winds over hills, the family road turns a corner at each change of section over hills; the stops in
 * the hollows; the fork and the meeting unchanged.
 */

const MEETING = ['portrait', 'sketch'];

/** @param {'a' | 'b'} door */
function road(door) {
  const route = routeFor(door).road;
  if (!route) throw new Error('no road');
  const { layout, stops } = route;
  const roadStops = stops.map((stop, i) => ({ stop, along: layout.along[i] })).filter(({ stop }) => !MEETING.includes(stop.kind));
  const lastRoad = roadStops[roadStops.length - 1].along;
  return { layout, stops, roadStops, lastRoad, bendAt: lastRoad + BEND_AFTER };
}

/** @param {Readonly<[number, number, number?]>} h */
const angle = (h) => Math.atan2(h[1], h[0]);
/** @param {number} a @param {number} b */
const turnBetween = (a, b) => Math.atan2(Math.sin(b - a), Math.cos(b - a));

describe('both roads', () => {
  for (const door of /** @type {const} */ (['a', 'b'])) {
    const { layout, roadStops, bendAt } = road(door);

    it(`door ${door}: every stop stands in a hollow, with its hills between the stops`, () => {
      for (const { stop, along } of roadStops) expect(roadAt(layout, along).height, stop.id).toBeCloseTo(0, 6);
      for (let k = 1; k < roadStops.length; k += 1) {
        const from = roadStops[k - 1].along;
        const span = roadStops[k].along - from;
        const label = `between ${roadStops[k - 1].stop.id} and ${roadStops[k].stop.id}`;
        // Business: one crest midway. Family (2026-11-17): a tall crest midway, then two rolling ones, by turns.
        const crests = door === 'a' ? [[0.5, ROAD_SHAPE.hill]] : (k - 1) % 2 === 0 ? [[0.5, ROAD_SHAPE.tallHill]] : [[0.25, ROAD_SHAPE.hill], [0.75, ROAD_SHAPE.hill]];
        for (const [share, height] of crests) {
          expect(Math.abs(roadAt(layout, from + span * share).height - height) / height, label).toBeLessThan(0.05);
        }
      }
    });

    it(`door ${door}: flat and on its starting heading where the bend begins; the branch untouched`, () => {
      expect(roadAt(layout, bendAt).height).toBeCloseTo(0, 6);
      // Its last piece before the bend, which the bend turns from: within a tenth of a degree.
      expect(Math.abs(turnBetween(angle(layout.direction), angle(roadAt(layout, bendAt - 0.5).heading)))).toBeLessThan((0.1 * Math.PI) / 180);
      const branch = door === 'a' ? ROAD_PATHS.business : ROAD_PATHS.family;
      branch.forEach((p, i) => {
        expect(layout.path[i][0]).toBeCloseTo(p[0], 9);
        expect(layout.path[i][1]).toBeCloseTo(p[1], 9);
      });
    });

    it(`door ${door}: no part of the road runs under a landmark, and the road never crosses itself`, () => {
      for (const landmark of layout.landmarks) {
        expect(distanceToPath([landmark.center[0], landmark.center[2]], layout.path), landmark.stopId).toBeGreaterThanOrEqual(LATERAL - 1);
      }
      const path = layout.path;
      /** @param {Readonly<[number, number, number?]>} a @param {Readonly<[number, number, number?]>} b @param {Readonly<[number, number, number?]>} c @param {Readonly<[number, number, number?]>} d */
      const crosses = (a, b, c, d) => {
        const side = (/** @type {Readonly<[number, number, number?]>} */ p, /** @type {Readonly<[number, number, number?]>} */ q, /** @type {Readonly<[number, number, number?]>} */ r) => Math.sign((q[0] - p[0]) * (r[1] - p[1]) - (q[1] - p[1]) * (r[0] - p[0]));
        return side(a, b, c) * side(a, b, d) < 0 && side(c, d, a) * side(c, d, b) < 0;
      };
      for (let i = 0; i < path.length - 1; i += 1) {
        for (let j = i + 2; j < path.length - 1; j += 1) {
          expect(crosses(path[i], path[i + 1], path[j], path[j + 1]), `pieces ${i} and ${j}`).toBe(false);
        }
      }
    });
  }
});

describe('the business road winds (A)', () => {
  const { layout, roadStops } = road('a');
  const base = angle(layout.direction);

  it('swings either side of its heading, by up to the swing', () => {
    let most = 0;
    for (let s = roadStops[0].along; s <= roadStops[roadStops.length - 1].along; s += 0.5) most = Math.max(most, Math.abs(turnBetween(base, angle(roadAt(layout, s).heading))));
    expect(most).toBeGreaterThan(ROAD_SHAPE.swing * 0.9);
    expect(most).toBeLessThan(ROAD_SHAPE.swing * 1.05);
  });

  it('turns away from each landmark, so it stands on the outside of its curve and comes into view round it', () => {
    for (const landmark of layout.landmarks) {
      const index = roadStops.findIndex(({ stop }) => stop.id === landmark.stopId);
      if (index < 0) continue;
      const along = roadStops[index].along;
      const here = roadAt(layout, along);
      const right = [-here.heading[1], here.heading[0]];
      const before = roadAt(layout, along - 1).heading;
      const after = roadAt(layout, along + 1).heading;
      const turn = (after[0] - before[0]) * right[0] + (after[1] - before[1]) * right[1];
      const side = (landmark.center[0] - here.point[0]) * right[0] + (landmark.center[2] - here.point[1]) * right[1];
      expect(Math.abs(turn), landmark.stopId).toBeGreaterThan(1e-3);
      expect(Math.sign(turn) * Math.sign(side), landmark.stopId).toBe(-1);
    }
  });
});

describe('the family road turns at each section (B)', () => {
  const { layout, roadStops } = road('b');
  const base = angle(layout.direction);
  const at = (/** @type {string} */ id) => roadStops.find(({ stop }) => stop.id === id)?.along ?? Number.NaN;

  it('meets Hearth on its heading, turns a corner into the templates, and turns back before Done for you', () => {
    // Within 0.06°: the road is laid in 1-unit pieces, each on the heading at its middle, and the gentle
    // bends (2026-11-17) leave a stop's neighbouring pieces a hair off its own heading.
    const STOP_HEADING = 1e-3;
    const hearth = at('hearth');
    const templates = roadStops.filter(({ stop }) => stop.kind === 'template' && stop.id !== 'hearth');
    const done = at('done-for-you');
    expect(Math.abs(turnBetween(base, angle(roadAt(layout, hearth).heading)))).toBeLessThan(STOP_HEADING);
    const through = angle(roadAt(layout, templates[0].along).heading);
    expect(Math.abs(Math.abs(turnBetween(base, through)) - ROAD_SHAPE.corner)).toBeLessThan(STOP_HEADING);
    // Through the templates the road bends gently (2026-11-17), back to the corner's heading at each.
    for (const { stop, along } of templates) expect(Math.abs(turnBetween(through, angle(roadAt(layout, along).heading))), stop.id).toBeLessThan(STOP_HEADING);
    for (let s = templates[0].along; s <= templates[templates.length - 1].along; s += 0.5) {
      expect(Math.abs(turnBetween(through, angle(roadAt(layout, s).heading))), `at ${s}`).toBeLessThan(ROAD_SHAPE.bend * 1.05);
    }
    expect(Math.abs(turnBetween(base, angle(roadAt(layout, done).heading)))).toBeLessThan(STOP_HEADING);
  });

  it('turns each corner over its corner length, scaled with the step, between the stops', () => {
    const hearth = at('hearth');
    const first = roadStops[1].along;
    expect(first - hearth).toBe(BUSINESS_STEP);
    expect((ROAD_SHAPE.cornerLength * BUSINESS_STEP) / ROAD_STEP).toBeLessThan(BUSINESS_STEP - 1);
  });
});
