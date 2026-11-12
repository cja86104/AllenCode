// @ts-check
import { describe, expect, it, vi } from 'vitest';
import { createWorldFrame } from '../src/world/worldFrame.js';
import { roadGlyphs, routeFor } from '../src/world/route.js';
import { CURSOR } from '../src/world/shapes.js';

/** @returns {import('../src/world/worldFrame.js').WorldFrame} */
const frame = (progress = 0.5) => ({ progress, handover: null, typed: null, commits: 0 });

describe('worldFrame: the canvas tells the journey where things are (Code World W2.4)', () => {
  it('delivers each published frame to its listeners, until they leave', () => {
    const bus = createWorldFrame();
    const listener = vi.fn();
    const leave = bus.subscribe(listener);
    bus.publish(frame(0.1));
    expect(listener).toHaveBeenCalledWith(frame(0.1));
    leave();
    bus.publish(frame(0.2));
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('keeps the last frame, so a host that mounts mid-journey can place its screen at once', () => {
    const bus = createWorldFrame();
    expect(bus.latest()).toBeNull();
    bus.publish(frame(0.3));
    bus.publish(frame(0.4));
    expect(bus.latest()).toEqual(frame(0.4));
  });

  it('is free with no listeners', () => {
    const bus = createWorldFrame();
    expect(() => bus.publish(frame())).not.toThrow();
  });
});

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
