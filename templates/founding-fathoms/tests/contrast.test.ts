import { describe, expect, it } from 'vitest';
import { colors, type ColorName } from '../src/theme/colors';

function luminance(hex: string): number {
  const [r, g, b] = [1, 3, 5]
    .map((i) => parseInt(hex.slice(i, i + 2), 16) / 255)
    .map((v) => (v <= 0.03928 ? v / 12.92 : ((v + 0.055) / 1.055) ** 2.4));
  return 0.2126 * (r ?? 0) + 0.7152 * (g ?? 0) + 0.0722 * (b ?? 0);
}

function contrast(a: string, b: string): number {
  const [light, dark] = [luminance(a), luminance(b)].sort((x, y) => y - x);
  return ((light ?? 0) + 0.05) / ((dark ?? 0) + 0.05);
}

/** Every text colour the pages place on each ground. */
const TEXT_PAIRS: [ColorName, ColorName][] = [
  ['cream', 'navy'],
  ['cream', 'navyDeep'],
  ['cream', 'panel'],
  ['mist', 'navy'],
  ['mist', 'navyDeep'],
  ['mist', 'panel'],
  ['brass', 'navy'],
  ['brass', 'navyDeep'],
  ['brass', 'panel'],
  ['navy', 'brass'],
  ['navy', 'brassBright'],
  ['navy', 'cream'],
  ['navy', 'creamDeep'],
  ['slate', 'cream'],
  ['slate', 'creamDeep'],
  ['brassInk', 'cream'],
  ['brassInk', 'creamDeep'],
];

describe('palette', () => {
  it.each(TEXT_PAIRS)('%s on %s meets WCAG AA for body text (4.5:1)', (text, ground) => {
    expect(contrast(colors[text], colors[ground])).toBeGreaterThanOrEqual(4.5);
  });

  it('keeps the signature brass off cream for text, because it cannot meet AA there', () => {
    expect(contrast(colors.brass, colors.cream)).toBeLessThan(4.5);
  });
});
