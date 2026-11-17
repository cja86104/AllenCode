// @ts-check
import { describe, expect, it } from 'vitest';
import { stretchFor } from '../src/world/stretches.js';
import { roadSizes } from '../src/world/roadLayout.js';
import { layoutStretch } from '../src/world/stretchLayout.js';
import { buildStretchWorld } from '../src/world/stretchShapes.js';
import { budgetFor } from '../src/world/shapes.js';
import ambient from '../src/content/excerpts/ambient.js';

const PATHS = ['/products', '/products/underfire-ai', '/products/crew-advisors', '/services', '/templates', '/about', '/contact'];
const TIERS = /** @type {const} */ (['low', 'mid', 'high']);

/** @param {string} path @param {'low' | 'mid' | 'high'} tier @param {Record<string, { data: Uint8ClampedArray, width: number, height: number }>} [landed] */
function build(path, tier, landed) {
  const stretch = stretchFor(path);
  if (!stretch) throw new Error(`no stretch for ${path}`);
  const layout = layoutStretch(stretch.stops, roadSizes(stretch.stops, stretch.sources), { width: 1440, height: 900 });
  return { stretch, layout, parts: buildStretchWorld(tier, { road: ambient.code, stops: stretch.sources }, 1, { stops: stretch.stops, layout }, landed) };
}

/** A plain grey picture, as a read screen. @param {number} width @param {number} height */
function picture(width, height) {
  const data = new Uint8ClampedArray(width * height * 4).fill(128);
  return { data, width, height };
}

describe('a stretch’s world (Code World W5a)', () => {
  it('stays within every tier’s budget on every page, with a landmark and a stand for each stop', () => {
    for (const tier of TIERS) {
      for (const path of PATHS) {
        const { stretch, parts } = build(path, tier, Object.fromEntries(stretchFor(path)?.stops.map((s) => [s.id, picture(320, 200)]) ?? []));
        const total = parts.reduce((sum, part) => sum + part.shape.glyphs.length, 0);
        expect(total, `${tier} ${path}`).toBeLessThanOrEqual(budgetFor(tier));
        for (const stop of stretch.stops) {
          expect(parts.filter((p) => p.name === `landmark:${stop.id}`)).toHaveLength(1);
          expect(parts.filter((p) => p.name === `stand:${stop.id}`)).toHaveLength(1);
        }
        expect(parts.find((p) => p.name === 'road')?.shape.glyphs.length).toBeGreaterThan(0);
        expect(parts.find((p) => p.name === 'edges')?.shape.glyphs.length).toBeGreaterThan(0);
      }
    }
  });

  it('draws Crew Advisors unfinished with its cursor, and the empty file and the audit as slabs of their code', () => {
    const crew = build('/products', 'mid').parts.find((p) => p.name === 'landmark:crew-advisors');
    expect(crew?.cursor).toBeGreaterThan(0);
    const contact = build('/contact', 'mid');
    const gateCode = contact.stretch.sources.gate;
    const slab = contact.parts.find((p) => p.name === 'landmark:contact');
    expect(slab?.shape.glyphs.length).toBe([...gateCode].filter((c) => c.trim() !== '').length);
    const audit = build('/services', 'mid').parts.find((p) => p.name === 'landmark:technical-audits');
    expect(audit?.shape.tag ?? 0).toBe(0);
  });

  it('tags a screen landmark by its place on the road and its picture by minus that, once read', () => {
    const { stretch, parts } = build('/products', 'mid', { 'my-teachers-toolbox': picture(320, 200) });
    const place = stretch.stops.findIndex((s) => s.id === 'my-teachers-toolbox') + 1;
    expect(parts.find((p) => p.name === 'landmark:my-teachers-toolbox')?.shape.tag).toBe(place);
    expect(parts.find((p) => p.name === 'landed:my-teachers-toolbox')?.shape.tag).toBe(-place);
    // Without its picture, a landmark is untagged code.
    expect(parts.find((p) => p.name === 'landmark:underfire-ai')?.shape.tag ?? 0).toBe(0);
    expect(parts.some((p) => p.name === 'landed:underfire-ai')).toBe(false);
  });
});
