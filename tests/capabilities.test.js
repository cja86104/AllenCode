// @ts-check
import { describe, expect, it } from 'vitest';
import { detectCapabilities } from '../src/field/capabilities.js';

/** @type {import('../src/field/types.js').CapabilityEnv} */
const desktop = {
  webgl2: true,
  prefersReducedMotion: false,
  hardwareConcurrency: 8,
  deviceMemory: 8,
  viewportWidth: 1440,
};

describe('detectCapabilities', () => {
  it('phone width is the low tier with 700 ambient characters and a 1200-particle budget', () => {
    expect(detectCapabilities({ ...desktop, viewportWidth: 390 })).toEqual({
      webgl2: true,
      reducedMotion: false,
      tier: 'low',
      ambientCount: 700,
      transformBudget: 1200,
    });
  });

  it('four or fewer cores is the low tier', () => {
    expect(detectCapabilities({ ...desktop, hardwareConcurrency: 4 }).tier).toBe('low');
  });

  it('4 GB or less of memory is the medium tier with 1800 ambient characters', () => {
    const caps = detectCapabilities({ ...desktop, deviceMemory: 4 });
    expect(caps.tier).toBe('medium');
    expect(caps.ambientCount).toBe(1800);
    expect(caps.transformBudget).toBe(2500);
  });

  it('a capable desktop is the high tier with 3500 ambient characters', () => {
    expect(detectCapabilities(desktop)).toMatchObject({ tier: 'high', ambientCount: 3500, transformBudget: 4000 });
  });

  it('unknown device memory does not lower the tier', () => {
    const noMemoryReported = {
      webgl2: true,
      prefersReducedMotion: false,
      hardwareConcurrency: 8,
      viewportWidth: 1440,
    };
    expect(detectCapabilities(noMemoryReported).tier).toBe('high');
  });

  it('reduced motion is reported without changing the tier', () => {
    const caps = detectCapabilities({ ...desktop, prefersReducedMotion: true });
    expect(caps.reducedMotion).toBe(true);
    expect(caps.tier).toBe('high');
  });

  it('missing WebGL2 is reported', () => {
    expect(detectCapabilities({ ...desktop, webgl2: false }).webgl2).toBe(false);
  });
});
