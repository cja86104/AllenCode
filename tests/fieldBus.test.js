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
