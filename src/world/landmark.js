// @ts-check
import { transformPoint, viewProjectionFor } from './matrix.js';

/** @typedef {[number, number, number]} Vec3 */

/**
 * The first landmark: UnderFire AI's screen, standing at the end of the business road. It is 16:10,
 * the shape of the product's real screen (its 1280 x 800 poster and loop).
 */
export const LANDMARK = Object.freeze({ center: /** @type {Vec3} */ ([-6, 1.8, -58]), width: 6, height: 3.75 });

/** Where in the journey the sculpture hands over to the real screen. */
const RESOLVE_FROM = 0.8;
const RESOLVE_TO = 0.92;

/**
 * How far the sculpture has turned into the real screen at a scroll progress: 0 before 0.80, 1
 * after 0.92, eased between (Task P4).
 * @param {number} progress
 */
export function resolveAt(progress) {
  const t = Math.min(1, Math.max(0, (progress - RESOLVE_FROM) / (RESOLVE_TO - RESOLVE_FROM)));
  return t * t * (3 - 2 * t);
}

/**
 * Where the landmark's screen appears on the page, in CSS pixels: the box around its four corners
 * as the camera sees them. Not visible when any corner is behind the camera.
 * @param {{ eye: Vec3, target: Vec3, fov: number }} camera The camera as drawn (already framed).
 * @param {{ width: number, height: number }} viewport
 * @returns {{ left: number, top: number, width: number, height: number, visible: boolean }}
 */
export function landmarkRect(camera, viewport) {
  const viewProjection = viewProjectionFor(camera, viewport.width / viewport.height);
  const [cx, cy, cz] = LANDMARK.center;
  const hw = LANDMARK.width / 2;
  const hh = LANDMARK.height / 2;
  const xs = [];
  const ys = [];
  for (const [dx, dy] of [
    [-hw, -hh],
    [hw, -hh],
    [hw, hh],
    [-hw, hh],
  ]) {
    const [x, y, , w] = transformPoint(viewProjection, [cx + dx, cy + dy, cz]);
    if (w <= 0) return { left: 0, top: 0, width: 0, height: 0, visible: false };
    xs.push(((x / w + 1) / 2) * viewport.width);
    ys.push(((1 - y / w) / 2) * viewport.height);
  }
  const left = Math.min(...xs);
  const top = Math.min(...ys);
  return { left, top, width: Math.max(...xs) - left, height: Math.max(...ys) - top, visible: true };
}
