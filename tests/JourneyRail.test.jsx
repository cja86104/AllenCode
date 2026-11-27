// @ts-check
import { act, fireEvent, render, screen } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import JourneyRail from '../src/world/JourneyRail.jsx';
import { setJumpHandler } from '../src/world/jump.js';

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  setJumpHandler(null);
});

/** @type {import('../src/world/rail.js').RailStop[]} */
const STOPS = [
  { id: 'empty-file', name: 'Empty file', from: 0, y: 0 },
  { id: 'into-the-code', name: 'Into the code', from: 0.01, y: 900 },
  { id: 'the-fork', name: 'The fork', from: 0.02, y: 1800 },
  { id: 'mvp-sprints', name: 'MVP Sprints', from: 0.4, y: 36000 },
  { id: 'brief', name: 'Shipped', from: 1, y: 90000 },
];

/**
 * The rail at a given progress, after its first frame, on a fine pointer (a mouse or trackpad) or not.
 * @param {number} progress
 * @param {{ fine?: boolean, onJump?: (stop: import('../src/world/rail.js').RailStop) => void }} [opts]
 */
function railAt(progress, { fine = false, onJump } = {}) {
  /** @type {FrameRequestCallback[]} */
  const frames = [];
  vi.stubGlobal('requestAnimationFrame', (/** @type {FrameRequestCallback} */ cb) => frames.push(cb));
  vi.stubGlobal('cancelAnimationFrame', () => {});
  vi.stubGlobal('matchMedia', (/** @type {string} */ query) => ({
    matches: fine && query === '(pointer: fine)',
    media: query,
    addEventListener() {},
    removeEventListener() {},
  }));
  // jsdom lays nothing out: the rail's line is 400 px tall here.
  vi.spyOn(HTMLElement.prototype, 'clientHeight', 'get').mockReturnValue(400);
  render(<JourneyRail stops={STOPS} getProgress={() => progress} onJump={onJump} />);
  act(() => frames.shift()?.(0));
  const rail = /** @type {HTMLElement} */ (document.querySelector('nav[data-rail]'));
  const ends = /** @type {HTMLElement[]} */ ([...rail.querySelectorAll(':scope > span')]);
  /** Words a sighted visitor reads on the rail: its labels, not the screen-reader-only names or the hover labels. */
  const seen = [...rail.querySelectorAll('span')]
    .filter((el) => !el.classList.contains('sr-only') && !el.closest('[data-rail-marks]') && el.textContent)
    .map((el) => (el.textContent ?? '').toLowerCase());
  return { rail, top: ends[0], bottom: ends[ends.length - 1], seen, current: rail.querySelector('ol [aria-current="step"]') };
}

describe('JourneyRail: the ends name their own stops (2026-11-26: EMPTY FILE twice on the gate)', () => {
  it('at the empty file: "empty file" is read once, at the top end, in the current stop’s colour', () => {
    const { top, bottom, seen, current } = railAt(0);
    expect(seen.filter((text) => text === 'empty file')).toHaveLength(1);
    expect(top).toHaveClass('text-ember');
    expect(bottom).not.toHaveClass('text-ember');
    // Still named for screen readers as the current step.
    expect(current?.textContent).toBe('Empty file');
  });

  it('between the ends: the stop is named down the line, and neither end is lit', () => {
    const { top, bottom, seen, current } = railAt(0.45);
    expect(seen).toContain('mvp sprints');
    expect(top).not.toHaveClass('text-ember');
    expect(bottom).not.toHaveClass('text-ember');
    expect(current?.textContent).toBe('MVP Sprints');
  });

  it('at shipped: "shipped" is read once, at the bottom end, lit', () => {
    const { top, bottom, seen, current } = railAt(1);
    expect(seen.filter((text) => text === 'shipped')).toHaveLength(1);
    expect(bottom).toHaveClass('text-ember');
    expect(top).not.toHaveClass('text-ember');
    expect(current?.textContent).toBe('Shipped');
  });
});

describe('JourneyRail: jumps (2026-11-26, Phase 2: "keep the length but add the jumps")', () => {
  it('on a touch screen the line has no marks to aim at: the Chapters list is the way', () => {
    const { rail } = railAt(0.45);
    expect(rail.querySelectorAll('[data-rail-mark]')).toHaveLength(0);
    expect(screen.getByRole('button', { name: 'Chapters' })).toHaveAttribute('aria-expanded', 'false');
  });

  it('on a fine pointer each stop’s mark jumps to it; the marks stay out of the tab order and away from screen readers, at least 24 px apart', () => {
    const onJump = vi.fn();
    const { rail } = railAt(0.45, { fine: true, onJump });
    const layer = /** @type {HTMLElement} */ (rail.querySelector('[data-rail-marks]'));
    expect(layer).toHaveAttribute('aria-hidden', 'true');
    const marks = /** @type {HTMLButtonElement[]} */ ([...layer.querySelectorAll('[data-rail-mark]')]);
    expect(marks.map((m) => m.getAttribute('data-rail-mark'))).toEqual(STOPS.map((s) => s.id));
    for (const mark of marks) expect(mark).toHaveAttribute('tabindex', '-1');
    const tops = marks.map((m) => parseFloat(m.style.top));
    for (let i = 1; i < tops.length; i += 1) expect(tops[i] - tops[i - 1]).toBeGreaterThanOrEqual(24 - 1e-6);
    fireEvent.click(marks[3]);
    expect(onJump).toHaveBeenCalledWith(STOPS[3]);
  });

  it('Chapters lists every stop in order, the current one marked, then Start a project; a choice jumps and closes it', () => {
    const onJump = vi.fn();
    railAt(0.45, { onJump });
    const toggle = screen.getByRole('button', { name: 'Chapters' });
    fireEvent.click(toggle);
    expect(toggle).toHaveAttribute('aria-expanded', 'true');
    const list = /** @type {HTMLElement} */ (document.getElementById(String(toggle.getAttribute('aria-controls'))));
    const choices = /** @type {HTMLButtonElement[]} */ ([...list.querySelectorAll('button')]);
    expect(choices.map((b) => b.textContent)).toEqual(['Empty file', 'Into the code', 'The fork', 'MVP Sprints', 'Start a project']);
    expect(choices[3]).toHaveAttribute('aria-current', 'step');
    fireEvent.click(choices[4]);
    expect(onJump).toHaveBeenCalledWith(STOPS[4]);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.getElementById(String(toggle.getAttribute('aria-controls')))).toBeNull();
  });

  it('Escape closes the list and gives focus back to Chapters; so does a click outside it, without moving focus', () => {
    railAt(0.45, { onJump: vi.fn() });
    const toggle = screen.getByRole('button', { name: 'Chapters' });
    fireEvent.click(toggle);
    const first = /** @type {HTMLElement} */ (document.querySelector('[data-chapters] button'));
    first.focus();
    fireEvent.keyDown(document, { key: 'Escape' });
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
    expect(document.activeElement).toBe(toggle);
    fireEvent.click(toggle);
    fireEvent.pointerDown(document.body);
    expect(toggle).toHaveAttribute('aria-expanded', 'false');
  });

  it('by default a choice asks the world for the jump, and on arrival focus is on the stop’s own heading', () => {
    const stop = document.createElement('div');
    stop.setAttribute('data-world-stop', 'mvp-sprints');
    stop.innerHTML = '<h2>MVP Sprints</h2>';
    document.body.appendChild(stop);
    /** @type {number[]} */
    const asked = [];
    setJumpHandler((y, onArrive) => {
      asked.push(y);
      onArrive?.();
    });
    railAt(0.1);
    fireEvent.click(screen.getByRole('button', { name: 'Chapters' }));
    fireEvent.click(screen.getByRole('button', { name: 'MVP Sprints' }));
    expect(asked).toEqual([36000]);
    const heading = /** @type {HTMLElement} */ (stop.querySelector('h2'));
    expect(document.activeElement).toBe(heading);
    expect(heading).toHaveAttribute('tabindex', '-1');
    stop.remove();
  });
});
