/** @vitest-environment node */
// @ts-check
import { existsSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { products } from '../src/data/products.js';

const MAX_POSTER_BYTES = 150 * 1024;
const MAX_LOOP_BYTES = 2 * 1024 * 1024;

/** @param {string} publicPath */
const onDisk = (publicPath) => `public${publicPath}`;

describe('product loops and posters', () => {
  const live = products.filter((product) => product.status === 'live');
  const comingSoon = products.filter((product) => product.status === 'coming-soon');

  it('there are three live products and one coming soon', () => {
    expect(live.map((product) => product.slug)).toEqual(['my-teachers-toolbox', 'underfire-ai', 'founders-helm']);
    expect(comingSoon.map((product) => product.slug)).toEqual(['crew-advisors']);
  });

  it.each(live.map((product) => [product.slug, product]))('%s has a loop of at most 2 MB and a poster of at most 150 KB', (slug, product) => {
    const loop = `/media/products/${slug}.mp4`;
    const poster = `/media/products/${slug}.jpg`;
    expect(product.previewVideo).toBe(loop);
    expect(product.poster).toBe(poster);
    expect(existsSync(onDisk(loop))).toBe(true);
    expect(existsSync(onDisk(poster))).toBe(true);
    expect(statSync(onDisk(loop)).size).toBeLessThanOrEqual(MAX_LOOP_BYTES);
    expect(statSync(onDisk(poster)).size).toBeLessThanOrEqual(MAX_POSTER_BYTES);
  });

  it('coming-soon products have neither a loop nor a poster', () => {
    for (const product of comingSoon) {
      expect(product).not.toHaveProperty('previewVideo');
      expect(product).not.toHaveProperty('poster');
    }
  });
});
