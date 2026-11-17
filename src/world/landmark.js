// @ts-check
import { transformPoint, viewProjectionFor } from './matrix.js';

/** @typedef {[number, number, number]} Vec3 */

/**
 * The first landmark: UnderFire AI's screen, standing at the end of the business road. It is 16:10,
 * the shape of the product's real screen (its 1280 x 800 poster and loop).
 */
export const LANDMARK = Object.freeze({ center: /** @type {Vec3} */ ([-6, 1.8, -58]), width: 6, height: 3.75 });

/** The way the prototype's landmark faces: straight back up the road (+z). */
const FACING_BACK = /** @type {Vec3} */ ([0, 0, 1]);

/**
 * Where a landmark's screen appears on the page, in CSS pixels: the box around its four corners
 * as the camera sees them. Not visible when any corner is behind the camera. The landmark is
 * upright, its face looking along `facing` (on the ground); the prototype's when left out.
 * @param {{ eye: Vec3, target: Vec3, fov: number }} camera The camera as drawn (already framed).
 * @param {{ width: number, height: number }} viewport
 * @param {{ center: Vec3, width: number, height: number, facing?: Vec3 }} [landmark]
 * @returns {{ left: number, top: number, width: number, height: number, visible: boolean }}
 */
export function landmarkRect(camera, viewport, landmark = LANDMARK) {
  const viewProjection = viewProjectionFor(camera, viewport.width / viewport.height);
  const [cx, cy, cz] = landmark.center;
  const facing = landmark.facing ?? FACING_BACK;
  // The face's right-hand direction, seen from in front: across the face, on the ground.
  const rx = facing[2];
  const rz = -facing[0];
  const hw = landmark.width / 2;
  const hh = landmark.height / 2;
  const xs = [];
  const ys = [];
  for (const [dx, dy] of [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ]) {
    const [x, y, , w] = transformPoint(viewProjection, [cx + rx * dx, cy + dy, cz + rz * dx]);
    if (w <= 0) return { left: 0, top: 0, width: 0, height: 0, visible: false };
    xs.push(((x / w + 1) / 2) * viewport.width);
    ys.push(((1 - y / w) / 2) * viewport.height);
  }
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return { left, top, width: Math.max(...xs) - left, height: Math.max(...ys) - top, visible: true };
}
