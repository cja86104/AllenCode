/** @vitest-environment node */
// @ts-check
import { existsSync, statSync } from 'node:fs';
import { describe, expect, it } from 'vitest';
import { templateCategories, templates } from '../src/data/templates.js';
import { excerpts, getExcerpt, validateExcerpt } from '../src/content/excerpts/index.js';

const EXISTING_PRICES = { ignite: 89, launchpad: 99, monoline: 59, terminal: 69, gridview: 129, 'control-panel': 149, studio: 89, atelier: 95 };
const FAMILY_TEMPLATES = ['hearth', 'evergreen', 'keepsake', 'vow', 'gather', 'folio'];
/** Templates Chris has built: each lives in templates/<id> and is filmed from its own build. */
const READY = ['evergreen'];
const MAX_POSTER_BYTES = 150 * 1024;
const MAX_LOOP_BYTES = 2 * 1024 * 1024;

/** @param {string} id */
const byId = (id) => templates.find((t) => t.id === id);

describe('template data', () => {
  it('the eight existing templates keep their prices in the data', () => {
    for (const [id, price] of Object.entries(EXISTING_PRICES)) expect(byId(id)?.price, id).toBe(price);
  });

  it('hearth, evergreen, keepsake, vow, gather and folio exist with no price', () => {
    for (const id of FAMILY_TEMPLATES) {
      const template = byId(id);
      expect(template, id).toBeDefined();
      expect(template, id).not.toHaveProperty('price');
    }
  });

  it('ids are unique', () => {
    const ids = templates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
    expect(ids).toHaveLength(14);
  });

  it('no template has a slot field', () => {
    for (const template of templates) expect(template, template.id).not.toHaveProperty('slot');
  });

  it('every template is a concept until Chris builds it, and a built one is ready', () => {
    for (const template of templates) {
      expect(template.status, template.id).toBe(READY.includes(template.id) ? 'ready' : 'concept');
    }
  });

  it('a ready template is a real project in templates/<id>, and its concept preview page is gone', () => {
    for (const id of READY) {
      expect(existsSync(`templates/${id}/package.json`), id).toBe(true);
      expect(existsSync(`tools/previews/src/${id}.html`), id).toBe(false);
    }
  });

  it('categories include Family and Memories, Events, and Personal and Creative, and every category is used', () => {
    expect(templateCategories).toEqual(expect.arrayContaining(['Family and Memories', 'Events', 'Personal and Creative']));
    for (const template of templates) expect(templateCategories, template.id).toContain(template.category);
    for (const category of templateCategories) expect(templates.some((t) => t.category === category), category).toBe(true);
  });

  it("every template's excerpt is real code from its own preview page or, once built, its own source; valid and approved", () => {
    for (const template of templates) {
      const excerpt = excerpts[template.excerpt];
      expect(excerpt, template.id).toBeDefined();
      expect(excerpt.repo, template.id).toBe('cja86104/AllenCode');
      if (template.status === 'ready') {
        expect(excerpt.path.startsWith(`templates/${template.id}/`), template.id).toBe(true);
        expect(existsSync(excerpt.path), excerpt.path).toBe(true);
        expect(excerpt.approved?.by, template.id).toBe('Chris');
      } else {
        expect(excerpt.path, template.id).toBe(`tools/previews/src/${template.id}.html`);
        expect(excerpt.approved, template.id).toEqual({ by: 'Chris', on: '2026-11-09' });
      }
      expect(validateExcerpt(excerpt), template.id).toEqual([]);
      expect(getExcerpt(template.excerpt)?.id, template.id).toBe(template.excerpt);
    }
  });

  it('every template names its excerpt, and its preview loop and poster exist within size limits', () => {
    for (const template of templates) {
      expect(template.excerpt, template.id).toBe(`template-${template.id}`);
      expect(template.previewVideo, template.id).toBe(`/media/templates/${template.id}.mp4`);
      expect(template.poster, template.id).toBe(`/media/templates/${template.id}.jpg`);
      const loop = `public/media/templates/${template.id}.mp4`;
      const poster = `public/media/templates/${template.id}.jpg`;
      expect(existsSync(loop), loop).toBe(true);
      expect(existsSync(poster), poster).toBe(true);
      expect(statSync(loop).size, loop).toBeLessThanOrEqual(MAX_LOOP_BYTES);
      expect(statSync(poster).size, poster).toBeLessThanOrEqual(MAX_POSTER_BYTES);
    }
  });
});
