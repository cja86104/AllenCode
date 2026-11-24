import type { PartialDate } from '../content/types';

const MONTHS = [
  'January',
  'February',
  'March',
  'April',
  'May',
  'June',
  'July',
  'August',
  'September',
  'October',
  'November',
  'December',
] as const;

const SEASONS: Record<NonNullable<PartialDate['season']>, string> = {
  spring: 'Spring',
  summer: 'Summer',
  autumn: 'Autumn',
  winter: 'Winter',
};

function monthName(month: number | undefined): string | undefined {
  if (month === undefined || !Number.isInteger(month) || month < 1 || month > 12) return undefined;
  return MONTHS[month - 1];
}

/**
 * Writes a partial date the way a person would say it, without inventing precision:
 * `{ year: 1982, season: 'summer', approximate: true }` → "Summer, around 1982".
 * Returns an empty string when nothing is known, so callers can leave the date out entirely.
 */
export function formatPartialDate(date: PartialDate | undefined): string {
  if (!date) return '';
  if (date.label && date.label.trim() !== '') return date.label.trim();

  const year = date.year === undefined ? '' : `${date.approximate ? 'around ' : ''}${date.year}`;
  const month = monthName(date.month);

  if (month) {
    const day = date.day !== undefined && Number.isInteger(date.day) && date.day >= 1 && date.day <= 31 ? ` ${date.day}` : '';
    if (date.year === undefined) return `${month}${day}`;
    const exact = day ? `${month}${day}, ${date.year}` : `${month} ${date.year}`;
    return date.approximate ? `Around ${exact}` : exact;
  }

  if (date.season) {
    const season = SEASONS[date.season];
    return year ? `${season}, ${year}` : season;
  }

  return year ? year.charAt(0).toUpperCase() + year.slice(1) : '';
}

/** A short form for life dates in the opening: "May 12, 1946". Same rules, no capitalization change. */
export function formatLifeDate(date: PartialDate | undefined): string {
  return formatPartialDate(date);
}

/**
 * The span shown under the name: "May 12, 1946 — September 18, 2026".
 * Either side may be unknown; returns an empty string when both are.
 */
export function formatLifeSpan(born: PartialDate | undefined, died: PartialDate | undefined): string {
  const start = formatLifeDate(born);
  const end = formatLifeDate(died);
  if (start && end) return `${start} — ${end}`;
  return start || end;
}

/** A sortable key for a partial date; unknown dates sort last. */
export function partialDateSortKey(date: PartialDate | undefined): number {
  if (!date || date.year === undefined) return Number.POSITIVE_INFINITY;
  const seasonMonth = { winter: 1, spring: 4, summer: 7, autumn: 10 } as const;
  const month = date.month ?? (date.season ? seasonMonth[date.season] : 6);
  const day = date.day ?? 15;
  return date.year * 10000 + month * 100 + day;
}

/** A machine-readable value for a `<time>` element, as precise as the date allows. */
export function partialDateTimeValue(date: PartialDate | undefined): string | undefined {
  if (!date || date.year === undefined || date.label) return undefined;
  const y = String(date.year).padStart(4, '0');
  if (date.month === undefined || monthName(date.month) === undefined) return y;
  const m = String(date.month).padStart(2, '0');
  if (date.day === undefined) return `${y}-${m}`;
  return `${y}-${m}-${String(date.day).padStart(2, '0')}`;
}
