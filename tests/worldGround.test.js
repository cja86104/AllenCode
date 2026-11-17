// @ts-check
import { describe, expect, it } from 'vitest';
import { createRippleTrail, GROUND_CELL, GROUND_FLAT, groundAt, groundMesh, groundRoads, rayThrough, RIPPLE_GAP, RIPPLE_LIFE, RIPPLE_MAX, stretchGroundRoads, traceGround } from '../src/world/ground.js';
import { routeFor } from '../src/world/route.js';
import { roadAt } from '../src/world/roadLayout.js';

/**
 * The ground (Chris, 2026-11-16: "can we add some kind of 'ground' … to give it some structure"; "Grid
 * that rolls with hills") and the compiler ripples on it ("When the user moves their cursor through the
 * black space outside the road, let nearby invisible grid nodes … briefly illuminate in dim orange").
 */

/** A straight road over one hill: up 2.5 at z = −20, back to 0 at z = −40. */
const HILL = {
  hilly: [/** @type {Array<[number, number, number]>} */ ([[0, 0, 0], [0, -10, 1.25], [0, -20, 2.5], [0, -30, 1.25], [0, -40, 0], [0, -200, 0]])],
  flat: [{ path: /** @type {Array<[number, number]>} */ ([[0, 60], [0, 0]]), half: 2 }],
  half: 1.6,
};

describe('the ground', () => {
  it('takes the road’s height beside the road, and is flat far from it', () => {
    expect(groundAt(HILL, 0, -20).height).toBeCloseTo(2.5, 6);
    expect(groundAt(HILL, 3, -20).height).toBeCloseTo(2.5, 6);
    expect(groundAt(HILL, GROUND_FLAT, -20).height).toBeCloseTo(0, 9);
    expect(groundAt(HILL, 60, -20).height).toBe(0);
    // In between it eases down, never above the road's height.
    const mid = groundAt(HILL, 14, -20).height;
    expect(mid).toBeGreaterThan(0);
    expect(mid).toBeLessThan(2.5);
  });

  it('before a door is taken, is the opening’s: flat, and kept off the trunk and both branches', () => {
    const opening = groundRoads(null);
    expect(groundAt(opening, 30, -20).height).toBe(0);
    expect(groundAt(opening, 0, -20).offRoad).toBeLessThan(0);
    expect(groundAt(opening, -3, -48).offRoad).toBeLessThan(0);
    expect(groundAt(opening, 3, -48).offRoad).toBeLessThan(0);
    expect(groundAt(opening, 12, -20).offRoad).toBeCloseTo(10, 5);
    const hit = traceGround(opening, [0, 1.6, 0], [1, -0.3, -1], 46);
    expect(hit).not.toBeNull();
    expect(hit?.offRoad).toBeGreaterThan(0.5);
  });

  it('under an inner page’s straight road: flat, and kept off the road (2026-11-17)', () => {
    const straight = stretchGroundRoads([[0, 4], [0, -40]]);
    expect(groundAt(straight, 20, -10).height).toBe(0);
    expect(groundAt(straight, 0, -10).offRoad).toBeLessThan(0);
    expect(groundAt(straight, 1.5, -10).offRoad).toBeLessThan(0);
    expect(groundAt(straight, 8, -10).offRoad).toBeCloseTo(6.4, 5);
  });

  it('knows how far off the road a point is: negative on it, by the nearest road’s edge', () => {
    expect(groundAt(HILL, 0, -20).offRoad).toBeCloseTo(-1.6, 6);
    expect(groundAt(HILL, 5, -20).offRoad).toBeCloseTo(3.4, 6);
    // The trunk is 2 each side of its centre.
    expect(groundAt(HILL, 3, 30).offRoad).toBeCloseTo(1, 6);
  });

  it('on the real roads: flat at every stop’s hollow and at the fork, rising with the road between', () => {
    for (const door of /** @type {const} */ (['a', 'b'])) {
      const road = routeFor(door).road;
      if (!road) throw new Error('no road');
      const roads = groundRoads(road.layout);
      for (const landmark of road.layout.landmarks) {
        expect(groundAt(roads, landmark.center[0], landmark.center[2]).height, `${door} ${landmark.stopId}`).toBeCloseTo(0, 6);
      }
      expect(groundAt(roads, 0, -40).height).toBeCloseTo(0, 9);
      const crest = (road.layout.along[0] + road.layout.along[1]) / 2;
      const top = roadAt(road.layout, crest);
      expect(groundAt(roads, top.point[0], top.point[1]).height).toBeCloseTo(top.height, 1);
    }
  });

  it('under a cut, takes the road’s height only from the road’s own pieces, never from a line joining two that pass near', () => {
    // A road that runs out past the cut and back: its two passes near the cut are not joined.
    const hairpin = { hilly: [/** @type {Array<[number, number, number]>} */ ([[-20, 0, 2], [-20, -100, 2], [20, -100, 2], [20, 0, 2]])], flat: [], half: 1.6 };
    const mesh = groundMesh(hairpin, [0, 0], 22);
    for (let i = 0; i < mesh.positions.length / 3; i += 1) {
      expect(mesh.positions[i * 3 + 1]).toBeCloseTo(groundAt(hairpin, mesh.positions[i * 3], mesh.positions[i * 3 + 2]).height, 6);
    }
  });

  it('meshes the cut on a grid a cell apart, on the grid’s own lines so they hold still from cut to cut', () => {
    const mesh = groundMesh(HILL, [3.3, -51.7], 10);
    const xs = new Set();
    for (let i = 0; i < mesh.positions.length / 3; i += 1) {
      const x = mesh.positions[i * 3];
      const z = mesh.positions[i * 3 + 2];
      expect(Math.abs(x / GROUND_CELL - Math.round(x / GROUND_CELL))).toBeLessThan(1e-9);
      expect(Math.abs(z / GROUND_CELL - Math.round(z / GROUND_CELL))).toBeLessThan(1e-9);
      expect(mesh.positions[i * 3 + 1]).toBeCloseTo(groundAt(HILL, x, z).height, 6);
      expect(mesh.offRoad[i]).toBeCloseTo(groundAt(HILL, x, z).offRoad, 6);
      xs.add(x);
    }
    // The cut and a cell of margin each way.
    expect(Math.min(...xs)).toBeLessThanOrEqual(3.3 - 10);
    expect(Math.max(...xs)).toBeGreaterThanOrEqual(3.3 + 10);
    expect(mesh.indices.length % 3).toBe(0);
    expect(Math.max(...mesh.indices)).toBe(mesh.positions.length / 3 - 1);
  });
});

describe('tracing the cursor to the ground', () => {
  it('lands where the ray meets the ground, on the near slope of a hill, not behind it', () => {
    // From the road's foot, looking straight at the hill's face, a little down.
    const hit = traceGround(HILL, [8, 1.6, 0], [0, -0.03, -1], 46);
    if (!hit) throw new Error('no hit');
    expect(hit.point[2]).toBeGreaterThan(-20);
    expect(hit.point[1]).toBeCloseTo(groundAt(HILL, hit.point[0], hit.point[2]).height, 2);
  });

  it('misses beyond the fog, and up into the sky', () => {
    expect(traceGround(HILL, [8, 1.6, 0], [0, 0.2, -1], 46)).toBeNull();
    expect(traceGround(HILL, [40, 1.6, 0], [0, -0.001, -1], 46)).toBeNull();
  });

  it('turns a point on the screen into the camera’s ray through it', () => {
    const camera = { eye: /** @type {[number, number, number]} */ ([0, 1.6, 10]), target: /** @type {[number, number, number]} */ ([0, 1.6, 0]), fov: 52 };
    const centre = rayThrough(camera, 16 / 9, 0, 0);
    expect(centre[0]).toBeCloseTo(0, 9);
    expect(centre[1]).toBeCloseTo(0, 9);
    expect(centre[2]).toBeCloseTo(-1, 9);
    const top = rayThrough(camera, 16 / 9, 0, 1);
    expect(Math.atan2(top[1], -top[2])).toBeCloseTo((26 * Math.PI) / 180, 6);
    const right = rayThrough(camera, 2, 1, 0);
    expect(Math.atan2(right[0], -right[2])).toBeCloseTo(Math.atan(2 * Math.tan((26 * Math.PI) / 180)), 6);
  });
});

describe('the ripple trail', () => {
  it('adds a point only off the road and a gap from the last, keeps the last few, and lets each fade', () => {
    const trail = createRippleTrail();
    expect(trail.add({ point: [0, 0, -5], offRoad: -0.5 }, 0)).toBe(false);
    expect(trail.add({ point: [6, 0, -5], offRoad: 4.4 }, 0)).toBe(true);
    expect(trail.add({ point: [6 + RIPPLE_GAP / 2, 0, -5], offRoad: 4.8 }, 10)).toBe(false);
    expect(trail.add({ point: [6 + RIPPLE_GAP, 0, -5], offRoad: 5.15 }, 20)).toBe(true);
    for (let i = 0; i < 20; i += 1) trail.add({ point: [10 + i, 0, -5], offRoad: 8 + i }, 30 + i);
    expect(trail.active(50)).toHaveLength(RIPPLE_MAX);
    expect(trail.active(50 + RIPPLE_LIFE)).toHaveLength(0);
  });
});
