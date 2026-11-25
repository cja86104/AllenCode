/**
 * The Founding Fathoms palette: harbor navy, brass and sail cream. `brass` is the signature accent on the
 * dark grounds; on the cream grounds text uses `brassInk`, a deeper brass that stays readable. `mist` is
 * the quiet text on dark grounds and `slate` the quiet text on cream. `tests/contrast.test.ts` checks every
 * text pairing the pages use.
 */
export const colors = {
  navy: '#0b2027',
  navyDeep: '#07161b',
  panel: '#0f2a32',
  brass: '#c08a3e',
  brassBright: '#d4a04c',
  brassInk: '#7d5a22',
  cream: '#f1e9da',
  creamDeep: '#f7f1e4',
  mist: '#aaa598',
  slate: '#4a5558',
} as const;

export type ColorName = keyof typeof colors;
