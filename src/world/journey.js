// @ts-check

/** @typedef {[number, number, number]} Vec3 */
/** @typedef {import('./camera.js').CameraKey} CameraKey */
/** @typedef {'a' | 'b'} Door 'a': the business road (left). 'b': the family road (right). */
/** @typedef {{ id: string, name: string, from: number, to: number }} JourneyStop */

/**
 * A camera key placed in screens of scroll from the top, before the journey is scaled to 0..1.
 * @typedef {{ screens: number, stop: string, eye: Vec3, target: Vec3, fov: number }} PlacedKey
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

/**
 * The camera's journey for a visitor (Code World spec, section 3): the shared opening to the split,
 * then, once a road is taken, down that road. Without a road the journey ends at the split, where
 * the camera waits, looking down both branches. Keys and stops are scaled to 0..1 of the journey;
 * `screens` is its length in screens of scroll and `splitAt` where the split sits in 0..1.
 * @param {Door | null} door
 * @returns {{ keys: CameraKey[], stops: JourneyStop[], screens: number, splitAt: number }}
 */
export function buildJourney(door) {
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
  const screens = placed[placed.length - 1].screens;
  const keys = placed.map((key) => ({ at: key.screens / screens, stop: key.stop, eye: key.eye, target: key.target, fov: key.fov }));
  keys[keys.length - 1].at = 1;

  const forkTo = door ? SPLIT_SCREENS + FORK_AFTER_SPLIT : SPLIT_SCREENS;
  /** @type {JourneyStop[]} */
  const stops = [...OPENING_STOPS.map((stop) => ({ ...stop })), { id: 'the-fork', name: 'The fork', from: 3.8, to: forkTo }];
  if (door) stops.push({ id: door === 'a' ? 'business-road' : 'family-road', name: BRANCH_NAMES[door], from: forkTo, to: screens });
  for (const stop of stops) {
    stop.from /= screens;
    stop.to /= screens;
  }
  stops[stops.length - 1].to = 1;

  return { keys, stops, screens, splitAt: SPLIT_SCREENS / screens };
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
