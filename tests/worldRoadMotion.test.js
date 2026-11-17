// @ts-check
import { describe, expect, it } from 'vitest';
import { buildRoadWorld, codeRoad, roadEdges, roadGateway, ROAD_COLORS, EDGE_LINES } from '../src/world/shapes.js';
import { packShapes } from '../src/world/worldRenderer.js';
import { WORLD_VERTEX_SHADER } from '../src/world/worldShaders.js';
import { routeFor } from '../src/world/route.js';
import { worldBudgetFor } from '../src/world/surroundings.js';
import gate from '../src/content/excerpts/gate.js';
import ambient from '../src/content/excerpts/ambient.js';

/** Chris, 2026-11-16: the road's code moving forward like a stand's, a third of it in colour (orange, sky blue, green), and three lines on each orange edge. */

const CODE = 'const road = () => moving.forward();';
const PATH = /** @type {Array<[number, number]>} */ ([
  [0, 0],
  [0, -20],
  [12, -32],
]);

/** @param {number} r @param {number} g @param {number} b */
const hex = (r, g, b) => [r, g, b].map((c) => Math.round(c * 255).toString(16).padStart(2, '0')).join('');

describe('the road’s code (Chris, 2026-11-16)', () => {
  it('is about a third in colour, the orange, sky blue and green in even shares; the rest pale', () => {
    expect(ROAD_COLORS.map((c) => hex(c[0], c[1], c[2]))).toEqual(['f97316', '38bdf8', '4ade80']);
    const road = codeRoad(CODE, { path: PATH, width: 3.2, count: 6000 }, 3);
    /** @type {Record<string, number>} */
    const counts = {};
    for (let i = 0; i < 6000; i += 1) {
      const key = hex(road.colors[i * 4], road.colors[i * 4 + 1], road.colors[i * 4 + 2]);
      counts[key] = (counts[key] ?? 0) + 1;
    }
    for (const colour of ['f97316', '38bdf8', '4ade80']) {
      expect(counts[colour] / 6000, colour).toBeGreaterThan(0.09);
      expect(counts[colour] / 6000, colour).toBeLessThan(0.14);
    }
    expect((counts.dbdbd6 ?? 0) / 6000).toBeGreaterThan(0.6);
  });

  it('moves forward: each character runs along its stretch of road, the way the road goes, in a short loop', () => {
    const road = codeRoad(CODE, { path: PATH, width: 3.2, count: 400 }, 3);
    expect(road.stream).toBeInstanceOf(Float32Array);
    const stream = /** @type {Float32Array} */ (road.stream);
    // Four floats a glyph: its run in x, y and z, and its loop (2026-11-16: on hills it runs up and down too).
    expect(stream.length).toBe(400 * 4);
    const first = [0, -1];
    const second = [Math.SQRT1_2, -Math.SQRT1_2];
    for (let i = 0; i < 400; i += 1) {
      const [dx, dy, dz, loop] = [stream[i * 4], stream[i * 4 + 1], stream[i * 4 + 2], stream[i * 4 + 3]];
      expect(dy).toBe(0);
      expect(Math.hypot(dx, dz)).toBeCloseTo(1, 6);
      const along = (dx - first[0]) ** 2 + (dz - first[1]) ** 2 < 1e-9 || (dx - second[0]) ** 2 + (dz - second[1]) ** 2 < 1e-9;
      expect(along, `glyph ${i} runs (${dx}, ${dz})`).toBe(true);
      expect(loop).toBeGreaterThan(0.5);
      expect(loop).toBeLessThan(3);
    }
  });
});

describe('the road’s orange edges (Chris, 2026-11-16: three lines wide)', () => {
  it('draws three lines on each side, the outer at the road’s edge, the others inside it, all orange and still', () => {
    expect(EDGE_LINES).toBe(3);
    const edges = roadEdges(CODE, { path: [[0, 0], [0, -30]], width: 3.2, spacing: 0.5 }, 5);
    /** @type {Set<number>} */
    const offsets = new Set();
    for (let i = 0; i < edges.glyphs.length; i += 1) {
      offsets.add(Math.round(Math.abs(edges.positions[i * 3]) * 20) / 20);
      expect(hex(edges.colors[i * 4], edges.colors[i * 4 + 1], edges.colors[i * 4 + 2])).toBe('f97316');
    }
    // 15 cm apart, inward from the edge (each within its 2 cm jitter).
    expect([...offsets].sort()).toEqual([1.3, 1.45, 1.6]);
    expect(edges.stream).toBeUndefined();
    // Three lines a side, each a character every half unit for 30 units.
    expect(edges.glyphs.length).toBe(2 * 3 * 61);
  });
});

describe('the moving road in the renderer', () => {
  it('packs each glyph’s run (direction and loop) after its flow, and nothing for still glyphs', () => {
    const road = codeRoad('ab', { path: [[0, 0], [0, -4]], width: 1, count: 2 }, 1);
    const still = roadEdges('ab', { path: [[0, 0], [0, -1]], width: 1, spacing: 1 }, 1);
    const { data } = packShapes([road, still], () => 0);
    const stride = 15;
    expect(data.length).toBe((2 + still.glyphs.length) * stride);
    expect([...data.subarray(11, 15)]).toEqual([...(road.stream ?? []).subarray(0, 4)]);
    expect([...data.subarray(2 * stride + 11, 2 * stride + 15)]).toEqual([0, 0, 0, 0]);
  });

  it('moves a glyph with a run along it over time, fading at the ends of its loop', () => {
    expect(WORLD_VERTEX_SHADER).toContain('layout(location = 6) in vec4 aStream;');
    expect(WORLD_VERTEX_SHADER).toMatch(/if \(aStream\.w > 0\.0\)/);
    expect(WORLD_VERTEX_SHADER).toMatch(/position \+= aStream\.xyz \*/);
  });
});

describe('the budget with three-line edges', () => {
  // Each road's landmark glyphs and opening before the change (measured 2026-11-16).
  const BEFORE = {
    a: { low: { landmark: 4184, trunk: 1776 }, mid: { landmark: 5489, trunk: 3848 }, high: { landmark: 7919, trunk: 6808 } },
    b: { low: { landmark: 5195, trunk: 1776 }, mid: { landmark: 8282, trunk: 3848 }, high: { landmark: 12888, trunk: 6808 } },
  };
  it('keeps the opening as it was and at least nine tenths of the landmarks’ glyphs, on both roads and every tier', () => {
    for (const door of /** @type {const} */ (['a', 'b'])) {
      const road = routeFor(door).road;
      if (!road) throw new Error('no road');
      for (const tier of /** @type {const} */ (['low', 'mid', 'high'])) {
        const parts = buildRoadWorld(tier, { gate: gate.code, road: ambient.code, stops: road.sources }, 1, { stops: road.stops, layout: road.layout, budget: worldBudgetFor(door, tier) });
        const sum = (/** @type {string} */ prefix) => parts.filter((p) => p.name.split(':')[0] === prefix).reduce((s, p) => s + p.shape.glyphs.length, 0);
        expect(sum('trunk-road'), `${door} ${tier} trunk`).toBe(BEFORE[door][tier].trunk);
        expect(sum('landmark'), `${door} ${tier} landmarks`).toBeGreaterThanOrEqual(Math.floor(BEFORE[door][tier].landmark * 0.9));
      }
    }
  });
});

describe('the road’s characters on the hills (Chris, 2026-11-16: C)', () => {
  // Up a rise of 2 over 10, then down it again.
  const HILL = /** @type {Array<[number, number, number]>} */ ([[0, 0, 0], [0, -10, 2], [0, -20, 0]]);
  /** The ground's height under a point on this path. @param {number} z */
  const groundAt = (z) => (z > -10 ? (-z / 10) * 2 : 2 - ((-z - 10) / 10) * 2);

  it('lays the scatter on the ground, each character running along the slope it stands on', () => {
    const road = codeRoad(CODE, { path: HILL, width: 3.2, count: 800 }, 4);
    const stream = /** @type {Float32Array} */ (road.stream);
    for (let i = 0; i < 800; i += 1) {
      const z = road.positions[i * 3 + 2];
      expect(Math.abs(road.positions[i * 3 + 1] - groundAt(z)), `glyph ${i}`).toBeLessThanOrEqual(0.11);
      const [dx, dy, dz] = [stream[i * 4], stream[i * 4 + 1], stream[i * 4 + 2]];
      expect(Math.hypot(dx, dy, dz)).toBeCloseTo(1, 6);
      // Up the first half, down the second: the slope is 2 in 10.
      expect(dy / Math.hypot(dx, dz)).toBeCloseTo(z > -10 ? 0.2 : -0.2, 6);
    }
  });

  it('lays the edges on the ground', () => {
    const edges = roadEdges(CODE, { path: HILL, width: 3.2, spacing: 0.5 }, 5);
    for (let i = 0; i < edges.glyphs.length; i += 1) {
      expect(Math.abs(edges.positions[i * 3 + 1] - groundAt(edges.positions[i * 3 + 2]))).toBeLessThanOrEqual(0.03);
    }
  });

  it('stands the "our work/" sign on the ground where it crosses the road', () => {
    const sign = roadGateway('our work/', { at: [0, -10], heading: [0, -1], halfWidth: 1.6, ground: 2 }, 1);
    /** @type {number[]} */
    const posts = [];
    /** @type {number[]} */
    const label = [];
    for (let i = 0; i < sign.glyphs.length; i += 1) (sign.colors[i * 4 + 1] === 1 ? label : posts).push(sign.positions[i * 3 + 1]);
    // Stored as 32-bit floats: to five places.
    expect(Math.min(...posts)).toBeCloseTo(2, 5);
    for (const y of label) expect(y).toBeCloseTo(2 + 3.3, 5);
  });
});
