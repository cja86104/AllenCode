// @ts-check
import { useContext, useEffect } from 'react';
import { useLocation } from 'react-router-dom';
import { PageMetaContext } from './pageMetaContext.js';

const SITE_URL = 'https://www.allencodeco.com';

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
/**
 * @param {string} title
 * @param {string} description
 * @param {{ noindex?: boolean }} [options]
 */
export default function usePageMeta(title, description, options = {}) {
  const location = useLocation();
  const noindex = options.noindex === true;

  // During the build's server render the page's head is collected here and written into its HTML
  // (Phase 9); in the browser there is no collector and the effects below keep the head in sync.
  const report = useContext(PageMetaContext);
  if (report) report({ title, description, noindex });

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
