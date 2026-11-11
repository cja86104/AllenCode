// @ts-check
import { describe, expect, it } from 'vitest';
import { budgetFor, buildWorld, codeRoad, distanceToPath, editorSlab, forkSigns, roadEdges, screenSculpture } from '../src/world/shapes.js';
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
