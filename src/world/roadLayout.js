// @ts-check
import { serviceScreens } from '../data/serviceScreens.js';
import { ROAD_PATHS, SLAB_METRICS } from './shapes.js';

/** @typedef {import('./roads.js').RoadStop} RoadStop */
/** @typedef {[number, number, number]} Vec3 */
/** @typedef {[number, number]} Point2 A point on the ground: x and z. */

/**
 * A landmark beside the road: its centre, the unit direction its face looks (back up the road,
 * toward the arriving camera), and its size in world units.
 * @typedef {{ stopId: string, kind: RoadStop['kind'], center: Vec3, facing: Vec3, width: number, height: number }} Landmark
 */

/** Distance along the road between one landmark and the next, in world units. */
export const ROAD_STEP = 14;
/** How far beside the road's centre line each landmark stands. */
export const LATERAL = 4.2;
/** How far past the branch's end the first landmark stands. */
const FIRST_AT = 7;
/** Half the branch road's width: its edges, where the commits of how I work stand. */
const ROAD_HALF_WIDTH = 1.6;
/** The three commits of how I work, this far apart along the edge. */
const COMMIT_GAP = 4;
/** How far the road runs on past its last stop: past the fog's far edge (46) seen from the camera's
 * last rest, so it fades out instead of ending in front of the camera (Chris, 2026-11-12: "messed up
 * at the end"). */
export const RUN_ON = 60;
/** A side path stops this far short of its landmark's foot, just before the stand's near post. */
const SPUR_SHORT = 0.6;
/** The camera's eye height along the road. */
export const EYE_HEIGHT = 1.6;
/** A landmark stands this share of its height above eye height, so the camera, resting level with
 * a point below its centre, sees it in the upper part of the screen and the stop's words have the
 * lower part (on a phone above all), while staying square on to it. */
export const LOOK_BELOW = 0.35;
/** A screen landmark's width; its height follows the real screen's shape. */
const SCREEN_WIDTH = 6;
/** The product loops are 1280 x 800. */
const LOOP_ASPECT = 1280 / 800;

/**
 * Each landmark's size: products as their 16:10 loops, services as their real screens, and the
 * slabs (the audit's file, Crew Advisors' unfinished one) as their code lays out.
 * @param {ReadonlyArray<RoadStop>} stops
 * @param {Readonly<Record<string, string>>} sources Approved excerpt code by excerpt id.
 * @returns {Record<string, { width: number, height: number }>}
 */
export function roadSizes(stops, sources) {
  /** @type {Record<string, { width: number, height: number }>} */
  const sizes = {};
  for (const stop of stops) {
    if (stop.kind === 'product') {
      sizes[stop.id] = { width: SCREEN_WIDTH, height: SCREEN_WIDTH / LOOP_ASPECT };
    } else if (stop.kind === 'service') {
      const screen = serviceScreens[/** @type {keyof typeof serviceScreens} */ (stop.id)];
      if (!screen) throw new Error(`The service ${stop.id} has no screen.`);
      sizes[stop.id] = { width: SCREEN_WIDTH, height: (SCREEN_WIDTH * screen.height) / screen.width };
    } else if (stop.kind === 'audit' || stop.kind === 'unfinished') {
      const code = stop.excerptId ? sources[stop.excerptId] : undefined;
      if (code === undefined) throw new Error(`No code for ${stop.id}.`);
      const lines = code.split('\n');
      sizes[stop.id] = {
        width: Math.max(...lines.map((line) => line.length)) * SLAB_METRICS.charWidth,
        height: lines.length * SLAB_METRICS.lineHeight,
      };
    }
  }
  return sizes;
}

/**
 * The business branch's end and its last direction on the ground; the road runs straight on.
 * @returns {{ end: Point2, direction: Point2 }}
 */
function branchEnd() {
  const path = ROAD_PATHS.business;
  const end = path[path.length - 1];
  const before = path[path.length - 2];
  const length = Math.hypot(end[0] - before[0], end[1] - before[1]);
  return { end, direction: [(end[0] - before[0]) / length, (end[1] - before[1]) / length] };
}

/**
 * Where everything on a road stands: the road's path (the branch, then straight on), a landmark per
 * stop set `LATERAL` to the side on alternating sides (the first on the road's outer side), facing
 * back up the road, and, for how I work, three commit points on the road's edge. Laid out for the
 * business road; the family road is its mirror image in x.
 * @param {ReadonlyArray<RoadStop>} stops
 * @param {'a' | 'b'} door
 * @param {Readonly<Record<string, { width: number, height: number }>>} sizes From `roadSizes`.
 * @returns {{ path: Point2[], landmarks: Landmark[], commits: Point2[], along: number[], origin: Point2, direction: Point2, spurs: Array<{ stopId: string, path: Point2[] }> }}
 *   `along` is each stop's distance along the road past the branch's end; `origin` and `direction`
 *   the straight road's start and heading (mirrored for the family road); `spurs` the side path to
 *   each landmark (`spurPaths`).
 */
export function layoutRoad(stops, door, sizes) {
  const { end, direction } = branchEnd();
  // To the traveller's right, on the ground; the business road's outer side is its left.
  const right = /** @type {Point2} */ ([-direction[1], direction[0]]);
  const at = (/** @type {number} */ along, /** @type {number} */ lateral) =>
    /** @type {Point2} */ ([end[0] + direction[0] * along + right[0] * lateral, end[1] + direction[1] * along + right[1] * lateral]);
  const facing = /** @type {Vec3} */ ([-direction[0], 0, -direction[1]]);

  /** @type {Landmark[]} */
  const landmarks = [];
  /** @type {Point2[]} */
  const commits = [];
  /** @type {number[]} */
  const along = [];
  stops.forEach((stop, k) => {
    const distance = FIRST_AT + ROAD_STEP * k;
    along.push(distance);
    const side = k % 2 === 0 ? -1 : 1;
    if (stop.kind === 'commits') {
      for (const offset of [-COMMIT_GAP, 0, COMMIT_GAP]) commits.push(at(distance + offset, side * ROAD_HALF_WIDTH));
      return;
    }
    const size = sizes[stop.id];
    if (!size) throw new Error(`No size for ${stop.id}.`);
    const ground = at(distance, side * LATERAL);
    landmarks.push({ stopId: stop.id, kind: stop.kind, center: [ground[0], EYE_HEIGHT + LOOK_BELOW * size.height, ground[1]], facing: [...facing], width: size.width, height: size.height });
  });

  const last = along.length > 0 ? along[along.length - 1] : 0;
  /** @type {Point2[]} */
  const path = [...ROAD_PATHS.business.map((p) => /** @type {Point2} */ ([p[0], p[1]])), at(last + RUN_ON, 0)];
  const origin = /** @type {Point2} */ ([end[0], end[1]]);
  const heading = /** @type {Point2} */ ([direction[0], direction[1]]);

  if (door === 'b') {
    const flip = (/** @type {Point2} */ p) => /** @type {Point2} */ ([-p[0], p[1]]);
    for (const landmark of landmarks) {
      landmark.center[0] = -landmark.center[0];
      landmark.facing[0] = -landmark.facing[0];
    }
    const mirrored = { path: path.map(flip), landmarks, commits: commits.map(flip), along, origin: flip(origin), direction: flip(heading) };
    return { ...mirrored, spurs: spurPaths(mirrored) };
  }
  const business = { path, landmarks, commits, along, origin, direction: heading };
  return { ...business, spurs: spurPaths(business) };
}

/**
 * A side path from the road to each landmark (Chris, 2026-11-12: "side sections that run to the
 * screens"): straight, square off the road at the landmark's place along it, on its side, from the
 * road's centre line to `SPUR_SHORT` short of the landmark's foot (its centre on the ground). How I
 * work has no landmark, so no side path. Works for either door's layout.
 * @param {{ landmarks: ReadonlyArray<Landmark>, origin: Point2, direction: Point2 }} layout From `layoutRoad`.
 * @returns {Array<{ stopId: string, path: Point2[] }>}
 */
export function spurPaths(layout) {
  const [ox, oz] = layout.origin;
  const [dx, dz] = layout.direction;
  return layout.landmarks.map((landmark) => {
    const foot = /** @type {Point2} */ ([landmark.center[0], landmark.center[2]]);
    const along = (foot[0] - ox) * dx + (foot[1] - oz) * dz;
    const from = /** @type {Point2} */ ([ox + dx * along, oz + dz * along]);
    const length = Math.hypot(foot[0] - from[0], foot[1] - from[1]);
    const reach = (length - SPUR_SHORT) / length;
    const to = /** @type {Point2} */ ([from[0] + (foot[0] - from[0]) * reach, from[1] + (foot[1] - from[1]) * reach]);
    return { stopId: landmark.stopId, path: [from, to] };
  });
}
