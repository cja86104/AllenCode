import { describe, expect, it } from 'vitest';
import { formatLifeSpan, formatPartialDate, partialDateSortKey, partialDateTimeValue } from '../src/lib/dates';

describe('formatPartialDate', () => {
  it('writes a full date', () => {
    expect(formatPartialDate({ year: 1946, month: 5, day: 12 })).toBe('May 12, 1946');
  });

  it('writes a season with an approximate year without inventing precision', () => {
    expect(formatPartialDate({ year: 1982, season: 'summer', approximate: true })).toBe('Summer, around 1982');
  });

  it('writes an approximate year on its own', () => {
    expect(formatPartialDate({ year: 1952, approximate: true })).toBe('Around 1952');
  });

  it('writes a month and year', () => {
    expect(formatPartialDate({ year: 1969, month: 6 })).toBe('June 1969');
    expect(formatPartialDate({ year: 1969, month: 6, approximate: true })).toBe('Around June 1969');
  });

  it('prefers the family’s own wording', () => {
    expect(formatPartialDate({ year: 1977, label: 'The week of the flood' })).toBe('The week of the flood');
  });

  it('returns nothing for an unknown date', () => {
    expect(formatPartialDate(undefined)).toBe('');
    expect(formatPartialDate({})).toBe('');
  });

  it('ignores an impossible month rather than printing it', () => {
    expect(formatPartialDate({ year: 1990, month: 13 })).toBe('1990');
  });
});

describe('formatLifeSpan', () => {
  it('joins both dates', () => {
    expect(formatLifeSpan({ year: 1946, month: 5, day: 12 }, { year: 2026, month: 9, day: 18 })).toBe('May 12, 1946 — September 18, 2026');
  });

  it('shows one side when the other is unknown', () => {
    expect(formatLifeSpan(undefined, { year: 2026 })).toBe('2026');
    expect(formatLifeSpan(undefined, undefined)).toBe('');
  });
});

describe('machine-readable dates', () => {
  it('is only as precise as the date', () => {
    expect(partialDateTimeValue({ year: 1982, season: 'summer' })).toBe('1982');
    expect(partialDateTimeValue({ year: 1969, month: 6 })).toBe('1969-06');
    expect(partialDateTimeValue({ year: 1946, month: 5, day: 12 })).toBe('1946-05-12');
    expect(partialDateTimeValue({ label: 'Sometime' })).toBeUndefined();
  });

  it('sorts unknown dates last', () => {
    expect(partialDateSortKey({ year: 1950 })).toBeLessThan(partialDateSortKey({ year: 1951 }));
    expect(partialDateSortKey(undefined)).toBe(Number.POSITIVE_INFINITY);
  });
});
