// @ts-check

/** How fast a stand's code rises, in world units per millisecond (0.35 a second). */
const FLOW_SPEED = '0.00035';

/**
 * The code world: every glyph is a point in 3D (Code world prototype, Task P2). Its on-screen size
 * follows its distance, it fades into the dark with distance (fog) and very close to the camera,
 * and ember sparks twinkle; up to four ranges of glyphs fade on their own (P4, W2.4, R3), and one glyph, a cursor, can move and blink (W2.3), and a stand's code flows up between its posts (R5). The fragment shader is the field's (src/field/shaders.js): characters
 * stay characters.
 */
export const WORLD_VERTEX_SHADER = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in float aGlyph;
layout(location = 2) in vec4 aColor;
layout(location = 3) in float aSize;
layout(location = 4) in float aTag;
layout(location = 5) in float aFlow;

uniform mat4 uViewProjection;
uniform float uProjScale;
uniform float uViewportHeight;
uniform float uPixelRatio;
uniform float uTime;
uniform float uFogNear;
uniform float uFogFar;
uniform int uFadeFrom[4];
uniform int uFadeTo[4];
uniform float uFadeAmount[4];
uniform int uPassed;
uniform int uCursorIndex;
uniform vec3 uCursorPosition;
uniform float uCursorOn;

out float vGlyph;
out float vAlpha;
out vec3 vColor;

void main() {
  // One glyph (an unfinished file's cursor) can be moved and blinked on its own.
  bool cursor = gl_VertexID == uCursorIndex;
  vec3 position = cursor ? uCursorPosition : aPosition;
  // A stand's code rises up its column from the ground and wraps (R5), fading in at the foot and out
  // at the top.
  float flowing = 1.0;
  if (aFlow > 0.0) {
    float s = fract(aPosition.y / aFlow + uTime * ${FLOW_SPEED} / aFlow);
    position.y = s * aFlow;
    flowing = smoothstep(0.0, 0.15, s) * (1.0 - smoothstep(0.85, 1.0, s));
  }
  vec4 clip = uViewProjection * vec4(position, 1.0);
  gl_Position = clip;
  float depth = max(clip.w, 0.0001);
  // The atlas draws a glyph at two thirds of its cell, so the cell is 1.5 times the glyph's size.
  float size = aSize * 1.5 * uProjScale * uViewportHeight * 0.5 / depth;
  gl_PointSize = min(size * uPixelRatio, 256.0);

  float fog = 1.0 - smoothstep(uFogNear, uFogFar, depth);
  float near = smoothstep(0.25, 1.2, depth);
  float ember = step(0.9, aColor.r) * step(aColor.g, 0.5);
  float seed = fract(sin(dot(position.xz, vec2(12.9898, 78.233))) * 43758.5453);
  float twinkle = mix(1.0, 0.55 + 0.45 * sin(uTime * 0.002 + seed * 6.2831), ember);

  vGlyph = aGlyph;
  // Up to four ranges of glyphs fade on their own: a landmark under its chapter's box, the world's
  // editor while the gate plays, an unfinished file's code not typed yet.
  float faded = 1.0;
  for (int i = 0; i < 4; i += 1) {
    if (gl_VertexID >= uFadeFrom[i] && gl_VertexID < uFadeTo[i]) faded *= uFadeAmount[i];
  }
  float blink = cursor ? uCursorOn : 1.0;
  // A road landmark's code until the visitor has passed it, then its picture (R4).
  int place = int(abs(aTag) + 0.5);
  bool passed = place > 0 && place <= uPassed;
  float tagged = aTag > 0.5 ? (passed ? 0.0 : 1.0) : (aTag < -0.5 ? (passed ? 1.0 : 0.0) : 1.0);
  vAlpha = aColor.a * fog * near * twinkle * faded * blink * tagged * flowing * step(0.0, clip.w);
  vColor = aColor.rgb;
}
`;

/**
 * A chapter's flight in the world (Code World R3): the field's transformation motion
 * (`TRANSFORM_VERTEX_SHADER` in src/field/shaders.js), same delays, easing, copies emerging, size and
 * colour change, with the start and landing places on a plane in the world. The field's sway and lift
 * (in CSS pixels) run along the plane's right and up directions, scaled to a pixel; the arc also lifts
 * the characters out of the plane toward the camera, through the scene, before they land.
 */
export const FLIGHT_VERTEX_SHADER = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aStart;
layout(location = 1) in vec3 aEnd;
layout(location = 2) in vec4 aMeta;
layout(location = 3) in vec3 aSrcColor;
layout(location = 4) in vec3 aDstColor;

uniform mat4 uViewProjection;
uniform float uProjScale;
uniform float uViewportHeight;
uniform float uPixelRatio;
uniform float uProgress;
uniform float uFromSize;
uniform float uToSize;
uniform vec3 uNormal;
uniform vec3 uRight;
uniform vec3 uUp;
uniform float uLift;

out float vGlyph;
out float vAlpha;
out vec3 vColor;

float easeInOutCubic(float t) {
  return t < 0.5 ? 4.0 * t * t * t : 1.0 - pow(-2.0 * t + 2.0, 3.0) / 2.0;
}

void main() {
  float glyph = aMeta.x;
  float original = aMeta.y;
  float seed = aMeta.z;
  float row = aMeta.w;
  float delay = row * 0.2 + seed * (original > 0.5 ? 0.04 : 0.12);
  float t = clamp((uProgress - delay) / 0.68, 0.0, 1.0);

  vec3 position = mix(aStart, aEnd, easeInOutCubic(t));
  float arc = sin(t * 3.14159);
  position += uRight * (sin(seed * 6.2831 + t * 4.0) * 70.0 * arc);
  position += uUp * (arc * (80.0 + seed * 160.0));
  position += uNormal * (arc * uLift * (0.6 + 0.8 * seed));
  vec4 clip = uViewProjection * vec4(position, 1.0);
  gl_Position = clip;

  float landed = smoothstep(0.5, 0.95, t);
  float depth = max(clip.w, 0.0001);
  // As in the world's glyphs: the atlas draws a glyph at two thirds of its cell.
  float size = mix(uFromSize, uToSize, landed) * 1.5 * uProjScale * uViewportHeight * 0.5 / depth;
  gl_PointSize = min(size * uPixelRatio, 256.0);
  vGlyph = glyph;
  vAlpha = (original > 0.5 ? 1.0 : smoothstep(0.04, 0.35, t)) * step(0.0, clip.w);
  vColor = mix(aSrcColor, aDstColor, landed);
}
`;
