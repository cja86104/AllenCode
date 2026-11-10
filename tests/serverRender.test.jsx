// @ts-check
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { render } from '../src/entry-server.jsx';

/** The paths in public/sitemap.xml, the pages the build writes as their own HTML (Phase 9). */
const SITEMAP_PATHS = [...readFileSync('public/sitemap.xml', 'utf8').matchAll(/<loc>https:\/\/www\.allencodeco\.com([^<]*)<\/loc>/g)].map(
  (m) => m[1],
);

/** Each page's own title, as its page passes it to usePageMeta. */
const TITLES = /** @type {Record<string, string>} */ ({
  '/': 'Allen Code Co. — Custom Software, Web Design & AI for Real Businesses',
  '/products': 'Products — Allen Code Co.',
  '/products/my-teachers-toolbox': 'My Teachers Toolbox — Allen Code Co.',
  '/products/underfire-ai': 'UnderFire AI — Allen Code Co.',
  '/products/founders-helm': 'Founders Helm — Allen Code Co.',
  '/products/crew-advisors': 'Crew Advisors — Allen Code Co.',
  '/services': 'Services — Allen Code Co.',
  '/templates': 'Templates — Allen Code Co.',
  '/about': 'About — Allen Code Co.',
  '/contact': 'Contact — Allen Code Co.',
});

describe('server render', () => {
  it('runs with no browser globals', () => {
    expect(typeof window).toBe('undefined');
    expect(typeof document).toBe('undefined');
  });

  it('covers the ten sitemap pages', () => {
    expect(SITEMAP_PATHS).toEqual(Object.keys(TITLES));
  });

  for (const path of Object.keys(TITLES)) {
    it(`renders ${path} with its own title and one h1`, async () => {
      const { html, meta, status } = await render(path);
      expect(status).toBe(200);
      expect(meta.title).toBe(TITLES[path]);
      expect(meta.description.length).toBeGreaterThan(40);
      expect(meta.noindex).toBe(false);
      expect(html.match(/<h1[\s>]/g)).toHaveLength(1);
    });
  }

  it('renders the home page as a first visit sees it: the opening and the fork, no door chapter', async () => {
    const { html } = await render('/');
    expect(html).toContain('Welcome to Allen Code Co.');
    expect(html).toContain('I&#x27;m building a product or business');
    expect(html).toContain('I want a site for me or my family');
    expect(html).not.toContain('data-chapter="mvp-sprints"');
    expect(html).not.toContain('data-door-b-intro');
    expect(html).not.toContain('your-idea.txt');
  });

  it('renders an unknown path as the 404 page', async () => {
    const { html, meta, status } = await render('/nope');
    expect(status).toBe(404);
    expect(meta.title).toBe('Page not found — Allen Code Co.');
    expect(html).toContain('Nothing to see here.');
  });
});
