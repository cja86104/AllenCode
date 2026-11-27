// @ts-check
import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageMetaContext } from './pageMetaContext.js';
import { jsonLdText } from '../seo/structuredData.js';

const SITE_URL = 'https://www.allencodeco.com';
/** No structured data of the page's own. */
const NONE = Object.freeze(/** @type {object[]} */ ([]));

/**
 * @param {'name' | 'property'} attr
 * @param {string} key
 * @param {string} content
 */
function upsertMeta(attr, key, content) {
  let el = document.querySelector(`meta[${attr}="${key}"]`);
  if (!el) {
    el = document.createElement('meta');
    el.setAttribute(attr, key);
    document.head.appendChild(el);
  }
  el.setAttribute('content', content);
}

/** @param {string} href */
function upsertCanonical(href) {
  let el = document.querySelector('link[rel="canonical"]');
  if (!el) {
    el = document.createElement('link');
    el.setAttribute('rel', 'canonical');
    document.head.appendChild(el);
  }
  el.setAttribute('href', href);
}

// Sets document.title + meta description per route (as before), and now
// also keeps the canonical link and Open Graph/Twitter title+description in
// sync with the current route.
//
// The build also writes each page's values into that page's own prebuilt
// HTML (Phase 9, tools/prerender), so link-preview bots that never run
// JavaScript read the right page; these effects keep the head right as the
// visitor moves between pages.
//
// Pass `{ noindex: true }` for routes that must stay out of search results; the robots
// tag is removed again when the page unmounts.
//
// Pass `{ jsonLd }` for the page's own structured data (2026-11-26, src/seo/structuredData.js): one
// `script[data-page-ld]` in the head, beside the site-wide Organization, written into the prebuilt
// HTML and kept in step here; a page without any has none.
/**
 * @param {string} title
 * @param {string} description
 * @param {{ noindex?: boolean, jsonLd?: ReadonlyArray<object> }} [options]
 */
export default function usePageMeta(title, description, options = {}) {
  const location = useLocation();
  const noindex = options.noindex === true;
  const jsonLd = options.jsonLd ?? NONE;
  // The page's data as text, so the effect below runs when it changes, not on every render.
  const ld = jsonLd.length > 0 ? jsonLdText(jsonLd) : '';

  // During the build's server render the page's head is collected here and written into its HTML
  // (Phase 9); in the browser there is no collector and the effects below keep the head in sync.
  const report = useContext(PageMetaContext);
  if (report) report({ title, description, noindex, jsonLd: [...jsonLd] });

  useEffect(() => {
    const existing = document.head.querySelector('script[data-page-ld]');
    if (!ld) {
      existing?.remove();
      return;
    }
    const script = existing ?? document.createElement('script');
    if (!existing) {
      script.setAttribute('type', 'application/ld+json');
      script.setAttribute('data-page-ld', '');
      document.head.appendChild(script);
    }
    if (script.textContent !== ld) script.textContent = ld;
  }, [ld]);

  useEffect(() => {
    const url = `${SITE_URL}${location.pathname}`;

    document.title = title;
    upsertMeta('name', 'description', description);
    upsertCanonical(url);

    upsertMeta('property', 'og:title', title);
    upsertMeta('property', 'og:description', description);
    upsertMeta('property', 'og:url', url);

    upsertMeta('name', 'twitter:title', title);
    upsertMeta('name', 'twitter:description', description);
  }, [title, description, location.pathname]);

  useEffect(() => {
    if (!noindex) return undefined;
    const robots = document.createElement('meta');
    robots.setAttribute('name', 'robots');
    robots.setAttribute('content', 'noindex, nofollow');
    document.head.appendChild(robots);
    return () => {
      robots.remove();
    };
  }, [noindex]);
}
