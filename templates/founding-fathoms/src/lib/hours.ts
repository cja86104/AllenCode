import type { Opening, Weekday } from '../content/types';

const DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;
const DAY_SHORT = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'] as const;
/** The week as most visitors read it, Monday first. */
export const WEEK: Weekday[] = [1, 2, 3, 4, 5, 6, 0];

function minutes(time: string): number {
  const [hours, mins] = time.split(':').map(Number);
  return (hours ?? 0) * 60 + (mins ?? 0);
}

/** "3pm", "11:30am" from a 24-hour `HH:mm` time. */
export function clockLabel(time: string): string {
  const total = minutes(time);
  const hours24 = Math.floor(total / 60) % 24;
  const mins = total % 60;
  const suffix = hours24 < 12 ? 'am' : 'pm';
  const hours12 = hours24 % 12 === 0 ? 12 : hours24 % 12;
  return mins === 0 ? `${hours12}${suffix}` : `${hours12}:${String(mins).padStart(2, '0')}${suffix}`;
}

/** "3 – 10pm" or "11am – 2pm". */
export function rangeLabel(opening: Opening): string {
  const start = clockLabel(opening.opens);
  const end = clockLabel(opening.closes);
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
 * joined: "Mon – Tue  Closed", "Wed – Thu  3 – 10pm".
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

export function dayName(day: Weekday): string {
  return DAY_NAMES[day];
}
