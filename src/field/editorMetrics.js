// @ts-check

/**
 * Editor geometry shared by the scenes (which draw the editor frame in the DOM) and the renderer
 * (which lays the characters out). JetBrains Mono advances every character 0.6 em.
 */
export const CODE_FONT_SIZE = 13;
export const CODE_CHAR_WIDTH = CODE_FONT_SIZE * 0.6;
export const CODE_LINE_HEIGHT = 19;
export const EDITOR_PADDING = 20;

/**
 * Size of the editor box that fits `code` exactly, at `scale` (1 is full size; smaller on phones).
 * @param {string} code
 * @param {number} [scale]
 * @returns {{ w: number, h: number }}
 */
export function editorSize(code, scale = 1) {
  const lines = code.split('\n');
  const longest = Math.max(...lines.map((line) => line.length));
  return {
    w: Math.ceil((longest * CODE_CHAR_WIDTH + EDITOR_PADDING * 2) * scale),
    h: Math.ceil((lines.length * CODE_LINE_HEIGHT + EDITOR_PADDING * 2) * scale),
  };
}
