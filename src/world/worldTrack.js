// @ts-check
import { cameraAt as cameraOnKeys, frameCamera } from './camera.js';
import { buildJourney } from './journey.js';
import { distanceAlongRoad, EYE_HEIGHT, roadAt } from './roadLayout.js';
import { restPose } from './restPose.js';
import { ROAD_PATHS } from './shapes.js';

/** @typedef {[number, number, number]} Vec3 */
/** @typedef {import('./camera.js').CameraKey} CameraKey */
/** @typedef {import('./route.js').Route} Route */
/** @typedef {{ x: number, y: number, w: number, h: number }} Box */

/**
 * A stretch of the page the camera follows, in scroll pixels: the gate (the camera holds at the empty
 * file), the world opening (W1's journey to the fork and, with a door, the turn), and each road
 * chapter's pinned span (`rest`: the camera holds square on to the chapter's landmark, framed on `box`,
 * the chapter's screen box). A rest that is not pinned (`hold: 'visible'`, your idea, W4) holds while
 * most of its section is on screen and moves with it: framed on `box` at its start and `boxTo` at its
 * end. `end` (W4) is the screen before the brief, over which the world fades out. Scroll between two
 * sections is the road between them.
 * @typedef {{ kind: 'gate' | 'opening' | 'rest' | 'end', from: number, to: number, stopId?: string, box?: Box, hold?: 'visible', boxTo?: Box }} TrackSection
 */

/** Ahead of How I work's middle commit, where the camera stands and where it looks, along the road. */
const COMMITS_EYE = -6;
const COMMITS_LOOK = 10;
const COMMITS_LOOK_Y = 0.8;
/** The road's field of view, in degrees. */
const ROAD_FOV = 52;
/** How many keys the opening is sampled into, so the eye follows the road's centre line closely. */
const OPENING_SAMPLES = 48;
/** Where the road between two rests runs on its centre line, looking down it, as shares of the gap. */
const TRAVEL_SHARES = Object.freeze([0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
/** How far ahead the camera looks down the road while it travels. */
const TRAVEL_LOOK = 10;

/** @typedef {[number, number, number?]} Point2 x and z, and the ground's height there (2026-11-16: hills). */

/**
 * A point on a path at a distance along it (before its start: back along its first segment; past
 * its end: on along its last).
 * @param {ReadonlyArray<Point2>} path @param {number} distance
 * @returns {Point2}
 */
function pointOn(path, distance) {
  let walked = 0;
  for (let i = 0; i < path.length - 1; i += 1) {
    const [ax, az] = path[i];
    const [bx, bz] = path[i + 1];
    const length = Math.hypot(bx - ax, bz - az);
    const last = i === path.length - 2;
    if (distance <= walked + length || last) {
      const t = (distance - walked) / length;
      return [ax + (bx - ax) * t, az + (bz - az) * t];
    }
    walked += length;
  }
  return [path[0][0], path[0][1]];
}

/**
 * How far along a path a point lies: the distance to its nearest point on the path.
 * @param {ReadonlyArray<Point2>} path @param {Point2} p
 */
function distanceAlong(path, p) {
  let best = { d: Infinity, along: 0 };
  let walked = 0;
  for (let i = 0; i < path.length - 1; i += 1) {
    const [ax, az] = path[i];
    const [bx, bz] = path[i + 1];
    const dx = bx - ax;
    const dz = bz - az;
    const length = Math.hypot(dx, dz);
    const t = Math.max(0, Math.min(1, ((p[0] - ax) * dx + (p[1] - az) * dz) / (length * length)));
    const d = Math.hypot(p[0] - (ax + dx * t), p[1] - (az + dz * t));
    if (d < best.d) best = { d, along: walked + length * t };
    walked += length;
  }
  return best.along;
}

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
  const layout = route.road?.layout;
  // The road's centre line from in front of the empty file, down the trunk, the branch taken and on.
  const branch = door === 'a' ? ROAD_PATHS.business : door === 'b' ? ROAD_PATHS.family : null;
  /** @type {Point2[]} */
  const centre = [[0, 60], ...ROAD_PATHS.trunk.slice(1)];
  if (branch) centre.push(...branch.slice(1));
  if (branch && layout) centre.push(...layout.path.slice(branch.length));

  /**
   * The opening framed for this screen as W1 framed it (a wider view, stepped back on a narrow
   * screen), with the eye on the road's centre line (Chris, 2026-11-16: the camera ran to one side of
   * the family road): the eye stands where the road is at its distance along it, and steps back along
   * the road, not along the line of sight (which swings in the turn and moved the eye right before it
   * went left, the R2 sway) nor straight up +z (which put it beside a diagonal branch).
   * @param {{ eye: Vec3, target: Vec3, fov: number }} key
   */
  const framed = (key) => {
    const f = frameCamera({ eye: key.eye, target: key.target, fov: key.fov }, aspect);
    const back = Math.hypot(f.eye[0] - key.eye[0], f.eye[2] - key.eye[2]);
    const [x, z] = pointOn(centre, distanceAlong(centre, [key.eye[0], key.eye[2]]) - back);
    return { eye: /** @type {Vec3} */ ([x, f.eye[1], z]), target: /** @type {Vec3} */ ([...key.target]), fov: f.fov };
  };

  // Distances along the road and places on it, round the bend where the roads meet (W4).
  const along = (/** @type {Vec3} */ p) => (layout ? distanceAlongRoad(layout, [p[0], p[2]]) : 0);
  // `y` above the ground there (2026-11-16: the road rolls over hills).
  const onRoad = (/** @type {number} */ distance, /** @type {number} */ y) => {
    if (!layout) return /** @type {Vec3} */ ([0, y, 0]);
    const { point, height } = roadAt(layout, distance);
    return /** @type {Vec3} */ ([point[0], height + y, point[1]]);
  };

  for (const section of sections) {
    if (section.kind === 'gate') {
      push(section.from, framed(opening.keys[0]), 'gate', true);
    } else if (section.kind === 'opening') {
      // W1's journey sampled densely, each sample's eye put back on the centre line, so the curve
      // between keys cannot cut the turn's corner.
      for (let i = 0; i <= OPENING_SAMPLES; i += 1) {
        const share = i / OPENING_SAMPLES;
        const stop = opening.keys.reduce((name, key) => (key.at <= share + 1e-9 ? key.stop : name), opening.keys[0].stop);
        push(section.from + share * (section.to - section.from), framed(cameraOnKeys(share, opening.keys)), stop, i === 0);
      }
    } else if (section.kind === 'end') {
      continue;
    } else if (layout && route.road) {
      const pose = restFor(section);
      if (!pose) continue;
      // The road between the last pose and this rest: through its middle the camera is on the centre
      // line looking down the road; it turns toward a landmark only leaving and nearing its rest.
      const last = placed[placed.length - 1];
      if (last && section.from > last.px) {
        const start = { px: last.px, along: along(last.eye) };
        const end = along(pose.eye);
        for (const share of TRAVEL_SHARES) {
          const distance = start.along + (end - start.along) * share;
          push(start.px + (section.from - start.px) * share, { eye: onRoad(distance, EYE_HEIGHT), target: onRoad(distance + TRAVEL_LOOK, COMMITS_LOOK_Y), fov: ROAD_FOV }, 'road');
        }
      }
      const moving = section.boxTo ? restFor({ ...section, box: section.boxTo }) : null;
      if (moving) {
        // A held rest moves with its section (W4): straight from the pose at its start to the pose at
        // its end, so the landmark stays under the part of the page it belongs to.
        const length = placed.length;
        push(section.from, pose, String(section.stopId), true);
        if (placed.length > length) placed[placed.length - 1].linear = true;
        push(section.to, moving, String(section.stopId), true);
      } else {
        push(section.from, pose, String(section.stopId), true);
        push(section.to, pose, String(section.stopId), true);
      }
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
    // How I work's commits and a stop of words (done for you, W3) rest on the road, looking down it.
    const kind = index < 0 ? null : route.road.stops[index].kind;
    if (kind !== 'commits' && kind !== 'words') return null;
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

  const end = sections.find((s) => s.kind === 'end');
  /** How much of the world shows at a scroll position: 1, falling to 0 over the end section (W4). @param {number} scrollY */
  const fadeAt = (scrollY) => (end ? Math.min(1, Math.max(0, (end.to - scrollY) / Math.max(1, end.to - end.from))) : 1);

  return {
    keys,
    progressAt,
    fadeAt,
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
 * page has scrolled. A held rest (`data-world-hold="visible"`) and the end section (`data-world-segment
 * ="end"`) are measured as `TrackSection` describes (W4).
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
    if (kind !== 'gate' && kind !== 'opening' && kind !== 'rest' && kind !== 'end') continue;
    const rect = el.getBoundingClientRect();
    const top = rect.top + scroll;
    if (kind === 'end') {
      // The screen before the brief: the world fades out over it (W4).
      sections.push({ kind, from: top - viewportHeight, to: top });
      continue;
    }
    /** @type {TrackSection} */
    const section = { kind, from: top, to: top + Math.max(0, rect.height - viewportHeight) };
    if (kind === 'rest' && el.dataset.worldHold === 'visible') {
      // Not pinned (your idea, W4): held while most of the section is on screen, its target's box
      // taken at the hold's start and end from where the target sits on the page.
      section.stopId = el.dataset.worldStop;
      section.hold = 'visible';
      section.from = top - 0.25 * viewportHeight;
      section.to = top + rect.height - 0.75 * viewportHeight;
      const target = el.querySelector('[data-world-target]');
      if (target) {
        const t = target.getBoundingClientRect();
        const pageTop = t.top + scroll;
        section.box = { x: t.left, y: pageTop - section.from, w: t.width, h: t.height };
        section.boxTo = { x: t.left, y: pageTop - section.to, w: t.width, h: t.height };
      }
    } else if (kind === 'rest') {
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
