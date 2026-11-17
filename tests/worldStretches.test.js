// @ts-check
import { describe, expect, it } from 'vitest';
import { stretchFor } from '../src/world/stretches.js';

/** @param {string} path */
const ids = (path) => stretchFor(path)?.stops.map((s) => s.id);

describe('each inner page’s stretch of road (Code World W5a)', () => {
  it('Products: the others in page order, then MyTeachersToolbox, the lead, at the end', () => {
    expect(ids('/products')).toEqual(['underfire-ai', 'founders-helm', 'crew-advisors', 'my-teachers-toolbox']);
    expect(stretchFor('/products')?.lead.id).toBe('my-teachers-toolbox');
    expect(stretchFor('/products')?.stops.find((s) => s.id === 'crew-advisors')?.kind).toBe('unfinished');
  });

  it('each product page: that product alone, Crew Advisors unfinished', () => {
    for (const slug of ['my-teachers-toolbox', 'underfire-ai', 'founders-helm']) {
      expect(ids(`/products/${slug}`)).toEqual([slug]);
      expect(stretchFor(`/products/${slug}`)?.lead.kind).toBe('product');
    }
    expect(stretchFor('/products/crew-advisors')?.lead.kind).toBe('unfinished');
  });

  it('Services: the others in the road’s order, then MVP Sprints, the lead; the audit as its file', () => {
    expect(ids('/services')).toEqual(['custom-saas-builds', 'custom-web-development', 'ui-ux-design', 'ai-integration', 'technical-audits', 'mvp-sprints']);
    expect(stretchFor('/services')?.stops.find((s) => s.id === 'technical-audits')?.kind).toBe('audit');
  });

  it('Templates: the family road’s houses, Evergreen the lead', () => {
    expect(ids('/templates')).toEqual(['keepsake', 'vow', 'gather', 'folio', 'evergreen']);
  });

  it('About: the builder as a portrait; Contact: the empty file as a slab', () => {
    expect(stretchFor('/about')?.stops.map((s) => [s.kind, s.excerptId])).toEqual([['portrait', 'builder']]);
    expect(stretchFor('/contact')?.stops.map((s) => [s.kind, s.excerptId])).toEqual([['audit', 'gate']]);
  });

  it('every stop’s approved code is in its sources; a trailing slash is the same page', () => {
    for (const path of ['/products', '/products/underfire-ai', '/services', '/templates', '/about', '/contact']) {
      const stretch = stretchFor(path);
      if (!stretch) throw new Error(`no stretch for ${path}`);
      for (const stop of stretch.stops) expect(typeof stretch.sources[String(stop.excerptId)]).toBe('string');
      expect(stretchFor(`${path}/`)).toBe(stretch);
    }
  });

  it('the home page, checkout success, unknown pages and unknown products have none', () => {
    for (const path of ['/', '/checkout-success', '/nope', '/products/nope', '/lab/world']) expect(stretchFor(path)).toBeNull();
  });
});
