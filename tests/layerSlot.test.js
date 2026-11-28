// @ts-check
import { describe, expect, it } from 'vitest';
import { PHONE_STACK_PX, stageFit } from '../src/scenes/layerSlot.jsx';

describe('where a chapter’s stack sits (Living Source Phase 4)', () => {
  it('on a desktop it leaves room for the tilt: 85 % of the stage, centred', () => {
    const fit = stageFit({ x: 600, y: 100, w: 700, h: 1000 }, 1.6, Number.POSITIVE_INFINITY);
    expect(fit.width).toBeCloseTo(595);
    expect(fit.x).toBeCloseTo(600 + (700 - 595) / 2);
  });

  it('on a phone it is about 320 px wide (rule 7)', () => {
    expect(PHONE_STACK_PX).toBe(320);
    expect(stageFit({ x: 15, y: 300, w: 360, h: 420 }, 1.6, PHONE_STACK_PX).width).toBe(320);
  });

  it('a short stage narrows it so the steps and provenance still fit under it', () => {
    const fit = stageFit({ x: 0, y: 0, w: 900, h: 450 }, 1.6, Number.POSITIVE_INFINITY);
    expect(fit.width).toBeCloseTo((450 - 150) * 1.6);
  });
});
