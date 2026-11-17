// @ts-check
import { describe, expect, it } from 'vitest';
import { roadGlyphs, routeFor } from '../src/world/route.js';
import { CURSOR } from '../src/world/shapes.js';
import { familyRoadStops, MEETING_STOPS } from '../src/world/roads.js';

describe('routeFor: one journey per door, shared by the canvas and the page (Code World W2.4)', () => {
  it('builds the business road for door a, once', () => {
    const route = routeFor('a');
    expect(routeFor('a')).toBe(route);
    expect(route.road?.door).toBe('a');
    // W2's nine stops, and the two services added on 2026-11-16.
    expect(route.road?.stops).toHaveLength(11 + MEETING_STOPS.length);
    // The opening's 6.8 screens, 4.5 for each of the eleven business stops (three steps apart, 2026-11-16),
    // and 1.5 for each stop where the roads meet (W4).
    expect(route.journey.screens).toBeCloseTo(6.8 + 11 * 4.5 + 1.5 * MEETING_STOPS.length, 9);
    expect(route.journey.landmarks).toHaveLength(10 + MEETING_STOPS.length);
    for (const stop of route.road?.stops ?? []) if (stop.excerptId) expect(typeof route.road?.sources[stop.excerptId]).toBe('string');
  });

  it('builds the family road for door b, once, and the atlas covers both roads (W3.2)', () => {
    const route = routeFor('b');
    expect(route.road?.door).toBe('b');
    expect(route.road?.stops.map((s) => s.id)).toEqual([...familyRoadStops(), ...MEETING_STOPS].map((s) => s.id));
    expect(routeFor('b')).toBe(route);
    expect(routeFor(null).road).toBeNull();
    expect(routeFor(null).journey.screens).toBeCloseTo(4.4, 9);
    expect(route.journey.landmarks).toHaveLength(6 + MEETING_STOPS.length);
    const glyphs = roadGlyphs();
    for (const code of Object.values(route.road?.sources ?? {})) for (const c of code) if (c.trim()) expect(glyphs).toContain(c);
  });

  it('gives the atlas every character the road may draw, and the cursor', () => {
    const glyphs = roadGlyphs();
    expect(glyphs).toContain(CURSOR);
    for (const code of Object.values(routeFor('a').road?.sources ?? {})) for (const c of code) if (c.trim()) expect(glyphs).toContain(c);
  });
});

describe('both roads end where the roads meet (Code World W4.2)', () => {
  it('appends the workshop and your idea to both doors’ roads, with the builder’s code', () => {
    for (const door of /** @type {const} */ (['a', 'b'])) {
      const road = routeFor(door).road;
      expect(road?.stops.slice(-2).map((s) => s.id)).toEqual(['workshop', 'your-idea']);
      expect(typeof road?.sources.builder).toBe('string');
      expect(road?.layout.landmarks.slice(-2).map((l) => l.stopId)).toEqual(['workshop', 'your-idea']);
      expect(road?.layout.other.length).toBeGreaterThan(1);
    }
  });
});
