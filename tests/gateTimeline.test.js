// @ts-check
import { describe, expect, it } from 'vitest';
import { gateTimeline } from '../src/scenes/gateTimeline.js';

describe('gateTimeline', () => {
  it('starts with an empty file, the approved line showing and nothing in flight', () => {
    expect(gateTimeline(0)).toEqual({ typed: 0, flight: 0, handoff: 0, intro: 1 });
  });

  it('types the whole file by 35 percent of the section', () => {
    expect(gateTimeline(0.175).typed).toBeCloseTo(0.5);
    expect(gateTimeline(0.35).typed).toBe(1);
    expect(gateTimeline(0.35).flight).toBe(0);
  });

  it('flies from 40 percent to the end', () => {
    expect(gateTimeline(0.4).flight).toBe(0);
    expect(gateTimeline(0.7).flight).toBeCloseTo(0.5);
    expect(gateTimeline(1).flight).toBe(1);
  });

  it('hands off to the real headline over the last 12 percent of the flight', () => {
    expect(gateTimeline(0.4 + 0.6 * 0.88).handoff).toBeCloseTo(0);
    expect(gateTimeline(1).handoff).toBe(1);
  });

  it('fades the approved line and the scroll cue out over the first tenth of the gate', () => {
    expect(gateTimeline(0.05).intro).toBeCloseTo(0.5);
    expect(gateTimeline(0.1).intro).toBe(0);
  });

  it('clamps progress outside 0..1', () => {
    expect(gateTimeline(-1)).toEqual(gateTimeline(0));
    expect(gateTimeline(2)).toEqual(gateTimeline(1));
  });
});
