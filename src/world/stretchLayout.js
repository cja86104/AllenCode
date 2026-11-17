// @ts-check
import { chapterLayout } from '../scenes/flight.jsx';
import { restPose } from './restPose.js';

/** @typedef {[number, number, number]} Vec3 */
/** @typedef {[number, number]} Point2 A point on the ground: x and z. */
/** @typedef {import('./roads.js').RoadStop} RoadStop */
/** @typedef {import('./roadLayout.js').Landmark} Landmark */
/** @typedef {import('./camera.js').CameraKey} CameraKey */

/**
 * A stretch's timing in screens of scroll (Code World W5a; shorter since 2026-11-17, Chris: "i want it
 * to be shorter as well just so it shows that frame at the end"): half a screen of driving to the lead,
 * then at rest while its code lands as the page's headline, from 0.55 screens. As shares of the
 * stretch: `drive` where the camera comes to rest, `landFrom` where the landing starts.
 */
export const STRETCH = Object.freeze({ screens: 1, drive: 0.5, landFrom: 0.55 });

/** Where the lead stands down the road, on every page, so its screen is in view from the start. */
export const STRETCH_LEAD_AT = 26;
/** The road runs on this far past the lead. */
const RUN_ON = 14;
/** A landmark's lower edge stands this high above the road. */
const LIFT = 0.9;
/**
 * The camera at the start: higher than the home road's eye (1.6) and looking down onto the road ahead,
 * so the word lying on it reads (2026-11-17: at eye height the letters were too edge-on to read); how
 * far ahead it looks, and its field of view throughout.
 */
const DRIVE_EYE = 3.4;
const DRIVE_LOOK_Y = 0.6;
const LOOK_AHEAD = 12;
const FOV = 52;
/** The lead faces straight back up the road. */
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
 * A stretch's straight road down -z with its one stop, the lead, across the road's end at
 * `STRETCH_LEAD_AT` (2026-11-17: no boards beside the road), and the camera's keys: it drives down the
 * road from above (`DRIVE_EYE`) and comes to rest square on to the lead at `STRETCH.drive`, still from
 * there to the end.
 * @param {ReadonlyArray<RoadStop>} stops The stretch's one stop, its lead.
 * @param {Readonly<Record<string, { width: number, height: number }>>} sizes From `roadSizes`.
 * @param {{ width: number, height: number }} viewport
 * @returns {{ path: Point2[], landmarks: Landmark[], keys: CameraKey[] }}
 */
export function layoutStretch(stops, sizes, viewport) {
  if (stops.length !== 1) throw new Error('A stretch has one stop: its lead, at the end of the road.');
  const stop = stops[0];
  const size = sizes[stop.id];
  if (!size) throw new Error(`No size for ${stop.id}.`);
  const lead = { stopId: stop.id, kind: stop.kind, center: /** @type {Vec3} */ ([0, LIFT + size.height / 2, -STRETCH_LEAD_AT]), facing: FACING, width: size.width, height: size.height };
  const path = /** @type {Point2[]} */ ([
    [0, 4],
    [0, -STRETCH_LEAD_AT - RUN_ON],
  ]);
  const rest = restPose(lead, stretchRestBox(lead, viewport), viewport, FOV);
  /** @type {CameraKey[]} */
  const keys = [
    { at: 0, stop: 'stretch', eye: [0, DRIVE_EYE, 6], target: [0, DRIVE_LOOK_Y, 6 - LOOK_AHEAD], fov: FOV },
    { at: STRETCH.drive, stop: lead.stopId, ...rest, still: true },
    { at: 1, stop: lead.stopId, ...rest, still: true },
  ];
  return { path, landmarks: [lead], keys };
}
