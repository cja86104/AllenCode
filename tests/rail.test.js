// @ts-check
import { describe, expect, it } from 'vitest';
import { railStops } from '../src/world/rail.js';
import { spreadMarks } from '../src/world/railMarks.js';
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

describe('where a jump to each stop lands (2026-11-26, Phase 2)', () => {
  const route = routeFor('a');
  const stopIds = route.road?.stops.map((s) => s.id) ?? [];
  /** A measured business road: the gate, the opening, a rest per stop with road between, the end; between pixels, as measured. @type {TrackSection[]} */
  const sections = [
    { kind: 'gate', from: 0, to: 800.25 },
    { kind: 'opening', from: 800.25, to: 8000.5 },
    ...stopIds.map((stopId, i) => /** @type {TrackSection} */ ({ kind: 'rest', stopId, from: 10000.0625 + i * 3000, to: 11000.0625 + i * 3000 })),
  ];
  const last = sections[sections.length - 1];
  sections.push({ kind: 'end', from: last.to + 1500, to: last.to + 2300 });
  const end = sections[sections.length - 1];
  const stops = railStops(route, sections);

  it('every stop has an id and a place to land, inside the page, in order', () => {
    for (const stop of stops) {
      expect(stop.id, stop.name).toMatch(/\S/);
      expect(stop.y, stop.name).toBeGreaterThanOrEqual(0);
      expect(stop.y, stop.name).toBeLessThanOrEqual(Math.ceil(end.to));
    }
    for (let i = 1; i < stops.length; i += 1) expect(stops[i].y, stops[i].name).toBeGreaterThanOrEqual(stops[i - 1].y);
  });

  it('the empty file lands at the top, a road stop at the start of its rest, shipped on the brief', () => {
    expect(stops[0]).toMatchObject({ id: 'empty-file', y: 0 });
    // On the first whole pixel inside the rest: a page moved to the pixel before its start is still on the road.
    for (const section of sections.filter((s) => s.kind === 'rest')) {
      const stop = stops.find((s) => s.id === section.stopId);
      expect(Number.isInteger(stop?.y), section.stopId).toBe(true);
      expect(stop?.y, section.stopId).toBeGreaterThanOrEqual(section.from);
      expect(stop?.y, section.stopId).toBeLessThan(section.from + 1);
    }
    expect(stops[stops.length - 1]).toMatchObject({ id: 'brief', name: 'Shipped', y: Math.ceil(end.to) });
  });

  it('the opening’s stops land where the rail says they start', () => {
    const total = end.to;
    for (const id of ['into-the-code', 'the-fork', 'business-road']) {
      const stop = stops.find((s) => s.id === id);
      expect(stop, id).toBeDefined();
      expect(Math.abs((stop?.y ?? 0) - (stop?.from ?? 0) * total), id).toBeLessThan(1);
    }
  });
});

describe('spreadMarks: the rail’s marks for a fine pointer, at least a target apart (WCAG 2.2, 24 px)', () => {
  it('keeps marks where they are when they are already apart', () => {
    expect(spreadMarks([0, 0.5, 1], 400, 24)).toEqual([0, 200, 400]);
  });

  it('eases crowded marks apart, in order, within the line', () => {
    const marks = spreadMarks([0, 0.01, 0.02, 0.5, 0.99, 1], 400, 24);
    for (let i = 1; i < marks.length; i += 1) expect(marks[i] - marks[i - 1]).toBeGreaterThanOrEqual(24 - 1e-9);
    expect(marks[0]).toBeGreaterThanOrEqual(0);
    expect(marks[marks.length - 1]).toBeLessThanOrEqual(400);
    expect(marks[3]).toBeCloseTo(200, 6);
  });

  it('shares a line too short for them evenly', () => {
    const marks = spreadMarks([0, 0.1, 0.2, 0.3, 0.4], 40, 24);
    expect(marks).toEqual([0, 10, 20, 30, 40]);
  });
});
