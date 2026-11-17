// @ts-check
import { serviceScreens } from '../data/serviceScreens.js';
import { ROAD_PATHS, SLAB_METRICS } from './shapes.js';
import { distanceAlongRoad, roadAt, roadHeadingAt } from './roadPath.js';

export { distanceAlongRoad, roadAt, roadBetween, roadHeadingAt, roadLength } from './roadPath.js';

/** @typedef {import('./roads.js').RoadStop} RoadStop */
/** @typedef {[number, number, number]} Vec3 */
/** @typedef {[number, number, number?]} Point2 A point on the ground: x and z, and the ground's height there (2026-11-16: hills), 0 when absent. */

/**
 * A landmark beside the road: its centre, the unit direction its face looks (back up the road,
 * toward the arriving camera), and its size in world units.
 * @typedef {{ stopId: string, kind: RoadStop['kind'], center: Vec3, facing: Vec3, width: number, height: number }} Landmark
 */

/** Distance along the road between one landmark and the next, in world units. */
export const ROAD_STEP = 14;
/**
 * The business road's stops stand three steps apart (Chris, 2026-11-16: "the business side road needs to
 * be longer … and it items along the way need to be spread out"; "3x: one in view"): beyond the fog's
 * far edge (46) from each other, so one landmark is in view at a time. The family road too (Chris,
 * 2026-11-17: "extend the family side as well. just like you did for business"). The meeting stops keep
 * `ROAD_STEP`.
 */
export const BUSINESS_STEP = 3 * ROAD_STEP;

/**
 * The distance between a door's road stops.
 * @param {'a' | 'b'} door
 */
export function roadStepFor(door) {
  void door;
  return BUSINESS_STEP;
}
/** How far beside the road's centre line each landmark stands. */
export const LATERAL = 4.2;
/** How far past the branch's end the first landmark stands. */
const FIRST_AT = 7;
/** Half the branch road's width: its edges, where the commits of how I work stand. */
const ROAD_HALF_WIDTH = 1.6;
/** The three commits of how I work, this far apart along the edge. */
export const COMMIT_GAP = 4;
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

/**
 * Each road's shape between its branch's end and the bend where the roads meet (Chris, 2026-11-16: "A
 * with C on business, B with C on family"), in radians and world units:
 * - `swing`: the business road's heading swings this far either side of its start, a swing a stop (A);
 * - `corner` and `cornerLength`: the family road turns this far, over this length of road, between
 *   Hearth and the templates, and back before Done for you (B);
 *   (each corner's length is for a `ROAD_STEP` stretch, scaled with the road's step, 2026-11-17);
 * - `hill`: on the business road the ground rises this high midway between stops and is flat at each
 *   stop (C);
 * - the long family road (Chris, 2026-11-17: "Mix: one tall, then rolling", "Corners + gentle bends"):
 *   stretch by stretch, one `tallHill` hill, then two `hill` hills, every stop in a hollow (three were
 *   too narrow for the camera's travel keys to ride); and each
 *   stretch without a corner bends `bend` either way, alternating, back to the road's own heading at
 *   each stop.
 * Both ease in from nothing at the branch's end and out to nothing at the bend.
 */
export const ROAD_SHAPE = Object.freeze({
  swing: (18 * Math.PI) / 180,
  corner: (35 * Math.PI) / 180,
  cornerLength: 12,
  hill: 2.5,
  tallHill: 7,
  bend: (12 * Math.PI) / 180,
});

/** @param {number} a @param {number} b @param {number} x */
function smoothstep(a, b, x) {
  const t = Math.min(1, Math.max(0, (x - a) / (b - a)));
  return t * t * (3 - 2 * t);
}

/**
 * The onward road from the branch's end to `length` along it, in 1-unit pieces, shaped for its door:
 * the business road winds (each stop on the outside of its curve), the family road turns its corners,
 * and both roll over hills with every stop in a hollow. Each point carries the ground's height.
 * @param {Point2} origin @param {Point2} heading The road's heading at the branch's end.
 * @param {'a' | 'b'} door @param {number} length @param {number} lastRoad Where the last road stop stands.
 * @param {ReadonlyArray<RoadStop>} roadStops
 * @returns {Point2[]}
 */
function shapedRoad(origin, heading, door, length, lastRoad, roadStops) {
  const base = Math.atan2(heading[1], heading[0]);
  // Eases in before the first stop and out after the last, each finished a piece clear of the stop so
  // the road is even either side of every stop; gone a piece before the end, so the last piece runs
  // exactly on the starting heading.
  const ease = (/** @type {number} */ s) => smoothstep(0, FIRST_AT - 1, s) * (1 - smoothstep(lastRoad + 1, length - 1, s));
  // From one stop to the next is one swing; at each stop the heading is the road's own.
  const spacing = roadStepFor(door);
  const wave = (/** @type {number} */ s) => (s - FIRST_AT) / spacing;
  const hearthAt = roadStops.findIndex((stop) => stop.id === 'hearth');
  const doneAt = roadStops.findIndex((stop) => stop.kind === 'words');
  const cornerAt = (/** @type {number} */ index) => FIRST_AT + spacing * (index + 0.5);
  const cornerHalf = (ROAD_SHAPE.cornerLength * spacing) / ROAD_STEP / 2;
  /** The stretches the family road turns a corner in. */
  const cornered = [hearthAt, doneAt - 1].filter((index) => index >= 0);
  /** Which stretch `s` is in (0 from the first stop to the second), and how far through it. @param {number} s */
  const stretch = (s) => {
    const k = Math.floor(wave(s));
    return { k, f: wave(s) - k };
  };
  /** @param {number} s */
  const turn = (s) => {
    if (door === 'a') return ROAD_SHAPE.swing * ease(s) * Math.sin(Math.PI * wave(s));
    let total = 0;
    if (hearthAt >= 0) total += smoothstep(cornerAt(hearthAt) - cornerHalf, cornerAt(hearthAt) + cornerHalf, s);
    if (doneAt > 0) total -= smoothstep(cornerAt(doneAt - 1) - cornerHalf, cornerAt(doneAt - 1) + cornerHalf, s);
    const { k, f } = stretch(s);
    // Flat at both ends, so each stop meets the road's own heading whatever its neighbour does.
    const bend = cornered.includes(k) ? 0 : (ROAD_SHAPE.bend * ease(s) * (1 - Math.cos(2 * Math.PI * f)) * (k % 2 === 0 ? 1 : -1)) / 2;
    return ROAD_SHAPE.corner * total + bend;
  };
  /** @param {number} s */
  const ground = (s) => {
    if (door === 'a') return (ROAD_SHAPE.hill * ease(s) * (1 - Math.cos(2 * Math.PI * wave(s)))) / 2;
    const { k, f } = stretch(s);
    return k % 2 === 0 ? (ROAD_SHAPE.tallHill * ease(s) * (1 - Math.cos(2 * Math.PI * f))) / 2 : (ROAD_SHAPE.hill * ease(s) * (1 - Math.cos(4 * Math.PI * f))) / 2;
  };
  const pieces = Math.max(1, Math.ceil(length));
  const piece = length / pieces;
  /** @type {Point2[]} */
  const points = [];
  let [x, z] = origin;
  for (let i = 1; i <= pieces; i += 1) {
    // Each piece runs at the heading halfway through it.
    const angle = base + turn((i - 0.5) * piece);
    x += Math.cos(angle) * piece;
    z += Math.sin(angle) * piece;
    points.push([x, z, ground(i * piece)]);
  }
  return points;
}

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
 * @returns {{ path: Point2[], landmarks: Landmark[], commits: Point2[], along: number[], origin: Point2, direction: Point2, junction: number, other: Point2[], signs: Array<{ label: string, along: number }>, spurs: Array<{ stopId: string, path: Point2[] }> }}
 *   `along` is each stop's distance along the road; `origin` and `direction` the branch's end and the
 *   road's first heading (mirrored for the family road); `junction` where the shared road begins (the
 *   road's end when no stop is on it); `other` the other road coming in to the junction (empty then);
 *   `signs` a sign across the road half a stretch before each stop with `signBefore` (2026-11-16);
 *   `spurs` the side path to each landmark (`spurPaths`).
 */
export function layoutRoad(stops, door, sizes) {
  const { end, direction } = branchEnd();
  const origin = /** @type {Point2} */ ([end[0], end[1]]);
  const heading = /** @type {Point2} */ ([direction[0], direction[1]]);
  const roadStops = stops.filter((s) => !MEETING_KINDS.includes(s.kind));
  const meetingStops = stops.filter((s) => MEETING_KINDS.includes(s.kind));
  const spacing = roadStepFor(door);
  const lastRoad = roadStops.length > 0 ? FIRST_AT + spacing * (roadStops.length - 1) : 0;

  // The centre line from the branch's end: straight on, then (with meeting stops) the bend and the
  // shared road.
  /** @type {Point2[]} */
  const road = [origin];
  /** @type {Point2[]} */
  let other = [];
  let junction = lastRoad + RUN_ON;
  // The onward road takes its door's shape (2026-11-16), ending flat on its starting heading.
  if (meetingStops.length === 0) {
    road.push(...shapedRoad(origin, heading, door, lastRoad + RUN_ON, lastRoad, roadStops));
  } else {
    road.push(...shapedRoad(origin, heading, door, lastRoad + BEND_AFTER, lastRoad, roadStops));
    const bendIndex = road.length - 1;
    const bendStart = road[bendIndex];
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
    const bend = road.slice(bendIndex, bendIndex + 1 + BEND_PIECES).map(mirror);
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
    const { point } = roadAt(layoutSoFar, distance);
    const here = roadHeadingAt(layoutSoFar, distance);
    const right = /** @type {Point2} */ ([-here[1], here[0]]);
    if (stop.kind === 'commits') {
      // Each commit on the edge square off the road where it stands (the road may be curving).
      for (const offset of [-COMMIT_GAP, 0, COMMIT_GAP]) {
        const p = roadAt(layoutSoFar, distance + offset).point;
        const h = roadHeadingAt(layoutSoFar, distance + offset);
        commits.push([p[0] - h[1] * side * ROAD_HALF_WIDTH, p[1] + h[0] * side * ROAD_HALF_WIDTH]);
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
  /** @type {Array<{ label: string, along: number }>} */
  const signs = [];
  let roadIndex = 0;
  let meetingIndex = 0;
  for (const stop of stops) {
    if (MEETING_KINDS.includes(stop.kind)) {
      const distance = junction + FIRST_AT + ROAD_STEP * meetingIndex;
      along.push(distance);
      place(stop, distance, meetingIndex % 2 === 0 ? -1 : 1);
      meetingIndex += 1;
    } else {
      const distance = FIRST_AT + spacing * roadIndex;
      along.push(distance);
      if (stop.signBefore) signs.push({ label: stop.signBefore, along: distance - spacing / 2 });
      place(stop, distance, roadIndex % 2 === 0 ? -1 : 1);
      roadIndex += 1;
    }
  }

  if (door === 'b') {
    // Mirrored across, keeping the ground's height.
    const flip = (/** @type {Point2} */ p) => /** @type {Point2} */ (p.length > 2 ? [-p[0], p[1], p[2]] : [-p[0], p[1]]);
    for (const landmark of landmarks) {
      landmark.center[0] = -landmark.center[0];
      landmark.facing[0] = noNegativeZero(-landmark.facing[0]);
    }
    const mirrored = { path: path.map(flip), landmarks, commits: commits.map(flip), along, origin: flip(origin), direction: flip(heading), junction, other: other.map(flip), signs };
    return { ...mirrored, spurs: spurPaths(mirrored) };
  }
  const business = { path, landmarks, commits, along, origin, direction: heading, junction, other, signs };
  return { ...business, spurs: spurPaths(business) };
}

/** -0 as 0, so a facing straight back up the shared road reads [0, 0, 1]. @param {number} v */
function noNegativeZero(v) {
  return v === 0 ? 0 : v;
}

/** @param {Readonly<Point2>} from @param {Readonly<Point2>} heading @param {number} distance @returns {Point2} */
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
    // Back across to the road square to the way the landmark faces (back up the road at its stop), as
    // far as it was set off it: the road's point at its stop, also where the road is curving.
    const right = [landmark.facing[2], -landmark.facing[0]];
    const near = roadAt(layout, distanceAlongRoad(layout, foot)).point;
    const side = Math.sign((foot[0] - near[0]) * right[0] + (foot[1] - near[1]) * right[1]) || 1;
    const from = /** @type {Point2} */ ([foot[0] - right[0] * side * LATERAL, foot[1] - right[1] * side * LATERAL]);
    const length = Math.hypot(foot[0] - from[0], foot[1] - from[1]);
    const reach = (length - SPUR_SHORT) / length;
    const to = /** @type {Point2} */ ([from[0] + (foot[0] - from[0]) * reach, from[1] + (foot[1] - from[1]) * reach]);
    return { stopId: landmark.stopId, path: [from, to] };
  });
}
