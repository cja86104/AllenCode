// @ts-check
import { describe, expect, it } from 'vitest';
import { STOPS, stopAt } from '../src/world/stops.js';

describe('journey stops (Code world prototype, Task P3)', () => {
  it('names the stop at each point of the journey', () => {
    expect([0, 0.2, 0.45, 0.68, 0.9, 1].map((p) => stopAt(p).name)).toEqual([
      'Empty file',
      'Into the code',
      'The road',
      'The fork',
      'First landmark',
      'First landmark',
    ]);
  });

  it('covers 0 to 1 with no gap or overlap, in order', () => {
    expect(STOPS[0].from).toBe(0);
    for (let i = 1; i < STOPS.length; i += 1) expect(STOPS[i].from).toBe(STOPS[i - 1].to);
    expect(STOPS[STOPS.length - 1].to).toBe(1);
  });

  it('clamps progress outside 0..1', () => {
    expect(stopAt(-0.5).name).toBe('Empty file');
    expect(stopAt(3).name).toBe('First landmark');
  });
});
