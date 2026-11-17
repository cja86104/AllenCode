// @ts-check
import { getExcerpt } from '../content/excerpts/index.js';
import { businessRoadStops, familyRoadStops, MEETING_STOPS } from './roads.js';

/** @typedef {import('./roads.js').RoadStop} RoadStop */

/**
 * An inner page's short stretch of road (Code World W5a): its stops in road order, the lead last
 * (the stop whose code lands as the page's headline), and each stop's approved code by excerpt id.
 * @typedef {{ id: string, stops: RoadStop[], lead: RoadStop, sources: Record<string, string> }} Stretch
 */

/** The empty file, Contact's stop: the site's first screen comes back as the start of a project. */
const CONTACT_STOP = Object.freeze({ id: 'contact', name: 'Contact', kind: /** @type {const} */ ('audit'), excerptId: 'gate' });

/** @type {Map<string, Stretch | null>} */
const known = new Map();

/**
 * A stretch from its stops: the lead moved to the end of the road, the rest kept in page order.
 * @param {string} id
 * @param {ReadonlyArray<RoadStop>} stops In page order; the first is the lead.
 * @returns {Stretch | null}
 */
function stretchOf(id, stops) {
  if (stops.length === 0) return null;
  const [lead, ...rest] = stops;
  /** @type {Record<string, string>} */
  const sources = {};
  for (const stop of stops) {
    const excerpt = stop.excerptId ? getExcerpt(stop.excerptId) : null;
    if (!excerpt || !stop.excerptId) return null;
    sources[stop.excerptId] = excerpt.code;
  }
  return { id, stops: [...rest, lead], lead, sources };
}

/**
 * The stretch for a path (Chris, 2026-11-16, approved: every stop reuses an approved excerpt):
 * Products, each product page, Services, Templates, About and Contact. Every other page has none.
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
  if (path === '/products') stretch = stretchOf('products', products);
  else if (path.startsWith('/products/')) {
    const slug = path.slice('/products/'.length);
    const product = products.find((s) => s.id === slug);
    stretch = product ? stretchOf(`product:${slug}`, [product]) : null;
  } else if (path === '/services') stretch = stretchOf('services', services);
  else if (path === '/templates') stretch = stretchOf('templates', houses);
  else if (path === '/about') stretch = stretchOf('about', workshop);
  else if (path === '/contact') stretch = stretchOf('contact', [CONTACT_STOP]);
  known.set(path, stretch);
  return stretch;
}
