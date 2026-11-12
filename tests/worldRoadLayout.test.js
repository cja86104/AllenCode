// @ts-check
import { describe, expect, it } from 'vitest';
import { layoutRoad, roadSizes, ROAD_STEP, LATERAL } from '../src/world/roadLayout.js';
import { businessRoadStops } from '../src/world/roads.js';
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

  it('mirrors in x for the family road', () => {
    const family = layoutRoad(stops, 'b', sizes);
    family.landmarks.forEach((landmark, i) => {
      const business = road.landmarks[i];
      expect(landmark.center[0]).toBeCloseTo(-business.center[0], 9);
      expect(landmark.center[2]).toBeCloseTo(business.center[2], 9);
      expect(landmark.facing[0]).toBeCloseTo(-business.facing[0], 9);
    });
  });
});
