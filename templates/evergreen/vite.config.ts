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

export default defineConfig({
  plugins: [react(), evergreenHead()],
  test: {
    environment: 'jsdom',
    setupFiles: ['./tests/setup.ts'],
    include: ['tests/**/*.test.{ts,tsx}'],
    css: false,
  },
});
