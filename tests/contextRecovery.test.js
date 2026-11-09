// @ts-check
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { RESTORE_WAIT_MS, watchContext } from '../src/field/contextRecovery.js';

/**
 * A document stand-in whose visibility the test controls.
 * @param {DocumentVisibilityState} [initial]
 */
function fakeDocument(initial = 'visible') {
  const target = new EventTarget();
  /** @type {DocumentVisibilityState} */
  let state = initial;
  return {
    /** @returns {DocumentVisibilityState} */
    get visibilityState() {
      return state;
    },
    /** @param {DocumentVisibilityState} next */
    show(next) {
      state = next;
      target.dispatchEvent(new Event('visibilitychange'));
    },
    addEventListener: target.addEventListener.bind(target),
    removeEventListener: target.removeEventListener.bind(target),
  };
}

const lose = (/** @type {HTMLCanvasElement} */ canvas) => {
  const event = new Event('webglcontextlost', { cancelable: true });
  canvas.dispatchEvent(event);
  return event;
};
const restore = (/** @type {HTMLCanvasElement} */ canvas) => canvas.dispatchEvent(new Event('webglcontextrestored'));

describe('watchContext', () => {
  beforeEach(() => vi.useFakeTimers());
  afterEach(() => vi.useRealTimers());

  it('on a lost context, asks the browser to restore it and stops drawing, without restarting yet', () => {
    const canvas = document.createElement('canvas');
    const onLost = vi.fn();
    const onRestart = vi.fn();
    watchContext(canvas, { onLost, onRestart, doc: fakeDocument() });
    const event = lose(canvas);
    expect(event.defaultPrevented).toBe(true);
    expect(onLost).toHaveBeenCalledOnce();
    expect(onRestart).not.toHaveBeenCalled();
  });

  it('restarts once when the browser restores the context', () => {
    const canvas = document.createElement('canvas');
    const onRestart = vi.fn();
    watchContext(canvas, { onLost: () => {}, onRestart, doc: fakeDocument() });
    lose(canvas);
    restore(canvas);
    restore(canvas);
    vi.advanceTimersByTime(RESTORE_WAIT_MS * 3);
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it('restarts on its own when a visible page has waited RESTORE_WAIT_MS without a restore', () => {
    const canvas = document.createElement('canvas');
    const onRestart = vi.fn();
    watchContext(canvas, { onLost: () => {}, onRestart, doc: fakeDocument() });
    lose(canvas);
    vi.advanceTimersByTime(RESTORE_WAIT_MS - 1);
    expect(onRestart).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it('does not count time in the background: the wait starts when the page is visible again', () => {
    const canvas = document.createElement('canvas');
    const doc = fakeDocument('visible');
    const onRestart = vi.fn();
    watchContext(canvas, { onLost: () => {}, onRestart, doc });
    doc.show('hidden');
    lose(canvas);
    vi.advanceTimersByTime(RESTORE_WAIT_MS * 10);
    expect(onRestart).not.toHaveBeenCalled();
    doc.show('visible');
    vi.advanceTimersByTime(RESTORE_WAIT_MS - 1);
    expect(onRestart).not.toHaveBeenCalled();
    vi.advanceTimersByTime(1);
    expect(onRestart).toHaveBeenCalledOnce();
  });

  it('hiding the page again pauses the wait', () => {
    const canvas = document.createElement('canvas');
    const doc = fakeDocument('visible');
    const onRestart = vi.fn();
    watchContext(canvas, { onLost: () => {}, onRestart, doc });
    lose(canvas);
    vi.advanceTimersByTime(RESTORE_WAIT_MS / 2);
    doc.show('hidden');
    vi.advanceTimersByTime(RESTORE_WAIT_MS * 10);
    expect(onRestart).not.toHaveBeenCalled();
  });

  it('ignores a restore event when the context was never lost', () => {
    const canvas = document.createElement('canvas');
    const onRestart = vi.fn();
    watchContext(canvas, { onLost: () => {}, onRestart, doc: fakeDocument() });
    restore(canvas);
    expect(onRestart).not.toHaveBeenCalled();
  });

  it('after cleanup, nothing fires', () => {
    const canvas = document.createElement('canvas');
    const onLost = vi.fn();
    const onRestart = vi.fn();
    const stop = watchContext(canvas, { onLost, onRestart, doc: fakeDocument() });
    lose(canvas);
    stop();
    vi.advanceTimersByTime(RESTORE_WAIT_MS * 3);
    restore(canvas);
    lose(canvas);
    expect(onLost).toHaveBeenCalledOnce();
    expect(onRestart).not.toHaveBeenCalled();
  });
});
