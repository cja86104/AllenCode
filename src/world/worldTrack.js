// @ts-check
import { cameraAt as cameraOnKeys, frameCamera } from './camera.js';
import { buildJourney } from './journey.js';
import { EYE_HEIGHT } from './roadLayout.js';
import { restPose } from './restPose.js';

/** @typedef {[number, number, number]} Vec3 */
/** @typedef {import('./camera.js').CameraKey} CameraKey */
/** @typedef {import('./route.js').Route} Route */
/** @typedef {{ x: number, y: number, w: number, h: number }} Box */

/**
 * A stretch of the page the camera follows, in scroll pixels: the gate (the camera holds at the empty
 * file), the world opening (W1's journey to the fork and, with a door, the turn), and each road
 * chapter's pinned span (`rest`: the camera holds square on to the chapter's landmark, framed on `box`,
 * the chapter's screen box). Scroll between two sections is the road between them.
 * @typedef {{ kind: 'gate' | 'opening' | 'rest', from: number, to: number, stopId?: string, box?: Box }} TrackSection
 */

/** Ahead of How I work's middle commit, where the camera stands and where it looks, along the road. */
const COMMITS_EYE = -6;
const COMMITS_LOOK = 10;
const COMMITS_LOOK_Y = 0.8;
/** The road's field of view, in degrees. */
const ROAD_FOV = 52;
/** Before the page is measured: the camera at the empty file, as the gate starts. */
const EMPTY_FILE = Object.freeze({ eye: /** @type {Vec3} */ ([0, 1.6, 7]), target: /** @type {Vec3} */ ([0, 1.6, 0]), fov: 45 });

/**
 * The camera's track through the world-mode page (Code World R2): keys placed at the page's own
 * scroll positions, so the camera holds through the gate, runs the world opening as W1 did, rests at
 * each chapter's landmark exactly on its screen box while the chapter is pinned, and travels the
 * road's centre line between chapters. Rebuilt whenever the page is measured again (layout, resize,
 * a door taken).
 * @param {Route} route
 * @param {ReadonlyArray<TrackSection>} sections In page order.
 * @param {{ width: number, height: number }} viewport
 */
export function buildTrack(route, sections, viewport) {
  const aspect = viewport.width / viewport.height;
  const door = route.road?.door ?? null;
  // W1's journey without the road's stops: the opening, framed for this screen as W1 framed it.
  const opening = route.road ? buildJourney(door) : route.journey;
  /** @type {Array<CameraKey & { px: number }>} */
  const placed = [];
  const push = (/** @type {number} */ px, /** @type {{ eye: Vec3, target: Vec3, fov: number }} */ pose, /** @type {string} */ stop, still = false) => {
    if (placed.length > 0 && px <= placed[placed.length - 1].px) return;
    /** @type {CameraKey & { px: number }} */
    const key = { px, at: 0, stop, eye: [...pose.eye], target: [...pose.target], fov: pose.fov };
    if (still) key.still = true;
    placed.push(key);
  };
  /**
   * The opening framed for this screen as W1 framed it (a wider view, stepped back on a narrow
   * screen), but stepped back straight up the road (+z) rather than along the line of sight: during
   * the turn the line of sight swings left, and stepping back along it moved the eye right before it
   * went left (a sway on phones, found in R2).
   * @param {CameraKey} key
   */
  const framed = (key) => {
    const f = frameCamera({ eye: key.eye, target: key.target, fov: key.fov }, aspect);
    const back = Math.hypot(f.eye[0] - key.eye[0], f.eye[2] - key.eye[2]);
    return { eye: /** @type {Vec3} */ ([key.eye[0], f.eye[1], key.eye[2] + back]), target: /** @type {Vec3} */ ([...key.target]), fov: f.fov };
  };

  const layout = route.road?.layout;
  const along = (/** @type {Vec3} */ p) => (layout ? (p[0] - layout.origin[0]) * layout.direction[0] + (p[2] - layout.origin[1]) * layout.direction[1] : 0);
  const onRoad = (/** @type {number} */ distance, /** @type {number} */ y) =>
    /** @type {Vec3} */ (layout ? [layout.origin[0] + layout.direction[0] * distance, y, layout.origin[1] + layout.direction[1] * distance] : [0, y, 0]);

  for (const section of sections) {
    if (section.kind === 'gate') {
      push(section.from, framed(opening.keys[0]), 'gate', true);
    } else if (section.kind === 'opening') {
      opening.keys.forEach((key, i) => push(section.from + key.at * (section.to - section.from), framed(key), key.stop, i === 0));
    } else if (layout && route.road) {
      const pose = restFor(section);
      if (!pose) continue;
      // The road between the last pose and this rest: a key on the centre line, midway.
      const last = placed[placed.length - 1];
      if (last && section.from > last.px) {
        const middle = (along(last.eye) + along(pose.eye)) / 2;
        push((last.px + section.from) / 2, { eye: onRoad(middle, EYE_HEIGHT), target: [...pose.target], fov: ROAD_FOV }, 'road');
      }
      push(section.from, pose, String(section.stopId), true);
      push(section.to, pose, String(section.stopId), true);
    }
  }

  /**
   * The rest pose for a chapter: on its screen box, or for How I work, down the road past its commits.
   * @param {TrackSection} section
   * @returns {{ eye: Vec3, target: Vec3, fov: number } | null}
   */
  function restFor(section) {
    if (!layout || !route.road) return null;
    const landmark = layout.landmarks.find((l) => l.stopId === section.stopId);
    if (landmark && section.box) return restPose(landmark, section.box, viewport);
    const index = route.road.stops.findIndex((s) => s.id === section.stopId);
    if (index < 0 || route.road.stops[index].kind !== 'commits') return null;
    const middle = layout.along[index];
    return { eye: onRoad(middle + COMMITS_EYE, EYE_HEIGHT), target: onRoad(middle + COMMITS_LOOK, COMMITS_LOOK_Y), fov: ROAD_FOV };
  }

  const first = placed.length > 0 ? placed[0].px : 0;
  const last = placed.length > 0 ? placed[placed.length - 1].px : 0;
  const span = Math.max(1, last - first);
  /** @type {CameraKey[]} */
  const keys = placed.map(({ px, ...key }) => ({ ...key, at: (px - first) / span }));
  if (keys.length > 0) keys[keys.length - 1].at = 1;

  /** Where the track is for a scroll position, 0..1. @param {number} scrollY */
  const progressAt = (scrollY) => Math.min(1, Math.max(0, (scrollY - first) / span));

  return {
    keys,
    progressAt,
    /** The camera for a scroll position, as drawn (already framed). @param {number} scrollY */
    cameraAt: (/** @type {number} */ scrollY) => (keys.length > 1 ? cameraOnKeys(progressAt(scrollY), keys) : EMPTY_FILE),
    /** The section a scroll position is in, or null on the road between sections. @param {number} scrollY */
    sectionAt: (/** @type {number} */ scrollY) => sections.find((s) => scrollY >= s.from && scrollY <= s.to) ?? null,
  };
}

/**
 * Measures the world-mode page (Code World R4): every `[data-world-segment]` in page order, its
 * camera span in scroll pixels (from its top until it would scroll its last screen into view, the
 * span a pinned frame holds), and for a road chapter (`rest`) its stop and its screen box, measured
 * from the chapter's `[data-world-target]` against its pinned frame, so it is right however far the
 * page has scrolled.
 * @param {ParentNode} [root]
 * @returns {TrackSection[]}
 */
export function measureSections(root = document) {
  const viewportHeight = window.innerHeight;
  const scroll = window.scrollY;
  /** @type {TrackSection[]} */
  const sections = [];
  for (const el of root.querySelectorAll('[data-world-segment]')) {
    if (!(el instanceof HTMLElement)) continue;
    const kind = el.dataset.worldSegment;
    if (kind !== 'gate' && kind !== 'opening' && kind !== 'rest') continue;
    const rect = el.getBoundingClientRect();
    const from = rect.top + scroll;
    /** @type {TrackSection} */
    const section = { kind, from, to: from + Math.max(0, rect.height - viewportHeight) };
    if (kind === 'rest') {
      section.stopId = el.dataset.worldStop;
      const target = el.querySelector('[data-world-target]');
      const frame = target?.closest('.pin-frame');
      if (target && frame) {
        const t = target.getBoundingClientRect();
        const f = frame.getBoundingClientRect();
        section.box = { x: t.left - f.left, y: t.top - f.top, w: t.width, h: t.height };
      }
    }
    sections.push(section);
  }
  return sections;
}
