// @ts-check
import { describe, expect, it } from 'vitest';
import { layoutRoad, roadAt, roadHeadingAt, roadSizes, spurPaths, ROAD_STEP, LATERAL, BEND_AFTER, BEND_LENGTH, OTHER_ROAD, RUN_ON } from '../src/world/roadLayout.js';
import { businessRoadStops, familyRoadStops, MEETING_STOPS } from '../src/world/roads.js';
import { getExcerpt } from '../src/content/excerpts/index.js';
import { distanceToPath } from '../src/world/shapes.js';

/** Every approved excerpt the business road uses, by id. */
function sourcesOf(/** @type {ReturnType<typeof businessRoadStops>} */ stops) {
  /** @type {Record<string, string>} */
  const sources = {};
  for (const stop of stops) {
    if (!stop.excerptId) continue;
    const excerpt = getExcerpt(stop.excerptId);
    if (excerpt) sources[stop.excerptId] = excerpt.code;
  }
  return sources;
}

const stops = businessRoadStops();
const sources = sourcesOf(stops);
const sizes = roadSizes(stops, sources);

describe('roadSizes (Code World W2.2)', () => {
  it('gives products their loops’ 16:10, services their screens’ shape, and slabs their code’s', () => {
    for (const id of ['my-teachers-toolbox', 'underfire-ai', 'founders-helm']) expect(sizes[id]).toEqual({ width: 6, height: 3.75 });
    expect(sizes['mvp-sprints'].width).toBe(6);
    expect(sizes['mvp-sprints'].height).toBeCloseTo((6 * 660) / 1416, 9);
    expect(sizes['custom-saas-builds'].height).toBeCloseTo((6 * 982) / 1800, 9);
    for (const id of ['crew-advisors', 'technical-audits']) {
      const stop = stops.find((s) => s.id === id);
      const lines = sources[/** @type {string} */ (stop?.excerptId)].split('\n');
      expect(sizes[id].width).toBeCloseTo(Math.max(...lines.map((l) => l.length)) * 0.06, 9);
      expect(sizes[id].height).toBeCloseTo(lines.length * 0.145, 9);
    }
    expect(sizes['how-i-work']).toBeUndefined();
  });
});

describe('layoutRoad (Code World W2.2)', () => {
  const road = layoutRoad(stops, 'a', sizes);

  it('sets one landmark per stop but How I work, which has three commits on the road’s edge', () => {
    expect(road.landmarks.map((l) => l.stopId)).toEqual(stops.filter((s) => s.kind !== 'commits').map((s) => s.id));
    expect(road.commits).toHaveLength(3);
    for (const point of road.commits) expect(distanceToPath(point, road.path)).toBeCloseTo(1.6, 6);
  });

  it('spaces the landmarks a road step apart, beside the road, on alternating sides', () => {
    const [, , , ...rest] = road.path;
    expect(rest.length).toBeGreaterThan(0);
    const along = road.landmarks.map((l) => l.center);
    for (let i = 1; i < along.length; i += 1) {
      expect(Math.hypot(along[i][0] - along[i - 1][0], along[i][2] - along[i - 1][2])).toBeGreaterThanOrEqual(ROAD_STEP);
    }
    let lastSide = 0;
    for (const landmark of road.landmarks) {
      const ground = /** @type {[number, number]} */ ([landmark.center[0], landmark.center[2]]);
      expect(distanceToPath(ground, road.path)).toBeGreaterThanOrEqual(3);
      expect(distanceToPath(ground, road.path)).toBeCloseTo(LATERAL, 6);
      expect(landmark.center[1]).toBeCloseTo(1.6 + 0.35 * landmark.height, 9);
      // Which side: the sign of the cross product of the road's direction and the landmark's offset.
      const side = Math.sign(landmark.facing[2] * (landmark.center[0] - road.path[3][0]) - landmark.facing[0] * (landmark.center[2] - road.path[3][1]));
      expect(side).not.toBe(lastSide);
      lastSide = side;
    }
  });

  it('starts the road where the business branch ends, and faces each landmark back up the road', () => {
    expect(road.path.slice(0, 3)).toEqual([
      [0, -40],
      [-3, -48],
      [-6, -55],
    ]);
    const direction = [-3 / Math.hypot(3, 7), -7 / Math.hypot(3, 7)];
    for (const landmark of road.landmarks) {
      expect(landmark.facing[0]).toBeCloseTo(-direction[0], 9);
      expect(landmark.facing[1]).toBe(0);
      expect(landmark.facing[2]).toBeCloseTo(-direction[1], 9);
    }
    // The first landmark is on the outer side (left, for business/).
    expect(road.landmarks[0].center[0]).toBeLessThan(-6);
  });

  it('starts the family road where the family branch ends (the business branch mirrored), and faces each landmark back up its own road (each road its own shape, 2026-11-16)', () => {
    const family = layoutRoad(stops, 'b', sizes);
    [[0, -40], [3, -48], [6, -55]].forEach((p, i) => {
      expect(family.path[i][0]).toBeCloseTo(p[0], 9);
      expect(family.path[i][1]).toBeCloseTo(p[1], 9);
    });
    for (const landmark of family.landmarks) {
      const heading = roadHeadingAt(family, family.along[stops.findIndex((s) => s.id === landmark.stopId)]);
      expect(landmark.facing[0]).toBeCloseTo(-heading[0], 9);
      expect(landmark.facing[2]).toBeCloseTo(-heading[1], 9);
    }
  });
});

describe('the road runs on, and a side path leads to each landmark (Code World R5)', () => {
  for (const door of /** @type {const} */ (['a', 'b'])) {
    const road = layoutRoad(stops, door, sizes);
    const last = road.path[road.path.length - 1];
    const lastStop = road.along[road.along.length - 1];

    it(`door ${door}: runs on past How I work beyond the fog’s far edge (46) from its rest`, () => {
      const there = roadAt(road, lastStop).point;
      expect(Math.hypot(last[0] - there[0], last[1] - there[1])).toBeGreaterThanOrEqual(46 + 10);
    });

    it(`door ${door}: one straight spur per landmark, square off the road on its side, from the centre line to just short of its foot`, () => {
      const spurs = spurPaths(road);
      expect(spurs.map((s) => s.stopId)).toEqual(road.landmarks.map((l) => l.stopId));
      expect(spurs.some((s) => s.stopId === 'how-i-work')).toBe(false);
      spurs.forEach((spur, k) => {
        const landmark = road.landmarks[k];
        expect(spur.path).toHaveLength(2);
        const [from, to] = spur.path;
        expect(distanceToPath(from, road.path)).toBeLessThan(1e-9);
        const dx = to[0] - from[0];
        const dz = to[1] - from[1];
        const length = Math.hypot(dx, dz);
        // Perpendicular to the road there: square to the way its landmark faces, back up the road.
        expect(Math.abs((dx * landmark.facing[0] + dz * landmark.facing[2]) / length)).toBeLessThan(1e-9);
        // On the landmark's side, toward its foot.
        const toFoot = [landmark.center[0] - from[0], landmark.center[2] - from[1]];
        expect(dx * toFoot[0] + dz * toFoot[1]).toBeGreaterThan(0);
        const short = Math.hypot(landmark.center[0] - to[0], landmark.center[2] - to[1]);
        expect(short).toBeGreaterThanOrEqual(0.6 - 1e-9);
        expect(short).toBeLessThanOrEqual(1.0);
      });
    });
  }
});

describe('the family road (Code World W3.2)', () => {
  const family = familyRoadStops();
  const familySizes = roadSizes(family, sourcesOf(family));
  const road = layoutRoad(family, 'b', familySizes);

  it('sizes every template as a 16:10 screen 6 wide', () => {
    for (const stop of family.filter((s) => s.kind === 'template')) expect(familySizes[stop.id]).toEqual({ width: 6, height: 6 / (1280 / 800) });
  });

  it('places a landmark per template on the mirrored road, none for done for you, and a side path for each', () => {
    expect(road.landmarks.map((l) => l.stopId)).toEqual(family.slice(0, -1).map((s) => s.id));
    expect(road.commits).toEqual([]);
    expect(road.spurs.map((s) => s.stopId)).toEqual(road.landmarks.map((l) => l.stopId));
    expect(road.direction[0]).toBeGreaterThan(0);
    expect(road.along).toHaveLength(family.length);
  });
});

describe('the road bends and meets a shared road (Code World W4.1)', () => {
  /** @type {Array<import('../src/world/roads.js').RoadStop>} */
  const meeting = [
    { id: 'm1', name: 'M1', kind: 'portrait', excerptId: null },
    { id: 'm2', name: 'M2', kind: 'sketch', excerptId: null },
  ];
  const meetingSizes = { m1: { width: 6, height: 7.5 }, m2: { width: 6, height: 4.5 } };
  const all = [...stops, ...meeting];
  const both = { ...sizes, ...meetingSizes };
  const near = (/** @type {ReadonlyArray<number | undefined>} */ a, /** @type {ReadonlyArray<number | undefined>} */ b, eps = 1e-9) => a.every((v, i) => Math.abs((v ?? 0) - (b[i] ?? 0)) <= eps);

  it('lays each road stop a step along the road from the branch’s end, the business road running on its starting heading at each (2026-11-16: it winds between them)', () => {
    const road = layoutRoad(all, 'a', both);
    road.along.slice(0, stops.length).forEach((distance, k) => {
      expect(distance).toBe(7 + ROAD_STEP * k);
      expect(near(roadHeadingAt(road, distance), road.direction)).toBe(true);
    });
  });

  for (const door of /** @type {const} */ (['a', 'b'])) {
    const road = layoutRoad(all, door, both);
    const last = road.along[stops.length - 1];

    it(`door ${door}: bends from the branch's heading to straight down −z, turning one way only, and the shared road starts at the junction`, () => {
      expect(road.junction).toBeCloseTo(last + BEND_AFTER + BEND_LENGTH, 9);
      // Just past the junction (exactly on the joint, the sum of the road's many short pieces can round either way).
      expect(near(roadAt(road, road.junction + 0.01).heading, [0, -1], 1e-9)).toBe(true);
      expect(near(roadAt(road, last + BEND_AFTER - 0.01).heading, road.direction, 1e-9)).toBe(true);
      let previous = Math.abs(roadAt(road, last + BEND_AFTER).heading[0]);
      for (let d = last + BEND_AFTER; d <= road.junction; d += 0.5) {
        const sideways = Math.abs(roadAt(road, d).heading[0]);
        expect(sideways).toBeLessThanOrEqual(previous + 1e-9);
        previous = sideways;
      }
    });

    it(`door ${door}: puts the meeting landmarks on the shared road, alternate sides, facing back up it`, () => {
      const placed = road.landmarks.slice(-2);
      expect(placed.map((l) => l.stopId)).toEqual(['m1', 'm2']);
      const [jx] = roadAt(road, road.junction).point;
      placed.forEach((landmark, i) => {
        expect(road.along[stops.length + i]).toBeCloseTo(road.junction + 7 + ROAD_STEP * i, 9);
        expect(Math.abs(landmark.center[0] - jx)).toBeCloseTo(LATERAL, 9);
        expect(landmark.facing).toEqual([0, 0, 1]);
      });
      expect(Math.sign(placed[0].center[0] - jx)).toBe(-Math.sign(placed[1].center[0] - jx));
    });

    it(`door ${door}: the other road comes in from the other side, the bend's mirror image about the shared road, ${OTHER_ROAD} long`, () => {
      const [jx, jz] = roadAt(road, road.junction).point;
      const end = road.other[road.other.length - 1];
      expect(near(end, [jx, jz], 1e-9)).toBe(true);
      const length = road.other.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - road.other[i][0], p[1] - road.other[i][1]), 0);
      expect(length).toBeCloseTo(OTHER_ROAD, 6);
      for (let back = 0; back <= BEND_LENGTH; back += 2) {
        const mine = roadAt(road, road.junction - back).point;
        const theirs = pointBack(road.other, back);
        expect(theirs[0]).toBeCloseTo(2 * jx - mine[0], 6);
        expect(theirs[1]).toBeCloseTo(mine[1], 6);
      }
    });

    it(`door ${door}: runs on ${RUN_ON} past the last meeting stop`, () => {
      const end = road.path[road.path.length - 1];
      const lastMeeting = road.along[road.along.length - 1];
      expect(near(end, roadAt(road, lastMeeting + RUN_ON).point, 1e-6)).toBe(true);
    });
  }

  it('door b’s fork is door a’s mirrored in x, and the roads meet as far along each (each road its own shape between, 2026-11-16)', () => {
    const a = layoutRoad(all, 'a', both);
    const b = layoutRoad(all, 'b', both);
    expect(b.junction).toBeCloseTo(a.junction, 9);
    a.path.slice(0, 3).forEach((p, i) => expect(near(b.path[i], [-p[0], p[1]], 1e-9)).toBe(true));
  });

  it('every side path leaves the road square to its heading, including on the shared road', () => {
    const road = layoutRoad(all, 'a', both);
    for (const spur of spurPaths(road)) {
      const k = all.findIndex((s) => s.id === spur.stopId);
      const { point } = roadAt(road, road.along[k]);
      const heading = roadHeadingAt(road, road.along[k]);
      expect(near(spur.path[0], point, 1e-6)).toBe(true);
      const dx = spur.path[1][0] - spur.path[0][0];
      const dz = spur.path[1][1] - spur.path[0][1];
      expect(Math.abs(dx * heading[0] + dz * heading[1]) / Math.hypot(dx, dz)).toBeLessThan(1e-6);
    }
  });
});

/** The point `back` units before a path's end, walking back along it. @param {ReadonlyArray<Readonly<[number, number, number?]>>} path @param {number} back */
function pointBack(path, back) {
  let left = back;
  for (let i = path.length - 1; i > 0; i -= 1) {
    const [bx, bz] = path[i];
    const [ax, az] = path[i - 1];
    const length = Math.hypot(bx - ax, bz - az);
    if (left <= length) return /** @type {[number, number]} */ ([bx + ((ax - bx) * left) / length, bz + ((az - bz) * left) / length]);
    left -= length;
  }
  return path[0];
}

describe('the meeting landmarks’ sizes (Code World W4.2)', () => {
  it('sizes the workshop as the photo’s 4:5 and your idea as the sketch’s 4:3, 6 wide', () => {
    const meetingSizes = roadSizes(MEETING_STOPS, { builder: 'x' });
    expect(meetingSizes.workshop).toEqual({ width: 6, height: 7.5 });
    expect(meetingSizes['your-idea']).toEqual({ width: 6, height: 4.5 });
  });
});

describe('the "our work/" sign between the services and the products (Chris, 2026-11-16)', () => {
  it('stands half a stretch before the first product, on door a; door b has none', () => {
    const road = layoutRoad(stops, 'a', sizes);
    const first = stops.findIndex((s) => s.signBefore);
    expect(road.signs).toEqual([{ label: 'our work/', along: road.along[first] - ROAD_STEP / 2 }]);
    const family = familyRoadStops();
    expect(layoutRoad(family, 'b', roadSizes(family, sourcesOf(family))).signs).toEqual([]);
  });
});
