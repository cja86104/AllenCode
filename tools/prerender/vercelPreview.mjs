// @ts-check
import { existsSync } from 'node:fs';
import { join, resolve } from 'node:path';

/**
 * How Vercel answers a path with this site's vercel.json (`cleanUrls: true`, `trailingSlash: false`,
 * every other non-API path rewritten to `/spa`): a redirect, the file to serve, or null to leave the
 * request to the static server (the home page and real files such as scripts and images).
 * @param {string} pathname
 * @param {(file: string) => boolean} hasFile Whether `dist` holds this path, e.g. `/about.html`.
 * @returns {{ redirect: string } | { file: string } | null}
 */
export function vercelAnswer(pathname, hasFile) {
  if (pathname === '/' || pathname.startsWith('/api/')) return null;
  if (pathname.endsWith('.html')) return { redirect: pathname === '/index.html' ? '/' : pathname.slice(0, -'.html'.length) };
  if (pathname.endsWith('/')) return { redirect: pathname.replace(/\/+$/, '') || '/' };
  const last = pathname.slice(pathname.lastIndexOf('/') + 1);
  if (last.includes('.')) return null;
  if (hasFile(`${pathname}.html`)) return { file: `${pathname}.html` };
  return { file: '/spa.html' };
}

/**
 * Makes `vite preview` (and so the e2e tests) answer like Vercel does for the prebuilt pages, the
 * shell and the redirects (Phase 9). Preview only: the dev server and the build are unchanged.
 * @returns {import('vite').Plugin}
 */
export function vercelPreview() {
  return {
    name: 'allencode:vercel-preview',
    configurePreviewServer(server) {
      const outDir = resolve(server.config.root, server.config.build.outDir);
      server.middlewares.use((req, res, next) => {
        if (req.method !== 'GET' && req.method !== 'HEAD') return next();
        const url = new URL(req.url ?? '/', 'http://preview.local');
        const answer = vercelAnswer(decodeURIComponent(url.pathname), (file) => existsSync(join(outDir, file)));
        if (!answer) return next();
        if ('redirect' in answer) {
          res.statusCode = 308;
          res.setHeader('Location', `${answer.redirect}${url.search}`);
          return res.end();
        }
        req.url = `${answer.file}${url.search}`;
        return next();
      });
    },
  };
}
