import type { Brewery } from '../content/types';
import { colors } from '../theme/colors';

/** Escapes text for use inside an HTML attribute or element. */
export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

export function documentTitle(brewery: Brewery, page?: string): string {
  return page ? `${page} · ${brewery.site.name}` : `${brewery.site.name} · ${brewery.site.tagline}`;
}

export function robotsContent(brewery: Brewery): string {
  return brewery.site.indexable ? 'index, follow' : 'noindex, nofollow';
}

const SCHEMA_DAYS = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'] as const;

/** schema.org `Brewery` data built from the content, so search engines read the real hours and address. */
export function structuredData(brewery: Brewery): Record<string, unknown> {
  const { contact, site, hours } = brewery;
  const data: Record<string, unknown> = {
    '@context': 'https://schema.org',
    '@type': 'Brewery',
    name: site.name,
    description: site.description,
    email: contact.email,
    address: { '@type': 'PostalAddress', streetAddress: contact.street, addressLocality: contact.city },
    openingHoursSpecification: hours.schedule.map((opening) => ({
      '@type': 'OpeningHoursSpecification',
      dayOfWeek: SCHEMA_DAYS[opening.day],
      opens: opening.opens,
      closes: opening.closes,
    })),
  };
  if (contact.phone) data.telephone = contact.phone;
  if (site.url) data.url = site.url;
  return data;
}

/** The tags written into the page head at build time, all generated from the content model. */
export function headTags(brewery: Brewery): string {
  const title = documentTitle(brewery);
  const description = brewery.site.description;
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="robots" content="${robotsContent(brewery)}" />`,
    `<meta property="og:type" content="website" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="theme-color" content="${colors.navy}" />`,
  ];
  const url = brewery.site.url;
  if (url) {
    tags.push(`<link rel="canonical" href="${escapeHtml(url)}" />`);
    tags.push(`<meta property="og:url" content="${escapeHtml(url)}" />`);
    tags.push(`<meta property="og:image" content="${escapeHtml(brewery.home.hero.photo.src)}" />`);
    tags.push(`<meta property="og:image:alt" content="${escapeHtml(brewery.home.hero.photo.alt)}" />`);
  }
  // JSON in a script element: `<` is escaped so the content can never close the element early.
  const json = JSON.stringify(structuredData(brewery)).replace(/</g, '\\u003c');
  tags.push(`<script type="application/ld+json">${json}</script>`);
  return tags.join('\n    ');
}
