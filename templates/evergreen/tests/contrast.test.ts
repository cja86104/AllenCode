import { describe, expect, it } from 'vitest';
import { PRESETS, type PresetTokens } from '../src/theme/presets';

function luminance(hex: string): number {
  const channels = [1, 3, 5].map((index) => parseInt(hex.slice(index, index + 2), 16) / 255);
  const [r, g, b] = channels.map((value) => (value <= 0.03928 ? value / 12.92 : ((value + 0.055) / 1.055) ** 2.4));
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

/** Every text colour the stylesheets place on each background. */
const TEXT_PAIRS: [keyof PresetTokens, keyof PresetTokens][] = [
  ['ink', 'paper'],
  ['ink', 'surface'],
  ['accent', 'paper'],
  ['accent', 'surface'],
  ['muted', 'paper'],
  ['muted', 'surface'],
  ['warm', 'paper'],
  ['warm', 'surface'],
  ['onAccent', 'accent'],
];

describe.each(Object.values(PRESETS))('$name', (preset) => {
  it.each(TEXT_PAIRS)('%s on %s meets WCAG AA for body text (4.5:1)', (text, background) => {
    expect(contrast(preset.tokens[text], preset.tokens[background])).toBeGreaterThanOrEqual(4.5);
  });

  it('has a focus outline that meets 3:1 against the page', () => {
    expect(contrast(preset.tokens.focus, preset.tokens.paper)).toBeGreaterThanOrEqual(3);
    expect(contrast(preset.tokens.focus, preset.tokens.surface)).toBeGreaterThanOrEqual(3);
  });
});
