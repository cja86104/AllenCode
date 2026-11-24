import type { Memorial } from '../content/types';
import { findPhoto } from './content';
import { PRESETS } from '../theme/presets';

/** Escapes text for use inside an HTML attribute or element. */
export function escapeHtml(value: string): string {
  return value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');
}

/** Years only, for titles: "1946–2026". */
function yearSpan(memorial: Memorial): string {
  const { born, died, showDates } = memorial.person;
  if (!showDates) return '';
  const start = born?.year;
  const end = died?.year;
  if (start !== undefined && end !== undefined) return `${start}–${end}`;
  return String(start ?? end ?? '');
}

export function documentTitle(memorial: Memorial, page?: string): string {
  const years = yearSpan(memorial);
  const base = years ? `${memorial.person.fullName}, ${years}` : memorial.person.fullName;
  return page ? `${page} · ${base}` : base;
}

export function metaDescription(memorial: Memorial): string {
  return memorial.site.description?.trim() || memorial.opening.intro;
}

/**
 * Whether search engines may index the memorial. Only a public memorial is indexable. An unlisted
 * memorial asks not to be indexed, which keeps it out of search results but does not stop anyone
 * with the link from opening it.
 */
export function robotsContent(memorial: Memorial): string {
  return memorial.privacy.mode === 'public' ? 'index, follow' : 'noindex, nofollow, noarchive';
}

/**
 * The tags written into the page head at build time, all generated from the content model.
 * The social image is only offered when the memorial has a published address (so the image URL can be
 * absolute, as link previews require) and the image is a real photograph rather than a placeholder.
 */
export function headTags(memorial: Memorial): string {
  const title = documentTitle(memorial);
  const description = metaDescription(memorial);
  const tags = [
    `<title>${escapeHtml(title)}</title>`,
    `<meta name="description" content="${escapeHtml(description)}" />`,
    `<meta name="robots" content="${robotsContent(memorial)}" />`,
    `<meta property="og:type" content="profile" />`,
    `<meta property="og:title" content="${escapeHtml(title)}" />`,
    `<meta property="og:description" content="${escapeHtml(description)}" />`,
    `<meta name="twitter:card" content="summary_large_image" />`,
    `<meta name="theme-color" content="${PRESETS[memorial.site.appearance].tokens.paper}" />`,
  ];

  const url = memorial.site.url;
  if (url) {
    tags.push(`<link rel="canonical" href="${escapeHtml(url)}" />`);
    tags.push(`<meta property="og:url" content="${escapeHtml(url)}" />`);
    const image = findPhoto(memorial, memorial.site.socialImageId ?? memorial.opening.portraitId);
    if (image && !image.placeholder) {
      const absolute = new URL(image.src, url).toString();
      tags.push(`<meta property="og:image" content="${escapeHtml(absolute)}" />`);
      tags.push(`<meta property="og:image:alt" content="${escapeHtml(image.alt)}" />`);
    }
  }

  return tags.join('\n    ');
}
