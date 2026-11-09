// @ts-check
import { describe, expect, it } from 'vitest';
import { CODE_CHAR_WIDTH, CODE_LINE_HEIGHT, EDITOR_PADDING, editorSize } from '../src/field/editorMetrics.js';

describe('editorSize', () => {
  it('fits the longest line and every row at full size', () => {
    expect(editorSize('abcd\nab')).toEqual({
      w: Math.ceil(4 * CODE_CHAR_WIDTH + EDITOR_PADDING * 2),
      h: Math.ceil(2 * CODE_LINE_HEIGHT + EDITOR_PADDING * 2),
    });
  });

  it('scales every dimension for small screens', () => {
    expect(editorSize('abcd\nab', 0.5)).toEqual({
      w: Math.ceil((4 * CODE_CHAR_WIDTH + EDITOR_PADDING * 2) * 0.5),
      h: Math.ceil((2 * CODE_LINE_HEIGHT + EDITOR_PADDING * 2) * 0.5),
    });
  });
});
