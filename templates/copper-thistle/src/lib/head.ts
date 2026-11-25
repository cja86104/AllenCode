import type { Restaurant } from '../content/types';
import { colors } from '../theme/colors';

/** Escapes text for use inside an HTML attribute or element. */
export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function documentTitle(restaurant: Restaurant, page?: string): string {
  const base = `${restaurant.site.name} · ${restaurant.site.tagline}`;
  return page ? `${page} · ${restaurant.site.name}` : base;
}

export function robotsContent(restaurant: Restaurant): string {
  return restaurant.site.indexable ? 'index, follow' : 'noindex, nofollow';
}

const SCHEMA_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/** schema.org `Restaurant` data built from the content, so search engines read the real hours and address. */
export function structuredData(restaurant: Restaurant): Record<string, unknown> {
  const { contact, site, hours } = restaurant;
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Restaurant',
    name: site.name,
    description: site.description,
    telephone: contact.phone,
    email: contact.email,
    address: {
      '@type': 'PostalAddress',
      streetAddress: contact.street,
      addressLocality: contact.city,
      addressRegion: contact.region,
      postalCode: contact.postalCode,
    },
    openingHoursSpecification: hours.schedule.map((opening) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: SCHEMA_DAYS[opening.day],
      opens: opening.opens,
      closes: opening.closes,
    })),
    servesCuisine: 'Seasonal American',
    acceptsReservations: true,
  };
  if (site.url) data.url = site.url;
  return data;
}

/** The tags written into the page head at build time, all generated from the content model. */
export function headTags(restaurant: Restaurant): string {
  const title = documentTitle(restaurant);
  const description = restaurant.site.description;
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="robots" content="${robotsContent(restaurant)}" />`,
    `<meta property="og:type" content="restaurant" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="theme-color" content="${colors.charcoal}" />`,
  ];
  const url = restaurant.site.url;
  if (url) {
    tags.push(`<link rel="canonical" href="${escapeHtml(url)}" />`);
    tags.push(`<meta property="og:url" content="${escapeHtml(url)}" />`);
    tags.push(`<meta property="og:image" content="${escapeHtml(restaurant.home.hero.photo.src)}" />`);
    tags.push(`<meta property="og:image:alt" content="${escapeHtml(restaurant.home.hero.photo.alt)}" />`);
  }
  // JSON in a script element: `<` is escaped so the content can never close the element early.
  const json = JSON.stringify(structuredData(restaurant)).replace(/</g, '\\u003c');
  tags.push(`<script type="application/ld+json">${json}</script>`);
  return tags.join('\n    ');
}
