// @ts-check

/** @typedef {[number, number, number]} Vec3 */
/** @typedef {{ at: number, eye: Vec3, target: Vec3, fov: number, stop: string }} CameraKey */

/**
 * The prototype's camera stops (docs/superpowers/plans/2026-11-10-code-world-prototype.md), in world
 * units (about a metre each; y is up, the road runs toward -z). The empty file sits at z = 0, the
 * road starts behind it, the fork is at z = -40 and the UnderFire landmark at (-6, 1.8, -58).
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
    { at: 1, stop: 'first landmark', eye: [-5.2, 1.8, -50.5], target: [-6, 1.8, -58], fov: 48 },
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

/** @param {Vec3} a @param {Vec3} b @param {Vec3} c @param {Vec3} d @param {number} t @returns {Vec3} */
const curve3 = (a, b, c, d, t) => [catmullRom(a[0], b[0], c[0], d[0], t), catmullRom(a[1], b[1], c[1], d[1], t), catmullRom(a[2], b[2], c[2], d[2], t)];

/**
 * Where the camera is, what it looks at and its vertical field of view (degrees) at a scroll
 * progress. A pure function of progress, so any jump (a flick, a link to the end) gives the right
 * frame with nothing carried over.
 * @param {number} progress 0 at the top of the journey, 1 at its end; clamped.
 * @returns {{ eye: Vec3, target: Vec3, fov: number }}
 */
export function cameraAt(progress) {
  const p = Math.min(1, Math.max(0, Number.isFinite(progress) ? progress : 0));
  const last = CAMERA_KEYS.length - 1;
  let i = 0;
  while (i < last - 1 && p > CAMERA_KEYS[i + 1].at) i += 1;
  const k0 = CAMERA_KEYS[Math.max(0, i - 1)];
  const k1 = CAMERA_KEYS[i];
  const k2 = CAMERA_KEYS[i + 1];
  const k3 = CAMERA_KEYS[Math.min(last, i + 2)];
  const t = (p - k1.at) / (k2.at - k1.at);
  return {
    eye: curve3(k0.eye, k1.eye, k2.eye, k3.eye, t),
    target: curve3(k0.target, k1.target, k2.target, k3.target, t),
    fov: catmullRom(k0.fov, k1.fov, k2.fov, k3.fov, t),
  };
}
