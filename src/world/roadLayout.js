// @ts-check
import { serviceScreens } from '../data/serviceScreens.js';
import { ROAD_PATHS, SLAB_METRICS } from './shapes.js';
import { distanceAlongRoad, roadAt } from './roadPath.js';

export { distanceAlongRoad, roadAt, roadBetween, roadLength } from './roadPath.js';

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
/** Where the roads meet (W4): the road bends this far past its last stop... */
export const BEND_AFTER = 14;
/** ...over this length, from its heading to straight down −z, where the shared road begins. */
export const BEND_LENGTH = 20;
/** The other road, coming in to the junction from the other side, is drawn this long. */
export const OTHER_ROAD = 40;
/** The bend is drawn as this many straight pieces. */
const BEND_PIECES = 10;
/** The shared road's heading, and the way its landmarks face (back up it). */
const SHARED_HEADING = /** @type {Point2} */ ([0, -1]);
/** Stops on the shared road, where the roads meet. */
const MEETING_KINDS = Object.freeze(['portrait', 'sketch']);

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
 * Each landmark's size: products and templates as their 16:10 loops, services as their real screens,
 * and the slabs (the audit's file, Crew Advisors' unfinished one) as their code lays out.
 * @param {ReadonlyArray<RoadStop>} stops
 * @param {Readonly<Record<string, string>>} sources Approved excerpt code by excerpt id.
 * @returns {Record<string, { width: number, height: number }>}
 */
export function roadSizes(stops, sources) {
  /** @type {Record<string, { width: number, height: number }>} */
  const sizes = {};
  for (const stop of stops) {
    if (stop.kind === 'product' || stop.kind === 'template') {
      sizes[stop.id] = { width: SCREEN_WIDTH, height: SCREEN_WIDTH / LOOP_ASPECT };
    } else if (stop.kind === 'service') {
      const screen = serviceScreens[/** @type {keyof typeof serviceScreens} */ (stop.id)];
      if (!screen) throw new Error(`The service ${stop.id} has no screen.`);
      sizes[stop.id] = { width: SCREEN_WIDTH, height: (SCREEN_WIDTH * screen.height) / screen.width };
    } else if (stop.kind === 'portrait') {
      // The workshop: the shape of Chris's photo (960 × 1200).
      sizes[stop.id] = { width: SCREEN_WIDTH, height: (SCREEN_WIDTH * 5) / 4 };
    } else if (stop.kind === 'sketch') {
      // Your idea: the sketch's 4:3 drawing space.
      sizes[stop.id] = { width: SCREEN_WIDTH, height: (SCREEN_WIDTH * 3) / 4 };
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
 * Where everything on a road stands: the road's path (the branch, straight on past the road's stops,
 * and, when there are stops where the roads meet (W4), a bend to straight down −z and the shared road),
 * a landmark per stop set `LATERAL` to the side on alternating sides (the first on the road's outer
 * side), facing back up the road, and, for how I work, three commit points on the road's edge. Laid
 * out for the business road; the family road is its mirror image in x. Distances along the road
 * (`along`, `junction`, `roadAt`) are measured from the branch's end.
 * @param {ReadonlyArray<RoadStop>} stops
 * @param {'a' | 'b'} door
 * @param {Record<string, { width: number, height: number }>} sizes From `roadSizes`.
 * @returns {{ path: Point2[], landmarks: Landmark[], commits: Point2[], along: number[], origin: Point2, direction: Point2, junction: number, other: Point2[], spurs: Array<{ stopId: string, path: Point2[] }> }}
 *   `along` is each stop's distance along the road; `origin` and `direction` the branch's end and the
 *   road's first heading (mirrored for the family road); `junction` where the shared road begins (the
 *   road's end when no stop is on it); `other` the other road coming in to the junction (empty then);
 *   `spurs` the side path to each landmark (`spurPaths`).
 */
export function layoutRoad(stops, door, sizes) {
  const { end, direction } = branchEnd();
  const origin = /** @type {Point2} */ ([end[0], end[1]]);
  const heading = /** @type {Point2} */ ([direction[0], direction[1]]);
  const roadStops = stops.filter((s) => !MEETING_KINDS.includes(s.kind));
  const meetingStops = stops.filter((s) => MEETING_KINDS.includes(s.kind));
  const lastRoad = roadStops.length > 0 ? FIRST_AT + ROAD_STEP * (roadStops.length - 1) : 0;

  // The centre line from the branch's end: straight on, then (with meeting stops) the bend and the
  // shared road.
  /** @type {Point2[]} */
  const road = [origin];
  /** @type {Point2[]} */
  let other = [];
  let junction = lastRoad + RUN_ON;
  if (meetingStops.length === 0) {
    road.push(step(origin, heading, lastRoad + RUN_ON));
  } else {
    const bendStart = step(origin, heading, lastRoad + BEND_AFTER);
    road.push(bendStart);
    const from = Math.atan2(heading[1], heading[0]);
    const to = Math.atan2(SHARED_HEADING[1], SHARED_HEADING[0]);
    const piece = BEND_LENGTH / BEND_PIECES;
    let at = bendStart;
    for (let i = 0; i < BEND_PIECES; i += 1) {
      // Each piece runs at the heading halfway through it, so the bend is a sampled circular arc.
      const angle = from + (to - from) * ((i + 0.5) / BEND_PIECES);
      at = step(at, [Math.cos(angle), Math.sin(angle)], piece);
      road.push(at);
    }
    junction = lastRoad + BEND_AFTER + BEND_LENGTH;
    const lastMeeting = junction + FIRST_AT + ROAD_STEP * (meetingStops.length - 1);
    road.push(step(at, SHARED_HEADING, lastMeeting + RUN_ON - junction));
    // The other road: the bend's mirror image about the shared road's centre line, run back into the fog.
    const jx = at[0];
    const mirror = (/** @type {Point2} */ p) => /** @type {Point2} */ ([2 * jx - p[0], p[1]]);
    const bend = road.slice(1, 2 + BEND_PIECES).map(mirror);
    const straight = OTHER_ROAD - BEND_LENGTH;
    const startOther = mirror(step(bendStart, heading, -straight));
    other = [startOther, ...bend];
  }

  const branch = ROAD_PATHS.business.map((p) => /** @type {Point2} */ ([p[0], p[1]]));
  /** @type {Point2[]} */
  const path = [...branch, ...road.slice(1)];
  const layoutSoFar = { path, origin, direction: heading };

  /** @type {Landmark[]} */
  const landmarks = [];
  /** @type {Point2[]} */
  const commits = [];
  /** @type {number[]} */
  const along = [];
  /**
   * @param {RoadStop} stop @param {number} distance @param {number} side
   */
  const place = (stop, distance, side) => {
    const { point, heading: here } = roadAt(layoutSoFar, distance);
    const right = /** @type {Point2} */ ([-here[1], here[0]]);
    if (stop.kind === 'commits') {
      for (const offset of [-COMMIT_GAP, 0, COMMIT_GAP]) {
        const p = roadAt(layoutSoFar, distance + offset).point;
        commits.push([p[0] + right[0] * side * ROAD_HALF_WIDTH, p[1] + right[1] * side * ROAD_HALF_WIDTH]);
      }
      return;
    }
    // A stop of words (done for you, W3) has no landmark: the camera rests on the road there.
    if (stop.kind === 'words') return;
    const size = sizes[stop.id];
    if (!size) throw new Error(`No size for ${stop.id}.`);
    const ground = [point[0] + right[0] * side * LATERAL, point[1] + right[1] * side * LATERAL];
    landmarks.push({
      stopId: stop.id,
      kind: stop.kind,
      center: [ground[0], EYE_HEIGHT + LOOK_BELOW * size.height, ground[1]],
      facing: [noNegativeZero(-here[0]), 0, noNegativeZero(-here[1])],
      width: size.width,
      height: size.height,
    });
  };
  let roadIndex = 0;
  let meetingIndex = 0;
  for (const stop of stops) {
    if (MEETING_KINDS.includes(stop.kind)) {
      const distance = junction + FIRST_AT + ROAD_STEP * meetingIndex;
      along.push(distance);
      place(stop, distance, meetingIndex % 2 === 0 ? -1 : 1);
      meetingIndex += 1;
    } else {
      const distance = FIRST_AT + ROAD_STEP * roadIndex;
      along.push(distance);
      place(stop, distance, roadIndex % 2 === 0 ? -1 : 1);
      roadIndex += 1;
    }
  }

  if (door === 'b') {
    const flip = (/** @type {Point2} */ p) => /** @type {Point2} */ ([-p[0], p[1]]);
    for (const landmark of landmarks) {
      landmark.center[0] = -landmark.center[0];
      landmark.facing[0] = noNegativeZero(-landmark.facing[0]);
    }
    const mirrored = { path: path.map(flip), landmarks, commits: commits.map(flip), along, origin: flip(origin), direction: flip(heading), junction, other: other.map(flip) };
    return { ...mirrored, spurs: spurPaths(mirrored) };
  }
  const business = { path, landmarks, commits, along, origin, direction: heading, junction, other };
  return { ...business, spurs: spurPaths(business) };
}

/** -0 as 0, so a facing straight back up the shared road reads [0, 0, 1]. @param {number} v */
function noNegativeZero(v) {
  return v === 0 ? 0 : v;
}

/** @param {Point2} from @param {ReadonlyArray<number>} heading @param {number} distance @returns {Point2} */
function step(from, heading, distance) {
  return [from[0] + heading[0] * distance, from[1] + heading[1] * distance];
}

/**
 * A side path from the road to each landmark (Chris, 2026-11-12: "side sections that run to the
 * screens"): straight, square off the road at the landmark's place along it, on its side, from the
 * road's centre line to `SPUR_SHORT` short of the landmark's foot (its centre on the ground). How I
 * work has no landmark, so no side path. Works for either door's layout.
 * @param {{ landmarks: ReadonlyArray<Landmark>, path: ReadonlyArray<Point2>, origin: Point2 }} layout From `layoutRoad`.
 * @returns {Array<{ stopId: string, path: Point2[] }>}
 */
export function spurPaths(layout) {
  return layout.landmarks.map((landmark) => {
    const foot = /** @type {Point2} */ ([landmark.center[0], landmark.center[2]]);
    const from = roadAt(layout, distanceAlongRoad(layout, foot)).point;
    const length = Math.hypot(foot[0] - from[0], foot[1] - from[1]);
    const reach = (length - SPUR_SHORT) / length;
    const to = /** @type {Point2} */ ([from[0] + (foot[0] - from[0]) * reach, from[1] + (foot[1] - from[1]) * reach]);
    return { stopId: landmark.stopId, path: [from, to] };
  });
}
