// @ts-check
import { describe, expect, it } from 'vitest';
import { STEPS, layerTimeline, stepAt } from '../src/scenes/layers/layerTimeline.js';

describe('the layer stack’s timeline (Living Source Phase 4)', () => {
  it('starts at the source: tilted, together, the code shown, no characters in flight', () => {
    const t = layerTimeline(0);
    expect(t).toMatchObject({ step: 'source', tilt: 1, apart: 0, codeOpacity: 1, glyphOpacity: 0, landed: false });
    expect(t.screenOpacity).toBeCloseTo(0.35);
  });

  it('is pulled apart in the transformation', () => {
    const t = layerTimeline(0.4);
    expect(t.step).toBe('transformation');
    expect(t.apart).toBe(1);
    expect(t.tilt).toBe(1);
    expect(t.glyphOpacity).toBe(1);
  });

  it('ends flat and face-on on the result, the screen alone', () => {
    expect(layerTimeline(1)).toMatchObject({ step: 'result', tilt: 0, landed: true, screenOpacity: 1, codeOpacity: 0, glyphOpacity: 0 });
  });

  it('never tilts back up as the visitor scrolls on', () => {
    let last = 1;
    for (let p = 0; p <= 1.0001; p += 0.01) {
      const { tilt } = layerTimeline(p);
      expect(tilt).toBeLessThanOrEqual(last + 1e-9);
      last = tilt;
    }
  });

  it('each step’s point is in that step', () => {
    expect(STEPS.map((s) => s.id)).toEqual(['source', 'transformation', 'result']);
    expect(STEPS.map((s) => `${s.n} ${s.label}`)).toEqual(['01 Source', '02 Transformation', '03 Result']);
    expect(STEPS.map((s) => s.short)).toEqual(['Source', 'Flight', 'Result']);
    for (const step of STEPS) {
      expect(stepAt(step.id)).toBe(step.at);
      expect(layerTimeline(step.at).step).toBe(step.id);
    }
  });
});
