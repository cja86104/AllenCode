// @ts-check
import { describe, expect, it } from 'vitest';
import { railStops } from '../src/world/rail.js';
import { routeFor } from '../src/world/route.js';
import { ROAD_NAMES } from '../src/world/roadNames.js';

/** @typedef {import('../src/world/worldTrack.js').TrackSection} TrackSection */

/** A measured page: the gate, the opening, then the end, in scroll pixels. @type {TrackSection[]} */
const SECTIONS = [
  { kind: 'gate', from: 0, to: 800 },
  { kind: 'opening', from: 800, to: 8000 },
  { kind: 'end', from: 8000, to: 9000 },
];

describe('railStops (Code World W4)', () => {
  it('names each road as the world does (roadNames.js), not the fork’s files', () => {
    const business = railStops(routeFor('a'), SECTIONS).map((stop) => stop.name);
    const custom = railStops(routeFor('b'), SECTIONS).map((stop) => stop.name);
    expect(business).toContain(ROAD_NAMES.a);
    expect(custom).toContain(ROAD_NAMES.b);
    expect(ROAD_NAMES.b).toBe('templates/custom/');
    expect(custom).not.toContain('family/');
  });

  it('before a road is taken, names no road', () => {
    const names = railStops(routeFor(null), SECTIONS).map((stop) => stop.name);
    expect(names).not.toContain(ROAD_NAMES.a);
    expect(names).not.toContain(ROAD_NAMES.b);
  });
});
