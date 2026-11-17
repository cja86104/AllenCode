// @ts-check

/**
 * The drive between pages (Code World W5b, Chris 2026-11-17: "Drive on ahead"). Moving to a page with a
 * stretch, the camera drives on ahead out of what it was looking at, which fades out, then comes in
 * from behind the new road's start, which fades in. The speed matches across the swap, so it reads as
 * one drive.
 */

/** @typedef {[number, number, number]} Vec3 */
/** @typedef {{ eye: Vec3, target: Vec3, fov: number }} Camera */

/** How long the whole drive takes, in milliseconds: half out of the old world, half in to the new. */
export const DRIVE_MS = 600;
/** How far the camera travels in each half, in world units. */
export const DRIVE_DISTANCE = 12;

/** @param {number} x */
const smooth = (x) => x * x * (3 - 2 * x);

/**
 * Where the drive is, `elapsed` ms after it started: which half, how far through it (0..1), how far the
 * camera has travelled (ahead from the old camera on the way out; behind the new camera, so negative,
 * on the way in), and how much of its world is shown. Null once it is over.
 * @param {number} elapsed
 * @returns {{ half: 'out' | 'in', u: number, travel: number, alpha: number } | null}
 */
export function driveAt(elapsed) {
  if (!(elapsed >= 0) || elapsed >= DRIVE_MS) return null;
  const half = DRIVE_MS / 2;
  if (elapsed < half) {
    const u = elapsed / half;
    // Speeding up: the distance grows as u², so the speed at the swap is 2 · DRIVE_DISTANCE per half.
    return { half: 'out', u, travel: DRIVE_DISTANCE * u * u, alpha: 1 - smooth(u) };
  }
  const u = (elapsed - half) / half;
  // Slowing down to the start, from the same speed.
  return { half: 'in', u, travel: -DRIVE_DISTANCE * (1 - u) * (1 - u), alpha: smooth(u) };
}

/**
 * A camera moved `distance` along the way it looks, level: the eye and the target together, at their
 * own heights, with the same field of view.
 * @param {Camera} camera @param {number} distance
 * @returns {Camera}
 */
export function driveCamera(camera, distance) {
  const dx = camera.target[0] - camera.eye[0];
  const dz = camera.target[2] - camera.eye[2];
  const length = Math.hypot(dx, dz) || 1;
  const x = (dx / length) * distance;
  const z = (dz / length) * distance;
  return {
    eye: [camera.eye[0] + x, camera.eye[1], camera.eye[2] + z],
    target: [camera.target[0] + x, camera.target[1], camera.target[2] + z],
    fov: camera.fov,
  };
}
