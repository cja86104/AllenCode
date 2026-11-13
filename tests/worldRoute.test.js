// @ts-check
import { describe, expect, it } from 'vitest';
import { roadGlyphs, routeFor } from '../src/world/route.js';
import { CURSOR } from '../src/world/shapes.js';

describe('routeFor: one journey per door, shared by the canvas and the page (Code World W2.4)', () => {
  it('builds the business road for door a, once', () => {
    const route = routeFor('a');
    expect(routeFor('a')).toBe(route);
    expect(route.road?.door).toBe('a');
    expect(route.road?.stops).toHaveLength(9);
    expect(route.journey.screens).toBeCloseTo(20.3, 9);
    expect(route.journey.landmarks).toHaveLength(8);
    for (const stop of route.road?.stops ?? []) if (stop.excerptId) expect(typeof route.road?.sources[stop.excerptId]).toBe('string');
  });

  it('leaves the fork and the family road as W1 had them', () => {
    expect(routeFor(null).road).toBeNull();
    expect(routeFor('b').road).toBeNull();
    expect(routeFor(null).journey.screens).toBeCloseTo(4.4, 9);
    expect(routeFor('b').journey.screens).toBeCloseTo(6.8, 9);
  });

  it('gives the atlas every character the road may draw, and the cursor', () => {
    const glyphs = roadGlyphs();
    expect(glyphs).toContain(CURSOR);
    for (const code of Object.values(routeFor('a').road?.sources ?? {})) for (const c of code) if (c.trim()) expect(glyphs).toContain(c);
  });
});
