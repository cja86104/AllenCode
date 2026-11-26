import { describe, expect, it } from 'vitest';
import { brewery } from '../src/content/brewery';
import { averageAbv, draftGroups, mapUrl, onTap, price, searchRetailers, trucksByWeek, validateBrewery } from '../src/lib/content';
import { headTags, structuredData } from '../src/lib/head';
import { clockLabel, hoursRows, rangeLabel } from '../src/lib/hours';
import { clone } from './render';

describe('hours', () => {
  it('writes times the way people say them', () => {
    expect(clockLabel('15:00')).toBe('3pm');
    expect(clockLabel('11:30')).toBe('11:30am');
    expect(clockLabel('00:00')).toBe('12am');
    expect(rangeLabel({ day: 3, opens: '15:00', closes: '22:00' })).toBe('3 – 10pm');
    expect(rangeLabel({ day: 5, opens: '11:00', closes: '23:00' })).toBe('11am – 11pm');
  });

  it('joins neighbouring days that keep the same hours, Monday first', () => {
    expect(hoursRows(brewery.hours.schedule)).toEqual([
      { days: 'Mon – Tue', hours: 'Closed', closed: true },
      { days: 'Wed – Thu', hours: '3 – 10pm', closed: false },
      { days: 'Fri – Sat', hours: '12 – 11pm', closed: false },
      { days: 'Sunday', hours: '12 – 8pm', closed: false },
    ]);
  });
});

describe('content', () => {
  it('has no problems', () => {
    expect(validateBrewery(brewery)).toEqual([]);
  });

  it('names each mistake the pages cannot recover from', () => {
    const content = clone();
    content.hours.schedule.push({ day: 3, opens: '22:00', closes: '15:00' });
    content.contact.tradeEmail = 'trade@';
    content.home.hero.photo.src = 'http://example.com/tanks.jpg';
    const [first, second] = content.beer.beers;
    const [product] = content.shop.products;
    if (!first || !second || !product) throw new Error('The demonstration needs two beers and a product.');
    first.group = 'Cider';
    content.beer.beers.push(structuredClone(second));
    product.price = 0;
    expect(validateBrewery(content)).toEqual([
      'Hours for day 3 close before they open.',
      'Day 3 appears twice in the hours.',
      'The trade email address is not complete.',
      `The photo “${content.home.hero.photo.alt}” needs a secure https address or a file in public/.`,
      'Harbor Lights IPA is in the group “Cider”, which isn’t in beer.groups.',
      'Two beers share the id “keel-line”.',
      'Harbor Lights IPA needs a price above zero.',
    ]);
  });

  it('checks every photograph the pages use, the gallery and process strip included', () => {
    const content = clone();
    const [room] = content.taproom.photos;
    const [step] = content.story.process.steps;
    if (!room || !step) throw new Error('The demonstration needs a room photo and a process step.');
    room.alt = ' ';
    step.photo.src = 'photos/kettle.jpg';
    expect(validateBrewery(content)).toEqual([
      `A photo at ${room.src} needs alt text describing what it shows.`,
      'The photo “A copper brew kettle, close up” needs a secure https address or a file in public/.',
    ]);
    content.taproom.photos = [];
    content.story.process.steps = [];
    expect(validateBrewery(content)).toEqual(
      expect.arrayContaining(['The taproom gallery needs at least one photo.', 'The process strip needs at least one step.']),
    );
  });

  it('needs at least one beer on tap', () => {
    const content = clone();
    for (const beer of content.beer.beers) beer.onTap = false;
    expect(validateBrewery(content)).toContain('At least one beer must be on tap for the home page.');
  });

  it('lists the draft beers and works out their average strength', () => {
    const pouring = onTap(brewery);
    expect(pouring.map((beer) => beer.id)).toEqual([
      'harbor-lights',
      'keel-line',
      'blackwater',
      'pier-7',
      'fog-bank',
      'barnacle-berry',
      'winter-mooring',
      'rigging-rope',
    ]);
    expect(averageAbv(pouring)).toBe(6.1);
    expect(averageAbv([])).toBe(0);
  });

  it('groups the draft list in the set order and leaves out empty groups', () => {
    const content = clone();
    content.beer.groups.push('Cider');
    expect(draftGroups(content).map((entry) => [entry.group, entry.beers.length])).toEqual([
      ['IPA', 4],
      ['Lager', 3],
      ['Stout', 2],
      ['Sour', 2],
      ['Seasonal', 3],
    ]);
  });

  it('searches shops by name, street, city or region, ignoring case and spaces', () => {
    const names = (query: string) => searchRetailers(brewery, query).flatMap((region) => region.stores.map((store) => store.name));
    expect(names('')).toHaveLength(10);
    expect(names('  GULL ')).toEqual(['Gull & Grain']);
    expect(names('wharf')).toEqual(['Dockside Bottle Shop']);
    expect(names('north shore')).toEqual(['Cliffside Provisions', 'Gull & Grain']);
    expect(searchRetailers(brewery, 'atlantis')).toEqual([]);
  });

  it('orders the food trucks Monday first and writes prices', () => {
    expect(trucksByWeek(brewery).map((truck) => truck.day)).toEqual([3, 4, 5, 6, 0]);
    expect(price(16)).toBe('$16');
    expect(price(16.5)).toBe('$16.50');
  });

  it('links the address to a map', () => {
    expect(mapUrl(brewery)).toBe('https://www.openstreetmap.org/search?query=4%20East%20Pier%2C%20Warehouse%20Row%2C%20Seaport%20Harbor');
    const content = clone();
    content.contact.mapUrl = 'https://maps.example.com/fathoms';
    expect(mapUrl(content)).toBe('https://maps.example.com/fathoms');
  });
});

describe('head', () => {
  it('describes the brewery to search engines with its real hours', () => {
    const data = structuredData(brewery);
    expect(data['@type']).toBe('Brewery');
    expect(data.openingHoursSpecification).toHaveLength(5);
    expect(data.url).toBeUndefined();
  });

  it('keeps the preview out of search results and escapes what it writes', () => {
    const content = clone();
    content.site.description = 'Pints & <b>pours</b>';
    const tags = headTags(content);
    expect(tags).toContain('<meta name="robots" content="noindex, nofollow" />');
    expect(tags).toContain('content="Pints &amp; &lt;b&gt;pours&lt;/b&gt;"');
    expect(tags).not.toContain('<b>');
    expect(tags).not.toContain('rel="canonical"');
  });

  it('adds the address and link preview once the site has one', () => {
    const content = clone();
    content.site.url = 'https://foundingfathoms.example';
    content.site.indexable = true;
    const tags = headTags(content);
    expect(tags).toContain('<link rel="canonical" href="https://foundingfathoms.example" />');
    expect(tags).toContain('<meta property="og:image" content="');
    expect(tags).toContain('<meta name="robots" content="index, follow" />');
  });
});
