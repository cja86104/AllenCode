import { describe, expect, it, vi } from 'vitest';
import { restaurant } from '../src/content/restaurant';
import { mapUrl, signatureDishes, validateRestaurant } from '../src/lib/content';
import { demonstrationSender, httpSender, senderFor } from '../src/lib/forms';
import { headTags, robotsContent, structuredData } from '../src/lib/head';
import { hoursRows, longDate, rangeLabel, slotsFor, weekdayOf } from '../src/lib/hours';
import { clone } from './render';

describe('hours', () => {
  it('groups the week Monday first, joining days with the same hours', () => {
    expect(hoursRows(restaurant.hours.schedule)).toEqual([
      { days: 'Monday', hours: 'Closed', closed: true },
      { days: 'Tue – Thu', hours: '5:30 – 9:30pm', closed: false },
      { days: 'Fri – Sat', hours: '5:00 – 10:00pm', closed: false },
      { days: 'Sunday', hours: '4:30 – 9:00pm', closed: false },
    ]);
  });

  it('writes a range that crosses noon in full', () => {
    expect(rangeLabel({ day: 1, opens: '11:30', closes: '14:30' })).toBe('11:30am – 2:30pm');
  });

  it('offers times from opening until the last seating, and none on a closed day', () => {
    const options = { slotMinutes: 30, lastSeatingMinutes: 60 };
    // 2026-12-01 is a Tuesday (5:30 – 9:30pm): last seating 8:30.
    expect(slotsFor('2026-12-01', restaurant.hours.schedule, options)).toEqual([
      '5:30 PM',
      '6:00 PM',
      '6:30 PM',
      '7:00 PM',
      '7:30 PM',
      '8:00 PM',
      '8:30 PM',
    ]);
    // 2026-11-30 is a Monday.
    expect(slotsFor('2026-11-30', restaurant.hours.schedule, options)).toEqual([]);
    expect(slotsFor('not a date', restaurant.hours.schedule, options)).toEqual([]);
  });

  it('reads calendar dates without time zone drift', () => {
    expect(weekdayOf('2026-11-30')).toBe(1);
    expect(longDate('2026-12-05')).toBe('Saturday, December 5');
  });
});

describe('content', () => {
  it('has no problems', () => {
    expect(validateRestaurant(restaurant)).toEqual([]);
  });

  it('features the six signature dishes from the menu, with the menu’s own prices', () => {
    expect(signatureDishes(restaurant).map((dish) => `${dish.name} ${dish.price}`)).toEqual([
      'Heirloom Beet Carpaccio $19',
      'Slow Roasted Lamb Shoulder $42',
      'Seared Hudson Duck Breast $38',
      'Brown Butter Diver Scallops $34',
      'Wild Mushroom Risotto $27',
      'Stone Fruit Galette $14',
    ]);
  });

  it('credits no real publication and makes no award claims', () => {
    const text = JSON.stringify(restaurant);
    for (const claim of ['Eater', 'James Beard', 'Michelin', 'Hudson Magazine', 'Farmland Trust']) expect(text).not.toContain(claim);
    expect(restaurant.contact.email.endsWith('.example')).toBe(true);
  });

  it('catches broken hours, photos and links', () => {
    const content = clone();
    content.hours.schedule.push({ day: 1, opens: '22:00', closes: '17:00' });
    content.home.hero.photo.src = 'http://insecure.example/photo.jpg';
    content.reservations.external = { label: 'Book', url: 'ftp://nope' };
    const problems = validateRestaurant(content);
    expect(problems).toContain('Hours for day 1 close before they open.');
    expect(problems.join(' ')).toMatch(/secure https address or a file in public/);
    expect(problems).toContain('The outside booking link must be a secure https address.');
  });

  it('links the address to a map search when no map link is given', () => {
    expect(mapUrl(restaurant)).toBe('https://www.openstreetmap.org/search?query=123%20Harvest%20Lane%2C%20Rhinebeck%2C%20NY%2012572');
  });
});

describe('page head', () => {
  it('keeps a demonstration copy out of search results, and builds structured data from the content', () => {
    expect(robotsContent(restaurant)).toBe('noindex, nofollow');
    const data = structuredData(restaurant);
    expect(data['@type']).toBe('Restaurant');
    expect((data.openingHoursSpecification as unknown[]).length).toBe(6);
  });

  it('escapes content so it can never break out of the head', () => {
    const content = clone();
    content.site.description = '</script><script>alert(1)</script>';
    const tags = headTags(content);
    expect(tags).not.toContain('</script><script>');
    expect(tags).toContain('&lt;/script&gt;');
  });
});

describe('form senders', () => {
  it('is a demonstration unless an endpoint is configured', () => {
    expect(senderFor(undefined)).toBe(demonstrationSender);
    expect(senderFor('  ').mode).toBe('demonstration');
    expect(senderFor('https://example.org/reserve').mode).toBe('live');
  });

  it('posts JSON and turns failures into recoverable messages', async () => {
    const fetcher = vi.fn<typeof fetch>();
    const sender = httpSender('https://example.org/reserve', fetcher);
    fetcher.mockResolvedValueOnce(new Response(null, { status: 201 }));
    expect(await sender.send({ name: 'Ada' })).toEqual({ kind: 'sent' });
    expect(fetcher.mock.calls[0]?.[1]?.body).toBe('{"name":"Ada"}');
    fetcher.mockResolvedValueOnce(new Response(null, { status: 422 }));
    expect(await sender.send({})).toMatchObject({ kind: 'failed' });
    fetcher.mockRejectedValueOnce(new TypeError('offline'));
    expect((await sender.send({})).kind).toBe('failed');
  });
});
