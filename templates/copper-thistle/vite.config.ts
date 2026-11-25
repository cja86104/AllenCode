import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { defineConfig, type Plugin } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { restaurant } from './src/content/restaurant';
import { validateRestaurant } from './src/lib/content';
import { headTags } from './src/lib/head';

/**
 * Writes the head (title, description, indexing rule, link previews, structured data) into
 * `index.html` from the content, and stops the build when the content has a problem the page cannot
 * recover from.
 */
function restaurantHead(): Plugin {
  return {
    name: 'copper-thistle-head',
    buildStart() {
      const problems = validateRestaurant(restaurant);
      if (problems.length > 0) this.error(`The restaurant content needs attention:\n- ${problems.join('\n- ')}`);
    },
    transformIndexHtml(html) {
      return html.replace('<!--thistle:head-->', headTags(restaurant));
    },
  };
}

/**
 * Makes `npm run preview` answer like a static host: each prerendered page is served from its own file,
 * and anything else gets the not-found page with a 404 status.
 */
function staticHostPreview(): Plugin {
  return {
    name: 'copper-thistle-static-host-preview',
    configurePreviewServer(server) {
      const outDir = server.config.build.outDir;
      server.middlewares.use((request, response, next) => {
        const url = new URL(request.url ?? '/', 'http://preview.local');
        const path = decodeURIComponent(url.pathname).replace(/\/$/, '');
        if (!/\.[a-z0-9]+$/i.test(path)) {
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
  plugins: [react(), restaurantHead(), staticHostPreview()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
  },
});
