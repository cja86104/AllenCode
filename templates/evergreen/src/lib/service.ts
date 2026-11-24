import type { Gathering, GatheringEvent } from '../content/types';

/**
 * Which version of the gathering section the page shows.
 * `upcoming`: details, plus RSVP, livestream and calendar where the family configured them.
 * `past`: a thank-you, the date it took place, and no actions that only make sense beforehand.
 * `private`: details will be shared privately; no time or place is shown.
 * `none`: the family has not added a gathering, so the section is left out.
 */
export type ServiceState = 'upcoming' | 'past' | 'private' | 'none';

const DEFAULT_DURATION_MINUTES = 180;

interface LocalParts {
  year: number;
  month: number;
  day: number;
  hour: number;
  minute: number;
}

function parseLocal(start: string): LocalParts | undefined {
  const match = /^(\d{4})-(\d{2})-(\d{2})T(\d{2}):(\d{2})$/.exec(start);
  if (!match) return undefined;
  const [, year, month, day, hour, minute] = match;
  return { year: Number(year), month: Number(month), day: Number(day), hour: Number(hour), minute: Number(minute) };
}

/** The offset of `timeZone` from UTC at `instant`, in minutes. */
function offsetMinutes(instant: number, timeZone: string): number {
  const parts = new Intl.DateTimeFormat('en-US', {
    timeZone,
    hourCycle: 'h23',
    year: 'numeric',
    month: '2-digit',
    day: '2-digit',
    hour: '2-digit',
    minute: '2-digit',
    second: '2-digit',
  }).formatToParts(new Date(instant));
  const value = (type: Intl.DateTimeFormatPartTypes) => Number(parts.find((part) => part.type === type)?.value ?? '0');
  const asUtc = Date.UTC(value('year'), value('month') - 1, value('day'), value('hour'), value('minute'), value('second'));
  return Math.round((asUtc - instant) / 60000);
}

/**
 * Converts a local wall-clock time in a named time zone to a UTC timestamp, accounting for daylight
 * saving time. Returns undefined when the start is not written as `YYYY-MM-DDTHH:mm`.
 */
export function zonedTimeToUtc(start: string, timeZone: string): number | undefined {
  const local = parseLocal(start);
  if (!local) return undefined;
  const naive = Date.UTC(local.year, local.month - 1, local.day, local.hour, local.minute);
  // Two passes settle the offset across a daylight-saving boundary.
  let guess = naive - offsetMinutes(naive, timeZone) * 60000;
  guess = naive - offsetMinutes(guess, timeZone) * 60000;
  return guess;
}

export function eventStartsAt(event: GatheringEvent): number | undefined {
  return zonedTimeToUtc(event.start, event.timeZone);
}

export function eventEndsAt(event: GatheringEvent): number | undefined {
  const start = eventStartsAt(event);
  if (start === undefined) return undefined;
  return start + (event.durationMinutes ?? DEFAULT_DURATION_MINUTES) * 60000;
}

/**
 * Decides what the gathering section shows. The family's visibility setting comes first; otherwise
 * the page is `past` once every event has ended, so a past service is never presented as upcoming.
 */
export function serviceState(gathering: Gathering | undefined, now: number): ServiceState {
  if (!gathering) return 'none';
  if (gathering.visibility === 'private') return 'private';
  if (gathering.events.length === 0) return 'none';
  const stillToCome = gathering.events.some((event) => {
    const end = eventEndsAt(event);
    return end !== undefined && end > now;
  });
  return stillToCome ? 'upcoming' : 'past';
}

/** "Saturday, October 3, 2026", in the event's own time zone. */
export function formatEventDate(event: GatheringEvent): string {
  const start = eventStartsAt(event);
  if (start === undefined) return '';
  return new Intl.DateTimeFormat('en-US', {
    timeZone: event.timeZone,
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  }).format(new Date(start));
}

/** "2:00 p.m.", in the event's own time zone. */
export function formatEventTime(event: GatheringEvent): string {
  const start = eventStartsAt(event);
  if (start === undefined) return '';
  const time = new Intl.DateTimeFormat('en-US', { timeZone: event.timeZone, hour: 'numeric', minute: '2-digit' }).format(new Date(start));
  return time.replace(' AM', ' a.m.').replace(' PM', ' p.m.');
}

function icsStamp(instant: number): string {
  return new Date(instant)
    .toISOString()
    .replace(/[-:]/g, '')
    .replace(/\.\d{3}/, '');
}

function icsEscape(value: string): string {
  return value.replace(/\\/g, '\\\\').replace(/\n/g, '\\n').replace(/,/g, '\\,').replace(/;/g, '\\;');
}

/**
 * An iCalendar file for one event, or undefined when its time cannot be read. The file is built in the
 * page; nothing is sent anywhere.
 */
export function eventIcs(event: GatheringEvent, personName: string, stamp: number): string | undefined {
  const start = eventStartsAt(event);
  const end = eventEndsAt(event);
  if (start === undefined || end === undefined) return undefined;
  const location = [event.venue, event.address, event.city].filter(Boolean).join(', ');
  const lines = [
    'BEGIN:VCALENDAR',
    'VERSION:2.0',
    'PRODID:-//Allen Code Co.//Evergreen//EN',
    'CALSCALE:GREGORIAN',
    'BEGIN:VEVENT',
    `UID:${event.id}@evergreen`,
    `DTSTAMP:${icsStamp(stamp)}`,
    `DTSTART:${icsStamp(start)}`,
    `DTEND:${icsStamp(end)}`,
    `SUMMARY:${icsEscape(`${event.title} for ${personName}`)}`,
    `LOCATION:${icsEscape(location)}`,
  ];
  if (event.note) lines.push(`DESCRIPTION:${icsEscape(event.note)}`);
  lines.push('END:VEVENT', 'END:VCALENDAR');
  return lines.join('\r\n');
}
