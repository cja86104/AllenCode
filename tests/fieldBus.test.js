// @ts-check
import { describe, expect, it, vi } from 'vitest';
import { createFieldBus } from '../src/field/fieldBus.js';

describe('fieldBus', () => {
  it('starts from the documented initial state', () => {
    expect(createFieldBus().get()).toEqual({ progress: 0, door: null, intensity: 1, transform: null, transformProgress: 0, mode: 'pending' });
  });

  it('fieldBus notifies subscribers on set and stops after unsubscribe', () => {
    const bus = createFieldBus();
    const listener = vi.fn();
    const unsubscribe = bus.subscribe(listener);
    bus.set({ progress: 0.5 });
    expect(listener).toHaveBeenCalledTimes(1);
    expect(bus.get().progress).toBe(0.5);
    unsubscribe();
    bus.set({ progress: 0.75 });
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('set merges a partial patch and returns a new state object', () => {
    const bus = createFieldBus();
    const before = bus.get();
    bus.set({ door: 'b' });
    expect(bus.get()).toEqual({ ...before, door: 'b' });
    expect(bus.get()).not.toBe(before);
  });

  it('a patch that changes nothing does not notify', () => {
    const bus = createFieldBus();
    const listener = vi.fn();
    bus.subscribe(listener);
    bus.set({ progress: 0 });
    expect(listener).not.toHaveBeenCalled();
  });
});

describe('transformation ownership', () => {
  /** @param {string} key @returns {import('../src/field/types.js').TransformSpec} */
  const spec = (key) => ({
    key,
    code: 'a',
    sourceBox: { x: 0, y: 0, w: 10, h: 10 },
    target: { kind: 'text', text: 'a', font: '10px serif', color: [1, 1, 1] },
    targetBox: { x: 0, y: 0, w: 10, h: 10 },
    step: 2,
  });

  it('releasing does not clear a transformation another scene has since claimed', () => {
    const bus = createFieldBus();
    bus.claimTransform(spec('gate'));
    bus.claimTransform(spec('mvp-sprints'));
    bus.releaseTransform('gate');
    expect(bus.get().transform?.key).toBe('mvp-sprints');
  });

  it('releasing your own transformation clears it and resets its progress', () => {
    const bus = createFieldBus();
    bus.claimTransform(spec('gate'));
    bus.setTransformProgress('gate', 0.5);
    bus.releaseTransform('gate');
    expect(bus.get().transform).toBeNull();
    expect(bus.get().transformProgress).toBe(0);
  });

  it('only the owner of the current transformation can move its progress', () => {
    const bus = createFieldBus();
    bus.claimTransform(spec('mvp-sprints'));
    bus.setTransformProgress('gate', 0.9);
    expect(bus.get().transformProgress).toBe(0);
    bus.setTransformProgress('mvp-sprints', 0.4);
    expect(bus.get().transformProgress).toBe(0.4);
  });

  it('claiming resets progress so a new flight starts from the file', () => {
    const bus = createFieldBus();
    bus.claimTransform(spec('gate'));
    bus.setTransformProgress('gate', 0.7);
    bus.claimTransform(spec('mvp-sprints'));
    expect(bus.get().transformProgress).toBe(0);
  });
});
