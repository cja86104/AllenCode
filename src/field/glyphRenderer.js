// @ts-check
import { AMBIENT_VERTEX_SHADER, GLYPH_FRAGMENT_SHADER, TRANSFORM_VERTEX_SHADER } from './shaders.js';
import { ATLAS_CELL, ATLAS_FONT_SIZE } from './glyphAtlas.js';

/** @typedef {import('./glyphAtlas.js').Atlas} Atlas */
/** @typedef {import('./transformation.js').Transformation} Transformation */

/**
 * @typedef {object} GlyphRenderer
 * @property {(width: number, height: number, dpr: number) => void} resize
 * @property {(glyphs: number[] | null, capacity: number) => void} setAmbient Allocates `capacity` ambient characters cycling through `glyphs` (atlas indices of the ambient excerpt), or removes the ambient field.
 * @property {(count: number) => void} setAmbientCount Draws the first `count` ambient characters.
 * @property {(progress: number, intensity: number) => void} setAmbientState Page scroll progress (parallax) and brightness.
 * @property {(t: Transformation | null, sizes: { from: number, to: number }) => void} setTransformation Character sizes in CSS pixels, in the file and when landed.
 * @property {(progress: number, fade: number) => void} setTransformState
 * @property {(timeMs: number) => void} render
 * @property {() => void} destroy Frees every GPU resource this renderer created.
 */

/** The point sprite is the atlas cell, so scale the wanted character size by cell / font size. */
const GLYPH_SCALE = ATLAS_CELL / ATLAS_FONT_SIZE;

/**
 * @param {WebGL2RenderingContext} gl
 * @param {number} type
 * @param {string} source
 */
function compile(gl, type, source) {
  const shader = gl.createShader(type);
  if (!shader) throw new Error('Could not create a WebGL shader.');
  gl.shaderSource(shader, source);
  gl.compileShader(shader);
  if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) {
    const log = gl.getShaderInfoLog(shader) ?? 'unknown error';
    gl.deleteShader(shader);
    throw new Error(`Glyph shader failed to compile: ${log}`);
  }
  return shader;
}

/**
 * @param {WebGL2RenderingContext} gl
 * @param {string} vertexSource
 */
function link(gl, vertexSource) {
  const vertex = compile(gl, gl.VERTEX_SHADER, vertexSource);
  const fragment = compile(gl, gl.FRAGMENT_SHADER, GLYPH_FRAGMENT_SHADER);
  const program = gl.createProgram();
  if (!program) throw new Error('Could not create a WebGL program.');
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) {
    throw new Error(`Glyph program failed to link: ${gl.getProgramInfoLog(program) ?? 'unknown error'}`);
  }
  /** @type {Map<string, WebGLUniformLocation>} */
  const locations = new Map();
  /** @param {string} name */
  const uniform = (name) => {
    const cached = locations.get(name);
    if (cached) return cached;
    const location = gl.getUniformLocation(program, name);
    if (!location) throw new Error(`Glyph program is missing the ${name} uniform.`);
    locations.set(name, location);
    return location;
  };
  return { program, uniform };
}

/**
 * Uploads attribute arrays into a new vertex array. Returns the array and its buffers.
 * @param {WebGL2RenderingContext} gl
 * @param {[Float32Array, number][]} attributes Data and component count, in location order.
 */
function upload(gl, attributes) {
  const vao = gl.createVertexArray();
  if (!vao) throw new Error('Could not allocate a WebGL vertex array.');
  gl.bindVertexArray(vao);
  const buffers = attributes.map(([data, size], location) => {
    const buffer = gl.createBuffer();
    if (!buffer) throw new Error('Could not allocate a WebGL buffer.');
    gl.bindBuffer(gl.ARRAY_BUFFER, buffer);
    gl.bufferData(gl.ARRAY_BUFFER, data, gl.STATIC_DRAW);
    gl.enableVertexAttribArray(location);
    gl.vertexAttribPointer(location, size, gl.FLOAT, false, 0, 0);
    return buffer;
  });
  gl.bindVertexArray(null);
  return { vao, buffers };
}

/**
 * Deterministic pseudo-random numbers so the ambient field is the same on every visit.
 * @param {number} seed
 */
function random(seed) {
  let state = seed;
  return () => {
    state = (state * 16807) % 2147483647;
    return state / 2147483647;
  };
}

/**
 * Creates the WebGL2 glyph renderer. Throws if WebGL2 is unavailable or a shader fails, so the
 * caller can fall back to the CSS field.
 *
 * @param {HTMLCanvasElement} canvas
 * @param {{ atlas: Atlas }} opts
 * @returns {GlyphRenderer}
 */
export function createGlyphRenderer(canvas, { atlas }) {
  const gl = canvas.getContext('webgl2', { alpha: true, antialias: false, premultipliedAlpha: true });
  if (!gl) throw new Error('WebGL2 is not available.');

  const ambientProgram = link(gl, AMBIENT_VERTEX_SHADER);
  const transformProgram = link(gl, TRANSFORM_VERTEX_SHADER);

  const texture = gl.createTexture();
  if (!texture) throw new Error('Could not allocate the glyph atlas texture.');
  gl.bindTexture(gl.TEXTURE_2D, texture);
  gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, atlas.canvas);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, gl.LINEAR);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
  gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);

  for (const { program, uniform } of [ambientProgram, transformProgram]) {
    gl.useProgram(program);
    gl.uniform1i(uniform('uAtlas'), 0);
    gl.uniform2f(uniform('uGrid'), atlas.columns, atlas.rows);
    gl.uniform1f(uniform('uGlyphScale'), GLYPH_SCALE);
  }

  gl.disable(gl.DEPTH_TEST);
  gl.enable(gl.BLEND);
  gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);

  /** @type {{ vao: WebGLVertexArrayObject, buffers: WebGLBuffer[] } | null} */
  let ambient = null;
  let ambientCapacity = 0;
  let ambientCount = 0;
  let pageProgress = 0;
  let intensity = 1;

  /** @type {{ vao: WebGLVertexArrayObject, buffers: WebGLBuffer[] } | null} */
  let transform = null;
  let transformCount = 0;
  let transformProgress = 0;
  let transformFade = 1;
  let sizes = { from: 13, to: 12 };

  let width = 1;
  let height = 1;
  let pixelRatio = 1;
  let destroyed = false;

  /** @param {{ vao: WebGLVertexArrayObject, buffers: WebGLBuffer[] } | null} geometry */
  const free = (geometry) => {
    if (!geometry || gl.isContextLost()) return;
    geometry.buffers.forEach((buffer) => gl.deleteBuffer(buffer));
    gl.deleteVertexArray(geometry.vao);
  };

  return {
    resize(w, h, dpr) {
      width = w;
      height = h;
      pixelRatio = dpr;
      const pw = Math.max(1, Math.round(w * dpr));
      const ph = Math.max(1, Math.round(h * dpr));
      if (canvas.width !== pw || canvas.height !== ph) {
        canvas.width = pw;
        canvas.height = ph;
      }
      gl.viewport(0, 0, pw, ph);
    },
    setAmbient(glyphs, capacity) {
      free(ambient);
      ambient = null;
      ambientCapacity = 0;
      ambientCount = 0;
      if (!glyphs || glyphs.length === 0 || capacity <= 0) return;
      const rnd = random(0x5eed);
      const base = new Float32Array(capacity * 2);
      const depth = new Float32Array(capacity);
      const glyph = new Float32Array(capacity);
      const seed = new Float32Array(capacity);
      for (let i = 0; i < capacity; i += 1) {
        base[i * 2] = rnd();
        base[i * 2 + 1] = rnd();
        depth[i] = Math.pow(rnd(), 2.2);
        glyph[i] = glyphs[i % glyphs.length];
        seed[i] = rnd();
      }
      ambient = upload(gl, [[base, 2], [depth, 1], [glyph, 1], [seed, 1]]);
      ambientCapacity = capacity;
      ambientCount = capacity;
    },
    setAmbientCount(count) {
      ambientCount = Math.max(0, Math.min(ambientCapacity, Math.round(count)));
    },
    setAmbientState(progress, nextIntensity) {
      pageProgress = progress;
      intensity = nextIntensity;
    },
    setTransformation(t, nextSizes) {
      free(transform);
      transform = null;
      transformCount = 0;
      sizes = nextSizes;
      if (!t || t.count === 0) return;
      const meta = new Float32Array(t.count * 4);
      for (let i = 0; i < t.count; i += 1) {
        meta.set([t.glyph[i], t.original[i], t.seed[i], t.row[i]], i * 4);
      }
      transform = upload(gl, [[t.start, 2], [t.end, 2], [meta, 4], [t.srcColor, 3], [t.dstColor, 3]]);
      transformCount = t.count;
    },
    setTransformState(progress, fade) {
      transformProgress = progress;
      transformFade = fade;
    },
    render(timeMs) {
      if (destroyed || gl.isContextLost()) return;
      gl.clearColor(0, 0, 0, 0);
      gl.clear(gl.COLOR_BUFFER_BIT);
      gl.activeTexture(gl.TEXTURE0);
      gl.bindTexture(gl.TEXTURE_2D, texture);

      if (ambient && ambientCount > 0) {
        const { program, uniform } = ambientProgram;
        gl.useProgram(program);
        gl.uniform1f(uniform('uTime'), timeMs);
        gl.uniform1f(uniform('uProgress'), pageProgress);
        gl.uniform1f(uniform('uIntensity'), intensity);
        gl.uniform1f(uniform('uPixelRatio'), pixelRatio);
        gl.uniform1f(uniform('uFade'), 1);
        gl.bindVertexArray(ambient.vao);
        gl.drawArrays(gl.POINTS, 0, ambientCount);
      }

      if (transform && transformCount > 0 && transformFade > 0) {
        const { program, uniform } = transformProgram;
        gl.useProgram(program);
        gl.uniform2f(uniform('uResolution'), width, height);
        gl.uniform1f(uniform('uPixelRatio'), pixelRatio);
        gl.uniform1f(uniform('uProgress'), transformProgress);
        gl.uniform1f(uniform('uFromSize'), sizes.from);
        gl.uniform1f(uniform('uToSize'), sizes.to);
        gl.uniform1f(uniform('uFade'), transformFade);
        gl.bindVertexArray(transform.vao);
        gl.drawArrays(gl.POINTS, 0, transformCount);
      }
      gl.bindVertexArray(null);
    },
    destroy() {
      if (destroyed) return;
      destroyed = true;
      free(ambient);
      free(transform);
      if (gl.isContextLost()) return;
      gl.deleteTexture(texture);
      gl.deleteProgram(ambientProgram.program);
      gl.deleteProgram(transformProgram.program);
    },
  };
}
