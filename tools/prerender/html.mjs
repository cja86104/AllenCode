// @ts-check

const SITE_URL = 'https://www.allencodeco.com';

/** @typedef {{ path: string, title: string, description: string, noindex: boolean }} PageHead */

/**
 * Escapes text for an HTML text node or a double-quoted attribute.
 * @param {string} text
 * @returns {string}
 */
export function escapeHtml(text) {
  return text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;').replaceAll('"', '&quot;').replaceAll("'", '&#39;');
}

/**
 * Replaces the one match of `pattern` in `html`, or throws naming `what`, so a template that lost a
 * tag fails the build instead of shipping a page without it.
 * @param {string} html
 * @param {RegExp} pattern
 * @param {string} replacement
 * @param {string} what
 * @returns {string}
 */
function replaceOnce(html, pattern, replacement, what) {
  const found = html.match(new RegExp(pattern.source, 'g')) ?? [];
  if (found.length !== 1) throw new Error(`The HTML template has ${found.length} ${what} tags; it needs exactly one.`);
  return html.replace(pattern, () => replacement);
}

/**
 * Writes a page's own head into the template: title, description, canonical, Open Graph and Twitter
 * title, description and address, and `robots` noindex when the page asks for it. These are the tags
 * `usePageMeta` keeps in sync in the browser (src/hooks/usePageMeta.js).
 * @param {string} template
 * @param {PageHead} page
 * @returns {string}
 */
export function applyHead(template, page) {
  const url = `${SITE_URL}${page.path}`;
  const title = escapeHtml(page.title);
  const description = escapeHtml(page.description);
  /** @param {string} attr @param {string} key @param {string} value @param {string} html */
  const meta = (html, attr, key, value) =>
    replaceOnce(html, new RegExp(`<meta ${attr}="${key}" content="[^"]*" ?/?>`), `<meta ${attr}="${key}" content="${value}" />`, key);

  let html = replaceOnce(template, /<title>[^<]*<\/title>/, `<title>${title}</title>`, 'title');
  html = meta(html, 'name', 'description', description);
  html = replaceOnce(html, /<link rel="canonical" href="[^"]*" ?\/?>/, `<link rel="canonical" href="${escapeHtml(url)}" />`, 'canonical');
  html = meta(html, 'property', 'og:title', title);
  html = meta(html, 'property', 'og:description', description);
  html = meta(html, 'property', 'og:url', escapeHtml(url));
  html = meta(html, 'name', 'twitter:title', title);
  html = meta(html, 'name', 'twitter:description', description);
  if (page.noindex) html = replaceOnce(html, /<\/head>/, '    <meta name="robots" content="noindex, nofollow" />\n  </head>', '</head>');
  return html;
}

/**
 * Puts a page's server-rendered HTML into the template's empty `#root` and drops the no-JavaScript
 * reader block, which a prebuilt page replaces with its real content. Throws when `#root` is not
 * empty, so an already prebuilt page is never used as the template.
 * @param {string} template
 * @param {string} appHtml
 * @returns {string}
 */
export function injectApp(template, appHtml) {
  const html = replaceOnce(template, /<div id="root"><\/div>/, `<div id="root">${appHtml}</div>`, 'empty #root');
  return replaceOnce(html, /\s*<!--(?:(?!-->)[\s\S])*?-->\s*<noscript>\s*<main[\s\S]*?<\/noscript>/, '', 'no-JavaScript reader <noscript>');
}
