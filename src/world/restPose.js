// @ts-check

/** @typedef {[number, number, number]} Vec3 */

/** The road's field of view, in degrees. */
const REST_FOV = 52;

/**
 * Where the camera rests while a chapter plays at its landmark (Code World R1): square on to the
 * landmark (looking straight back along its facing, level), at the distance that makes its width
 * fill `box`, and slid sideways and up so it lands exactly on `box`, the place today's layout gives
 * the chapter's screen in this viewport. Phones and desktops differ only through the box.
 * @param {{ center: Vec3, facing: Vec3, width: number }} landmark `facing` is a unit direction on the ground.
 * @param {{ x: number, y: number, w: number, h: number }} box In CSS pixels.
 * @param {{ width: number, height: number }} viewport In CSS pixels.
 * @param {number} [fov] Vertical field of view in degrees.
 * @returns {{ eye: Vec3, target: Vec3, fov: number }}
 */
export function restPose(landmark, box, viewport, fov = REST_FOV) {
  const { center, facing, width } = landmark;
  const focal = viewport.height / 2 / Math.tan((fov * Math.PI) / 360);
  const distance = (focal * width) / box.w;
  // World units per CSS pixel on the landmark's plane.
  const perPixel = width / box.w;
  // The face's right-hand direction, seen from in front.
  const right = /** @type {Vec3} */ ([facing[2], 0, -facing[0]]);
  // To show the landmark right of the screen's centre the camera moves left, and to show it lower
  // the camera moves up.
  const across = -(box.x + box.w / 2 - viewport.width / 2) * perPixel;
  const up = (box.y + box.h / 2 - viewport.height / 2) * perPixel;
  const target = /** @type {Vec3} */ ([center[0] + right[0] * across, center[1] + up, center[2] + right[2] * across]);
  const eye = /** @type {Vec3} */ ([target[0] + facing[0] * distance, target[1], target[2] + facing[2] * distance]);
  return { eye, target, fov };
}
