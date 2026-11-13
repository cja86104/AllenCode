// @ts-check
import { GLYPH_FRAGMENT_SHADER } from '../field/shaders.js';
import { FLIGHT_VERTEX_SHADER, WORLD_VERTEX_SHADER } from './worldShaders.js';
import { viewProjectionFor } from './matrix.js';

/** @typedef {import('./shapes.js').Shape} Shape */
/** @typedef {import('../field/glyphAtlas.js').Atlas} Atlas */
/** @typedef {{ eye: [number, number, number], target: [number, number, number], fov: number }} Camera */
/** @typedef {import('./worldFlight.js').WorldFlight} WorldFlight */

/** At most this many ranges fade on their own in one frame (the shader's arrays). */
export const MAX_FADES = 4;
/** How far a flight's arc lifts its characters toward the camera, in world units. */
const FLIGHT_LIFT = 2.1;

/** Where the world fades out: glyphs farther than FOG_FAR are not drawn. */
const FOG_NEAR = 14;
const FOG_FAR = 46;
/** Floats per glyph: x, y, z, atlas cell, r, g, b, a, size, tag, flow. */
const STRIDE = 11;

/**
 * @param {WebGL2RenderingContext} gl
 * @param {number} type
 * @param {string} source
 */
function compile(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('The world could not create a shader.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader);
    gl.deleteShader(shader);
    throw new Error(`World shader failed to compile: ${log}`);
  }
  return shader;
}

/**
 * Packs shapes into one interleaved array for one draw. Characters the atlas lacks are left out.
 * `ranges` gives each shape's first glyph and glyph count in the packed buffer.
 * @param {ReadonlyArray<Shape>} shapes
 * @param {(char: string) => number} indexOf
 * @returns {{ data: Float32Array, count: number, ranges: Array<{ start: number, count: number }> }}
 */
export function packShapes(shapes, indexOf) {
  const total = shapes.reduce((sum, shape) => sum + shape.glyphs.length, 0);
  const data = new Float32Array(total * STRIDE);
  let count = 0;
  /** @type {Array<{ start: number, count: number }>} */
  const ranges = [];
  for (const shape of shapes) {
    const start = count;
    for (let i = 0; i < shape.glyphs.length; i += 1) {
      const cell = indexOf(String.fromCharCode(shape.glyphs[i]));
      if (cell < 0) continue;
      const o = count * STRIDE;
      data[o] = shape.positions[i * 3];
      data[o + 1] = shape.positions[i * 3 + 1];
      data[o + 2] = shape.positions[i * 3 + 2];
      data[o + 3] = cell;
      data.set(shape.colors.subarray(i * 4, i * 4 + 4), o + 4);
      data[o + 8] = shape.sizes ? shape.sizes[i] : shape.size;
      data[o + 9] = shape.tag ?? 0;
      data[o + 10] = shape.flow ? shape.flow[i] : 0;
      count += 1;
    }
    ranges.push({ start, count: count - start });
  }
  return { data: data.subarray(0, count * STRIDE), count, ranges };
}

/**
 * The code world's renderer: one program, one buffer, one draw of every glyph as a point sprite.
 * @param {HTMLCanvasElement} canvas
 * @param {Atlas} atlas
 */
export function createWorldRenderer(canvas, atlas) {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) throw new Error('WebGL2 is not available for the code world.');

  /** @param {string} vertexSource */
  const link = (vertexSource) => {
    const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
    const fragment = compile(gl, gl.FRAGMENT_SHADER, GLYPH_FRAGMENT_SHADER);
    const linked = gl.createProgram();
    if (!linked) throw new Error('The world could not create a program.');
    gl.attachShader(linked, vertex);
    gl.attachShader(linked, fragment);
    gl.linkProgram(linked);
    if (!gl.getProgramParameter(linked, gl.LINK_STATUS)) throw new Error(`World program failed to link: ${gl.getProgramInfoLog(linked)}`);
    gl.deleteShader(vertex);
    gl.deleteShader(fragment);
    return linked;
  };
  const program = link(WORLD_VERTEX_SHADER);
  const flightProgram = link(FLIGHT_VERTEX_SHADER);

  /** @param {string} name */
  const uniform = (name) => gl.getUniformLocation(program, name);
  /** @param {string} name */
  const flightUniform = (name) => gl.getUniformLocation(flightProgram, name);
  const f = {
    viewProjection: flightUniform('uViewProjection'),
    projScale: flightUniform('uProjScale'),
    viewportHeight: flightUniform('uViewportHeight'),
    pixelRatio: flightUniform('uPixelRatio'),
    progress: flightUniform('uProgress'),
    fromSize: flightUniform('uFromSize'),
    toSize: flightUniform('uToSize'),
    normal: flightUniform('uNormal'),
    right: flightUniform('uRight'),
    up: flightUniform('uUp'),
    lift: flightUniform('uLift'),
    fade: flightUniform('uFade'),
  };
  const u = {
    viewProjection: uniform('uViewProjection'),
    projScale: uniform('uProjScale'),
    viewportHeight: uniform('uViewportHeight'),
    pixelRatio: uniform('uPixelRatio'),
    time: uniform('uTime'),
    fogNear: uniform('uFogNear'),
    fogFar: uniform('uFogFar'),
    fadeFrom: uniform('uFadeFrom'),
    fadeTo: uniform('uFadeTo'),
    fadeAmount: uniform('uFadeAmount'),
    passed: uniform('uPassed'),
    cursorIndex: uniform('uCursorIndex'),
    cursorPosition: uniform('uCursorPosition'),
    cursorOn: uniform('uCursorOn'),
  };

  const texture = gl.createTexture();
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);

  gl.useProgram(program);
  gl.uniform1i(uniform('uAtlas'), 0);
  gl.uniform2f(uniform('uGrid'), atlas.columns, atlas.rows);
  gl.uniform1f(uniform('uFade'), 1);
  gl.uniform1f(u.fogNear, FOG_NEAR);
  gl.uniform1f(u.fogFar, FOG_FAR);

  const vao = gl.createVertexArray();
  const buffer = gl.createBuffer();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
  const bytes = STRIDE * 4;
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, bytes, 0);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 1, gl.FLOAT, false, bytes, 12);
  gl.enableVertexAttribArray(2);
  gl.vertexAttribPointer(2, 4, gl.FLOAT, false, bytes, 16);
  gl.enableVertexAttribArray(3);
  gl.vertexAttribPointer(3, 1, gl.FLOAT, false, bytes, 32);
  gl.enableVertexAttribArray(4);
  gl.vertexAttribPointer(4, 1, gl.FLOAT, false, bytes, 36);
  gl.enableVertexAttribArray(5);
  gl.vertexAttribPointer(5, 1, gl.FLOAT, false, bytes, 40);
  gl.bindVertexArray(null);

  gl.useProgram(flightProgram);
  gl.uniform1i(flightUniform('uAtlas'), 0);
  gl.uniform2f(flightUniform('uGrid'), atlas.columns, atlas.rows);

  // The flight: start xyz, end xyz, meta (glyph, original, seed, row), source and landing colours.
  const flightVao = gl.createVertexArray();
  const flightBuffers = [gl.createBuffer(), gl.createBuffer(), gl.createBuffer(), gl.createBuffer(), gl.createBuffer()];
  gl.bindVertexArray(flightVao);
  [3, 3, 4, 3, 3].forEach((size, location) => {
    gl.bindBuffer(gl.ARRAY_BUFFER, flightBuffers[location]);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
  });
  gl.bindVertexArray(null);
  /** @type {WorldFlight | null} */
  let flight = null;

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  let glyphCount = 0;
  let width = 1;
  let height = 1;
  let pixelRatio = 1;

  return {
    /**
     * Replaces everything drawn. Returns each shape's place in the buffer, for `render`'s fade.
     * @param {ReadonlyArray<Shape>} shapes
     * @returns {Array<{ start: number, count: number }>}
     */
    setShapes(shapes) {
      const { data, count, ranges } = packShapes(shapes, atlas.indexOf);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      glyphCount = count;
      return ranges;
    },
    /** @param {number} w CSS pixels @param {number} h CSS pixels @param {number} dpr */
    resize(w, h, dpr) {
      width = Math.max(1, w);
      height = Math.max(1, h);
      pixelRatio = dpr;
      canvas.width = Math.round(width * dpr);
      canvas.height = Math.round(height * dpr);
      gl.viewport(0, 0, canvas.width, canvas.height);
    },
    /**
     * The flight to draw from now on, or none (Code World R3).
     * @param {WorldFlight | null} next
     */
    setFlight(next) {
      flight = next;
      if (!next) return;
      const arrays = [next.start, next.end, next.meta, next.srcColor, next.dstColor];
      arrays.forEach((array, i) => {
        gl.bindBuffer(gl.ARRAY_BUFFER, flightBuffers[i]);
        gl.bufferData(gl.ARRAY_BUFFER, array, gl.STATIC_DRAW);
      });
    },
    /**
     * @param {Camera} camera
     * @param {number} time ms
     * @param {{
     *   fades?: ReadonlyArray<{ start: number, count: number, amount: number }>,
     *   cursor?: { index: number, position: [number, number, number], visible: boolean },
     *   flight?: { progress: number, fade: number },
     *   passed?: number,
     * }} [options] Ranges of glyphs drawn at `amount` of their alpha (at most `MAX_FADES`); one glyph (by
     *   its place in the buffer) drawn at `position`, shown or hidden (an unfinished file's cursor); and
     *   the flight set by `setFlight`, at its progress and fade; and how many road landmarks the visitor
     *   has passed (each shows its picture instead of its code).
     */
    render(camera, time, { fades = [], cursor, flight: flying, passed = 0 } = {}) {
      const viewProjection = viewProjectionFor(camera, width / height);
      const projScale = 1 / Math.tan((camera.fov * Math.PI) / 360);
      gl.useProgram(program);
      gl.uniformMatrix4fv(u.viewProjection, false, viewProjection);
      gl.uniform1f(u.projScale, projScale);
      const ranges = fades.slice(0, MAX_FADES);
      const from = new Int32Array(MAX_FADES);
      const to = new Int32Array(MAX_FADES);
      const amount = new Float32Array(MAX_FADES).fill(1);
      ranges.forEach((range, i) => {
        from[i] = range.start;
        to[i] = range.start + range.count;
        amount[i] = range.amount;
      });
      gl.uniform1iv(u.fadeFrom, from);
      gl.uniform1iv(u.fadeTo, to);
      gl.uniform1fv(u.fadeAmount, amount);
      gl.uniform1i(u.passed, passed);
      gl.uniform1i(u.cursorIndex, cursor ? cursor.index : -1);
      gl.uniform3f(u.cursorPosition, cursor ? cursor.position[0] : 0, cursor ? cursor.position[1] : 0, cursor ? cursor.position[2] : 0);
      gl.uniform1f(u.cursorOn, cursor && cursor.visible ? 1 : 0);
      gl.uniform1f(u.viewportHeight, height);
      gl.uniform1f(u.pixelRatio, pixelRatio);
      gl.uniform1f(u.time, time);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.POINTS, 0, glyphCount);
      if (flight && flying && flight.count > 0 && flying.fade > 0) {
        gl.useProgram(flightProgram);
        gl.uniformMatrix4fv(f.viewProjection, false, viewProjection);
        gl.uniform1f(f.projScale, projScale);
        gl.uniform1f(f.viewportHeight, height);
        gl.uniform1f(f.pixelRatio, pixelRatio);
        gl.uniform1f(f.progress, flying.progress);
        gl.uniform1f(f.fromSize, flight.sizeFrom);
        gl.uniform1f(f.toSize, flight.sizeTo);
        gl.uniform3fv(f.normal, flight.normal);
        gl.uniform3fv(f.right, flight.right);
        gl.uniform3fv(f.up, flight.up);
        gl.uniform1f(f.lift, FLIGHT_LIFT);
        gl.uniform1f(f.fade, flying.fade);
        gl.bindVertexArray(flightVao);
        gl.drawArrays(gl.POINTS, 0, flight.count);
      }
      gl.bindVertexArray(null);
    },
    destroy() {
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      for (const flightBuffer of flightBuffers) gl.deleteBuffer(flightBuffer);
      gl.deleteVertexArray(flightVao);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
      gl.deleteProgram(flightProgram);
    },
  };
}
