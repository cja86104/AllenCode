// @ts-check
// @vitest-environment node
import { describe, expect, it } from 'vitest';
import { readFileSync } from 'node:fs';
import { outputFile, sitemapPaths } from '../tools/prerender/routes.mjs';
import { applyHead, injectApp } from '../tools/prerender/html.mjs';
import { vercelAnswer } from '../tools/prerender/vercelPreview.mjs';

const template = readFileSync('index.html', 'utf8');
const HOME = {
  path: '/',
  title: 'Allen Code Co. — Custom Software, Web Design & AI for Real Businesses',
  description: 'Custom development, web design, UI/UX, and AI integration — built around your business.',
  noindex: false,
};

/** @param {string} html @param {string} selector attribute selector inside the tag, e.g. `property="og:url"` */
const contentOf = (html, selector) => html.match(new RegExp(`<meta ${selector} content="([^"]*)"`))?.[1];

describe('sitemap routes', () => {
  it('reads the ten paths of public/sitemap.xml in order', () => {
    expect(sitemapPaths(readFileSync('public/sitemap.xml', 'utf8'))).toEqual([
      '/',
      '/products',
      '/products/my-teachers-toolbox',
      '/products/underfire-ai',
      '/products/founders-helm',
      '/products/crew-advisors',
      '/services',
      '/templates',
      '/about',
      '/contact',
    ]);
  });

  it('writes each path to a flat file, the home to index.html', () => {
    expect(outputFile('/')).toBe('index.html');
    expect(outputFile('/about')).toBe('about.html');
    expect(outputFile('/products/underfire-ai')).toBe('products/underfire-ai.html');
  });
});

describe('applyHead', () => {
  it('writes the title escaped', () => {
    const html = applyHead(template, HOME);
    expect(html).toContain('<title>Allen Code Co. — Custom Software, Web Design &amp; AI for Real Businesses</title>');
    expect(contentOf(html, 'property="og:title"')).toBe('Allen Code Co. — Custom Software, Web Design &amp; AI for Real Businesses');
    expect(contentOf(html, 'name="twitter:title"')).toBe('Allen Code Co. — Custom Software, Web Design &amp; AI for Real Businesses');
  });

  it("names the page's own address in the canonical, og:url, and its description everywhere", () => {
    const html = applyHead(template, { ...HOME, path: '/about', title: 'About — Allen Code Co.', description: 'Chris Allen and the studio.' });
    expect(html).toContain('<link rel="canonical" href="https://www.allencodeco.com/about" />');
    expect(contentOf(html, 'property="og:url"')).toBe('https://www.allencodeco.com/about');
    expect(contentOf(html, 'name="description"')).toBe('Chris Allen and the studio.');
    expect(contentOf(html, 'property="og:description"')).toBe('Chris Allen and the studio.');
    expect(contentOf(html, 'name="twitter:description"')).toBe('Chris Allen and the studio.');
    expect(html).not.toContain('name="robots"');
  });

  it('keeps the home canonical at the bare origin with its slash', () => {
    expect(applyHead(template, HOME)).toContain('<link rel="canonical" href="https://www.allencodeco.com/" />');
  });

  it('escapes markup and quotes in a description', () => {
    const html = applyHead(template, { ...HOME, description: 'Say "hi" to <b>us</b>' });
    expect(contentOf(html, 'name="description"')).toBe('Say &quot;hi&quot; to &lt;b&gt;us&lt;/b&gt;');
  });

  it('adds robots noindex only when the page asks for it', () => {
    expect(applyHead(template, { ...HOME, noindex: true })).toContain('<meta name="robots" content="noindex, nofollow" />');
  });

  it('throws when the template lacks a tag it must set', () => {
    const noCanonical = template.replace(/<link rel="canonical"[^>]*>/, '');
    expect(() => applyHead(noCanonical, HOME)).toThrow(/canonical/);
  });
});

describe('injectApp', () => {
  it("puts the page's HTML in #root, drops the no-JavaScript reader block and keeps the JSON-LD", () => {
    const html = injectApp(template, '<main id="main"><h1>Hello</h1></main>');
    expect(html).toContain('<div id="root"><main id="main"><h1>Hello</h1></main></div>');
    expect(html).not.toContain('<noscript>');
    expect(html).toContain('"@type": "Organization"');
  });

  it('throws when #root is not empty, so a prebuilt page is never used as the template', () => {
    const once = injectApp(template, '<p>built</p>');
    expect(() => injectApp(once, '<p>again</p>')).toThrow(/#root/);
  });
});

describe('vercelAnswer (how vite preview mirrors vercel.json)', () => {
  const built = new Set(['/about.html', '/products.html', '/products/underfire-ai.html']);
  /** @param {string} path */
  const answer = (path) => vercelAnswer(path, (file) => built.has(file));

  it('serves a prebuilt page at its address without .html', () => {
    expect(answer('/about')).toEqual({ file: '/about.html' });
    expect(answer('/products/underfire-ai')).toEqual({ file: '/products/underfire-ai.html' });
  });

  it('serves the shell for an address with no page', () => {
    expect(answer('/nope')).toEqual({ file: '/spa.html' });
    expect(answer('/products/not-a-product')).toEqual({ file: '/spa.html' });
    expect(answer('/checkout-success')).toEqual({ file: '/spa.html' });
  });

  it('redirects a trailing slash and a .html address to the clean one', () => {
    expect(answer('/about/')).toEqual({ redirect: '/about' });
    expect(answer('/about.html')).toEqual({ redirect: '/about' });
    expect(answer('/index.html')).toEqual({ redirect: '/' });
  });

  it('leaves the home page, files and the API alone', () => {
    expect(answer('/')).toBeNull();
    expect(answer('/assets/index.js')).toBeNull();
    expect(answer('/api/send-contact-email')).toBeNull();
  });
});
