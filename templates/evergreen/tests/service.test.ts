import { describe, expect, it } from 'vitest';
import type { Gathering } from '../src/content/types';
import { eventIcs, formatEventDate, formatEventTime, serviceState, zonedTimeToUtc } from '../src/lib/service';
import { memorial } from '../src/content/memorial';

const base: Gathering = {
  heading: 'Gathering',
  visibility: 'public',
  events: [
    {
      id: 'service',
      title: 'Celebration of life',
      start: '2026-10-03T14:00',
      durationMinutes: 180,
      timeZone: 'America/New_York',
      timeZoneLabel: 'Eastern Time',
      venue: 'A garden',
    },
  ],
};

describe('zonedTimeToUtc', () => {
  it('converts Eastern daylight time', () => {
    expect(new Date(zonedTimeToUtc('2026-10-03T14:00', 'America/New_York') ?? 0).toISOString()).toBe('2026-10-03T18:00:00.000Z');
  });

  it('converts Eastern standard time', () => {
    expect(new Date(zonedTimeToUtc('2026-12-05T14:00', 'America/New_York') ?? 0).toISOString()).toBe('2026-12-05T19:00:00.000Z');
  });

  it('rejects a start it cannot read', () => {
    expect(zonedTimeToUtc('October 3', 'America/New_York')).toBeUndefined();
  });
});

describe('serviceState', () => {
  it('is upcoming before the gathering ends', () => {
    expect(serviceState(base, Date.parse('2026-10-01T12:00:00Z'))).toBe('upcoming');
    expect(serviceState(base, Date.parse('2026-10-03T20:00:00Z'))).toBe('upcoming');
  });

  it('is past once the gathering has ended, so it is never shown as upcoming', () => {
    expect(serviceState(base, Date.parse('2026-10-03T21:01:00Z'))).toBe('past');
  });

  it('follows the family’s private setting whatever the time', () => {
    expect(serviceState({ ...base, visibility: 'private' }, Date.parse('2026-10-01T12:00:00Z'))).toBe('private');
  });

  it('is none without a gathering or without events', () => {
    expect(serviceState(undefined, 0)).toBe('none');
    expect(serviceState({ ...base, events: [] }, 0)).toBe('none');
  });

  it('shows the demonstration gathering as past today', () => {
    expect(serviceState(memorial.gathering, Date.parse('2026-11-24T12:00:00Z'))).toBe('past');
  });
});

describe('event formatting', () => {
  const event = base.events[0];
  it('writes the date and time in the event’s own time zone', () => {
    if (!event) throw new Error('fixture');
    expect(formatEventDate(event)).toBe('Saturday, October 3, 2026');
    expect(formatEventTime(event)).toBe('2:00 p.m.');
  });

  it('builds a calendar file with UTC times', () => {
    if (!event) throw new Error('fixture');
    const ics = eventIcs(event, 'Nell', Date.parse('2026-09-20T00:00:00Z')) ?? '';
    expect(ics).toContain('DTSTART:20261003T180000Z');
    expect(ics).toContain('DTEND:20261003T210000Z');
    expect(ics).toContain('SUMMARY:Celebration of life for Nell');
  });
});
