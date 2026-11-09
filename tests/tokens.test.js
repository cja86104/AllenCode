/** @vitest-environment node */
// @ts-check
import { describe, expect, it } from 'vitest';
import config from '../tailwind.config.js';

describe('design tokens', () => {
  it('tailwind exposes the locked palette and display font', () => {
    const extend = config.theme?.extend ?? {};
    /** @type {Record<string, unknown>} */
    const colors = /** @type {Record<string, unknown>} */ (extend.colors ?? {});
    /** @type {Record<string, unknown>} */
    const fonts = /** @type {Record<string, unknown>} */ (extend.fontFamily ?? {});
    expect(colors.ember).toBe('#f97316');
    expect(colors.night).toBe('#0a0a0a');
    const serif = fonts['serif-display'];
    expect(Array.isArray(serif) ? serif[0] : serif).toBe('Instrument Serif');
  });
});
