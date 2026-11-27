// @ts-check
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, cleanup, render } from '@testing-library/react';
import PlainFrameMeter from '../src/components/PlainFrameMeter.jsx';

/** @type {Map<number, FrameRequestCallback>} */
let pending;
let nextId = 0;
let now = 0;

beforeEach(() => {
  vi.useFakeTimers();
  pending = new Map();
  nextId = 0;
  now = 1000;
  vi.stubGlobal(
    'requestAnimationFrame',
    vi.fn((/** @type {FrameRequestCallback} */ callback) => {
      nextId += 1;
      pending.set(nextId, callback);
      return nextId;
    }),
  );
  vi.stubGlobal(
    'cancelAnimationFrame',
    vi.fn((/** @type {number} */ id) => {
      pending.delete(id);
    }),
  );
});

afterEach(() => {
  cleanup();
  vi.useRealTimers();
  vi.unstubAllGlobals();
});

/** Runs the one waiting frame callback, 16 ms after the last. */
function frame() {
  const [id, callback] = [...pending][0];
  pending.delete(id);
  now += 16;
  callback(now);
}

describe('PlainFrameMeter (Living Source, Phase 1, Task 1)', () => {
  it('shows the readout and counts frames', () => {
    const { container } = render(<PlainFrameMeter />);
    act(() => {
      for (let i = 0; i < 30; i += 1) frame();
      vi.advanceTimersByTime(500);
    });
    const readout = container.querySelector('[data-frame-meter]');
    expect(readout?.textContent).toMatch(/^plain · frames \d+ · median 16\.0 ms · p95 16\.0 ms$/);
    expect(Number(readout?.getAttribute('data-frames'))).toBeGreaterThan(0);
  });

  it('cancels its frame loop on unmount', () => {
    const { unmount } = render(<PlainFrameMeter />);
    act(() => {
      frame();
      frame();
    });
    const requestMock = /** @type {import('vitest').Mock} */ (globalThis.requestAnimationFrame);
    const lastId = requestMock.mock.results.at(-1)?.value;
    unmount();
    expect(globalThis.cancelAnimationFrame).toHaveBeenCalledWith(lastId);
  });
});
