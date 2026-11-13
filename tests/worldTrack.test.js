// @ts-check
import { describe, expect, it } from 'vitest';
import { buildTrack } from '../src/world/worldTrack.js';
import { routeFor } from '../src/world/route.js';
import { restPose } from '../src/world/restPose.js';
import { flightGeometry } from '../src/scenes/flight.jsx';
import { serviceScreens } from '../src/data/serviceScreens.js';

/** @typedef {import('../src/world/worldTrack.js').TrackSection} TrackSection */

const VIEWPORTS = [
  { width: 1440, height: 900 },
  { width: 393, height: 852 },
];

const route = routeFor('a');
const road = /** @type {NonNullable<typeof route.road>} */ (route.road);

/**
 * A page laid out as the world-mode home is: the gate (280vh, pinned 180vh), the opening (W1's journey
 * section), then per road stop 1.8 screens of road (80vh of road, then the chapter sliding in) and the
 * chapter's 120vh pinned span; boxes as today's layout gives them.
 * @param {{ width: number, height: number }} viewport
 * @returns {TrackSection[]}
 */
function page(viewport) {
  const h = viewport.height;
  const w1 = routeFor(null);
  void w1;
  const openingScreens = 6.8;
  /** @type {TrackSection[]} */
  const sections = [{ kind: 'gate', from: 0, to: 1.8 * h }];
  let at = 2.8 * h;
  sections.push({ kind: 'opening', from: at, to: at + openingScreens * h });
  at += (openingScreens + 1) * h;
  for (const stop of road.stops) {
    at += 0.8 * h;
    /** @type {TrackSection} */
    const rest = { kind: 'rest', stopId: stop.id, from: at, to: at + 1.2 * h };
    const code = stop.excerptId ? road.sources[stop.excerptId] : '';
    if (stop.kind === 'product') rest.box = flightGeometry(code, { width: 1280, height: 800 }, viewport.width, h).targetBox;
    else if (stop.kind === 'service') {
      const screen = serviceScreens[/** @type {keyof typeof serviceScreens} */ (stop.id)];
      if (!screen) throw new Error(stop.id);
      rest.box = flightGeometry(code, screen, viewport.width, h).targetBox;
    } else if (stop.kind !== 'commits') rest.box = { x: viewport.width * 0.5, y: h * 0.2, w: viewport.width * 0.42, h: h * 0.5 };
    sections.push(rest);
    at += 2.2 * h;
  }
  return sections;
}

const distance = (/** @type {number[]} */ a, /** @type {number[]} */ b) => Math.hypot(a[0] - b[0], a[1] - b[1], a[2] - b[2]);

describe('buildTrack: the camera follows the page (Code World R2)', () => {
  for (const viewport of VIEWPORTS) {
    const sections = page(viewport);
    const track = buildTrack(route, sections, viewport);
    const end = sections[sections.length - 1].to + viewport.height;
    const label = `${viewport.width}×${viewport.height}`;

    it(`maps scroll to the track continuously and in order (${label})`, () => {
      let previous = track.progressAt(0);
      for (let y = 4; y <= end; y += 4) {
        const p = track.progressAt(y);
        expect(p).toBeGreaterThanOrEqual(previous);
        previous = p;
      }
      expect(track.progressAt(-100)).toBe(0);
      expect(track.progressAt(end + 1000)).toBe(1);
    });

    it(`rests at each chapter exactly where its screen box is (${label})`, () => {
      for (const section of sections.filter((s) => s.kind === 'rest' && s.box)) {
        const landmark = road.layout.landmarks.find((l) => l.stopId === section.stopId);
        if (!landmark || !section.box) throw new Error(String(section.stopId));
        const pose = restPose(landmark, section.box, viewport);
        for (const t of [0, 0.3, 0.7, 1]) {
          const camera = track.cameraAt(section.from + (section.to - section.from) * t);
          camera.eye.forEach((v, i) => expect(v).toBeCloseTo(pose.eye[i], 6));
          camera.target.forEach((v, i) => expect(v).toBeCloseTo(pose.target[i], 6));
        }
      }
    });

    it(`holds still through the gate (${label})`, () => {
      const first = track.cameraAt(0);
      for (const y of [100, 0.9 * viewport.height, 1.8 * viewport.height, 2.8 * viewport.height]) expect(track.cameraAt(y)).toEqual(first);
    });

    it(`turns onto business/ without swinging right first (the W2 fork glitch) (${label})`, () => {
      const opening = sections[1];
      // The turn: from the split (4.4 of 6.8 screens) to the branch's end.
      let previousX = Infinity;
      for (let y = opening.from + (4.4 / 6.8) * (opening.to - opening.from); y <= opening.to; y += 4) {
        const x = track.cameraAt(y).eye[0];
        expect(x).toBeLessThanOrEqual(previousX + 1e-9);
        previousX = x;
      }
    });

    it(`never jumps: no 4 px of scroll moves the eye more than 0.15 (${label})`, () => {
      let previous = track.cameraAt(0).eye;
      for (let y = 4; y <= end; y += 4) {
        const eye = track.cameraAt(y).eye;
        expect(distance(eye, previous), `at ${y}`).toBeLessThanOrEqual(0.15);
        previous = eye;
      }
    });

    it(`travels the road between chapters, never through a landmark (${label})`, () => {
      const rests = sections.filter((s) => s.kind === 'rest');
      for (let i = 1; i < rests.length; i += 1) {
        for (let y = rests[i - 1].to; y <= rests[i].from; y += 8) {
          const eye = track.cameraAt(y).eye;
          for (const landmark of road.layout.landmarks) expect(distance(eye, landmark.center)).toBeGreaterThanOrEqual(2);
        }
      }
    });

    it(`knows which section a scroll is in (${label})`, () => {
      const rest = sections.find((s) => s.stopId === 'underfire-ai');
      if (!rest) throw new Error('no rest');
      expect(track.sectionAt((rest.from + rest.to) / 2)).toBe(rest);
      expect(track.sectionAt(rest.from - 10)).toBeNull();
      expect(track.sectionAt(10)?.kind).toBe('gate');
    });
  }
});
