import type { Opening, Weekday } from '../content/types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
/** The week as most guests read it, Monday first. */
const WEEK: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

function minutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (mins ?? 0);
}

/** "5:30 PM" from minutes after midnight. */
export function clockLabel(totalMinutes: number): string {
  const hours24 = Math.floor(totalMinutes / 60) % 24;
  const mins = totalMinutes % 60;
  const suffix = hours24 < 12 ? 'AM' : 'PM';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return `${hours12}:${String(mins).padStart(2, '0')} ${suffix}`;
}

/** "5:30 – 9:30pm" or "11:30am – 2:30pm". */
export function rangeLabel(opening: Opening): string {
  const short = (value: number) => clockLabel(value).toLowerCase().replace(' ', '');
  const start = short(minutes(opening.opens));
  const end = short(minutes(opening.closes));
  const sameHalf = start.slice(-2) === end.slice(-2);
  return `${sameHalf ? start.slice(0, -2) : start} – ${end}`;
}

export interface HoursRow {
  days: string;
  hours: string;
  closed: boolean;
}

/**
 * The weekly schedule as display rows, Monday first, with consecutive days that keep the same hours
 * joined: "Tue – Thu  5:30 – 9:30pm", "Monday  Closed".
 */
export function hoursRows(schedule: Opening[]): HoursRow[] {
  const byDay = new Map(schedule.map((opening) => [opening.day, opening]));
  const label = (day: Weekday) => {
    const opening = byDay.get(day);
    return opening ? rangeLabel(opening) : 'Closed';
  };
  const rows: { start: Weekday; end: Weekday; hours: string }[] = [];
  for (const day of WEEK) {
    const hours = label(day);
    const last = rows.at(-1);
    if (last && last.hours === hours) last.end = day;
    else rows.push({ start: day, end: day, hours });
  }
  return rows.map((row) => ({
    days: row.start === row.end ? DAY_NAMES[row.start] : `${DAY_SHORT[row.start]} – ${DAY_SHORT[row.end]}`,
    hours: row.hours,
    closed: row.hours === 'Closed',
  }));
}

/** Weekday of a `YYYY-MM-DD` date, read as a calendar date (no time zone shift). */
export function weekdayOf(date: string): Weekday | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return undefined;
  const value = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  if (Number.isNaN(value.getTime())) return undefined;
  return value.getUTCDay() as Weekday;
}

export function dayName(day: Weekday): string {
  return DAY_NAMES[day];
}

export interface SlotOptions {
  slotMinutes: number;
  lastSeatingMinutes: number;
}

/**
 * Bookable times on a date: from opening, every `slotMinutes`, until `lastSeatingMinutes` before closing.
 * Returns an empty list for a day the restaurant is closed.
 */
export function slotsFor(date: string, schedule: Opening[], options: SlotOptions): string[] {
  const day = weekdayOf(date);
  if (day === undefined) return [];
  const opening = schedule.find((entry) => entry.day === day);
  if (!opening) return [];
  const slots: string[] = [];
  const last = minutes(opening.closes) - options.lastSeatingMinutes;
  for (let time = minutes(opening.opens); time <= last; time += options.slotMinutes) slots.push(clockLabel(time));
  return slots;
}

/** Today as `YYYY-MM-DD` in the visitor's own calendar. */
export function isoDate(date: Date): string {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;
}

export function addDays(date: Date, days: number): Date {
  const next = new Date(date);
  next.setDate(next.getDate() + days);
  return next;
}

/** "Saturday, December 6" for a `YYYY-MM-DD` date. */
export function longDate(date: string): string {
  const match = /^(\d{4})-(\d{2})-(\d{2})$/.exec(date);
  if (!match) return date;
  const value = new Date(Date.UTC(Number(match[1]), Number(match[2]) - 1, Number(match[3])));
  return new Intl.DateTimeFormat('en-US', { weekday: 'long', month: 'long', day: 'numeric', timeZone: 'UTC' }).format(value);
}
