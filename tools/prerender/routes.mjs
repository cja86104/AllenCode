// @ts-check

/**
 * The paths the build writes as their own HTML (Phase 9): every `<loc>` in the sitemap, in order,
 * without the origin.
 * @param {string} xml The contents of public/sitemap.xml.
 * @returns {string[]}
 */
export function sitemapPaths(xml) {
  const paths = [...xml.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => new URL(m[1].trim()).pathname);
  if (paths.length === 0) throw new Error('The sitemap lists no pages.');
  return paths;
}

/**
 * Where a path's HTML is written inside `dist`: a flat file, which Vercel serves at the path without
 * `.html` when `cleanUrls` is on (vercel.json). The home page is `index.html`.
 * @param {string} path
 * @returns {string}
 */
export function outputFile(path) {
  if (path === '/') return 'index.html';
  return `${path.replace(/^\/+|\/+$/g, '')}.html`;
}
