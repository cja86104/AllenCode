// @ts-check
import { afterEach, describe, expect, it, vi } from 'vitest';
import { clearJumpHandler, jumpStep, requestJump, setJumpHandler } from '../src/world/jump.js';
import { DRIVE_DISTANCE, DRIVE_MS } from '../src/world/drive.js';
import { setGlider } from '../src/scroll/glide.js';

afterEach(() => {
  setJumpHandler(null);
  setGlider(null);
  vi.unstubAllGlobals();
});

describe('a jump along the rail (2026-11-26, Phase 2): the drive between pages, within the home page', () => {
  const jump = { start: 1000, y: 5000, scrolled: false };

  it('drives on ahead out of the world it leaves, without moving the page, for the first half', () => {
    for (const elapsed of [0, 100, DRIVE_MS / 2 - 1]) {
      const step = jumpStep(jump, jump.start + elapsed);
      expect(step.drive?.half, `${elapsed}`).toBe('out');
      expect(step.scrollTo, `${elapsed}`).toBeNull();
      expect(step.done).toBe(false);
    }
    expect(jumpStep(jump, jump.start + DRIVE_MS / 2 - 1).drive?.travel).toBeGreaterThan(0.9 * DRIVE_DISTANCE);
  });

  it('moves the page to the stop once, at the swap, then comes in from behind it', () => {
    const swap = jumpStep(jump, jump.start + DRIVE_MS / 2);
    expect(swap.drive?.half).toBe('in');
    expect(swap.scrollTo).toBe(5000);
    const after = jumpStep({ ...jump, scrolled: true }, jump.start + DRIVE_MS / 2 + 50);
    expect(after.scrollTo).toBeNull();
    expect(after.drive?.travel).toBeLessThan(0);
  });

  it('is over at the drive’s end, fully shown; a jump whose frames were missed still lands', () => {
    expect(jumpStep({ ...jump, scrolled: true }, jump.start + DRIVE_MS)).toEqual({ drive: null, scrollTo: null, done: true });
    expect(jumpStep(jump, jump.start + 10 * DRIVE_MS)).toEqual({ drive: null, scrollTo: 5000, done: true });
  });

  it('a new target before the swap is where it lands; one after it moves the page again', () => {
    expect(jumpStep({ ...jump, y: 7000 }, jump.start + DRIVE_MS / 2 + 1).scrollTo).toBe(7000);
    expect(jumpStep({ ...jump, y: 9000, scrolled: false }, jump.start + 0.8 * DRIVE_MS).scrollTo).toBe(9000);
  });

  it('requestJump goes to the world while it runs, and otherwise jumps the page at once (reduced motion, no WebGL)', () => {
    /** @type {Array<{ y: number }>} */
    const asked = [];
    const arrived = vi.fn();
    setJumpHandler((y, onArrive) => {
      asked.push({ y });
      onArrive?.();
    });
    requestJump(1234, arrived);
    expect(asked).toEqual([{ y: 1234 }]);
    expect(arrived).toHaveBeenCalledTimes(1);

    setJumpHandler(null);
    const scrollTo = vi.fn();
    vi.stubGlobal('scrollTo', scrollTo);
    const landed = vi.fn();
    requestJump(4321, landed);
    expect(scrollTo).toHaveBeenCalledWith({ top: 4321, left: 0, behavior: 'instant' });
    expect(landed).toHaveBeenCalledTimes(1);
  });

  it('a world that goes leaves a newer world’s jump in place (StrictMode, a lost GPU context)', () => {
    const older = vi.fn();
    const newer = vi.fn();
    setJumpHandler(older);
    setJumpHandler(newer);
    clearJumpHandler(older);
    requestJump(10);
    expect(newer).toHaveBeenCalledTimes(1);
    expect(older).not.toHaveBeenCalled();
    clearJumpHandler(newer);
    vi.stubGlobal('scrollTo', vi.fn());
    requestJump(20);
    expect(newer).toHaveBeenCalledTimes(1);
  });
});
