// @ts-check
import { describe, expect, it } from 'vitest';
import {
  budgetFor,
  buildRoadWorld,
  buildWorld,
  codeRoad,
  distanceToPath,
  editorSlab,
  forkSigns,
  landmarkStand,
  SLAB_METRICS,
  roadEdges,
  screenSculpture,
  slabCaret,
  unfinishedSlab,
} from '../src/world/shapes.js';
import { businessRoadStops } from '../src/world/roads.js';
import { layoutRoad, roadSizes, spurPaths } from '../src/world/roadLayout.js';
import { getExcerpt } from '../src/content/excerpts/index.js';
import gate from '../src/content/excerpts/gate.js';
import ambient from '../src/content/excerpts/ambient.js';
import underfire from '../src/content/excerpts/product-underfire-ai.js';

const SOURCES = { gate: gate.code, road: ambient.code, landmark: underfire.code };
const TRUNK = /** @type {Array<[number, number]>} */ ([
  [0, -3],
  [0, -40],
]);

/** Every character a shape draws, as a set. @param {{ glyphs: Uint16Array }} shape */
const charsOf = (shape) => new Set([...shape.glyphs].map((c) => String.fromCharCode(c)));
/** @param {string} code */
const charsIn = (code) => new Set([...code].filter((c) => c.trim() !== ''));
/** Positions are 32-bit floats (what the GPU reads), so bounds are checked to that precision. */
const F32 = 1e-5;

describe('world shapes (Code world prototype, Task P1)', () => {
  it('draws only characters of its own approved source: real code, never invented', () => {
    expect([gate, ambient, underfire].every((e) => e.approved)).toBe(true);
    const cases = [
      [editorSlab(gate.code, 1), gate.code],
      [codeRoad(ambient.code, { path: TRUNK, width: 4, count: 3000 }, 1), ambient.code],
      [screenSculpture(underfire.code, { width: 6, height: 3.75, center: [-6, 1.8, -58], count: 2000 }, 1), underfire.code],
    ];
    for (const [shape, code] of /** @type {Array<[import('../src/world/shapes.js').Shape, string]>} */ (cases)) {
      const allowed = charsIn(code);
      for (const c of charsOf(shape)) expect(allowed.has(c), c).toBe(true);
    }
    const signs = forkSigns(['business/', 'family/'], { at: [0, 0, -40] }, 1);
    for (const c of charsOf(signs)) expect(charsIn('business/family/').has(c), c).toBe(true);
  });

  it('lays the editor out as the file reads: one glyph per character, in line and column order', () => {
    const slab = editorSlab(gate.code, 1);
    expect(slab.glyphs.length).toBe([...gate.code].filter((c) => c.trim() !== '').length);
    expect(String.fromCharCode(slab.glyphs[0])).toBe([...gate.code].find((c) => c.trim() !== ''));
  });

  it('gives identical arrays for the same seed and different ones for another', () => {
    const a = codeRoad(ambient.code, { path: TRUNK, width: 4, count: 500 }, 7);
    const b = codeRoad(ambient.code, { path: TRUNK, width: 4, count: 500 }, 7);
    const c = codeRoad(ambient.code, { path: TRUNK, width: 4, count: 500 }, 8);
    expect([...a.positions]).toEqual([...b.positions]);
    expect([...a.colors]).toEqual([...b.colors]);
    expect([...a.positions]).not.toEqual([...c.positions]);
  });

  it('keeps every road glyph on the road: within half its width of the path, at ground level', () => {
    const road = codeRoad(ambient.code, { path: TRUNK, width: 4, count: 2000 }, 3);
    expect(road.glyphs.length).toBe(2000);
    for (let i = 0; i < road.glyphs.length; i += 1) {
      const x = road.positions[i * 3];
      const y = road.positions[i * 3 + 1];
      const z = road.positions[i * 3 + 2];
      expect(distanceToPath([x, z], TRUNK)).toBeLessThanOrEqual(2 + F32);
      expect(Math.abs(y)).toBeLessThanOrEqual(0.15);
    }
  });

  it('writes the signposts’ words in white, so they read against the dark (Chris, 2026-11-10: "washed out")', () => {
    const signs = forkSigns(['business/', 'family/'], { at: [0, 0, -40] }, 1);
    const board = signs.glyphs.length - 2 * 11;
    expect(board).toBe('business/family/'.length);
    let words = 0;
    for (let i = 0; i < signs.glyphs.length; i += 1) {
      const [r, g, b, a] = signs.colors.subarray(i * 4, i * 4 + 4);
      if (signs.positions[i * 3 + 1] < 2) continue; // the posts
      words += 1;
      expect(Math.min(r, g, b), String.fromCharCode(signs.glyphs[i])).toBeGreaterThan(0.95);
      expect(a).toBe(1);
    }
    expect(words).toBe(board);
  });

  it('edges the road with a line of ember characters on both sides, evenly spaced (Chris, 2026-11-10)', () => {
    const edges = roadEdges(ambient.code, { path: TRUNK, width: 4, spacing: 0.35 }, 1);
    const length = 37;
    expect(edges.glyphs.length).toBe(2 * (Math.floor(length / 0.35) + 1));
    const allowed = charsIn(ambient.code);
    for (let i = 0; i < edges.glyphs.length; i += 1) {
      const x = edges.positions[i * 3];
      const z = edges.positions[i * 3 + 2];
      expect(Math.abs(distanceToPath([x, z], TRUNK) - 2)).toBeLessThanOrEqual(0.05 + F32);
      expect(allowed.has(String.fromCharCode(edges.glyphs[i]))).toBe(true);
      const [r, g, b] = edges.colors.subarray(i * 4, i * 4 + 3);
      expect([r, g, b].map((v) => Math.round(v * 255))).toEqual([0xf9, 0x73, 0x16]);
    }
  });

  it('puts the landmark sculpture on its screen rectangle', () => {
    const s = screenSculpture(underfire.code, { width: 6, height: 3.75, center: [-6, 1.8, -58], count: 1500 }, 2);
    for (let i = 0; i < s.glyphs.length; i += 1) {
      expect(Math.abs(s.positions[i * 3] - -6)).toBeLessThanOrEqual(3 + F32);
      expect(Math.abs(s.positions[i * 3 + 1] - 1.8)).toBeLessThanOrEqual(1.875 + F32);
      expect(Math.abs(s.positions[i * 3 + 2] - -58)).toBeLessThanOrEqual(0.3);
    }
  });

  it('gives every glyph an rgba colour with alpha in 0..1', () => {
    const road = codeRoad(ambient.code, { path: TRUNK, width: 4, count: 300 }, 4);
    expect(road.colors.length).toBe(road.glyphs.length * 4);
    for (const v of road.colors) expect(v >= 0 && v <= 1).toBe(true);
  });

  it('builds the whole stretch within each tier’s glyph budget, with every part present', () => {
    expect([budgetFor('low'), budgetFor('mid'), budgetFor('high')]).toEqual([12000, 24000, 40000]);
    for (const tier of /** @type {const} */ (['low', 'mid', 'high'])) {
      const world = buildWorld(tier, SOURCES, 1);
      const total = world.reduce((sum, part) => sum + part.shape.glyphs.length, 0);
      expect(total).toBeLessThanOrEqual(budgetFor(tier));
      expect(world.map((p) => p.name).sort()).toEqual([
        'business-edges',
        'business-road',
        'editor',
        'family-edges',
        'family-road',
        'landmark',
        'signs',
        'trunk-edges',
        'trunk-road',
      ]);
    }
  });
});

describe('the business road’s shapes (Code World W2.3)', () => {
  /** @type {[number, number, number]} */
  const sideways = [1, 0, 0];

  it('facing straight back, the sculpture and the slab are exactly today’s', () => {
    const options = { width: 6, height: 3.75, center: /** @type {[number, number, number]} */ ([-6, 1.8, -58]), count: 800 };
    const before = screenSculpture(underfire.code, options, 4);
    const after = screenSculpture(underfire.code, { ...options, facing: [0, 0, 1] }, 4);
    expect([...after.positions]).toEqual([...before.positions]);
    expect([...editorSlab(gate.code, 1, { facing: [0, 0, 1] }).positions]).toEqual([...editorSlab(gate.code, 1).positions]);
  });

  it('turned, every glyph lies in the landmark’s own plane, across its facing', () => {
    /** @type {[number, number, number]} */
    const center = [10, 2, -5];
    const shapes = [
      screenSculpture(underfire.code, { width: 6, height: 3.75, center, count: 800, facing: sideways }, 4),
      editorSlab(gate.code, 1, { center, facing: sideways }),
    ];
    for (const shape of shapes) {
      let spread = 0;
      for (let i = 0; i < shape.glyphs.length; i += 1) {
        const depth = shape.positions[i * 3] - center[0];
        expect(Math.abs(depth)).toBeLessThanOrEqual(0.21);
        spread = Math.max(spread, Math.abs(shape.positions[i * 3 + 2] - center[2]));
      }
      expect(spread).toBeGreaterThan(1);
    }
  });

  it('an unfinished slab ends in one ember cursor, and the caret follows the typing', () => {
    const code = 'ab\ncd';
    /** @type {[number, number, number]} */
    const center = [0, 0, 0];
    const slab = unfinishedSlab(code, { center, facing: [0, 0, 1] }, 1);
    expect(slab.glyphs.length).toBe(5);
    expect(slab.cursor).toBe(4);
    expect(String.fromCharCode(slab.glyphs[slab.cursor])).toBe('▌');
    const [r, g, b] = slab.colors.subarray(slab.cursor * 4, slab.cursor * 4 + 3);
    expect([r, g, b].map((c) => Math.round(c * 255))).toEqual([0xf9, 0x73, 0x16]);
    const first = [...slab.positions.subarray(0, 3)];
    slabCaret(code, 0, { center, facing: [0, 0, 1] }).forEach((v, i) => expect(v).toBeCloseTo(first[i], 5));
    const last = [...slab.positions.subarray(3 * 3, 3 * 3 + 3)];
    const end = slabCaret(code, code.length, { center, facing: [0, 0, 1] });
    expect(end[0]).toBeGreaterThan(last[0]);
    expect(end[1]).toBeCloseTo(last[1], 5);
    const sideCaret = slabCaret(code, 1, { center, facing: sideways });
    expect(sideCaret[0]).toBeCloseTo(0, 9);
  });

  it('builds the whole road within every tier’s budget, from real code only, a part per stop', () => {
    const stops = businessRoadStops();
    /** @type {Record<string, string>} */
    const stopSources = {};
    for (const stop of stops) {
      const excerpt = stop.excerptId ? getExcerpt(stop.excerptId) : null;
      if (excerpt && stop.excerptId) stopSources[stop.excerptId] = excerpt.code;
    }
    const layout = layoutRoad(stops, 'a', roadSizes(stops, stopSources));
    for (const tier of /** @type {const} */ (['low', 'mid', 'high'])) {
      const parts = buildRoadWorld(tier, { gate: gate.code, road: ambient.code, stops: stopSources }, 1, { stops, layout });
      const total = parts.reduce((sum, part) => sum + part.shape.glyphs.length, 0);
      expect(total).toBeLessThanOrEqual(budgetFor(tier));
      expect(parts.some((part) => part.name === 'landmark')).toBe(false);
      for (const stop of stops.filter((s) => s.kind !== 'commits')) {
        const part = parts.find((p) => p.stopId === stop.id);
        expect(part, stop.id).toBeDefined();
        const code = stopSources[/** @type {string} */ (stop.excerptId)];
        const allowed = new Set([...charsIn(code), '▌']);
        for (const c of charsOf(/** @type {NonNullable<typeof part>} */ (part).shape)) expect(allowed.has(c), `${stop.id}: ${c}`).toBe(true);
        if (stop.kind === 'product' || stop.kind === 'service') {
          expect(/** @type {NonNullable<typeof part>} */ (part).shape.glyphs.length).toBeGreaterThanOrEqual(400);
        }
      }
      const crew = parts.find((p) => p.stopId === 'crew-advisors');
      expect(crew?.cursor).toBe((crew?.shape.glyphs.length ?? 0) - 1);
      expect(parts.find((p) => p.name === 'commits')).toBeUndefined();
    }
  });
});

describe('passed landmarks show their picture (Code World R4)', () => {
  const stops = businessRoadStops();
  /** @type {Record<string, string>} */
  const stopSources = {};
  for (const stop of stops) {
    const excerpt = stop.excerptId ? getExcerpt(stop.excerptId) : null;
    if (excerpt && stop.excerptId) stopSources[stop.excerptId] = excerpt.code;
  }
  const layout = layoutRoad(stops, 'a', roadSizes(stops, stopSources));
  const image = { data: new Uint8ClampedArray(320 * 200 * 4).fill(200), width: 320, height: 200 };
  /** @type {Record<string, typeof image>} */
  const landed = {};
  for (const stop of stops) if (stop.kind === 'product' || stop.kind === 'service') landed[stop.id] = image;

  it('tags each screen landmark’s sculpture and picture with its place on the road, within every tier’s budget', () => {
    for (const tier of /** @type {const} */ (['low', 'mid', 'high'])) {
      const parts = buildRoadWorld(tier, { gate: gate.code, road: ambient.code, stops: stopSources }, 1, { stops, layout }, landed);
      expect(parts.reduce((sum, part) => sum + part.shape.glyphs.length, 0)).toBeLessThanOrEqual(budgetFor(tier));
      layout.landmarks.forEach((landmark, k) => {
        const sculpture = parts.find((p) => p.name === `landmark:${landmark.stopId}`);
        const picture = parts.find((p) => p.name === `landed:${landmark.stopId}`);
        if (landmark.kind === 'product' || landmark.kind === 'service') {
          expect(sculpture?.shape.tag).toBe(k + 1);
          expect(picture?.shape.tag).toBe(-(k + 1));
          expect(picture?.shape.glyphs.length).toBeGreaterThanOrEqual(150);
          const code = stopSources[/** @type {string} */ (stops.find((s) => s.id === landmark.stopId)?.excerptId)];
          for (const c of charsOf(/** @type {NonNullable<typeof picture>} */ (picture).shape)) expect(code.includes(c)).toBe(true);
        } else {
          expect(picture).toBeUndefined();
        }
      });
    }
  });

  it('without pictures to show, builds exactly as before', () => {
    const before = buildRoadWorld('mid', { gate: gate.code, road: ambient.code, stops: stopSources }, 1, { stops, layout });
    expect(before.some((p) => p.name.startsWith('landed:'))).toBe(false);
  });
});

describe('the road’s edges, side paths and stands (Code World R5)', () => {
  const stops = businessRoadStops();
  /** @type {Record<string, string>} */
  const stopSources = {};
  for (const stop of stops) {
    const excerpt = stop.excerptId ? getExcerpt(stop.excerptId) : null;
    if (excerpt && stop.excerptId) stopSources[stop.excerptId] = excerpt.code;
  }
  const layout = layoutRoad(stops, 'a', roadSizes(stops, stopSources));
  const sources = { gate: gate.code, road: ambient.code, stops: stopSources };
  const parts = buildRoadWorld('mid', sources, 1, { stops, layout });
  const part = (/** @type {string} */ name) => {
    const found = parts.find((p) => p.name === name);
    if (!found) throw new Error(`No part ${name}.`);
    return found.shape;
  };
  /** @param {import('../src/world/shapes.js').Shape} shape @param {number} i @returns {[number, number]} */
  const ground = (shape, i) => [shape.positions[i * 3], shape.positions[i * 3 + 2]];
  const onwardPath = /** @type {Array<[number, number]>} */ (layout.path.slice(2));
  const EMBER_R = 0xf9 / 255;

  it('keeps every edge glyph on its edge line, commits included', () => {
    const edges = part('onward-edges');
    for (let i = 0; i < edges.glyphs.length; i += 1) expect(Math.abs(distanceToPath(ground(edges, i), onwardPath) - 1.6)).toBeLessThanOrEqual(0.05);
  });

  it('lights the edge at each of How I work’s commits: ember, full alpha, larger', () => {
    const edges = part('onward-edges');
    expect(edges.sizes).toBeDefined();
    const sizes = /** @type {Float32Array} */ (edges.sizes);
    for (const point of layout.commits) {
      let lit = 0;
      for (let i = 0; i < edges.glyphs.length; i += 1) {
        const [x, z] = ground(edges, i);
        const near = Math.hypot(x - point[0], z - point[1]) <= 0.8;
        if (near) {
          expect(edges.colors[i * 4]).toBeCloseTo(EMBER_R, 5);
          expect(edges.colors[i * 4 + 3]).toBe(1);
          expect(sizes[i]).toBeCloseTo(edges.size * 1.6, 5);
          lit += 1;
        }
      }
      expect(lit).toBeGreaterThanOrEqual(4);
    }
  });

  it('carries each edge evenly from the branch onto the road: no gap, no double', () => {
    const business = part('business-edges');
    const onward = part('onward-edges');
    const end = layout.origin;
    const [dx, dz] = layout.direction;
    for (const side of [-1, 1]) {
      /** @type {number[]} */
      const along = [];
      for (const shape of [business, onward]) {
        for (let i = 0; i < shape.glyphs.length; i += 1) {
          const [x, z] = ground(shape, i);
          const rel = [x - end[0], z - end[1]];
          if (Math.hypot(rel[0], rel[1]) > 3) continue;
          // Which side: the cross product of the road's direction and the offset.
          if (Math.sign(dx * rel[1] - dz * rel[0]) !== side) continue;
          along.push(rel[0] * dx + rel[1] * dz);
        }
      }
      along.sort((a, b) => a - b);
      expect(along.length).toBeGreaterThan(8);
      for (let i = 1; i < along.length; i += 1) {
        expect(along[i] - along[i - 1]).toBeGreaterThanOrEqual(0.35 / 2);
        expect(along[i] - along[i - 1]).toBeLessThanOrEqual(0.35 * 1.5);
      }
    }
  });

  it('draws each side path as road, its edges starting at the main road’s edge and never inside it', () => {
    for (const spur of spurPaths(layout)) {
      const scatter = part(`spur-road:${spur.stopId}`);
      const edges = part(`spur-edges:${spur.stopId}`);
      expect(scatter.glyphs.length).toBeGreaterThan(0);
      for (let i = 0; i < scatter.glyphs.length; i += 1) expect(distanceToPath(ground(scatter, i), spur.path)).toBeLessThanOrEqual(0.8 + F32);
      const perSide = edges.glyphs.length / 2;
      for (const first of [0, perSide]) expect(Math.abs(distanceToPath(ground(edges, first), layout.path) - 1.6)).toBeLessThanOrEqual(0.35);
      for (let i = 0; i < edges.glyphs.length; i += 1) expect(distanceToPath(ground(edges, i), layout.path)).toBeGreaterThanOrEqual(1.6 - 0.05);
    }
  });

  it('opens the main road’s edge where each side path joins it', () => {
    const edges = part('onward-edges');
    for (const spur of spurPaths(layout)) {
      const [from, to] = spur.path;
      const length = Math.hypot(to[0] - from[0], to[1] - from[1]);
      const mouth = [from[0] + ((to[0] - from[0]) / length) * 1.6, from[1] + ((to[1] - from[1]) / length) * 1.6];
      for (let i = 0; i < edges.glyphs.length; i += 1) {
        const [x, z] = ground(edges, i);
        expect(Math.hypot(x - mouth[0], z - mouth[1])).toBeGreaterThanOrEqual(0.8 - 0.05);
      }
    }
  });

  it('stands every landmark on a double post with the road’s code flowing between, its own part', () => {
    const allowed = charsIn(ambient.code);
    for (const landmark of layout.landmarks) {
      const stand = landmarkStand(ambient.code, landmark, 3);
      const flow = stand.flow;
      expect(flow).toHaveLength(stand.glyphs.length);
      const right = [landmark.facing[2], -landmark.facing[0]];
      const bottom = landmark.center[1] - landmark.height / 2;
      /** @type {Map<number, number[]>} */
      const posts = new Map();
      /** @type {Map<number, number[]>} */
      const columns = new Map();
      for (let i = 0; i < stand.glyphs.length; i += 1) {
        const x = stand.positions[i * 3];
        const y = stand.positions[i * 3 + 1];
        const z = stand.positions[i * 3 + 2];
        const across = (x - landmark.center[0]) * right[0] + (z - landmark.center[2]) * right[1];
        const depth = (x - landmark.center[0]) * landmark.facing[0] + (z - landmark.center[2]) * landmark.facing[2];
        expect(Math.abs(depth)).toBeLessThanOrEqual(0.02);
        expect(allowed.has(String.fromCharCode(stand.glyphs[i]))).toBe(true);
        expect(y).toBeGreaterThanOrEqual(-F32);
        expect(y).toBeLessThanOrEqual(bottom + F32);
        if (flow[i] === 0) {
          const key = Math.round(across * 100);
          posts.set(key, [...(posts.get(key) ?? []), y]);
          expect(stand.colors[i * 4]).toBeCloseTo(EMBER_R, 5);
          expect(Math.abs(Math.abs(across) - 0.35)).toBeLessThanOrEqual(0.02);
        } else {
          expect(flow[i]).toBeCloseTo(bottom, 5);
          expect(Math.abs(across)).toBeLessThan(0.35);
          const key = Math.round(across * 100);
          columns.set(key, [...(columns.get(key) ?? []), y]);
        }
      }
      expect([...posts.keys()].sort((a, b) => a - b)).toEqual([-35, 35]);
      for (const ys of posts.values()) {
        expect(Math.min(...ys)).toBeLessThanOrEqual(0.05);
        expect(bottom - Math.max(...ys)).toBeLessThanOrEqual(SLAB_METRICS.lineHeight);
      }
      expect([...columns.keys()].sort((a, b) => a - b)).toEqual([-12, 0, 12]);
    }
  });

  it('builds a stand per landmark, outside every landmark’s own part', () => {
    for (const landmark of layout.landmarks) {
      const stand = parts.find((p) => p.name === `stand:${landmark.stopId}`);
      expect(stand, landmark.stopId).toBeDefined();
      expect(stand?.stopId).toBeUndefined();
      expect(stand?.shape.flow).toBeDefined();
    }
  });

  it('keeps every tier within budget with the side paths and stands, screens still full', () => {
    for (const tier of /** @type {const} */ (['low', 'mid', 'high'])) {
      const built = buildRoadWorld(tier, sources, 1, { stops, layout });
      expect(built.reduce((sum, p) => sum + p.shape.glyphs.length, 0)).toBeLessThanOrEqual(budgetFor(tier));
      for (const landmark of layout.landmarks) {
        if (landmark.kind !== 'product' && landmark.kind !== 'service') continue;
        expect(built.find((p) => p.name === `landmark:${landmark.stopId}`)?.shape.glyphs.length).toBeGreaterThanOrEqual(400);
      }
    }
  });
});
