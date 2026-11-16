// @ts-check
import { products } from '../data/products.js';
import { services } from '../data/services.js';
import { serviceScreens } from '../data/serviceScreens.js';
import { excerpts as approvedRegistry, getExcerpt } from '../content/excerpts/index.js';
import { PRODUCT_EXCERPTS } from '../scenes/ProductChapter.jsx';
import { SERVICE_CHAPTERS } from '../scenes/ServiceChapters.jsx';
import { templates } from '../data/templates.js';
import { DOOR_B_TEMPLATES } from '../scenes/TemplateChapter.jsx';

/** @typedef {import('../content/excerpts/index.js').Excerpt} Excerpt */

/**
 * One stop on a road beyond the fork. `kind` decides its landmark: a product's screen resolving into
 * its loop, a product still being written (`unfinished`), a service's screen, the audit's checked
 * file, the commits of how I work, a template's screen resolving into its loop (the family road,
 * W3), or a stop of words with no landmark (done for you).
 * @typedef {{ id: string, name: string, kind: 'product' | 'unfinished' | 'service' | 'audit' | 'commits' | 'template' | 'words', excerptId: string | null }} RoadStop
 */

/** The audit chapter has no screen: its real thing is its own file, every line checked. */
const AUDIT_SLUG = 'technical-audits';

/**
 * The business road's stops (Code World spec, section 3; W2.1), from the site's own data: products
 * first, in `products.js` order (Chris, 2026-11-10: "products first"), then the services in the
 * chapters' story order, then how I work. A product or service without an approved excerpt, or
 * without the screen or loop it would resolve into, is left out rather than drawn half-built.
 * @param {{ includeDrafts?: boolean, registry?: Readonly<Record<string, Excerpt>> }} [options]
 * @returns {RoadStop[]}
 */
export function businessRoadStops({ includeDrafts = false, registry = approvedRegistry } = {}) {
  const has = (/** @type {string | undefined} */ id) => Boolean(id && getExcerpt(id, { includeDrafts, registry }));
  /** @type {RoadStop[]} */
  const stops = [];

  for (const product of products) {
    const excerptId = PRODUCT_EXCERPTS[product.slug];
    if (!has(excerptId)) continue;
    if (product.status === 'live') {
      if (product.previewVideo && product.poster) stops.push({ id: product.slug, name: product.name, kind: 'product', excerptId });
    } else {
      stops.push({ id: product.slug, name: product.name, kind: 'unfinished', excerptId });
    }
  }

  for (const { slug, excerptId } of SERVICE_CHAPTERS) {
    const service = services.find((s) => s.slug === slug);
    if (!service || !has(excerptId)) continue;
    if (slug === AUDIT_SLUG) {
      stops.push({ id: slug, name: service.name, kind: 'audit', excerptId });
    } else if (Object.hasOwn(serviceScreens, slug) && serviceScreens[/** @type {keyof typeof serviceScreens} */ (slug)]) {
      stops.push({ id: slug, name: service.name, kind: 'service', excerptId });
    }
  }

  stops.push({ id: 'how-i-work', name: 'How I work', kind: 'commits', excerptId: null });
  return stops;
}

/**
 * The family road's stops (Code World spec, section 3; W3.2): Hearth (door B's opening), then door
 * B's templates in their chapter order, then done for you as a stop of words. A template without an
 * approved excerpt or without its loop and poster is left out, as a product is.
 * @param {{ includeDrafts?: boolean, registry?: Readonly<Record<string, Excerpt>> }} [options]
 * @returns {RoadStop[]}
 */
export function familyRoadStops({ includeDrafts = false, registry = approvedRegistry } = {}) {
  const has = (/** @type {string | undefined} */ id) => Boolean(id && getExcerpt(id, { includeDrafts, registry }));
  const hearth = templates.find((t) => t.id === 'hearth');
  /** @type {RoadStop[]} */
  const stops = [];
  for (const template of [...(hearth ? [hearth] : []), ...DOOR_B_TEMPLATES]) {
    if (!has(template.excerpt) || !template.previewVideo || !template.poster) continue;
    stops.push({ id: template.id, name: template.name, kind: 'template', excerptId: template.excerpt });
  }
  stops.push({ id: 'done-for-you', name: 'Done for you', kind: 'words', excerptId: null });
  return stops;
}

/**
 * The road stop a chapter's flight lands at, from the flight's key prefix: door A's chapters name
 * their flights by their stop (`underfire-ai`), door B's by their own slugs (`door-b-intro` for
 * Hearth, `template-<id>` for a template; W3.5). Anything else is returned as it is.
 * @param {string} slug
 */
export function stopForFlight(slug) {
  if (slug === 'door-b-intro') return 'hearth';
  if (slug.startsWith('template-')) return slug.slice('template-'.length);
  return slug;
}
