// @ts-check
import { describe, expect, it } from 'vitest';
import { stretchFor } from '../src/world/stretches.js';
import { roadSizes } from '../src/world/roadLayout.js';
import { layoutStretch, STRETCH, stretchRestBox } from '../src/world/stretchLayout.js';
import { cameraAt } from '../src/world/camera.js';
import { landmarkRect } from '../src/world/landmark.js';

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 390, height: 844 },
];
const PATHS = ['/products', '/products/underfire-ai', '/products/crew-advisors', '/services', '/templates', '/about', '/contact'];

/** @param {string} path @param {{ width: number, height: number }} viewport */
function laid(path, viewport) {
  const stretch = stretchFor(path);
  if (!stretch) throw new Error(`no stretch for ${path}`);
  return { stretch, layout: layoutStretch(stretch.stops, roadSizes(stretch.stops, stretch.sources), viewport) };
}

/** @param {number[]} a @param {number[]} b */
const distance = (a, b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe('a stretch’s road, landmarks and camera (Code World W5a)', () => {
  it('lasts one screen: half a screen of driving, then at rest, the landing from 0.55 (2026-11-17: shorter)', () => {
    expect(STRETCH.screens).toBe(1);
    expect(STRETCH.drive).toBeCloseTo(0.5, 9);
    expect(STRETCH.landFrom).toBeCloseTo(0.55, 9);
  });

  it('stands only the lead, across the road’s end, facing back up it; the road runs on past it into the fog', () => {
    const { stretch, layout } = laid('/services', VIEWPORTS[0]);
    expect(layout.landmarks.map((l) => l.stopId)).toEqual(stretch.stops.map((s) => s.id));
    expect(layout.landmarks).toHaveLength(1);
    const lead = layout.landmarks[0];
    expect(lead.center[0]).toBe(0);
    expect(lead.facing).toEqual([0, 0, 1]);
    const end = layout.path[layout.path.length - 1];
    expect(end[1]).toBeLessThan(lead.center[2]);
  });

  it('keys the camera from the start of the road to a still rest square on to the lead, in order', () => {
    for (const viewport of VIEWPORTS) {
      for (const path of PATHS) {
        const { layout } = laid(path, viewport);
        const { keys } = layout;
        expect(keys[0].at).toBe(0);
        expect(keys[keys.length - 1].at).toBe(1);
        keys.slice(1).forEach((key, i) => expect(key.at).toBeGreaterThan(keys[i].at));
        const rest = cameraAt(STRETCH.drive, keys);
        const end = cameraAt(1, keys);
        const between = cameraAt((STRETCH.drive + 1) / 2, keys);
        expect(distance(rest.eye, end.eye)).toBeLessThan(1e-9);
        expect(distance(rest.eye, between.eye)).toBeLessThan(1e-9);
      }
    }
  });

  it('rests with the lead exactly on the stage a home chapter’s screen takes, on desktop and phone', () => {
    for (const viewport of VIEWPORTS) {
      for (const path of PATHS) {
        const { layout } = laid(path, viewport);
        const lead = layout.landmarks[layout.landmarks.length - 1];
        const box = stretchRestBox(lead, viewport);
        const rect = landmarkRect(cameraAt(1, layout.keys), viewport, lead);
        expect(rect.visible).toBe(true);
        expect(Math.abs(rect.left - box.x), `${path} ${viewport.width}`).toBeLessThan(2);
        expect(Math.abs(rect.top - box.y)).toBeLessThan(2);
        expect(Math.abs(rect.width - box.w)).toBeLessThan(2);
      }
    }
  });

  it('moves smoothly all the way', () => {
    for (const path of PATHS) {
      const { layout } = laid(path, VIEWPORTS[1]);
      let previous = cameraAt(0, layout.keys);
      for (let p = 0.001; p <= 1; p += 0.001) {
        const camera = cameraAt(p, layout.keys);
        expect(distance(camera.eye, previous.eye)).toBeLessThan(0.5);
        previous = camera;
      }
    }
  });
});
