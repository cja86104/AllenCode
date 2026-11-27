// @ts-check
import { act, render } from '@testing-library/react';
import { afterEach, describe, expect, it, vi } from 'vitest';
import JourneyRail from '../src/world/JourneyRail.jsx';

afterEach(() => {
  vi.unstubAllGlobals();
});

const STOPS = [
  { name: 'Empty file', from: 0 },
  { name: 'Into the code', from: 0.05 },
  { name: 'MVP Sprints', from: 0.4 },
  { name: 'Shipped', from: 1 },
];

/**
 * The rail at a given progress, after its first frame.
 * @param {number} progress
 */
function railAt(progress) {
  /** @type {FrameRequestCallback[]} */
  const frames = [];
  vi.stubGlobal('requestAnimationFrame', (/** @type {FrameRequestCallback} */ cb) => frames.push(cb));
  vi.stubGlobal('cancelAnimationFrame', () => {});
  render(<JourneyRail stops={STOPS} getProgress={() => progress} />);
  act(() => frames.shift()?.(0));
  const rail = /** @type {HTMLElement} */ (document.querySelector('nav[data-rail]'));
  const ends = /** @type {HTMLElement[]} */ ([...rail.querySelectorAll(':scope > span')]);
  /** Words a sighted visitor reads on the rail: everything but the screen-reader-only names. */
  const seen = [...rail.querySelectorAll('span')].filter((el) => !el.classList.contains('sr-only') && el.textContent).map((el) => (el.textContent ?? '').toLowerCase());
  return { rail, top: ends[0], bottom: ends[ends.length - 1], seen, current: rail.querySelector('[aria-current="step"]') };
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
