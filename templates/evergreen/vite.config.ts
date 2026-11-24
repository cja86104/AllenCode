import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { memorial } from './src/content/memorial';
import { validateMemorial } from './src/lib/content';
import { presetCss } from './src/theme/presets';
import { headTags } from './src/lib/head';

/**
 * Writes the memorial's head (title, description, indexing rules, social preview, colours) into
 * `index.html`, and stops the build when the content has a problem the page cannot recover from.
 * Colour and metadata come from the content model, so neither waits for JavaScript.
 */
function evergreenHead(): Plugin {
  return {
    name: 'evergreen-head',
    buildStart() {
      // No server-enforced access control ships with the static template (README, "Privacy modes").
      const problems = validateMemorial(memorial, { serverAccessControl: false });
      if (problems.length > 0) {
        this.error(`The memorial content needs attention:\n- ${problems.join('\n- ')}`);
      }
    },
    transformIndexHtml(html) {
      const style = `<style data-evergreen-preset>${presetCss(memorial.site.appearance)}</style>`;
      return html.replace('<!--evergreen:head-->', `${headTags(memorial)}\n    ${style}`);
    },
  };
}

/**
 * Makes `npm run preview` answer like the static hosts the template is configured for (vercel.json,
 * public/_redirects): each prerendered page is served from its own file, the family-area demonstration
 * from the browser-only shell, and anything else gets the not-found page with a 404 status.
 */
function staticHostPreview(): Plugin {
  return {
    name: 'evergreen-static-host-preview',
    configurePreviewServer(server) {
      const outDir = server.config.build.outDir;
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://preview.local');
        const path = decodeURIComponent(url.pathname).replace(/\/$/, '');
        if (path === '/family/preview') {
          request.url = '/spa.html';
        } else if (!/\.[a-z0-9]+$/i.test(path)) {
          if (existsSync(join(outDir, path, 'index.html'))) {
            request.url = `${path}/index.html${url.search}`;
          } else if (existsSync(join(outDir, '404.html'))) {
            response.statusCode = 404;
            response.setHeader('Content-Type', 'text/html; charset=utf-8');
            response.end(readFileSync(join(outDir, '404.html')));
            return;
          }
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), evergreenHead(), staticHostPreview()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
  },
});
