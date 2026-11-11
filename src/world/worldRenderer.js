// @ts-check
import { GLYPH_FRAGMENT_SHADER } from '../field/shaders.js';
import { WORLD_VERTEX_SHADER } from './worldShaders.js';
import { lookAt, multiply, perspective } from './matrix.js';

/** @typedef {import('./shapes.js').Shape} Shape */
/** @typedef {import('../field/glyphAtlas.js').Atlas} Atlas */
/** @typedef {{ eye: [number, number, number], target: [number, number, number], fov: number }} Camera */

/** Where the world fades out: glyphs farther than FOG_FAR are not drawn. */
const FOG_NEAR = 14;
const FOG_FAR = 46;
const NEAR = 0.1;
const FAR = 120;
/** Floats per glyph: x, y, z, atlas cell, r, g, b, a, size. */
const STRIDE = 9;

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
 * @param {ReadonlyArray<Shape>} shapes
 * @param {(char: string) => number} indexOf
 * @returns {{ data: Float32Array, count: number }}
 */
export function packShapes(shapes, indexOf) {
  const total = shapes.reduce((sum, shape) => sum + shape.glyphs.length, 0);
  const data = new Float32Array(total * STRIDE);
  let count = 0;
  for (const shape of shapes) {
    for (let i = 0; i < shape.glyphs.length; i += 1) {
      const cell = indexOf(String.fromCharCode(shape.glyphs[i]));
      if (cell < 0) continue;
      const o = count * STRIDE;
      data[o] = shape.positions[i * 3];
      data[o + 1] = shape.positions[i * 3 + 1];
      data[o + 2] = shape.positions[i * 3 + 2];
      data[o + 3] = cell;
      data.set(shape.colors.subarray(i * 4, i * 4 + 4), o + 4);
      data[o + 8] = shape.size;
      count += 1;
    }
  }
  return { data: data.subarray(0, count * STRIDE), count };
}

/**
 * The code world's renderer: one program, one buffer, one draw of every glyph as a point sprite.
 * @param {HTMLCanvasElement} canvas
 * @param {Atlas} atlas
 */
export function createWorldRenderer(canvas, atlas) {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) throw new Error('WebGL2 is not available for the code world.');

  const vertex = compile(gl, gl.VERTEX_SHADER, WORLD_VERTEX_SHADER);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, GLYPH_FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error('The world could not create a program.');
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`World program failed to link: ${gl.getProgramInfoLog(program)}`);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);

  /** @param {string} name */
  const uniform = (name) => gl.getUniformLocation(program, name);
  const u = {
    viewProjection: uniform('uViewProjection'),
    projScale: uniform('uProjScale'),
    viewportHeight: uniform('uViewportHeight'),
    pixelRatio: uniform('uPixelRatio'),
    time: uniform('uTime'),
    fogNear: uniform('uFogNear'),
    fogFar: uniform('uFogFar'),
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
  gl.bindVertexArray(null);

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  let glyphCount = 0;
  let width = 1;
  let height = 1;
  let pixelRatio = 1;

  return {
    /** Replaces everything drawn. @param {ReadonlyArray<Shape>} shapes @returns {number} glyphs uploaded */
    setShapes(shapes) {
      const { data, count } = packShapes(shapes, atlas.indexOf);
      gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
      gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
      glyphCount = count;
      return count;
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
    /** @param {Camera} camera @param {number} time ms */
    render(camera, time) {
      const projection = perspective(camera.fov, width / height, NEAR, FAR);
      gl.useProgram(program);
      gl.uniformMatrix4fv(u.viewProjection, false, multiply(projection, lookAt(camera.eye, camera.target)));
      gl.uniform1f(u.projScale, projection[5]);
      gl.uniform1f(u.viewportHeight, height);
      gl.uniform1f(u.pixelRatio, pixelRatio);
      gl.uniform1f(u.time, time);
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);
      gl.bindVertexArray(vao);
      gl.drawArrays(gl.POINTS, 0, glyphCount);
      gl.bindVertexArray(null);
    },
    destroy() {
      gl.deleteBuffer(buffer);
      gl.deleteVertexArray(vao);
      gl.deleteTexture(texture);
      gl.deleteProgram(program);
    },
  };
}
