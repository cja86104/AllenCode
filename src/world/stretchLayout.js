// @ts-check
import { chapterLayout } from '../scenes/flight.jsx';
import { restPose } from './restPose.js';

/** @typedef {[number, number, number]} Vec3 */
/** @typedef {[number, number]} Point2 A point on the ground: x and z. */
/** @typedef {import('./roads.js').RoadStop} RoadStop */
/** @typedef {import('./roadLayout.js').Landmark} Landmark */
/** @typedef {import('./camera.js').CameraKey} CameraKey */

/**
 * A stretch's timing in screens of scroll (Code World W5a): a screen of driving to the lead, then
 * half a screen at rest while its code lands as the page's headline, from 1.05 screens. As shares of
 * the stretch: `drive` where the camera comes to rest, `landFrom` where the landing starts.
 */
export const STRETCH = Object.freeze({ screens: 1.5, drive: 1 / 1.5, landFrom: 1.05 / 1.5 });

/** The road's half width, as the home road's. */
const ROAD_HALF = 1.6;
/** Between a roadside landmark's near edge and the road. */
const VERGE = 0.6;
/** Where the first landmark stands along the road, and the distance between landmarks. */
const FIRST_AT = 10;
const STEP = 9;
/** The lead stands this far past the last of the others; the road runs on this far past the lead. */
const LEAD_GAP = 5;
const RUN_ON = 14;
/** A landmark's lower edge stands this high above the road. */
const LIFT = 0.9;
/** The camera's height and how far ahead it looks while driving; its field of view throughout. */
const EYE_HEIGHT = 1.6;
const LOOK_AHEAD = 12;
const FOV = 52;
/** Every landmark faces straight back up the road. */
const FACING = /** @type {Vec3} */ ([0, 0, 1]);

/**
 * Where the lead rests on the screen: the box a home chapter's screen takes in this viewport (the
 * stage of `chapterLayout`), as large as fits at the lead's own shape and centred in it.
 * @param {{ width: number, height: number }} lead
 * @param {{ width: number, height: number }} viewport
 * @returns {{ x: number, y: number, w: number, h: number }}
 */
export function stretchRestBox(lead, viewport) {
  const { stage } = chapterLayout(viewport.width, viewport.height);
  const aspect = lead.width / lead.height;
  const w = Math.min(stage.w, stage.h * aspect);
  const h = w / aspect;
  return { x: stage.x + (stage.w - w) / 2, y: stage.y + (stage.h - h) / 2, w, h };
}

/**
 * A stretch's straight road down -z, its landmarks and the camera's keys (Code World W5a). The stops
 * before the lead stand alternately right and left of the road, clear of it, a step apart; the lead
 * stands across the road's end. The camera drives down the road, passing each, and comes to rest
 * square on to the lead at `STRETCH.drive`, still from there to the end.
 * @param {ReadonlyArray<RoadStop>} stops In road order, the lead last.
 * @param {Readonly<Record<string, { width: number, height: number }>>} sizes From `roadSizes`.
 * @param {{ width: number, height: number }} viewport
 * @returns {{ path: Point2[], landmarks: Landmark[], keys: CameraKey[] }}
 */
export function layoutStretch(stops, sizes, viewport) {
  if (stops.length === 0) throw new Error('A stretch needs at least one stop.');
  /** @type {Landmark[]} */
  const landmarks = stops.map((stop, i) => {
    const size = sizes[stop.id];
    if (!size) throw new Error(`No size for ${stop.id}.`);
    const isLead = i === stops.length - 1;
    const along = isLead ? FIRST_AT + STEP * (stops.length - 1) + (stops.length > 1 ? LEAD_GAP : 0) : FIRST_AT + STEP * i;
    const side = i % 2 === 0 ? 1 : -1;
    const x = isLead ? 0 : side * (ROAD_HALF + VERGE + size.width / 2);
    return { stopId: stop.id, kind: stop.kind, center: /** @type {Vec3} */ ([x, LIFT + size.height / 2, -along]), facing: FACING, width: size.width, height: size.height };
  });
  const lead = landmarks[landmarks.length - 1];
  const path = /** @type {Point2[]} */ ([
    [0, 4],
    [0, lead.center[2] - RUN_ON],
  ]);
  const rest = restPose(lead, stretchRestBox(lead, viewport), viewport, FOV);
  /** @type {CameraKey[]} */
  const keys = [{ at: 0, stop: 'stretch', eye: [0, EYE_HEIGHT, 6], target: [0, EYE_HEIGHT - 0.2, 6 - LOOK_AHEAD], fov: FOV }];
  // Passing each of the others, level with it, looking on down the road.
  landmarks.slice(0, -1).forEach((landmark, i) => {
    const z = landmark.center[2];
    keys.push({ at: (STRETCH.drive * (i + 1)) / landmarks.length, stop: landmark.stopId, eye: [0, EYE_HEIGHT, z], target: [0, EYE_HEIGHT - 0.2, z - LOOK_AHEAD], fov: FOV });
  });
  keys.push({ at: STRETCH.drive, stop: lead.stopId, ...rest, still: true });
  keys.push({ at: 1, stop: lead.stopId, ...rest, still: true });
  return { path, landmarks, keys };
}
