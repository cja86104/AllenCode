// @ts-check
import { describe, expect, it } from 'vitest';
import { stretchFor } from '../src/world/stretches.js';

/** @param {string} path */
const ids = (path) => stretchFor(path)?.stops.map((s) => s.id);

describe('each inner page’s stretch of road (Code World W5a)', () => {
  it('Products: MyTeachersToolbox alone, the lead, at the end (2026-11-17: no boards beside the road)', () => {
    expect(ids('/products')).toEqual(['my-teachers-toolbox']);
    expect(stretchFor('/products')?.lead.id).toBe('my-teachers-toolbox');
  });

  it('each product page: that product alone, Crew Advisors unfinished', () => {
    for (const slug of ['my-teachers-toolbox', 'underfire-ai', 'founders-helm']) {
      expect(ids(`/products/${slug}`)).toEqual([slug]);
      expect(stretchFor(`/products/${slug}`)?.lead.kind).toBe('product');
    }
    expect(stretchFor('/products/crew-advisors')?.lead.kind).toBe('unfinished');
  });

  it('Services: MVP Sprints alone, the lead', () => {
    expect(ids('/services')).toEqual(['mvp-sprints']);
  });

  it('Templates: Evergreen alone, the lead', () => {
    expect(ids('/templates')).toEqual(['evergreen']);
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

  it('checkout success and any unknown page (the 404): the empty file as a slab (W7, 2026-11-17)', () => {
    for (const path of ['/checkout-success', '/nope', '/lab/world', '/products/underfire-ai/more']) {
      expect(stretchFor(path)?.stops.map((s) => [s.kind, s.excerptId]), path).toEqual([['audit', 'gate']]);
    }
  });

  it('the home page and unknown products (they go on to Products) have none', () => {
    for (const path of ['/', '/products/nope']) expect(stretchFor(path)).toBeNull();
  });
});
