// @ts-check
import { getExcerpt } from '../content/excerpts/index.js';
import { businessRoadStops, familyRoadStops, MEETING_STOPS } from './roads.js';
import { products as catalogue } from '../data/products.js';

/** @typedef {import('./roads.js').RoadStop} RoadStop */

/**
 * An inner page's short stretch of road (Code World W5a): its one stop, the lead, at the end of the
 * road (2026-11-17: the boards beside the road gone, "just have the one screen at the end"), whose
 * code lands as the page's headline; its code by excerpt id; and the word its road spells.
 * @typedef {{ id: string, stops: RoadStop[], lead: RoadStop, sources: Record<string, string>, word: string }} Stretch
 */

/** The empty file, Contact's stop: the site's first screen comes back as the start of a project. */
const CONTACT_STOP = Object.freeze({ id: 'contact', name: 'Contact', kind: /** @type {const} */ ('audit'), excerptId: 'gate' });
/** The empty file again for checkout success and the 404 page (W7, Chris 2026-11-17: "Their own word road"). */
const THANK_YOU_STOP = Object.freeze({ id: 'thank-you', name: 'Thank you', kind: /** @type {const} */ ('audit'), excerptId: 'gate' });
const LOST_STOP = Object.freeze({ id: 'lost', name: 'Lost', kind: /** @type {const} */ ('audit'), excerptId: 'gate' });

/** @type {Map<string, Stretch | null>} */
const known = new Map();

/**
 * A stretch from its page's stops: the first, the lead, alone at the end of the road.
 * @param {string} id
 * @param {ReadonlyArray<RoadStop>} stops In page order; the first is the lead.
 * @param {string} word What the road spells.
 * @returns {Stretch | null}
 */
function stretchOf(id, stops, word) {
  const lead = stops[0];
  const excerpt = lead?.excerptId ? getExcerpt(lead.excerptId) : null;
  if (!lead?.excerptId || !excerpt) return null;
  return { id, stops: [lead], lead, sources: { [lead.excerptId]: excerpt.code }, word };
}

/**
 * The word a page's road spells (Chris, 2026-11-17: "spell out what it is"): its section, on a
 * product's page the product's name, THANK YOU on checkout success and LOST on any unknown page (W7);
 * null for the home page and an unknown product (which goes on to Products).
 * @param {string} pathname
 * @returns {string | null}
 */
export function wordFor(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const sections = /** @type {Record<string, string>} */ ({ '/products': 'PRODUCTS', '/services': 'SERVICES', '/templates': 'TEMPLATES', '/about': 'ABOUT', '/contact': 'CONTACT' });
  if (sections[path]) return sections[path];
  if (path === '/') return null;
  if (path === '/checkout-success') return 'THANK YOU';
  const slug = /^\/products\/([^/]+)$/.exec(path)?.[1];
  if (slug === undefined) return 'LOST';
  const product = catalogue.find((p) => p.slug === slug);
  return product ? product.name.toUpperCase() : null;
}

/**
 * The stretch for a path (Chris, 2026-11-16, approved: every stop reuses an approved excerpt):
 * Products, each product page, Services, Templates, About and Contact; since W7 checkout success and
 * the 404 page (any unknown address). The home page and an unknown product have none.
 * Built once per page and shared.
 * @param {string} pathname
 * @returns {Stretch | null}
 */
export function stretchFor(pathname) {
  const path = pathname.length > 1 ? pathname.replace(/\/+$/, '') : pathname;
  const cached = known.get(path);
  if (cached !== undefined) return cached;
  const business = businessRoadStops();
  const products = business.filter((s) => s.kind === 'product' || s.kind === 'unfinished');
  const services = business.filter((s) => s.kind === 'service' || s.kind === 'audit');
  const houses = familyRoadStops().filter((s) => s.kind === 'template' && s.id !== 'hearth');
  const workshop = MEETING_STOPS.filter((s) => s.kind === 'portrait');
  /** @type {Stretch | null} */
  let stretch = null;
  const word = wordFor(path);
  if (!word) stretch = null;
  // Any unknown address, a deeper one under /products/ included: the 404 page.
  else if (word === 'LOST') stretch = stretchOf('lost', [LOST_STOP], word);
  else if (path === '/products') stretch = stretchOf('products', products, word);
  else if (path.startsWith('/products/')) {
    const slug = path.slice('/products/'.length);
    const product = products.find((s) => s.id === slug);
    stretch = product ? stretchOf(`product:${slug}`, [product], word) : null;
  } else if (path === '/services') stretch = stretchOf('services', services, word);
  else if (path === '/templates') stretch = stretchOf('templates', houses, word);
  else if (path === '/about') stretch = stretchOf('about', workshop, word);
  else if (path === '/contact') stretch = stretchOf('contact', [CONTACT_STOP], word);
  else if (path === '/checkout-success') stretch = stretchOf('thank-you', [THANK_YOU_STOP], word);
  known.set(path, stretch);
  return stretch;
}
