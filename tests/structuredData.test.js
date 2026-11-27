// @ts-check
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { breadcrumbs, jsonLdText, ORGANIZATION_ID, person, PERSON_ID, serviceList, softwareApplication } from '../src/seo/structuredData.js';
import { services } from '../src/data/services.js';
import { catalog } from '../src/data/catalog.js';

/**
 * Every key anywhere inside a value.
 * @param {unknown} value
 * @returns {string[]}
 */
const keysOf = (value) => {
  if (Array.isArray(value)) return value.flatMap(keysOf);
  if (value && typeof value === 'object') return Object.entries(value).flatMap(([key, inner]) => [key, ...keysOf(inner)]);
  return [];
};

/** No price, offer or rating anywhere in it (services and templates show no prices; nothing is invented). @param {unknown} value */
const expectNoPrice = (value) => {
  for (const key of ['price', 'priceRange', 'offers', 'aggregateRating', 'review']) expect(keysOf(value)).not.toContain(key);
  expect(JSON.stringify(value)).not.toMatch(/\$\s?\d/);
};

describe('structured data for each page (2026-11-26, Task 1.5)', () => {
  it('the site-wide Organization in index.html carries the id every page refers to', () => {
    const html = readFileSync('index.html', 'utf8');
    const block = html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)?.[1] ?? '';
    const organization = JSON.parse(block);
    expect(organization['@type']).toBe('Organization');
    expect(organization['@id']).toBe(ORGANIZATION_ID);
  });

  it('Services: one Service per entry in services.js, provided by the Organization, with no price', () => {
    const list = serviceList(services);
    expect(list['@type']).toBe('ItemList');
    expect(list.itemListElement).toHaveLength(services.length);
    list.itemListElement.forEach((entry, i) => {
      expect(entry.position).toBe(i + 1);
      expect(entry.item['@type']).toBe('Service');
      expect(entry.item.name).toBe(services[i].name);
      expect(entry.item.description).toBe(services[i].summary);
      expect(entry.item.provider).toEqual({ '@id': ORGANIZATION_ID });
    });
    expectNoPrice(list);
  });

  it('a product: a web application by Chris Allen, its live address only when it has one, no offers or ratings', () => {
    for (const product of catalog) {
      const app = softwareApplication(product);
      expect(app['@type']).toBe('SoftwareApplication');
      expect(app.name).toBe(product.name);
      expect(app.operatingSystem).toBe('Web');
      expect(app.creator).toEqual({ '@id': PERSON_ID });
      expect(app.publisher).toEqual({ '@id': ORGANIZATION_ID });
      if (product.url) expect(app.url).toBe(product.url);
      else expect(app).not.toHaveProperty('url');
      expectNoPrice(app);
    }
  });

  it('About: Chris Allen, founder, with the LinkedIn profile index.html already names', () => {
    const chris = person();
    expect(chris['@type']).toBe('Person');
    expect(chris['@id']).toBe(PERSON_ID);
    expect(chris.name).toBe('Chris Allen');
    expect(chris.worksFor).toEqual({ '@id': ORGANIZATION_ID });
    expect(readFileSync('index.html', 'utf8')).toContain(chris.sameAs[0]);
  });

  it('breadcrumbs: Home first, each step a full address, in order', () => {
    const trail = breadcrumbs([
      { name: 'Products', path: '/products' },
      { name: 'UnderFire AI', path: '/products/underfire-ai' },
    ]);
    expect(trail['@type']).toBe('BreadcrumbList');
    expect(trail.itemListElement.map((step) => [step.position, step.name, step.item])).toEqual([
      [1, 'Home', 'https://www.allencodeco.com/'],
      [2, 'Products', 'https://www.allencodeco.com/products'],
      [3, 'UnderFire AI', 'https://www.allencodeco.com/products/underfire-ai'],
    ]);
  });

  it('jsonLdText: one graph, safe inside a script element, parses back to the same data', () => {
    const nodes = [{ '@type': 'Thing', name: 'A </script><script>alert(1)</script> & <b>' }];
    const text = jsonLdText(nodes);
    expect(text).not.toMatch(/[<>]/);
    expect(JSON.parse(text)).toEqual({ '@context': 'https://schema.org', '@graph': nodes });
  });
});
