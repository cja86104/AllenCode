// @ts-check

/**
 * Each page's own structured data (schema.org JSON-LD), beside the site-wide Organization in
 * index.html (2026-11-26, Task 1.5): AI and search readers take a page's facts from its HTML, which
 * the build prerenders. Only what the site's own data says: no prices (services and templates show
 * none), no offers, no ratings.
 */

const SITE = 'https://www.allencodeco.com';

/** The site-wide Organization's id, set on its block in index.html. */
export const ORGANIZATION_ID = `${SITE}/#organization`;
/** Chris Allen, as About describes him. */
export const PERSON_ID = `${SITE}/about#chris-allen`;
/** His profile, as index.html's Organization block already names it. */
const LINKEDIN = 'https://www.linkedin.com/in/chris-allen-6b8a32387';

/**
 * Services: one Service per entry, in the page's order, provided by the Organization.
 * @param {ReadonlyArray<{ name: string, summary: string }>} entries
 */
export function serviceList(entries) {
  return {
    '@type': 'ItemList',
    name: 'Services',
    url: `${SITE}/services`,
    itemListElement: entries.map((service, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      item: { '@type': 'Service', name: service.name, description: service.summary, provider: { '@id': ORGANIZATION_ID } },
    })),
  };
}

/**
 * A product: a web application by Chris Allen, published by the studio; its live address only when it
 * has one (Crew Advisors has none yet).
 * @param {{ name: string, summary: string, url: string | null }} product
 */
export function softwareApplication(product) {
  return {
    '@type': 'SoftwareApplication',
    name: product.name,
    description: product.summary,
    ...(product.url ? { url: product.url } : {}),
    operatingSystem: 'Web',
    creator: { '@id': PERSON_ID },
    publisher: { '@id': ORGANIZATION_ID },
  };
}

/** About: Chris Allen, founder of the studio. */
export function person() {
  return {
    '@type': 'Person',
    '@id': PERSON_ID,
    name: 'Chris Allen',
    url: `${SITE}/about`,
    jobTitle: 'Founder',
    worksFor: { '@id': ORGANIZATION_ID },
    sameAs: [LINKEDIN],
  };
}

/**
 * The way back to the home page: Home, then each step given.
 * @param {ReadonlyArray<{ name: string, path: string }>} steps
 */
export function breadcrumbs(steps) {
  return {
    '@type': 'BreadcrumbList',
    itemListElement: [{ name: 'Home', path: '/' }, ...steps].map((step, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: step.name,
      item: `${SITE}${step.path}`,
    })),
  };
}

/**
 * A page's nodes as the text of one `application/ld+json` script: a single graph, with `<`, `>` and `&`
 * written as JSON escapes so no text inside can end the script element.
 * @param {ReadonlyArray<object>} nodes
 * @returns {string}
 */
export function jsonLdText(nodes) {
  return JSON.stringify({ '@context': 'https://schema.org', '@graph': nodes })
    .replaceAll('<', '\\u003c')
    .replaceAll('>', '\\u003e')
    .replaceAll('&', '\\u0026');
}
