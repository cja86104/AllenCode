/**
 * The Copper Thistle palette. `gold` is the signature accent and is used on dark grounds and for
 * decorative rules; on the cream and white grounds, text uses `goldInk`, a deeper gold that stays readable.
 * `tests/contrast.test.ts` checks every text pairing the stylesheets use.
 */
export const colors = {
  cream: '#f8f2e8',
  paper: '#ffffff',
  charcoal: '#201c1b',
  burgundy: '#5c1a26',
  burgundyDeep: '#3c0f18',
  gold: '#c8973f',
  goldInk: '#8a6424',
  stone: '#5e5650',
  mist: '#b9b2a8',
} as const;

export type ColorName = keyof typeof colors;
