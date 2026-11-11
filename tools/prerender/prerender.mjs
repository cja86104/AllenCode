// @ts-check
// Writes every page in the sitemap as its own HTML (Phase 9). Runs after `vite build` (the browser
// bundle, dist/) and `vite build --ssr src/entry-server.jsx --outDir dist-ssr` (the server bundle):
//   1. dist/index.html, as Vite built it, is the template; it is copied untouched to dist/spa.html,
//      the shell Vercel serves for every address without a file (vercel.json).
//   2. Each sitemap path is rendered by the server bundle and written, with its own head, to
//      dist/<path>.html (dist/index.html for the home page).
// Any page that fails to render, or renders as anything but a 200, fails the build and names the page.
import { mkdirSync, readFileSync, writeFileSync } from 'node:fs';
import { dirname, join, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { outputFile, sitemapPaths } from './routes.mjs';
import { applyHead, injectApp } from './html.mjs';

const root = resolve(dirname(fileURLToPath(import.meta.url)), '../..');
const dist = join(root, 'dist');
const serverEntry = join(root, 'dist-ssr', 'entry-server.js');

const template = readFileSync(join(dist, 'index.html'), 'utf8');
const paths = sitemapPaths(readFileSync(join(root, 'public', 'sitemap.xml'), 'utf8'));

/** @type {{ render: (url: string) => Promise<{ html: string, meta: { title: string, description: string, noindex: boolean }, status: number }> }} */
const server = await import(pathToFileURL(serverEntry).href);

// Render every page before writing anything, so a failure leaves dist/ as Vite built it.
/** @type {Array<{ file: string, html: string }>} */
const pages = [];
for (const path of paths) {
  const { html, meta, status } = await server.render(path).catch((/** @type {unknown} */ error) => {
    throw new Error(`Prerendering ${path} failed.`, { cause: error });
  });
  if (status !== 200) throw new Error(`Prerendering ${path} answered ${status}, not 200.`);
  pages.push({ file: outputFile(path), html: applyHead(injectApp(template, html), { path, ...meta }) });
}

writeFileSync(join(dist, 'spa.html'), template);
for (const { file, html } of pages) {
  const target = join(dist, file);
  mkdirSync(dirname(target), { recursive: true });
  writeFileSync(target, html);
}
console.log(`prerendered ${pages.length} pages: ${pages.map((p) => p.file).join(', ')}; shell: spa.html`);
