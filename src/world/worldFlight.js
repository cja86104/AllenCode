// @ts-check
import { imageLayout } from '../field/layouts.js';
import { TRANSFORM_BUDGETS } from '../field/capabilities.js';

/** @typedef {[number, number, number]} Vec3 */
/** @typedef {import('../field/transformation.js').Transformation} Transformation */
/** @typedef {import('./shapes.js').Shape} Shape */
/** @typedef {import('./roadLayout.js').Landmark} Landmark */

/**
 * A chapter's flight placed in the world (Code World R3): where each character starts (on the
 * editor, on the plane) and lands (on the picture, on the plane), in world units, with the field's
 * per-particle data for the motion; sizes in world units; the plane's normal toward the camera (the
 * arc lifts along it) and its right and up directions scaled to one CSS pixel (the field's sway and
 * lift are in pixels).
 * @typedef {{
 *   count: number,
 *   start: Float32Array,
 *   end: Float32Array,
 *   glyph: Float32Array,
 *   meta: Float32Array,
 *   srcColor: Float32Array,
 *   dstColor: Float32Array,
 *   sizeFrom: number,
 *   sizeTo: number,
 *   normal: Vec3,
 *   right: Vec3,
 *   up: Vec3,
 * }} WorldFlight
 */

/** @param {Vec3} a @param {Vec3} b @returns {Vec3} */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
/** @param {Vec3} a @param {Vec3} b */
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** @param {Vec3} a @param {Vec3} b @returns {Vec3} */
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** @param {Vec3} a @returns {Vec3} */
function normalize(a) {
  const length = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / length, a[1] / length, a[2] / length];
}

/**
 * Places a resolved transformation (`resolveTransform`'s, in CSS pixels) on a plane in the world, by
 * unprojecting each pixel through the camera onto the plane. Exact for any camera; while a chapter
 * plays the camera rests square on, so the flight lands exactly where the chapter's boxes are.
 * @param {{ transformation: Transformation, sizes: { from: number, to: number } }} resolved
 * @param {{ camera: { eye: Vec3, target: Vec3, fov: number }, viewport: { width: number, height: number }, plane: { point: Vec3, normal: Vec3 } }} where
 * @returns {WorldFlight}
 */
export function toWorldFlight({ transformation: t, sizes }, { camera, viewport, plane }) {
  const { eye } = camera;
  // The camera's axes, as `lookAt` builds them (+y up).
  const back = normalize(sub(eye, camera.target));
  const forward = /** @type {Vec3} */ ([-back[0], -back[1], -back[2]]);
  const right = normalize(cross([0, 1, 0], back));
  const up = cross(back, right);
  const tanV = Math.tan((camera.fov * Math.PI) / 360);
  const tanH = tanV * (viewport.width / viewport.height);
  let normal = normalize(plane.normal);
  if (dot(normal, sub(eye, plane.point)) < 0) normal = [-normal[0], -normal[1], -normal[2]];

  /** A pixel on the plane. @param {number} px @param {number} py @returns {Vec3} */
  const onPlane = (px, py) => {
    const x = (px / viewport.width) * 2 - 1;
    const y = 1 - (py / viewport.height) * 2;
    const ray = /** @type {Vec3} */ ([
      forward[0] + right[0] * x * tanH + up[0] * y * tanV,
      forward[1] + right[1] * x * tanH + up[1] * y * tanV,
      forward[2] + right[2] * x * tanH + up[2] * y * tanV,
    ]);
    const s = dot(sub(plane.point, eye), normal) / dot(ray, normal);
    return [eye[0] + ray[0] * s, eye[1] + ray[1] * s, eye[2] + ray[2] * s];
  };

  // World units per CSS pixel at the plane's point, along the camera's axes.
  const depth = dot(sub(plane.point, eye), forward);
  const perPixel = (2 * depth * tanV) / viewport.height;

  const start = new Float32Array(t.count * 3);
  const end = new Float32Array(t.count * 3);
  const meta = new Float32Array(t.count * 4);
  for (let i = 0; i < t.count; i += 1) {
    start.set(onPlane(t.start[i * 2], t.start[i * 2 + 1]), i * 3);
    end.set(onPlane(t.end[i * 2], t.end[i * 2 + 1]), i * 3);
    meta.set([t.glyph[i], t.original[i], t.seed[i], t.row[i]], i * 4);
  }
  return {
    count: t.count,
    start,
    end,
    glyph: t.glyph,
    meta,
    srcColor: t.srcColor,
    dstColor: t.dstColor,
    sizeFrom: sizes.from * perPixel,
    sizeTo: sizes.to * perPixel,
    normal,
    right: [right[0] * perPixel, right[1] * perPixel, right[2] * perPixel],
    up: [up[0] * perPixel, up[1] * perPixel, up[2] * perPixel],
  };
}

/** A landed character's size, as a share of the grid step it sits on. */
const LANDED_SIZE = 0.9;

/**
 * A landmark's picture in characters, as a flight leaves it (Code World R3): the image sampled on a
 * grid every `step` image pixels, colours lifted as `imageLayout` lifts a landing (so it matches a
 * landed flight), laid on the landmark's face; the characters are the code's own, in reading order.
 * Drawn for landmarks the visitor has passed, so the road behind is lined with what was built.
 * @param {{ data: Uint8ClampedArray, width: number, height: number }} image
 * @param {Pick<Landmark, 'center' | 'facing' | 'width' | 'height'>} landmark
 * @param {string} code
 * @param {number} step In image pixels.
 * @returns {Shape}
 */
export function landedShape(image, landmark, code, step) {
  const points = imageLayout(image, { x: 0, y: 0, w: image.width, h: image.height }, step);
  const ink = [...code].filter((c) => c.trim() !== '' && c.charCodeAt(0) <= 0xffff);
  const count = ink.length > 0 ? points.length : 0;
  const { center, facing, width, height } = landmark;
  const rx = facing[2];
  const rz = -facing[0];
  const scale = width / image.width;
  const shape = {
    positions: new Float32Array(count * 3),
    glyphs: new Uint16Array(count),
    colors: new Float32Array(count * 4),
    size: step * scale * LANDED_SIZE,
  };
  for (let i = 0; i < count; i += 1) {
    const { x, y, color } = points[i];
    const across = (x / image.width - 0.5) * width;
    const up = (0.5 - y / image.height) * height;
    shape.positions.set([center[0] + rx * across, center[1] + up, center[2] + rz * across], i * 3);
    shape.glyphs[i] = ink[i % ink.length].charCodeAt(0);
    shape.colors.set([color[0], color[1], color[2], 0.9], i * 4);
  }
  return shape;
}

/**
 * A flight's particle budget: the field's transformation budget for the world's tier.
 * @param {'low' | 'mid' | 'high'} tier
 */
export function flightBudgetFor(tier) {
  return TRANSFORM_BUDGETS[tier === 'mid' ? 'medium' : tier];
}
