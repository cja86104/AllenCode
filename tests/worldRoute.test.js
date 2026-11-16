// @ts-check
import { describe, expect, it } from 'vitest';
import { roadGlyphs, routeFor } from '../src/world/route.js';
import { CURSOR } from '../src/world/shapes.js';
import { familyRoadStops } from '../src/world/roads.js';

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

  it('builds the family road for door b, once, and the atlas covers both roads (W3.2)', () => {
    const route = routeFor('b');
    expect(route.road?.door).toBe('b');
    expect(route.road?.stops.map((s) => s.id)).toEqual(familyRoadStops().map((s) => s.id));
    expect(routeFor('b')).toBe(route);
    expect(routeFor(null).road).toBeNull();
    expect(routeFor(null).journey.screens).toBeCloseTo(4.4, 9);
    expect(route.journey.landmarks).toHaveLength(6);
    const glyphs = roadGlyphs();
    for (const code of Object.values(route.road?.sources ?? {})) for (const c of code) if (c.trim()) expect(glyphs).toContain(c);
  });

  it('gives the atlas every character the road may draw, and the cursor', () => {
    const glyphs = roadGlyphs();
    expect(glyphs).toContain(CURSOR);
    for (const code of Object.values(routeFor('a').road?.sources ?? {})) for (const c of code) if (c.trim()) expect(glyphs).toContain(c);
  });
});
