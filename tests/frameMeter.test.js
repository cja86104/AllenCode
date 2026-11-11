// @ts-check
import { describe, expect, it } from 'vitest';
import { createFrameMeter } from '../src/world/frameMeter.js';

describe('frame meter (Code world prototype, Task P2)', () => {
  it('reports the median and 95th percentile of the frame intervals', () => {
    const meter = createFrameMeter();
    // 20 intervals: eighteen of 16 ms and two of 40 ms (the slowest 10 percent), nearest rank.
    let now = 1000;
    meter.tick(now);
    for (let i = 0; i < 18; i += 1) meter.tick((now += 16));
    meter.tick((now += 40));
    meter.tick((now += 40));
    const report = meter.report();
    expect(report.frames).toBe(20);
    expect(report.medianMs).toBe(16);
    expect(report.p95Ms).toBe(40);
  });

  it('ignores gaps longer than 250 ms (a hidden tab or a paused page is not a slow frame)', () => {
    const meter = createFrameMeter();
    meter.tick(0);
    meter.tick(10);
    meter.tick(5000);
    meter.tick(5010);
    expect(meter.report()).toEqual({ frames: 2, medianMs: 10, p95Ms: 10 });
  });

  it('reports zeros before two ticks and after a reset', () => {
    const meter = createFrameMeter();
    expect(meter.report()).toEqual({ frames: 0, medianMs: 0, p95Ms: 0 });
    meter.tick(0);
    meter.tick(16);
    meter.reset();
    expect(meter.report()).toEqual({ frames: 0, medianMs: 0, p95Ms: 0 });
  });
});
