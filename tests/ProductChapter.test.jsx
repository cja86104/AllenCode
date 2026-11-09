// @ts-check
import { render, screen, within } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import ProductChapters, { COUNTERS_SHOWN, PRODUCT_EXCERPTS, countText } from '../src/scenes/ProductChapter.jsx';
import { products } from '../src/data/products.js';
import { excerpts } from '../src/content/excerpts/index.js';

/** @param {string} slug */
const chapter = (slug) => /** @type {HTMLElement} */ (document.querySelector(`[data-product="${slug}"]`));

describe('countText', () => {
  it('counts the number inside a stat and keeps what surrounds it', () => {
    expect(countText('78K+', 0)).toBe('0K+');
    expect(countText('78K+', 0.5)).toBe('39K+');
    expect(countText('100%', 0.25)).toBe('25%');
    expect(countText('55+', 1)).toBe('55+');
  });

  it('ends on the exact original text', () => {
    for (const value of ['78K+', '105', '0', '100%', '40+', '47K+']) expect(countText(value, 1)).toBe(value);
  });

  it('leaves a value without a number as it is', () => {
    expect(countText('K–5', 0)).toBe('K–5');
    expect(countText('K–5', 0.6)).toBe('K–5');
  });
});

describe('ProductChapters', () => {
  it('renders every product from products.js, in order, each with its approved excerpt', () => {
    render(<ProductChapters includeDrafts={false} />);
    const shown = [...document.querySelectorAll('[data-product]')].map((el) => el.getAttribute('data-product'));
    expect(shown).toEqual(products.map((p) => p.slug));
    for (const product of products) {
      const excerpt = excerpts[PRODUCT_EXCERPTS[product.slug]];
      expect(within(chapter(product.slug)).getByText(excerpt.file)).toBeInTheDocument();
    }
  });

  it('exactly 3 live dots and 3 Open live site links, each to the product and in a new tab', () => {
    render(<ProductChapters includeDrafts={false} />);
    expect(document.querySelectorAll('[data-live-dot]')).toHaveLength(3);
    const links = screen.getAllByRole('link', { name: /Open live site/ });
    expect(links.map((a) => a.getAttribute('href'))).toEqual(products.filter((p) => p.status === 'live').map((p) => p.url));
    for (const link of links) {
      expect(link).toHaveAttribute('target', '_blank');
      expect(link.getAttribute('rel')).toContain('noopener');
    }
  });

  it('Crew Advisors has no live dot and no link and says coming soon', () => {
    render(<ProductChapters includeDrafts={false} />);
    const crew = chapter('crew-advisors');
    expect(crew.querySelector('[data-live-dot]')).toBeNull();
    expect(within(crew).queryByRole('link')).toBeNull();
    expect(within(crew).getByText(/coming soon/i)).toBeInTheDocument();
  });

  it("Crew Advisors' file is still being written: part of the code and a cursor", () => {
    render(<ProductChapters includeDrafts={false} />);
    const crew = chapter('crew-advisors');
    const code = /** @type {HTMLElement} */ (crew.querySelector('pre'));
    const shownChars = (code.textContent ?? '').length;
    expect(shownChars).toBeGreaterThan(0);
    expect(shownChars).toBeLessThan(excerpts['product-crew-advisors'].code.length);
    expect(crew.querySelector('[data-cursor]')).not.toBeNull();
  });

  it("each counter's final text equals its stats value exactly", () => {
    render(<ProductChapters includeDrafts={false} />);
    for (const product of products.filter((p) => p.stats)) {
      const counters = [...chapter(product.slug).querySelectorAll('[data-counter]')].map((el) => el.textContent);
      expect(counters).toEqual((product.stats ?? []).slice(0, COUNTERS_SHOWN).map((stat) => stat.number));
      for (const stat of (product.stats ?? []).slice(0, COUNTERS_SHOWN)) {
        expect(within(chapter(product.slug)).getByText(stat.label)).toBeInTheDocument();
      }
    }
  });

  it('a product without stats renders no counters', () => {
    render(<ProductChapters includeDrafts={false} />);
    expect(products.find((p) => p.slug === 'crew-advisors')?.stats).toBeUndefined();
    expect(chapter('crew-advisors').querySelectorAll('[data-counter]')).toHaveLength(0);
  });

  it('without the renderer, each live product shows its code beside its loop poster', () => {
    render(<ProductChapters includeDrafts={false} />);
    for (const product of products.filter((p) => p.status === 'live')) {
      const section = chapter(product.slug);
      expect(section.querySelector('pre')?.textContent).toBe(excerpts[PRODUCT_EXCERPTS[product.slug]].code);
      expect(within(section).getByRole('img', { name: new RegExp(product.name) })).toHaveAttribute('src', product.poster);
      expect(section.querySelector('video')).toHaveAttribute('src', product.previewVideo);
    }
  });
});
