// @ts-check
/**
 * Shared JSDoc types for the field system. This module has no runtime code.
 *
 * @typedef {'high' | 'medium' | 'low'} Tier
 *
 * @typedef {object} CapabilityEnv
 * @property {boolean} webgl2 Whether a WebGL2 context can be created.
 * @property {boolean} prefersReducedMotion The `prefers-reduced-motion: reduce` media query result.
 * @property {number} hardwareConcurrency Logical CPU cores (`navigator.hardwareConcurrency`).
 * @property {number} [deviceMemory] Approximate RAM in GB (`navigator.deviceMemory`); absent in some browsers.
 * @property {number} viewportWidth Viewport width in CSS pixels.
 *
 * @typedef {object} Capabilities
 * @property {boolean} webgl2
 * @property {boolean} reducedMotion
 * @property {Tier} tier
 * @property {number} ambientCount Ambient characters to start with for the tier.
 * @property {number} transformBudget Most particles one transformation may use.
 *
 * @typedef {object} Box
 * @property {number} x
 * @property {number} y
 * @property {number} w
 * @property {number} h
 *
 * @typedef {object} GlyphPoint A code character at its place in an editor layout.
 * @property {number} x
 * @property {number} y
 * @property {string} char
 * @property {[number, number, number]} color 0..1 RGB.
 *
 * @typedef {object} TargetPoint A place a character can land, with the color of what is there.
 * @property {number} x
 * @property {number} y
 * @property {[number, number, number]} color 0..1 RGB.
 *
 * @typedef {object} TransformSpec One code-to-text transformation a scene asks the field to play.
 * @property {string} key Changes whenever the layout changes, so the field rebuilds it.
 * @property {string} code The excerpt's code, laid out as an editor in `sourceBox`.
 * @property {Box} sourceBox Viewport box of the editor, in CSS pixels.
 * @property {number} [codeScale] Editor scale (1 is full size); the scene uses the same scale for its DOM editor.
 * @property {TextTarget | ImageTarget | SketchTarget} target What the characters land on, drawn inside `targetBox`.
 * @property {Box} targetBox Viewport box of the target, in CSS pixels.
 * @property {number} step Coarsest spacing of landing places, in CSS pixels.
 *
 * @typedef {object} TextTarget Land on a line of display text.
 * @property {'text'} kind
 * @property {string} text `\n` breaks lines.
 * @property {string} font CSS font for the text.
 * @property {[number, number, number]} color 0..1 RGB of the landed characters.
 *
 * @typedef {object} ImageTarget Land on a picture, each character tinted by the pixel beneath it.
 * @property {'image'} kind
 * @property {string} src Same-origin image URL.
 * @property {string} alt What the picture shows.
 *
 * @typedef {object} SketchTarget Land on a wireframe of the visitor's idea.
 * @property {'sketch'} kind
 * @property {ReadonlyArray<import('../scenes/sketchBlocks.js').SketchBlock>} blocks Top to bottom.
 *
 * @typedef {object} Governor
 * @property {(frameMs: number) => number} sample Records one frame time in milliseconds and returns the current count.
 */

export {};
