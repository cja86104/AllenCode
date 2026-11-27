/** @vitest-environment node */
// @ts-check
import { readFileSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { sitemapPaths } from '../tools/prerender/routes.mjs';
import { baselineTargets } from '../tools/baseline/targets.mjs';

const paths = sitemapPaths(readFileSync(new URL('../public/sitemap.xml', import.meta.url), 'utf8'));
const targets = baselineTargets(paths);

describe('baselineTargets', () => {
  it('lists the ten sitemap paths', () => {
    expect(paths).toHaveLength(10);
  });

  it('returns 26 targets: ten paths twice, the home with each door twice, the home door a with reduced motion twice', () => {
    expect(targets).toHaveLength(26);
    const plain = targets.filter((t) => t.door === null);
    expect(plain).toHaveLength(20);
    expect(plain.every((t) => !t.reducedMotion)).toBe(true);
    for (const path of paths) {
      expect(plain.filter((t) => t.path === path).map((t) => t.viewport).sort()).toEqual(['desktop', 'phone']);
    }
    for (const door of ['a', 'b']) {
      const found = targets.filter((t) => t.door === door && !t.reducedMotion);
      expect(found.map((t) => `${t.path} ${t.viewport}`).sort()).toEqual(['/ desktop', '/ phone']);
    }
    const reduced = targets.filter((t) => t.reducedMotion);
    expect(reduced.map((t) => `${t.path} ${t.door} ${t.viewport}`).sort()).toEqual(['/ a desktop', '/ a phone']);
  });

  it('gives every target a unique, url-safe id', () => {
    const ids = targets.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    for (const id of ids) expect(id).toMatch(/^[a-z0-9-]+$/);
    expect(ids).toContain('home-door-a-phone');
    expect(ids).toContain('products-underfire-ai-desktop');
  });

  it('carries no world flag: every target is plain', () => {
    for (const t of targets) expect(Object.keys(t).sort()).toEqual(['door', 'id', 'path', 'reducedMotion', 'viewport']);
  });
});
