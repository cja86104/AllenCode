// @ts-check

/** @typedef {[number, number, number]} Vec3 */
/** A 4 x 4 matrix in column-major order, as WebGL reads it. @typedef {Float32Array} Mat4 */

/** @param {Vec3} a @param {Vec3} b @returns {Vec3} */
const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
/** @param {Vec3} a @param {Vec3} b @returns {Vec3} */
const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
/** @param {Vec3} a @param {Vec3} b */
const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
/** @param {Vec3} a @returns {Vec3} */
function normalize(a) {
  const length = Math.hypot(a[0], a[1], a[2]) || 1;
  return [a[0] / length, a[1] / length, a[2] / length];
}

/**
 * Perspective projection.
 * @param {number} fovDegrees Vertical field of view.
 * @param {number} aspect Width over height.
 * @param {number} near
 * @param {number} far
 * @returns {Mat4}
 */
export function perspective(fovDegrees, aspect, near, far) {
  const f = 1 / Math.tan((fovDegrees * Math.PI) / 360);
  const range = 1 / (near - far);
  return new Float32Array([f / aspect, 0, 0, 0, 0, f, 0, 0, 0, 0, (far + near) * range, -1, 0, 0, 2 * far * near * range, 0]);
}

/**
 * The view matrix of a camera at `eye` looking at `target`, with +y up.
 * @param {Vec3} eye
 * @param {Vec3} target
 * @returns {Mat4}
 */
export function lookAt(eye, target) {
  const z = normalize(sub(eye, target));
  const x = normalize(cross([0, 1, 0], z));
  const y = cross(z, x);
  return new Float32Array([x[0], y[0], z[0], 0, x[1], y[1], z[1], 0, x[2], y[2], z[2], 0, -dot(x, eye), -dot(y, eye), -dot(z, eye), 1]);
}

/**
 * `a` times `b`.
 * @param {Mat4} a
 * @param {Mat4} b
 * @returns {Mat4}
 */
export function multiply(a, b) {
  const out = new Float32Array(16);
  for (let col = 0; col < 4; col += 1) {
    for (let row = 0; row < 4; row += 1) {
      let sum = 0;
      for (let k = 0; k < 4; k += 1) sum += a[k * 4 + row] * b[col * 4 + k];
      out[col * 4 + row] = sum;
    }
  }
  return out;
}

/**
 * A point through a matrix, in homogeneous coordinates (divide x, y, z by w for the screen).
 * @param {Mat4} m
 * @param {Vec3} p
 * @returns {[number, number, number, number]}
 */
export function transformPoint(m, p) {
  /** @param {number} row */
  const at = (row) => m[row] * p[0] + m[4 + row] * p[1] + m[8 + row] * p[2] + m[12 + row];
  return [at(0), at(1), at(2), at(3)];
}
