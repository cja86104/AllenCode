// @ts-check
import { describe, expect, it } from 'vitest';
import { services } from '../src/data/services.js';
import { products } from '../src/data/products.js';
import { DOOR_B_TEMPLATES, SERVICE_CHAPTERS } from '../src/data/homeOrder.js';
import { findFile, homeSegments, homeTree, pageFiles, pageSegments, productFiles } from '../src/pathbar/tree.js';

/** @param {string} id */
const branch = (id) => {
  const found = homeTree().find((b) => b.id === id);
  if (!found) throw new Error(`no branch ${id}`);
  return found;
};

describe('the path bar tree (Living Source Phase 3)', () => {
  it('branches in story order, each with its door', () => {
    const tree = homeTree();
    expect(tree.map((b) => b.id)).toEqual([
      '00_origin',
      '01_services',
      '02_our-work',
      '03_templates',
      '04_how-i-work',
      '05_who-builds-it',
      '06_your-idea',
      '07_start',
    ]);
    expect(tree.map((b) => b.door)).toEqual([null, 'a', 'a', 'b', 'a', null, null, null]);
  });

  it('services follow the home, then the rest', () => {
    const labels = branch('01_services').files.map((f) => f.label);
    expect(labels).toEqual([...SERVICE_CHAPTERS.map((c) => c.slug), 'acquisition-readiness']);
    expect(labels).toHaveLength(9);
    // Every service in the data appears exactly once, so a new service needs nothing here.
    expect([...labels].sort()).toEqual(services.map((s) => s.slug).sort());
  });

  it('service targets and fallbacks', () => {
    const files = branch('01_services').files;
    const immersive = files.find((f) => f.label === 'immersive-web-experiences');
    expect(immersive?.target).toEqual({ kind: 'home', selector: '[data-chapter="immersive-web-experiences"]' });
    expect(immersive?.fallback).toEqual({ kind: 'page', path: '/services', selector: '[data-service="immersive-web-experiences"]' });
    expect(immersive?.title).toBe('Immersive Web Experiences');
    expect(immersive?.id).toBe('01_services/immersive-web-experiences');
    const acquisition = files.find((f) => f.label === 'acquisition-readiness');
    expect(acquisition?.target).toEqual({ kind: 'page', path: '/services', selector: '[data-service="acquisition-readiness"]' });
    expect(acquisition?.fallback).toBeNull();
  });

  it('products in data order', () => {
    const files = branch('02_our-work').files;
    expect(files.map((f) => f.label)).toEqual(products.map((p) => p.slug));
    expect(files).toHaveLength(4);
    expect(files[1].target).toEqual({ kind: 'home', selector: `[data-product="${products[1].slug}"]` });
    expect(files[1].fallback).toEqual({ kind: 'page', path: `/products/${products[1].slug}` });
    expect(files[1].title).toBe(products[1].name);
  });

  it('templates: Hearth, then door B in its order, then Done for you', () => {
    const files = branch('03_templates').files;
    expect(files.map((f) => f.label)).toEqual(['hearth', ...DOOR_B_TEMPLATES.map((t) => t.id), 'done-for-you']);
    expect(files[0].target).toEqual({ kind: 'home', selector: '[data-door-b-intro]' });
    expect(files[1].target).toEqual({
      kind: 'home',
      selector: `[data-door-b-template="${DOOR_B_TEMPLATES[0].id}"]`,
      template: DOOR_B_TEMPLATES[0].id,
    });
    expect(files[files.length - 1].target).toEqual({ kind: 'home', selector: '[data-chapter="done-for-you"]' });
    for (const file of files) expect(file.fallback).toEqual({ kind: 'page', path: '/templates' });
  });

  it('one-file branches go to their own chapter and hold no files', () => {
    const expected = {
      '00_origin': 'gate',
      '04_how-i-work': 'how-i-work',
      '05_who-builds-it': 'builder',
      '06_your-idea': 'idea',
      '07_start': 'brief',
    };
    for (const [id, chapter] of Object.entries(expected)) {
      expect(branch(id).files).toEqual([]);
      expect(branch(id).target).toEqual({ kind: 'home', selector: `[data-chapter="${chapter}"]` });
    }
    for (const id of ['01_services', '02_our-work', '03_templates']) expect(branch(id).target).toBeNull();
  });

  it('finds a file by its id, and a one-file branch by its own', () => {
    expect(findFile('02_our-work/underfire-ai')?.file?.label).toBe('underfire-ai');
    expect(findFile('02_our-work/underfire-ai')?.branch?.id).toBe('02_our-work');
    expect(findFile('05_who-builds-it')).toEqual({ branch: branch('05_who-builds-it'), file: null });
    expect(findFile('pages/contact')?.file?.target).toEqual({ kind: 'page', path: '/contact' });
    expect(findFile('nope')).toBeNull();
  });

  it('the pages and the products as pages', () => {
    expect(pageFiles().map((f) => f.label)).toEqual(['services', 'products', 'templates', 'about', 'contact']);
    expect(productFiles().map((f) => f.target)).toEqual(products.map((p) => ({ kind: 'page', path: `/products/${p.slug}` })));
  });

  it('the home path: the origin before a file, then branch and file', () => {
    expect(homeSegments(null).map((s) => s.kind)).toEqual(['root', 'branches']);
    const origin = homeSegments(null)[1];
    expect(origin.kind === 'branches' && origin.branch.id).toBe('00_origin');
    const segments = homeSegments('02_our-work/underfire-ai');
    expect(segments.map((s) => s.kind)).toEqual(['root', 'branches', 'files']);
    const file = segments[2];
    expect(file.kind === 'files' && file.file.label).toBe('underfire-ai');
    expect(homeSegments('05_who-builds-it').map((s) => s.kind)).toEqual(['root', 'branches']);
  });

  it('an inner page is a file under pages', () => {
    const services = pageSegments('/services');
    expect(services.map((s) => s.kind)).toEqual(['root', 'pages', 'page']);
    const page = services[2];
    expect(page.kind === 'page' && page.file.label).toBe('services');
    expect(page.kind === 'page' && page.siblings).toEqual(pageFiles());
    expect(pageSegments('/services/').map((s) => s.kind)).toEqual(['root', 'pages', 'page']);

    const detail = pageSegments('/products/underfire-ai');
    expect(detail.map((s) => s.kind)).toEqual(['root', 'pages', 'link', 'page']);
    expect(detail[2]).toEqual({ kind: 'link', label: 'products', to: '/products' });
    const product = detail[3];
    expect(product.kind === 'page' && product.file.label).toBe('underfire-ai');
    expect(product.kind === 'page' && product.siblings).toEqual(productFiles());

    for (const [path, label] of [
      ['/checkout-success', 'checkout-success'],
      ['/nope', 'not-found'],
      ['/products/not-a-product', 'not-found'],
    ]) {
      const last = pageSegments(path).at(-1);
      expect(last?.kind === 'page' && last.file.label).toBe(label);
    }
  });
});
