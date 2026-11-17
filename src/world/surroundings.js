// @ts-check
import { budgetFor } from './shapes.js';
import { createRippleTrail, GROUND_CELL, groundMesh, groundRoads, rayThrough, RIPPLE_LIFE, RIPPLE_MAX, traceGround } from './ground.js';

/** @typedef {import('./shapes.js').Shape} Shape */
/** @typedef {{ name: string, shape: Shape, stopId?: string, cursor?: number }} Part */
/** @typedef {'low' | 'mid' | 'high'} Tier */

/** The fog's far edge, as the renderer's (`FOG_FAR` in worldRenderer.js): nothing past it is drawn. */
const FOG_FAR = 46;
/** The world is cut again once the camera has moved this far from where it was last cut. */
export const RECUT_AFTER = 20;
/**
 * The world is cut to what stands within this distance of where the camera was at the last cut (Chris,
 * 2026-11-16: "Build around the camera"): the fog's reach, and as far as the camera travels before the
 * next cut, so nothing within the fog's reach is ever missing.
 */
export const WINDOW_RADIUS = FOG_FAR + RECUT_AFTER;

/**
 * How many times the tier's budget a door's whole road may hold, once its world is cut around the
 * camera. The business road (three steps between stops, 2026-11-16) is built larger: enough that its
 * road keeps the family road's density and each of its landmarks about the family road's glyphs
 * (696 / 1131 / 1770 by tier), while no cut holds more than the tier's budget
 * (`tests/worldSurroundings.test.js`). The family road, three steps between stops too (2026-11-17), is
 * built larger by as much as keeps each of its landmarks the glyphs it had on the short road (348 / 565 /
 * 885 by tier) and the opening full.
 */
export const WORLD_SCALE = Object.freeze({
  a: Object.freeze({ low: 1.55, mid: 1.7, high: 1.75 }),
  b: Object.freeze({ low: 1.165, mid: 1.275, high: 1.31 }),
});

/**
 * The glyphs a door's whole road may hold on a tier.
 * @param {'a' | 'b'} door @param {Tier} tier
 */
export function worldBudgetFor(door, tier) {
  return Math.floor(budgetFor(tier) * WORLD_SCALE[door][tier]);
}

/** Each whole part's bounding circle on the ground, worked out once. @type {WeakMap<Shape, { x: number, z: number, r: number }>} */
const circles = new WeakMap();

/** @param {Shape} shape */
function circleOf(shape) {
  const known = circles.get(shape);
  if (known) return known;
  const n = shape.glyphs.length;
  let x = 0;
  let z = 0;
  for (let i = 0; i < n; i += 1) {
    x += shape.positions[i * 3];
    z += shape.positions[i * 3 + 2];
  }
  x /= Math.max(1, n);
  z /= Math.max(1, n);
  let r = 0;
  for (let i = 0; i < n; i += 1) r = Math.max(r, Math.hypot(shape.positions[i * 3] - x, shape.positions[i * 3 + 2] - z));
  const circle = { x, z, r };
  circles.set(shape, circle);
  return circle;
}

/**
 * A shape with only the glyphs `keep` names, in order, every per-glyph array cut alike.
 * @param {Shape} shape @param {ReadonlyArray<number>} keep
 * @returns {Shape}
 */
function pick(shape, keep) {
  const n = keep.length;
  const positions = new Float32Array(n * 3);
  const glyphs = new Uint16Array(n);
  const colors = new Float32Array(n * 4);
  const sizes = shape.sizes ? new Float32Array(n) : undefined;
  const flow = shape.flow ? new Float32Array(n) : undefined;
  const stream = shape.stream ? new Float32Array(n * 4) : undefined;
  keep.forEach((i, j) => {
    positions.set(shape.positions.subarray(i * 3, i * 3 + 3), j * 3);
    glyphs[j] = shape.glyphs[i];
    colors.set(shape.colors.subarray(i * 4, i * 4 + 4), j * 4);
    if (sizes && shape.sizes) sizes[j] = shape.sizes[i];
    if (flow && shape.flow) flow[j] = shape.flow[i];
    if (stream && shape.stream) stream.set(shape.stream.subarray(i * 4, i * 4 + 4), j * 4);
  });
  return { ...shape, positions, glyphs, colors, ...(sizes ? { sizes } : {}), ...(flow ? { flow } : {}), ...(stream ? { stream } : {}) };
}

/** An empty copy of a shape: drawn as nothing, its place in the order kept. @param {Shape} shape */
const nothing = (shape) => pick(shape, []);

/**
 * The world cut to what stands within `radius` of `center` on the ground (2026-11-16): the road's
 * scatter and edges (parts named `…-road` and `…-edges`) glyph by glyph; every other part (a
 * landmark, its picture, its stand, a slab, a sign, the editor) whole while any of it is within reach,
 * and empty otherwise, so its fades, tag and cursor keep working. The parts keep their order and names.
 * @param {ReadonlyArray<Part>} parts @param {[number, number]} center @param {number} radius
 * @returns {Part[]}
 */
export function cutWorld(parts, center, radius) {
  const [cx, cz] = center;
  return parts.map((part) => {
    const kind = part.name.split(':')[0];
    const { shape } = part;
    if (kind.endsWith('-road') || kind.endsWith('-edges')) {
      /** @type {number[]} */
      const keep = [];
      for (let i = 0; i < shape.glyphs.length; i += 1) {
        if (Math.hypot(shape.positions[i * 3] - cx, shape.positions[i * 3 + 2] - cz) <= radius) keep.push(i);
      }
      return { ...part, shape: keep.length === shape.glyphs.length ? shape : pick(shape, keep) };
    }
    if (shape.glyphs.length === 0) return part;
    const circle = circleOf(shape);
    return Math.hypot(circle.x - cx, circle.z - cz) - circle.r <= radius ? part : { ...part, shape: nothing(shape) };
  });
}

/** The middle of the opening's roads (trunk from z −3 to the branches' ends at −55). @type {[number, number]} */
const OPENING_CENTER = [0, -29];

/** The ground's grid lines, faint grey, and the ripples' dim orange (#f97316). */
const GROUND_SHADERS = {
  vertex: `#version 300 es
layout(location = 0) in vec3 aPosition;
layout(location = 1) in float aOffRoad;
uniform mat4 uViewProjection;
out vec2 vXZ;
out float vDepth;
out float vOffRoad;
void main() {
  vec4 clip = uViewProjection * vec4(aPosition, 1.0);
  gl_Position = clip;
  vXZ = aPosition.xz;
  vDepth = clip.w;
  vOffRoad = aOffRoad;
}
`,
  fragment: `#version 300 es
precision highp float;
in vec2 vXZ;
in float vDepth;
in float vOffRoad;
uniform float uFogNear;
uniform float uFogFar;
uniform float uShown;
uniform vec3 uRipples[${RIPPLE_MAX}];
out vec4 outColor;
void main() {
  if (vDepth <= 0.0) discard;
  vec2 g = vXZ / ${GROUND_CELL.toFixed(1)};
  vec2 w = max(fwidth(g), vec2(1e-4));
  // A line every cell each way, a pixel wide; faded where the cells grow too small to draw.
  vec2 d = abs(fract(g - 0.5) - 0.5) / w;
  float line = (1.0 - min(min(d.x, d.y), 1.0)) * (1.0 - smoothstep(0.25, 0.6, max(w.x, w.y)));
  // The grid's nodes, where its lines cross.
  float node = 1.0 - smoothstep(0.06, 0.2, length((fract(g + 0.5) - 0.5) * ${GROUND_CELL.toFixed(1)}));
  float fog = 1.0 - smoothstep(uFogNear, uFogFar, vDepth);
  float near = smoothstep(0.5, 2.0, vDepth);
  // Kept off the roads, so they read clean.
  float off = smoothstep(0.0, 0.8, vOffRoad);
  float base = line * 0.09 * fog * near * off * uShown;
  // The cursor's ripples: nodes near each point of its trail glow, fading out over its life.
  float glow = 0.0;
  for (int i = 0; i < ${RIPPLE_MAX}; i += 1) {
    float age = uRipples[i].z;
    if (age < 0.0) continue;
    float life = 1.0 - age / ${RIPPLE_LIFE.toFixed(1)};
    vec2 p = vXZ - uRipples[i].xy;
    glow += exp(-dot(p, p) / 9.0) * life * life;
  }
  glow = min(glow, 1.0) * (node * 0.6 + line * 0.25) * fog * off * uShown;
  vec3 color = vec3(0.55, 0.53, 0.5) * base + vec3(0.976, 0.451, 0.086) * glow;
  outColor = vec4(color, base + glow);
}
`,
};

/**
 * The ground's layer on the renderer's context: its mesh, re-sent at each cut, drawn beneath the glyphs.
 * @param {WebGL2RenderingContext} gl
 */
function createGroundLayer(gl) {
  /** @param {number} type @param {string} source */
  const compile = (type, source) => {
    const shader = gl.createShader(type);
    if (!shader) throw new Error('The ground could not create a shader.');
    gl.shaderSource(shader, source);
    gl.compileShader(shader);
    if (!gl.getShaderParameter(shader, gl.COMPILE_STATUS)) throw new Error(`Ground shader failed to compile: ${gl.getShaderInfoLog(shader)}`);
    return shader;
  };
  const program = gl.createProgram();
  if (!program) throw new Error('The ground could not create a program.');
  const vertex = compile(gl.VERTEX_SHADER, GROUND_SHADERS.vertex);
  const fragment = compile(gl.FRAGMENT_SHADER, GROUND_SHADERS.fragment);
  gl.attachShader(program, vertex);
  gl.attachShader(program, fragment);
  gl.linkProgram(program);
  if (!gl.getProgramParameter(program, gl.LINK_STATUS)) throw new Error(`Ground program failed to link: ${gl.getProgramInfoLog(program)}`);
  gl.deleteShader(vertex);
  gl.deleteShader(fragment);
  const u = {
    viewProjection: gl.getUniformLocation(program, 'uViewProjection'),
    fogNear: gl.getUniformLocation(program, 'uFogNear'),
    fogFar: gl.getUniformLocation(program, 'uFogFar'),
    shown: gl.getUniformLocation(program, 'uShown'),
    ripples: gl.getUniformLocation(program, 'uRipples'),
  };
  const vao = gl.createVertexArray();
  const positions = gl.createBuffer();
  const offRoad = gl.createBuffer();
  const indices = gl.createBuffer();
  gl.bindVertexArray(vao);
  gl.bindBuffer(gl.ARRAY_BUFFER, positions);
  gl.enableVertexAttribArray(0);
  gl.vertexAttribPointer(0, 3, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ARRAY_BUFFER, offRoad);
  gl.enableVertexAttribArray(1);
  gl.vertexAttribPointer(1, 1, gl.FLOAT, false, 0, 0);
  gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
  gl.bindVertexArray(null);
  let count = 0;
  let wide = false;
  const ripples = new Float32Array(RIPPLE_MAX * 3);
  return {
    /** @param {ReturnType<typeof groundMesh>} mesh */
    set(mesh) {
      gl.bindVertexArray(vao);
      gl.bindBuffer(gl.ARRAY_BUFFER, positions);
      gl.bufferData(gl.ARRAY_BUFFER, mesh.positions, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ARRAY_BUFFER, offRoad);
      gl.bufferData(gl.ARRAY_BUFFER, mesh.offRoad, gl.STATIC_DRAW);
      gl.bindBuffer(gl.ELEMENT_ARRAY_BUFFER, indices);
      gl.bufferData(gl.ELEMENT_ARRAY_BUFFER, mesh.indices, gl.STATIC_DRAW);
      gl.bindVertexArray(null);
      count = mesh.indices.length;
      wide = mesh.indices instanceof Uint32Array;
    },
    /**
     * @param {{ viewProjection: Float32Array, fogNear: number, fogFar: number }} frame
     * @param {number} shown @param {ReadonlyArray<{ x: number, z: number, age: number }>} lit
     */
    draw({ viewProjection, fogNear, fogFar }, shown, lit) {
      if (count === 0 || shown <= 0) return;
      for (let i = 0; i < RIPPLE_MAX; i += 1) {
        const p = lit[i];
        ripples.set(p ? [p.x, p.z, p.age] : [0, 0, -1], i * 3);
      }
      gl.useProgram(program);
      gl.uniformMatrix4fv(u.viewProjection, false, viewProjection);
      gl.uniform1f(u.fogNear, fogNear);
      gl.uniform1f(u.fogFar, fogFar);
      gl.uniform1f(u.shown, shown);
      gl.uniform3fv(u.ripples, ripples);
      gl.bindVertexArray(vao);
      gl.drawElements(gl.TRIANGLES, count, wide ? gl.UNSIGNED_INT : gl.UNSIGNED_SHORT, 0);
      gl.bindVertexArray(null);
    },
    destroy() {
      gl.deleteBuffer(positions);
      gl.deleteBuffer(offRoad);
      gl.deleteBuffer(indices);
      gl.deleteVertexArray(vao);
      gl.deleteProgram(program);
    },
  };
}

/**
 * The world around the camera (2026-11-16), for the home's world: each door's budget for its whole
 * road, the cut to draw, the ground beneath it, and the cursor's ripples on the ground. Created by the
 * canvas from the world layer, so its code stays out of the canvas chunk.
 * - The cut: the world within `WINDOW_RADIUS` of where the camera was, the ground's mesh under it.
 * - The ripples: a mouse (not touch) moving over the page is traced from the camera to the ground; off
 *   the road and within the fog's reach, each place joins the ripple trail. The canvas is marked
 *   `data-ripples` with how many are lit, for tests.
 * @param {{ tier: Tier, renderer: { context: WebGL2RenderingContext }, canvas: HTMLCanvasElement }} deps
 */
export function createSurroundings({ tier, renderer, canvas }) {
  const ground = createGroundLayer(renderer.context);
  const trail = createRippleTrail();
  /** The roads under the cut, worked out once per road. @type {WeakMap<object, ReturnType<typeof groundRoads>>} */
  const roadsOf = new WeakMap();
  /** @type {ReturnType<typeof groundRoads> | null} */
  let roads = null;
  /** The mouse on the screen (−1 to 1, up positive), and whether it has moved since the last frame. */
  let pointer = { x: 0, y: 0, moved: false };
  /** @type {ReadonlyArray<{ x: number, z: number, age: number }>} */
  let lit = [];
  let shown = 1;
  /** @param {PointerEvent} event */
  const move = (event) => {
    if (event.pointerType !== 'mouse') return;
    pointer = { x: (event.clientX / window.innerWidth) * 2 - 1, y: 1 - (event.clientY / window.innerHeight) * 2, moved: true };
  };
  window.addEventListener('pointermove', move, { passive: true });
  return {
    /** The world is cut again once the camera has moved this far from the last cut. */
    recutAfter: RECUT_AFTER,
    /** @param {'a' | 'b'} door */
    worldBudget(door) {
      return worldBudgetFor(door, tier);
    },
    /**
     * The world to draw around a point on the ground, with the ground's mesh under it.
     * @param {ReadonlyArray<Part>} world @param {[number, number]} center
     * @param {ReturnType<typeof import('./roadLayout.js').layoutRoad>} layout
     * @returns {Part[]}
     */
    cut(world, center, layout) {
      roads = roadsOf.get(layout) ?? groundRoads(layout);
      roadsOf.set(layout, roads);
      ground.set(groundMesh(roads, center, WINDOW_RADIUS));
      return cutWorld(world, center, WINDOW_RADIUS);
    },
    /** The opening's ground, before a door is taken: flat, centred on the trunk and both branches. */
    opening() {
      roads = groundRoads(null);
      ground.set(groundMesh(roads, OPENING_CENTER, WINDOW_RADIUS));
    },
    /**
     * Each frame: traces a moved mouse to the ground and keeps the ripple trail.
     * @param {{ camera: { eye: [number, number, number], target: [number, number, number], fov: number }, now: number, aspect: number, shown: number }} frame
     */
    frame({ camera, now, aspect, shown: visible }) {
      shown = visible;
      if (pointer.moved && roads && visible > 0) {
        pointer.moved = false;
        const hit = traceGround(roads, camera.eye, rayThrough(camera, aspect, pointer.x, pointer.y), FOG_FAR);
        if (hit) trail.add(hit, now);
      }
      lit = trail.active(now);
      canvas.dataset.ripples = String(lit.length);
    },
    /** The ground and its ripples, beneath the glyphs (the renderer's `underlay`). @param {{ viewProjection: Float32Array, fogNear: number, fogFar: number }} frame */
    underlay(frame) {
      ground.draw(frame, shown, lit);
    },
    destroy() {
      window.removeEventListener('pointermove', move);
      ground.destroy();
    },
  };
}
