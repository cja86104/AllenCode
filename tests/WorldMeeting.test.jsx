// @ts-check
import { act, render } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import WorldRoadChapters from '../src/scenes/WorldRoadChapters.jsx';
import JourneyRail from '../src/world/JourneyRail.jsx';
import { railStops } from '../src/world/rail.js';
import { routeFor } from '../src/world/route.js';
import { fieldBus } from '../src/field/fieldBus.js';

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
});
afterEach(() => {
  vi.unstubAllGlobals();
  fieldBus.set({ mode: 'pending', transform: null, transformProgress: 0 });
});

describe('where the roads meet, on the page (Code World W4.4)', () => {
  for (const door of /** @type {const} */ (['a', 'b'])) {
    it(`door ${door}: after its road, the workshop (the builder) after a long stretch of road, then your idea held while in view`, () => {
      fieldBus.set({ mode: 'webgl' });
      render(
        <MemoryRouter>
          <WorldRoadChapters door={door} includeDrafts={false} />
        </MemoryRouter>,
      );
      const stops = [...document.querySelectorAll('[data-world-segment="rest"][data-world-stop]')].map((el) => el.getAttribute('data-world-stop'));
      expect(stops.slice(-2)).toEqual(['workshop', 'your-idea']);
      const workshop = /** @type {HTMLElement} */ (document.querySelector('[data-world-stop="workshop"]'));
      expect(workshop.querySelector('[data-chapter="builder"] [data-world-target]')).not.toBeNull();
      const road = /** @type {HTMLElement} */ (workshop.previousElementSibling);
      expect(road.getAttribute('aria-hidden')).toBe('true');
      expect(road.style.height).toBe('240vh');
      const idea = /** @type {HTMLElement} */ (document.querySelector('[data-world-stop="your-idea"]'));
      expect(idea.dataset.worldHold).toBe('visible');
      expect(idea.querySelector('[data-chapter="idea"] [data-sketch][data-world-target]')).not.toBeNull();
    });
  }
});

describe('the journey rail (Code World W4.4)', () => {
  it('lists the home page’s stops by where each starts, from the empty file to shipped at the brief', () => {
    const route = routeFor('a');
    const h = 800;
    /** @type {import('../src/world/worldTrack.js').TrackSection[]} */
    const sections = [
      { kind: 'gate', from: 0, to: 1.8 * h },
      { kind: 'opening', from: 2.8 * h, to: 9.6 * h },
      ...(route.road?.stops ?? []).map((stop, k) => ({ kind: /** @type {const} */ ('rest'), stopId: stop.id, from: (11 + 3 * k) * h, to: (12 + 3 * k) * h })),
    ];
    const brief = (11 + 3 * (route.road?.stops.length ?? 0)) * h;
    sections.push({ kind: 'end', from: brief - h, to: brief });
    const stops = railStops(route, sections);
    expect(stops[0]).toEqual({ name: 'Empty file', from: 0 });
    expect(stops.map((s) => s.name)).toEqual([
      'Empty file',
      'Into the code',
      'The fork',
      'business/',
      ...(route.road?.stops ?? []).map((s) => s.name),
      'Shipped',
    ]);
    // Shipped as the brief arrives: three quarters of the way through the world's fade before it.
    expect(stops[stops.length - 1].from).toBeCloseTo((brief - 0.25 * h) / brief, 9);
    for (let i = 1; i < stops.length; i += 1) expect(stops[i].from).toBeGreaterThanOrEqual(stops[i - 1].from);
    const workshop = stops.find((s) => s.name === 'The workshop');
    expect(workshop?.from).toBeCloseTo((sections.find((s) => s.stopId === 'workshop')?.from ?? 0) / brief, 9);
  });

  it('shows the lab’s rail: the stops, the current one named, the marker where the visitor is', () => {
    let progress = 0.55;
    const frames = /** @type {FrameRequestCallback[]} */ ([]);
    vi.stubGlobal('requestAnimationFrame', (/** @type {FrameRequestCallback} */ cb) => frames.push(cb));
    vi.stubGlobal('cancelAnimationFrame', () => {});
    const stops = [
      { name: 'Empty file', from: 0 },
      { name: 'The workshop', from: 0.5 },
      { name: 'Shipped', from: 1 },
    ];
    render(<JourneyRail stops={stops} getProgress={() => progress} />);
    act(() => frames.shift()?.(0));
    const rail = /** @type {HTMLElement} */ (document.querySelector('nav[data-rail][aria-label="Journey"]'));
    expect(rail).not.toBeNull();
    expect(rail.querySelector('[aria-current="step"]')?.textContent).toBe('The workshop');
    expect(parseFloat(/** @type {HTMLElement} */ (rail.querySelector('[data-rail-marker]')).style.top)).toBeCloseTo(55, 6);
    progress = 1;
    act(() => frames.shift()?.(16));
    expect(rail.querySelector('[aria-current="step"]')?.textContent).toBe('Shipped');
  });
});

describe('the page between stops (Chris, 2026-11-16: the business road three times as long)', () => {
  for (const [door, height] of /** @type {const} */ ([['a', '240vh'], ['b', '240vh']])) {
    it(`door ${door}: ${height} of road before each of its road's chapters`, () => {
      fieldBus.set({ mode: 'webgl' });
      render(
        <MemoryRouter>
          <WorldRoadChapters door={door} includeDrafts={false} />
        </MemoryRouter>,
      );
      const rests = [...document.querySelectorAll('[data-world-segment="rest"][data-world-stop]')].filter((el) => !['workshop', 'your-idea'].includes(String(el.getAttribute('data-world-stop'))));
      expect(rests.length).toBeGreaterThan(4);
      for (const rest of rests) {
        const before = /** @type {HTMLElement} */ (rest.previousElementSibling);
        expect(before.getAttribute('aria-hidden')).toBe('true');
        expect(before.style.height, String(rest.getAttribute('data-world-stop'))).toBe(height);
      }
    });
  }
});

