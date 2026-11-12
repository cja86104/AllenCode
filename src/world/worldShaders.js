// @ts-check

/**
 * The code world: every glyph is a point in 3D (Code world prototype, Task P2). Its on-screen size
 * follows its distance, it fades into the dark with distance (fog) and very close to the camera,
 * and ember sparks twinkle; one range of glyphs can fade on its own (Task P4), one glyph, a cursor, can move and blink (W2.3), and a second range can be hidden (W2.4). The fragment shader is the field's (src/field/shaders.js): characters
 * stay characters.
 */
export const WORLD_VERTEX_SHADER = `#version 300 es
precision highp float;

layout(location = 0) in vec3 aPosition;
layout(location = 1) in float aGlyph;
layout(location = 2) in vec4 aColor;
layout(location = 3) in float aSize;

uniform mat4 uViewProjection;
uniform float uProjScale;
uniform float uViewportHeight;
uniform float uPixelRatio;
uniform float uTime;
uniform float uFogNear;
uniform float uFogFar;
uniform int uFadeFrom;
uniform int uFadeTo;
uniform float uFadeAmount;
uniform int uHideFrom;
uniform int uHideTo;
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
  // One range of glyphs (the landmark) can fade on its own as it hands over to the real screen.
  float handover = (gl_VertexID >= uFadeFrom && gl_VertexID < uFadeTo) ? uFadeAmount : 1.0;
  float blink = cursor ? uCursorOn : 1.0;
  // A second range is not drawn at all: an unfinished file's code not typed yet.
  float shown = (gl_VertexID >= uHideFrom && gl_VertexID < uHideTo) ? 0.0 : 1.0;
  vAlpha = aColor.a * fog * near * twinkle * handover * blink * shown * step(0.0, clip.w);
  vColor = aColor.rgb;
}
`;
