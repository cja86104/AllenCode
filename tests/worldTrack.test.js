// @ts-check
import { describe, expect, it } from 'vitest';
import { buildTrack, measureSections } from '../src/world/worldTrack.js';
import { landmarkRect } from '../src/world/landmark.js';
import { distanceAlongRoad, EYE_HEIGHT, ROAD_SHAPE, roadAt, roadStepFor } from '../src/world/roadLayout.js';
import { routeFor } from '../src/world/route.js';
import { restPose } from '../src/world/restPose.js';
import { flightGeometry } from '../src/scenes/flight.jsx';
import { serviceScreens } from '../src/data/serviceScreens.js';
import { ROAD_PATHS } from '../src/world/shapes.js';

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
 * @param {ReturnType<typeof routeFor>} [onRoute] Whose road (door a's by default).
 * @returns {TrackSection[]}
 */
function page(viewport, onRoute = route) {
  const h = viewport.height;
  const stopsOf = /** @type {NonNullable<typeof onRoute.road>} */ (onRoute.road);
  const w1 = routeFor(null);
  void w1;
  const openingScreens = 6.8;
  /** @type {TrackSection[]} */
  const sections = [{ kind: 'gate', from: 0, to: 1.8 * h }];
  let at = 2.8 * h;
  sections.push({ kind: 'opening', from: at, to: at + openingScreens * h });
  at += (openingScreens + 1) * h;
  for (const stop of stopsOf.stops) {
    // The workshop comes after the bend where the roads meet, about three ordinary stretches of road (W4).
    // The business road's stops three times as far apart, with three times the page (2026-11-16).
    const before = stop.id === 'workshop' ? 2.4 : stop.kind === 'portrait' || stop.kind === 'sketch' ? 0.8 : 0.8 * (roadStepFor(onRoute.road?.door ?? 'b') / 14);
    at += before * h;
    /** @type {TrackSection} */
    const rest = { kind: 'rest', stopId: stop.id, from: at, to: at + 1.2 * h };
    const code = stop.excerptId ? stopsOf.sources[stop.excerptId] : '';
    if (stop.kind === 'product' || stop.kind === 'template') rest.box = flightGeometry(code, { width: 1280, height: 800 }, viewport.width, h).targetBox;
    else if (stop.kind === 'service') {
      const screen = serviceScreens[/** @type {keyof typeof serviceScreens} */ (stop.id)];
      if (!screen) throw new Error(stop.id);
      rest.box = flightGeometry(code, screen, viewport.width, h).targetBox;
    } else if (stop.kind === 'portrait') {
      // The builder chapter's portrait box (Chris's photo, 960 × 1200), as the chapter lays it out.
      rest.box = flightGeometry(code, { width: 960, height: 1200 }, viewport.width, h).targetBox;
    } else if (stop.kind === 'sketch') {
      // The idea chapter's 4:3 sketch: the form's right column on a wide screen, full width on a phone.
      const w = viewport.width >= 1024 ? viewport.width * 0.42 : viewport.width - 48;
      rest.box = { x: viewport.width >= 1024 ? viewport.width * 0.5 : 24, y: h * 0.3, w, h: w * 0.75 };
    } else if (stop.kind !== 'commits' && stop.kind !== 'words') rest.box = { x: viewport.width * 0.5, y: h * 0.2, w: viewport.width * 0.42, h: h * 0.5 };
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
        // A centimetre: the curve rounding the fork's corner (3 mm), against the half-unit swing this guards.
        expect(x).toBeLessThanOrEqual(previousX + 0.01);
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

describe('buildTrack on the family road (Code World W3.3)', () => {
  const familyRoute = routeFor('b');
  const family = /** @type {NonNullable<typeof familyRoute.road>} */ (familyRoute.road);
  for (const viewport of VIEWPORTS) {
    const label = `${viewport.width}×${viewport.height}`;
    const sections = page(viewport, familyRoute);
    const track = buildTrack(familyRoute, sections, viewport);

    it(`door b: rests square on each template's box (${label})`, () => {
      for (const section of sections.filter((s) => s.kind === 'rest' && s.box)) {
        const landmark = family.layout.landmarks.find((l) => l.stopId === section.stopId);
        if (!landmark || !section.box) throw new Error(`No landmark for ${section.stopId}`);
        const pose = restPose(landmark, section.box, viewport);
        const camera = track.cameraAt((section.from + section.to) / 2);
        for (let i = 0; i < 3; i += 1) expect(camera.eye[i]).toBeCloseTo(pose.eye[i], 6);
      }
    });

    it(`door b: rests on the road at done for you, looking down it (${label})`, () => {
      const rest = sections.find((s) => s.stopId === 'done-for-you');
      if (!rest) throw new Error('no done for you');
      const along = family.layout.along[family.stops.findIndex((s) => s.id === 'done-for-you')];
      const camera = track.cameraAt((rest.from + rest.to) / 2);
      // On the road 6 before the stop, looking 10 past it, along the road (it turns, 2026-11-16).
      const eye = roadAt(family.layout, along - 6).point;
      const look = roadAt(family.layout, along + 10).point;
      expect(camera.eye[0]).toBeCloseTo(eye[0], 6);
      expect(camera.eye[2]).toBeCloseTo(eye[1], 6);
      expect(camera.target[0]).toBeCloseTo(look[0], 6);
      expect(camera.target[2]).toBeCloseTo(look[1], 6);
    });
  }
});

describe('the camera keeps to the road (Chris 2026-11-16: "the camera on family road runs to the right of the road")', () => {
  /**
   * The eye's signed distance from a path's centre line (positive: right of travel) and how far along.
   * @param {[number, number]} p @param {ReadonlyArray<Readonly<[number, number, number?]> | ReadonlyArray<number>>} path
   */
  function offRoad(p, path) {
    let best = { d: Infinity, side: 0, along: 0 };
    let walked = 0;
    for (let i = 0; i < path.length - 1; i += 1) {
      const [ax, az] = path[i];
      const [bx, bz] = path[i + 1];
      const dx = bx - ax;
      const dz = bz - az;
      const length = Math.hypot(dx, dz);
      const t = Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - az) * dz) / (length * length)));
      const d = Math.hypot(p[0] - (ax + dx * t), p[1] - (az + dz * t));
      if (d < best.d) best = { d, side: Math.sign(dx * (p[1] - az) - dz * (p[0] - ax)), along: walked + length * t };
      walked += length;
    }
    return best;
  }

  for (const door of /** @type {const} */ (['a', 'b'])) {
    const onRoute = routeFor(door);
    const theRoad = /** @type {NonNullable<typeof onRoute.road>} */ (onRoute.road);
    const branch = door === 'a' ? ROAD_PATHS.business : ROAD_PATHS.family;
    const path = [[0, 60], ...ROAD_PATHS.trunk.slice(1), ...branch.slice(1), ...theRoad.layout.path.slice(branch.length)];
    for (const viewport of VIEWPORTS) {
      const label = `door ${door}, ${viewport.width}×${viewport.height}`;
      const sections = page(viewport, onRoute);
      const track = buildTrack(onRoute, sections, viewport);

      it(`through the fork and the turn the eye is on the road's centre line (${label})`, () => {
        const opening = sections[1];
        for (let y = opening.from; y <= opening.to; y += 8) {
          const { eye } = track.cameraAt(y);
          expect(offRoad([eye[0], eye[2]], path).d, `scroll ${y}`).toBeLessThanOrEqual(0.15);
        }
      });

      it(`through the middle of the road between two stops the eye rides the hills, eye height above the ground (${label})`, () => {
        const rests = sections.filter((s) => s.kind === 'rest');
        let highest = 0;
        for (let k = 1; k < rests.length; k += 1) {
          const from = rests[k - 1].to;
          const to = rests[k].from;
          for (let share = 0.35; share <= 0.65; share += 0.05) {
            const { eye } = track.cameraAt(from + (to - from) * share);
            const ground = roadAt(theRoad.layout, distanceAlongRoad(theRoad.layout, [eye[0], eye[2]])).height;
            highest = Math.max(highest, ground);
            // Within 15 cm: the camera's travel keys sample the ground a tenth of the way apart, so on the
            // long stretch round the bend its curve can ride a little off a hill's shape between them
            // (closer keys there make the camera speed up past the never-jumps limit).
            expect(Math.abs(eye[1] - (ground + EYE_HEIGHT)), `${rests[k].stopId} at ${share.toFixed(2)}`).toBeLessThanOrEqual(0.15);
          }
        }
        // The road does climb: the camera has been over a crest.
        expect(highest).toBeGreaterThan(ROAD_SHAPE.hill * 0.5);
      });

      it(`through the middle of the road between two stops the eye is on the centre line, looking down the road (${label})`, () => {
        const rests = sections.filter((s) => s.kind === 'rest');
        for (let k = 1; k < rests.length; k += 1) {
          const from = rests[k - 1].to;
          const to = rests[k].from;
          for (let share = 0.35; share <= 0.65; share += 0.05) {
            const camera = track.cameraAt(from + (to - from) * share);
            const eye = offRoad([camera.eye[0], camera.eye[2]], path);
            const look = offRoad([camera.target[0], camera.target[2]], path);
            expect(eye.d, `${rests[k].stopId} at ${share.toFixed(2)}`).toBeLessThanOrEqual(0.15);
            expect(look.d, `${rests[k].stopId} at ${share.toFixed(2)}: looking down the road`).toBeLessThanOrEqual(0.5);
            expect(look.along).toBeGreaterThan(eye.along);
          }
        }
      });
    }
  }
});

describe('your idea’s moving hold and the end of the world (Code World W4.3)', () => {
  for (const door of /** @type {const} */ (['a', 'b'])) {
    const onRoute = routeFor(door);
    const theRoad = /** @type {NonNullable<typeof onRoute.road>} */ (onRoute.road);
    for (const viewport of VIEWPORTS) {
      const label = `door ${door}, ${viewport.width}×${viewport.height}`;
      const h = viewport.height;
      const sections = page(viewport, onRoute);
      const idea = sections.find((s) => s.stopId === 'your-idea');
      if (!idea || !idea.box) throw new Error('no idea section');
      // The idea is not pinned: over its hold its sketch scrolls up the screen with the page.
      idea.to = idea.from + 1.5 * h;
      idea.hold = 'visible';
      idea.boxTo = { ...idea.box, y: idea.box.y - (idea.to - idea.from) };
      const end = { kind: /** @type {const} */ ('end'), from: idea.to + 0.5 * h, to: idea.to + 1.5 * h };
      sections.push(end);
      const track = buildTrack(onRoute, sections, viewport);
      const landmark = theRoad.layout.landmarks.find((l) => l.stopId === 'your-idea');
      if (!landmark) throw new Error('no idea landmark');

      it(`through your idea's hold the frame stays under the sketch as the page moves (${label})`, () => {
        const from = /** @type {NonNullable<typeof idea.box>} */ (idea.box);
        const to = /** @type {NonNullable<typeof idea.boxTo>} */ (idea.boxTo);
        for (const t of [0, 0.25, 0.5, 0.75, 1]) {
          const rect = landmarkRect(track.cameraAt(idea.from + (idea.to - idea.from) * t), viewport, landmark);
          const top = from.y + (to.y - from.y) * t;
          expect(Math.abs(rect.left - from.x), `left at ${t}`).toBeLessThanOrEqual(0.02 * from.w);
          expect(Math.abs(rect.top - top), `top at ${t}`).toBeLessThanOrEqual(0.02 * from.h);
          expect(Math.abs(rect.width - from.w), `width at ${t}`).toBeLessThanOrEqual(0.02 * from.w);
        }
      });

      it(`never jumps through the meeting and the hold (${label})`, () => {
        let previous = track.cameraAt(sections[sections.length - 4].from).eye;
        for (let y = sections[sections.length - 4].from; y <= end.to; y += 4) {
          const eye = track.cameraAt(y).eye;
          expect(Math.hypot(eye[0] - previous[0], eye[1] - previous[1], eye[2] - previous[2]), `at ${y}`).toBeLessThanOrEqual(0.15);
          previous = eye;
        }
      });

      it(`fades the world out over the screen before the brief (${label})`, () => {
        expect(track.fadeAt(end.from - 10)).toBe(1);
        expect(track.fadeAt((end.from + end.to) / 2)).toBeCloseTo(0.5, 6);
        expect(track.fadeAt(end.to)).toBe(0);
        expect(track.fadeAt(end.to + 500)).toBe(0);
      });
    }
  }

  it('without an end section the world never fades', () => {
    const track = buildTrack(routeFor('a'), page(VIEWPORTS[0]), VIEWPORTS[0]);
    expect(track.fadeAt(1e7)).toBe(1);
  });

  it('measures a held rest from its section and its sketch at the hold’s start and end, and the end from the brief', () => {
    const vh = 800;
    Object.defineProperty(window, 'innerHeight', { value: vh, configurable: true });
    Object.defineProperty(window, 'scrollY', { value: 1000, configurable: true });
    const root = document.createElement('div');
    root.innerHTML = `
      <div data-world-segment="rest" data-world-stop="your-idea" data-world-hold="visible"><div data-world-target></div></div>
      <div data-world-segment="end"></div>`;
    const rect = (/** @type {Element} */ el, /** @type {{ top: number, left?: number, width?: number, height: number }} */ r) => {
      Object.defineProperty(el, 'getBoundingClientRect', {
        value: () => ({ top: r.top, left: r.left ?? 0, width: r.width ?? 0, height: r.height, bottom: r.top + r.height, right: (r.left ?? 0) + (r.width ?? 0) }),
      });
    };
    const [hold, end] = /** @type {HTMLElement[]} */ ([...root.querySelectorAll('[data-world-segment]')]);
    // Seen from scroll 1000: the section's top at 200 on screen (page 1200), 1400 tall; its sketch at 500 (page 1500).
    rect(hold, { top: 200, height: 1400 });
    rect(/** @type {Element} */ (hold.querySelector('[data-world-target]')), { top: 500, left: 40, width: 400, height: 300 });
    rect(end, { top: 1700, height: 900 });
    const [rest, last] = measureSections(root);
    expect(rest).toMatchObject({ kind: 'rest', stopId: 'your-idea', hold: 'visible', from: 1200 - 200, to: 1200 + 1400 - 600 });
    expect(rest.box).toEqual({ x: 40, y: 1500 - 1000, w: 400, h: 300 });
    expect(rest.boxTo).toEqual({ x: 40, y: 1500 - 2000, w: 400, h: 300 });
    expect(last).toEqual({ kind: 'end', from: 2700 - 800, to: 2700 });
  });
});
