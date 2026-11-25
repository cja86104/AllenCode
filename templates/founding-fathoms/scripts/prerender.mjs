// @ts-check
/**
 * Writes every page of the site to static HTML after `vite build` and the server build, so each page
 * reads in full without JavaScript and loads with its words already there. Also writes robots.txt, and a
 * sitemap when the site is indexable and has a published address.
 */
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '..');
const dist = join(root, 'dist');
const server =
  /** @type {{ render: (path: string) => string; routes: { path: string; title: string }[]; site: { url?: string; indexable: boolean } }} */ (
    await import(pathToFileURL(join(root, 'dist-ssr', 'entry-server.js')).href)
  );

const template = await readFile(join(dist, 'index.html'), 'utf8');
if (!template.includes('<div id="root"></div>')) throw new Error('prerender: dist/index.html has no empty #root to fill.');

/** @param {string} value */
const escapeHtml = (value) =>
  value.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;').replace(/'/g, '&#39;');

const siteUrl = server.site.url?.replace(/\/$/, '');

for (const route of server.routes) {
  const body = server.render(route.path === '/404' ? '/this-page-does-not-exist' : route.path);
  let html = template
    .replace('<div id="root"></div>', `<div id="root">${body}</div>`)
    .replace(/<title>[^<]*<\/title>/, `<title>${escapeHtml(route.title)}</title>`)
    .replace(/<meta property="og:title" content="[^"]*" \/>/, `<meta property="og:title" content="${escapeHtml(route.title)}" />`);
  if (siteUrl && route.path !== '/404') {
    const pageUrl = escapeHtml(route.path === '/' ? `${siteUrl}/` : `${siteUrl}${route.path}`);
    html = html
      .replace(/<link rel="canonical" href="[^"]*" \/>/, `<link rel="canonical" href="${pageUrl}" />`)
      .replace(/<meta property="og:url" content="[^"]*" \/>/, `<meta property="og:url" content="${pageUrl}" />`);
  }
  const file =
    route.path === '/'
      ? join(dist, 'index.html')
      : route.path === '/404'
        ? join(dist, '404.html')
        : join(dist, ...decodeURIComponent(route.path).split('/').filter(Boolean), 'index.html');
  await mkdir(dirname(file), { recursive: true });
  await writeFile(file, html);
}

const robots = server.site.indexable
  ? `User-agent: *\nAllow: /\n${siteUrl ? `Sitemap: ${siteUrl}/sitemap.xml\n` : ''}`
  : // Crawlers must be able to fetch the pages to read their noindex tag, so nothing is disallowed here.
    'User-agent: *\nAllow: /\n';
await writeFile(join(dist, 'robots.txt'), robots);

if (server.site.indexable && siteUrl) {
  const urls = server.routes
    .filter((route) => route.path !== '/404')
    .map((route) => `  <url><loc>${escapeHtml(route.path === '/' ? `${siteUrl}/` : `${siteUrl}${route.path}`)}</loc></url>`)
    .join('\n');
  await writeFile(
    join(dist, 'sitemap.xml'),
    `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`,
  );
}

console.log(`prerender: wrote ${server.routes.length} pages (${server.site.indexable ? 'indexable' : 'not indexed'}).`);
