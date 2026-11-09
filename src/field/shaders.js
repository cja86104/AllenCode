// @ts-check

/**
 * Ambient field: faint characters of the site's own source drifting at different depths. Scroll
 * progress moves nearer characters faster (parallax); time adds a slow upward drift.
 */
export const AMBIENT_VERTEX_SHADER = `#version 300 es
precision highp float;

layout(location = 0) in vec2 aBase;
layout(location = 1) in float aDepth;
layout(location = 2) in float aGlyph;
layout(location = 3) in float aSeed;

uniform float uTime;
uniform float uProgress;
uniform float uIntensity;
uniform float uPixelRatio;
uniform float uGlyphScale;

out float vGlyph;
out float vAlpha;
out vec3 vColor;

void main() {
  float y = fract(aBase.y - uTime * 0.000004 * (0.4 + aDepth) - uProgress * (0.15 + aDepth * 0.6));
  float x = aBase.x + sin(uTime * 0.00015 + aSeed * 6.2831) * 0.004;
  gl_Position = vec4(x * 2.0 - 1.0, 1.0 - y * 2.0, 0.0, 1.0);
  gl_PointSize = (9.0 + aDepth * 9.0) * uGlyphScale * uPixelRatio;
  vGlyph = aGlyph;
  vAlpha = (0.05 + aDepth * 0.14) * uIntensity;
  vColor = aSeed > 0.96 ? vec3(0.976, 0.451, 0.086) : vec3(0.82, 0.82, 0.8);
}
`;

/**
 * Transformation: the approved prototype's motion. Characters lift top line first, arc, and land;
 * copies of real characters emerge as the code lifts; color mixes to the landing color.
 */
export const TRANSFORM_VERTEX_SHADER = `#version 300 es
precision highp float;

layout(location = 0) in vec2 aStart;
layout(location = 1) in vec2 aEnd;
layout(location = 2) in vec4 aMeta;
layout(location = 3) in vec3 aSrcColor;
layout(location = 4) in vec3 aDstColor;

uniform vec2 uResolution;
uniform float uPixelRatio;
uniform float uGlyphScale;
uniform float uProgress;
uniform float uFromSize;
uniform float uToSize;

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

  vec2 pos = mix(aStart, aEnd, easeInOutCubic(t));
  float arc = sin(t * 3.14159);
  pos += vec2(sin(seed * 6.2831 + t * 4.0) * 70.0 * arc, -arc * (80.0 + seed * 160.0));
  vec2 clip = (pos / uResolution) * 2.0 - 1.0;
  gl_Position = vec4(clip.x, -clip.y, 0.0, 1.0);

  float landed = smoothstep(0.5, 0.95, t);
  gl_PointSize = mix(uFromSize, uToSize, landed) * uGlyphScale * uPixelRatio;
  vGlyph = glyph;
  vAlpha = original > 0.5 ? 1.0 : smoothstep(0.04, 0.35, t);
  vColor = mix(aSrcColor, aDstColor, landed);
}
`;

/** Both programs: sample the character from the atlas; characters stay characters. */
export const GLYPH_FRAGMENT_SHADER = `#version 300 es
precision mediump float;

uniform sampler2D uAtlas;
uniform vec2 uGrid;
uniform float uFade;

in float vGlyph;
in float vAlpha;
in vec3 vColor;
out vec4 outColor;

void main() {
  vec2 cell = vec2(mod(vGlyph, uGrid.x), floor(vGlyph / uGrid.x));
  float glyph = texture(uAtlas, (cell + gl_PointCoord) / uGrid).a;
  float alpha = glyph * vAlpha * uFade;
  if (alpha < 0.01) discard;
  outColor = vec4(vColor * alpha, alpha);
}
`;
