// @ts-check

/** @typedef {[number, number, number]} Vec3 */
/**
 * A camera key. `still` gives the key a zero tangent: the camera eases to rest there, and between
 * two still keys it does not move at all, so a landmark's real screen can be laid exactly over it
 * (Code World W2.2). Keys without it curve as uniform Catmull-Rom, as in the prototype.
 * @typedef {{ at: number, eye: Vec3, target: Vec3, fov: number, stop: string, still?: boolean }} CameraKey
 */

/**
 * The prototype's camera stops (docs/superpowers/plans/2026-11-10-code-world-prototype.md), in world
 * units (about a metre each; y is up, the road runs toward -z). The empty file sits at z = 0, the
 * road starts behind it, the fork is at z = -40 and the UnderFire landmark at (-6, 1.8, -58). The
 * last stop faces the landmark squarely, so its real screen, laid over the canvas, lines up with the
 * sculpture exactly (Task P4).
 * @type {ReadonlyArray<CameraKey>}
 */
export const CAMERA_KEYS = Object.freeze(
  /** @type {CameraKey[]} */ ([
    { at: 0, stop: 'empty file', eye: [0, 1.6, 7], target: [0, 1.6, 0], fov: 45 },
    { at: 0.15, stop: 'empty file', eye: [0, 1.6, 3.2], target: [0, 1.6, 0], fov: 50 },
    { at: 0.3, stop: 'into the code', eye: [0, 1.3, -3], target: [0, 0.9, -12], fov: 62 },
    { at: 0.45, stop: 'the road', eye: [0, 1.2, -15], target: [0, 0.8, -27], fov: 55 },
    { at: 0.6, stop: 'the fork', eye: [0, 1.5, -30], target: [0, 1, -42], fov: 52 },
    { at: 0.75, stop: 'the fork', eye: [-1.6, 1.6, -41], target: [-5, 1.4, -52], fov: 50 },
    { at: 1, stop: 'first landmark', eye: [-6, 1.8, -50.5], target: [-6, 1.8, -58], fov: 48 },
  ]).map((key) => Object.freeze(key)),
);

/**
 * Uniform Catmull-Rom between p1 and p2 at t in 0..1; it passes exactly through p1 at 0 and p2 at 1.
 * @param {number} p0 @param {number} p1 @param {number} p2 @param {number} p3 @param {number} t
 */
function catmullRom(p0, p1, p2, p3, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return 0.5 * (2 * p1 + (p2 - p0) * t + (2 * p0 - 5 * p1 + 4 * p2 - p3) * t2 + (3 * p1 - p0 - 3 * p2 + p3) * t3);
}

/**
 * Cubic Hermite between p1 and p2 with tangents m1 and m2 (per segment); with m1 = (p2 - p0) / 2 and
 * m2 = (p3 - p1) / 2 it is the same curve as `catmullRom`. Used only when a still key sets a tangent
 * to zero.
 * @param {number} p1 @param {number} p2 @param {number} m1 @param {number} m2 @param {number} t
 */
function hermite(p1, p2, m1, m2, t) {
  const t2 = t * t;
  const t3 = t2 * t;
  return (2 * t3 - 3 * t2 + 1) * p1 + (t3 - 2 * t2 + t) * m1 + (-2 * t3 + 3 * t2) * p2 + (t3 - t2) * m2;
}

/**
 * One coordinate between k1 and k2, with k0 and k3 either side.
 * @param {number} p0 @param {number} p1 @param {number} p2 @param {number} p3 @param {number} t
 * @param {boolean} still1 @param {boolean} still2
 */
function between(p0, p1, p2, p3, t, still1, still2) {
  if (!still1 && !still2) return catmullRom(p0, p1, p2, p3, t);
  // Between two still keys at the same place the camera is exactly there, not there give or take a
  // rounding error.
  if (still1 && still2 && p1 === p2) return p1;
  return hermite(p1, p2, still1 ? 0 : (p2 - p0) / 2, still2 ? 0 : (p3 - p1) / 2, t);
}

/**
 * @param {Vec3} a @param {Vec3} b @param {Vec3} c @param {Vec3} d @param {number} t
 * @param {boolean} still1 @param {boolean} still2
 * @returns {Vec3}
 */
const curve3 = (a, b, c, d, t, still1, still2) => [
  between(a[0], b[0], c[0], d[0], t, still1, still2),
  between(a[1], b[1], c[1], d[1], t, still1, still2),
  between(a[2], b[2], c[2], d[2], t, still1, still2),
];

/**
 * Where the camera is, what it looks at and its vertical field of view (degrees) at a scroll
 * progress. A pure function of progress, so any jump (a flick, a link to the end) gives the right
 * frame with nothing carried over.
 * @param {number} progress 0 at the top of the journey, 1 at its end; clamped.
 * @param {ReadonlyArray<CameraKey>} [keys] The journey's keys (`buildJourney` in journey.js); the
 *   prototype's own stops when left out.
 * @returns {{ eye: Vec3, target: Vec3, fov: number }}
 */
export function cameraAt(progress, keys = CAMERA_KEYS) {
  const p = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const last = keys.length - 1;
  let i = 0;
  while (i < last - 1 && p > keys[i + 1].at) i += 1;
  const k0 = keys[Math.max(0, i - 1)];
  const k1 = keys[i];
  const k2 = keys[i + 1];
  const k3 = keys[Math.min(last, i + 2)];
  const t = (p - k1.at) / (k2.at - k1.at);
  const still1 = k1.still === true;
  const still2 = k2.still === true;
  return {
    eye: curve3(k0.eye, k1.eye, k2.eye, k3.eye, t, still1, still2),
    target: curve3(k0.target, k1.target, k2.target, k3.target, t, still1, still2),
    fov: between(k0.fov, k1.fov, k2.fov, k3.fov, t, still1, still2),
  };
}

/** The widest field of view a narrow screen may get, in degrees; past it the world distorts. */
const MAX_NARROW_FOV = 70;
/** How much wider than the stop's own field of view a narrow screen may look. */
const NARROW_WIDEN = 1.35;

/**
 * Frames a camera for the screen's shape. A screen at least as wide as it is tall sees the stop as
 * designed. A narrower one (a phone held upright) would cut the sides off, so it sees at least
 * what a square screen sees: the field of view widens (up to 70 degrees), then the camera steps back
 * along its line of sight for the rest, still looking at the same point (Task P3).
 * @param {{ eye: Vec3, target: Vec3, fov: number }} camera
 * @param {number} aspect Width over height.
 * @returns {{ eye: Vec3, target: Vec3, fov: number }}
 */
export function frameCamera(camera, aspect) {
  if (!(aspect > 0) || aspect >= 1) return camera;
  const halfTan = (/** @type {number} */ degrees) => Math.tan((degrees * Math.PI) / 360);
  const fov = Math.min(camera.fov * NARROW_WIDEN, MAX_NARROW_FOV);
  const back = Math.max(1, halfTan(camera.fov) / (halfTan(fov) * aspect));
  const { eye, target } = camera;
  return {
    eye: [target[0] + (eye[0] - target[0]) * back, target[1] + (eye[1] - target[1]) * back, target[2] + (eye[2] - target[2]) * back],
    target,
    fov,
  };
}
