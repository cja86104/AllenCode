// @ts-check
import { cameraAt } from './camera.js';
import { EYE_HEIGHT, LOOK_BELOW, layoutRoad } from './roadLayout.js';

/** @typedef {[number, number, number]} Vec3 */
/** @typedef {import('./roads.js').RoadStop} RoadStop */
/** @typedef {import('./roadLayout.js').Landmark} Landmark */
/** @typedef {import('./camera.js').CameraKey} CameraKey */
/** @typedef {'a' | 'b'} Door 'a': the business road (left). 'b': the family road (right). */
/** @typedef {{ id: string, name: string, from: number, to: number }} JourneyStop */

/**
 * A camera key placed in screens of scroll from the top, before the journey is scaled to 0..1.
 * @typedef {{ screens: number, stop: string, eye: Vec3, target: Vec3, fov: number, still?: boolean, aside?: Vec3 }} PlacedKey
 */

/**
 * A landmark on the journey: where it stands, its stop's span, and when the camera arrives at it
 * and leaves (0..1 of the journey).
 * @typedef {Landmark & { from: number, to: number, arriveAt: number, holdAt: number }} JourneyLandmark
 */

/**
 * @typedef {{
 *   keys: CameraKey[],
 *   stops: JourneyStop[],
 *   screens: number,
 *   splitAt: number,
 *   landmarks: JourneyLandmark[],
 *   commits: { from: number, to: number, along: number[], origin: [number, number], direction: [number, number] } | null,
 * }} Journey
 */

/**
 * The shared opening, the same for every visitor (spec section 3): the empty file, into the code,
 * the road, and the split. Placed in screens of scroll; one object per key, so every road shares
 * them exactly.
 * @type {ReadonlyArray<PlacedKey>}
 */
const SHARED = Object.freeze([
  { screens: 0, stop: 'empty file', eye: /** @type {Vec3} */ ([0, 1.6, 7]), target: /** @type {Vec3} */ ([0, 1.6, 0]), fov: 45 },
  { screens: 1, stop: 'empty file', eye: /** @type {Vec3} */ ([0, 1.6, 3.2]), target: /** @type {Vec3} */ ([0, 1.6, 0]), fov: 50 },
  { screens: 2, stop: 'into the code', eye: /** @type {Vec3} */ ([0, 1.3, -3]), target: /** @type {Vec3} */ ([0, 0.9, -12]), fov: 62 },
  { screens: 3.2, stop: 'the road', eye: /** @type {Vec3} */ ([0, 1.2, -15]), target: /** @type {Vec3} */ ([0, 0.8, -27]), fov: 55 },
  // The split: higher and further back, looking down where the road divides, both branches in view.
  { screens: 4.4, stop: 'the fork', eye: /** @type {Vec3} */ ([0, 2.2, -30]), target: /** @type {Vec3} */ ([0, 0.4, -46]), fov: 58 },
].map((key) => Object.freeze(key)));

/** The business road's turn (left); the family road is its mirror image (right). */
const BRANCH = Object.freeze([
  { screens: 5.6, eye: /** @type {Vec3} */ ([-1.6, 1.7, -41]), target: /** @type {Vec3} */ ([-5, 1.3, -52]), fov: 52 },
  { screens: 6.8, eye: /** @type {Vec3} */ ([-4.4, 1.5, -49]), target: /** @type {Vec3} */ ([-6.6, 1.2, -58]), fov: 52 },
]);

/** The words for each road once taken: the signposts' own labels. */
const BRANCH_NAMES = Object.freeze({ a: 'business/', b: 'family/' });

/** Where each stop begins and ends, in screens of scroll; the fork's ends where the road is taken. */
const OPENING_STOPS = Object.freeze([
  { id: 'empty-file', name: 'Empty file', from: 0, to: 2 },
  { id: 'into-the-code', name: 'Into the code', from: 2, to: 3.2 },
  { id: 'the-road', name: 'The road', from: 3.2, to: 3.8 },
]);
const SPLIT_SCREENS = SHARED[SHARED.length - 1].screens;
/** The fork's stop runs this far past the split once a road is taken, while the camera turns. */
const FORK_AFTER_SPLIT = 0.6;

/** Each stop on a road gets the same scroll: 1.5 screens (spec section 3). */
const STOP_SCREENS = 1.5;
/** Within a road stop: the camera comes to rest at a landmark here, and leaves it here. */
const ARRIVE_SCREENS = 0.6;
const HOLD_SCREENS = 1;
/** The landmark hands over to its real thing over this much scroll, before arriving and after. */
const HANDOVER_SCREENS = 0.15;
/** The road's field of view, in degrees. */
const ROAD_FOV = 52;
/** Crew Advisors is typed from this share of its code to this one across its stop, as on the
 * products page (`ProductChapter.jsx`), and never finished. */
export const TYPED_FROM = 0.15;
export const TYPED_TO = 0.65;
/** Along how I work: where the camera is, past the stop's position, at the stop's quarter points
 * and its end (the commits stand 4 before, at, and 4 past it), so it passes one commit per quarter. */
const COMMIT_EYES = Object.freeze([-8, -2, 2, 6]);
/** Kinds whose landmark hands over to a real thing. */
const HANDS_OVER = Object.freeze(['product', 'service', 'audit']);

/**
 * How far from a landmark the camera rests: its width in view with room around it.
 * @param {{ width: number, height: number }} size
 */
const restDistance = (size) => 1.25 * Math.max(size.width, 1.6 * size.height);

/**
 * The camera's journey for a visitor (Code World spec, section 3): the shared opening to the split,
 * then, once a road is taken, down that road and, when the road has stops (W2), past each of its
 * landmarks: arriving square on to each, resting while it hands over to its real thing, then on to
 * the next. Without a road the journey ends at the split, where the camera waits, looking down both
 * branches. Keys and stops are scaled to 0..1 of the journey; `screens` is its length in screens of
 * scroll and `splitAt` where the split sits in 0..1.
 * @param {Door | null} door
 * @param {ReadonlyArray<RoadStop>} [roadStops] The road's stops (`businessRoadStops`); none: W1's journey.
 * @param {Readonly<Record<string, { width: number, height: number }>>} [sizes] From `roadSizes`.
 * @returns {Journey}
 */
export function buildJourney(door, roadStops = [], sizes = {}) {
  const side = door === 'b' ? -1 : 1;
  /** @type {PlacedKey[]} */
  const placed = [...SHARED];
  if (door) {
    for (const key of BRANCH) {
      placed.push({
        screens: key.screens,
        stop: BRANCH_NAMES[door],
        eye: [key.eye[0] * side, key.eye[1], key.eye[2]],
        target: [key.target[0] * side, key.target[1], key.target[2]],
        fov: key.fov,
      });
    }
  }
  const branchEnd = placed[placed.length - 1].screens;
  const road = door && roadStops.length > 0 ? placeRoad(door, roadStops, sizes, branchEnd, placed) : null;
  const screens = road ? road.end : branchEnd;
  const keys = placed.map((key) => {
    /** @type {CameraKey} */
    const camera = { at: key.screens / screens, stop: key.stop, eye: key.eye, target: key.target, fov: key.fov };
    if (key.still) camera.still = true;
    if (key.aside) camera.aside = key.aside;
    return camera;
  });
  keys[keys.length - 1].at = 1;

  const forkTo = door ? SPLIT_SCREENS + FORK_AFTER_SPLIT : SPLIT_SCREENS;
  /** @type {JourneyStop[]} */
  const stops = [...OPENING_STOPS.map((stop) => ({ ...stop })), { id: 'the-fork', name: 'The fork', from: 3.8, to: forkTo }];
  if (door) stops.push({ id: door === 'a' ? 'business-road' : 'family-road', name: BRANCH_NAMES[door], from: forkTo, to: branchEnd });
  if (road) stops.push(...road.stops);
  for (const stop of stops) {
    stop.from /= screens;
    stop.to /= screens;
  }
  stops[stops.length - 1].to = 1;

  /** @type {JourneyLandmark[]} */
  const landmarks = road
    ? road.landmarks.map((landmark) => ({
        ...landmark,
        from: landmark.from / screens,
        to: landmark.to / screens,
        arriveAt: landmark.arriveAt / screens,
        holdAt: landmark.holdAt / screens,
      }))
    : [];
  const commits = road?.commits ? { ...road.commits, from: road.commits.from / screens, to: road.commits.to / screens } : null;

  return { keys, stops, screens, splitAt: SPLIT_SCREENS / screens, landmarks, commits };
}

/**
 * Places a road's stops after the branch, in screens of scroll: the camera keys (pushed onto
 * `placed`), the stops, the landmarks with their arrive and hold points, and how I work's commits.
 * Each landmark stop rests square on to its landmark from `ARRIVE_SCREENS` to `HOLD_SCREENS` (two
 * still keys); how I work runs along the road's edge past its three commits; the journey ends at rest.
 * @param {Door} door
 * @param {ReadonlyArray<RoadStop>} roadStops
 * @param {Readonly<Record<string, { width: number, height: number }>>} sizes
 * @param {number} start Where the branch ends, in screens.
 * @param {PlacedKey[]} placed
 */
function placeRoad(door, roadStops, sizes, start, placed) {
  const layout = layoutRoad(roadStops, door, sizes);
  const { origin, direction } = layout;
  const onRoad = (/** @type {number} */ along, /** @type {number} */ y) =>
    /** @type {Vec3} */ ([origin[0] + direction[0] * along, y, origin[1] + direction[1] * along]);
  /** @type {JourneyStop[]} */
  const stops = [];
  /** @type {Array<Landmark & { from: number, to: number, arriveAt: number, holdAt: number }>} */
  const landmarks = [];
  /** @type {{ from: number, to: number, along: number[], origin: [number, number], direction: [number, number] } | null} */
  let commits = null;

  for (const [k, stop] of roadStops.entries()) {
    const from = start + STOP_SCREENS * k;
    const to = from + STOP_SCREENS;
    stops.push({ id: stop.id, name: stop.name, from, to });
    if (stop.kind === 'commits') {
      const along = layout.along[k];
      COMMIT_EYES.forEach((offset, i) => {
        placed.push({
          screens: from + (STOP_SCREENS * (i + 1)) / COMMIT_EYES.length,
          stop: stop.name,
          eye: onRoad(along + offset, EYE_HEIGHT),
          target: onRoad(along + offset + 10, 0.8),
          fov: ROAD_FOV,
          still: i === COMMIT_EYES.length - 1,
        });
      });
      const gap = layout.commits.length > 1 ? Math.hypot(layout.commits[1][0] - layout.commits[0][0], layout.commits[1][1] - layout.commits[0][1]) : 0;
      commits = { from, to, along: [along - gap, along, along + gap], origin: [origin[0], origin[1]], direction: [direction[0], direction[1]] };
      continue;
    }
    const landmark = layout.landmarks.find((l) => l.stopId === stop.id);
    if (!landmark) throw new Error(`No landmark for ${stop.id}.`);
    const look = /** @type {Vec3} */ ([landmark.center[0], landmark.center[1] - LOOK_BELOW * landmark.height, landmark.center[2]]);
    const distance = restDistance(landmark);
    const eye = /** @type {Vec3} */ ([look[0] + landmark.facing[0] * distance, look[1], look[2] + landmark.facing[2] * distance]);
    const arriveAt = from + ARRIVE_SCREENS;
    const holdAt = from + HOLD_SCREENS;
    // The landmark's right-hand direction at half its width, and how far it stands above the eye: a
    // wide screen slides the camera by them, to set the landmark right of its words and level (W2.5).
    const aside = /** @type {Vec3} */ ([(landmark.facing[2] * landmark.width) / 2, LOOK_BELOW * landmark.height, (-landmark.facing[0] * landmark.width) / 2]);
    for (const screens of [arriveAt, holdAt]) placed.push({ screens, stop: stop.name, eye: [...eye], target: [...look], fov: ROAD_FOV, still: true, aside: [...aside] });
    landmarks.push({ ...landmark, from, to, arriveAt, holdAt });
  }

  const end = start + STOP_SCREENS * roadStops.length;
  const last = placed[placed.length - 1];
  if (last.screens < end) {
    /** @type {PlacedKey} */
    const rest = { ...last, screens: end, eye: [...last.eye], target: [...last.target], still: true };
    if (last.aside) rest.aside = [...last.aside];
    placed.push(rest);
  }
  return { stops, landmarks, commits, end };
}

/** Smoothstep on 0..1. @param {number} t */
const ease = (t) => {
  const x = Math.min(1, Math.max(0, t));
  return x * x * (3 - 2 * x);
};

/**
 * The one landmark handing over to its real thing at a scroll progress, and how far (1: the real
 * thing fully shown): over `HANDOVER_SCREENS` before the camera arrives, fully while it rests, and
 * back over the same after it leaves. Null elsewhere, and for stops that never resolve (Crew
 * Advisors, how I work). A pure function of progress, so a jump lands on the right state.
 * @param {Journey} journey
 * @param {number} progress
 * @returns {{ stopId: string, amount: number } | null}
 */
export function handoverAt(journey, progress) {
  const span = HANDOVER_SCREENS / journey.screens;
  for (const landmark of journey.landmarks) {
    if (!HANDS_OVER.includes(landmark.kind)) continue;
    if (progress < landmark.arriveAt - span || progress >= landmark.holdAt + span) continue;
    // A hair of tolerance so a progress computed for the hold itself counts as resting.
    const tolerance = 1e-9;
    let amount = 1;
    if (progress < landmark.arriveAt - tolerance) amount = ease((progress - (landmark.arriveAt - span)) / span);
    else if (progress > landmark.holdAt + tolerance) amount = 1 - ease((progress - landmark.holdAt) / span);
    return { stopId: landmark.stopId, amount };
  }
  return null;
}

/**
 * How much of Crew Advisors' code is typed at a scroll progress (0.15 to 0.65 across its stop), or
 * null outside it. Its landmark never finishes and never hands over.
 * @param {Journey} journey
 * @param {number} progress
 * @returns {number | null}
 */
export function typedAt(journey, progress) {
  const landmark = journey.landmarks.find((l) => l.kind === 'unfinished');
  if (!landmark || progress < landmark.from || progress >= landmark.to) return null;
  return TYPED_FROM + (TYPED_TO - TYPED_FROM) * ((progress - landmark.from) / (landmark.to - landmark.from));
}

/**
 * How many of how I work's three commits the camera has passed at a scroll progress (0 to 3).
 * @param {Journey} journey
 * @param {number} progress
 */
export function commitsAt(journey, progress) {
  const commits = journey.commits;
  if (!commits || progress < commits.from) return 0;
  const { eye } = cameraAt(progress, journey.keys);
  const along = (eye[0] - commits.origin[0]) * commits.direction[0] + (eye[2] - commits.origin[1]) * commits.direction[1];
  return commits.along.filter((point) => point < along).length;
}

/** How far a gesture must travel sideways to take a road, in CSS pixels. */
const GESTURE_MIN_PX = 48;

/**
 * The road a sideways gesture steers onto at the split, or null when the gesture is not a clear
 * choice (too short, or more up-and-down than sideways). `dx` is where the visitor steers: negative
 * to the left (business/), positive to the right (family/). Touch, trackpad and mouse report
 * direction differently; each is converted to this before it is asked (W1.4).
 * @param {{ dx: number, dy: number }} gesture
 * @returns {Door | null}
 */
export function branchForGesture({ dx, dy }) {
  if (Math.abs(dx) < GESTURE_MIN_PX || Math.abs(dx) < 2 * Math.abs(dy)) return null;
  return dx < 0 ? 'a' : 'b';
}
