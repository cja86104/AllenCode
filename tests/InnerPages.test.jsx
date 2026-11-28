// @ts-check
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProductDetail from '../src/pages/ProductDetail.jsx';
import Products from '../src/pages/Products.jsx';
import Services from '../src/pages/Services.jsx';
import About from '../src/pages/About.jsx';
import Footer from '../src/components/Footer.jsx';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import CustomCursor, { CURSOR_DOT, CURSOR_RING } from '../src/components/CustomCursor.jsx';
import { catalog } from '../src/data/catalog.js';
import { services } from '../src/data/services.js';

beforeEach(() => {
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      observe() {}
      unobserve() {}
      disconnect() {}
      takeRecords() {
        return [];
      }
    },
  );
});

afterEach(() => vi.unstubAllGlobals());

/** @param {string} slug */
const renderDetail = (slug) =>
  render(
    <MemoryRouter initialEntries={[`/products/${slug}`]}>
      <Routes>
        <Route path="/products/:slug" element={<ProductDetail />} />
        <Route path="/products" element={<p>Products list</p>} />
      </Routes>
    </MemoryRouter>,
  );

describe('Products and product detail', () => {
  it('product detail renders for every slug and Crew Advisors shows no link', () => {
    for (const product of catalog) {
      const { unmount } = renderDetail(product.slug);
      expect(screen.getByRole('heading', { level: 1, name: product.name })).toBeInTheDocument();
      const live = screen.queryByRole('link', { name: /Visit live site/ });
      if (product.slug === 'crew-advisors') {
        expect(live).toBeNull();
        expect(screen.getAllByText('Launching soon').length).toBeGreaterThan(0);
      } else {
        expect(live).toHaveAttribute('href', product.url);
        expect(live).toHaveAttribute('rel', 'noopener noreferrer');
      }
      unmount();
    }
  });

  it('an unknown product goes back to the products list', () => {
    renderDetail('nope');
    expect(screen.getByText('Products list')).toBeInTheDocument();
  });

  it('the products page shows live products playing their real screens and Crew Advisors typing its code', () => {
    const { container } = render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>,
    );
    for (const product of catalog) {
      const card = /** @type {HTMLElement} */ (container.querySelector(`[data-product-card="${product.slug}"]`));
      if (product.previewVideo) {
        expect(card.querySelector('video')).toHaveAttribute('src', product.previewVideo);
        expect(card.querySelector('img')).toHaveAttribute('src', product.poster);
      } else {
        expect(card.querySelector('video')).toBeNull();
      }
    }
    const crew = /** @type {HTMLElement} */ (container.querySelector('[data-product-card="crew-advisors"]'));
    expect(crew.querySelector('[data-typing-file="product-crew-advisors"] [data-cursor]')).not.toBeNull();
    expect(crew).toHaveTextContent('still being written');
    expect(container.querySelector('[data-aiwp-slot]')).toBeNull();
  });
});

describe('Services', () => {
  it('Services page renders no dollar amount', () => {
    const { container } = render(
      <MemoryRouter>
        <Services />
      </MemoryRouter>,
    );
    const text = container.textContent ?? '';
    expect(text).not.toMatch(/\$\s?\d/);
    for (const service of services) expect(text).not.toContain(String(service.startingPrice));
    expect(screen.getAllByRole('link', { name: /Reserve a slot/ })).toHaveLength(services.length);
  });

  it('leads with the two flagships, each with tagline, summary, scope and the terms line, and keeps the other seven as they were', () => {
    const { container } = render(
      <MemoryRouter>
        <Services />
      </MemoryRouter>,
    );
    const terms = 'Timeline and deposit set per project, after scoping.';
    const cards = Array.from(container.querySelectorAll('article[data-service]'));
    expect(cards.map((c) => c.getAttribute('data-service')).slice(0, 2)).toEqual(['immersive-web-experiences', 'intelligent-ai-systems']);
    expect(cards).toHaveLength(9);
    for (const slug of ['immersive-web-experiences', 'intelligent-ai-systems']) {
      const service = services.find((s) => s.slug === slug);
      if (!service || !service.tagline || !service.terms) throw new Error(slug);
      const card = /** @type {HTMLElement} */ (container.querySelector(`[data-service="${slug}"]`));
      expect(card.textContent).toContain(service.tagline);
      expect(card.textContent).toContain(service.summary);
      for (const item of service.scope) expect(card.textContent).toContain(item);
      expect(card.textContent).toContain(terms);
      expect(card.textContent).not.toContain('·');
      const children = Array.from(/** @type {HTMLElement} */ (card.querySelector('h2')).parentElement?.children ?? []);
      const order = children.map((c) => c.textContent);
      expect(order.indexOf(service.tagline)).toBe(order.indexOf(service.name) + 1);
      expect(order.indexOf(service.summary)).toBe(order.indexOf(service.tagline) + 1);
    }
    expect(cards.slice(2).map((c) => c.getAttribute('data-service'))).toEqual([
      'custom-saas-builds', 'mvp-sprints', 'ai-integration', 'technical-audits', 'acquisition-readiness', 'custom-web-development', 'ui-ux-design',
    ]);
    for (const card of cards.slice(2)) {
      const service = services.find((s) => s.slug === card.getAttribute('data-service'));
      expect(card.textContent).toContain(`${service?.timeline} · ${service?.deposit}`);
    }
    expect(container.textContent).not.toMatch(/\$/);
  });

  it('the meta description names both flagships, stays under 160 characters and shows no price', () => {
    render(
      <MemoryRouter>
        <Services />
      </MemoryRouter>,
    );
    const description = document.querySelector('meta[name="description"]')?.getAttribute('content') ?? '';
    expect(description).toMatch(/immersive web experiences/i);
    expect(description).toMatch(/intelligent ai systems/i);
    expect(description.length).toBeLessThan(160);
    expect(description).not.toMatch(/\$/);
  });

  it('the footer lists the two flagships first', () => {
    render(
      <MemoryRouter>
        <Footer />
      </MemoryRouter>,
    );
    const heading = screen.getByText('Services', { selector: 'p' });
    const names = Array.from(heading.parentElement?.querySelectorAll('li') ?? []).map((li) => (li.textContent ?? '').trim());
    expect(names.slice(0, 3)).toEqual(['Immersive Web Experiences', 'Intelligent AI Systems', 'Custom SaaS Builds']);
    expect(names).toHaveLength(9);
  });

  it('llms.txt lists both flagships first, with their summaries and the terms line, and no price', () => {
    const text = readFileSync(join(process.cwd(), 'public/llms.txt'), 'utf8');
    const lines = text.split(/\r?\n/);
    const intro = lines.find((l) => l.startsWith('> ')) ?? '';
    expect(intro).toContain('Immersive web experiences, intelligent AI systems, custom SaaS builds');
    expect(intro).not.toMatch(/\$/);
    const start = lines.indexOf('## Services');
    const [first, second] = lines.slice(start + 1, start + 3);
    for (const [line, slug] of [[first, 'immersive-web-experiences'], [second, 'intelligent-ai-systems']]) {
      const service = services.find((s) => s.slug === slug);
      if (!service) throw new Error(slug);
      expect(line).toBe(`- [${service.name}](https://www.allencodeco.com/services): ${service.summary} Timeline and deposit set per project, after scoping.`);
      expect(line).not.toMatch(/\$|Typical timeline/);
    }
    expect(lines[start + 3]).toContain('[Custom SaaS Builds]');
  });

  it('the headline promises no prices it does not show (Chris, 2026-11-26)', () => {
    render(
      <MemoryRouter>
        <Services />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 1, name: 'Custom work, scoped upfront.' })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/priced upfront/i);
  });
});

describe('About', () => {
  it('keeps the timeline and the photo, without data-aiwp-slot', () => {
    const { container } = render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Fifteen years in professional kitchens' })).toBeInTheDocument();
    expect(screen.getByRole('img', { name: 'Chris Allen, founder of Allen Code Co.' })).toBeInTheDocument();
    expect(container.querySelector('[data-aiwp-slot]')).toBeNull();
  });

  it('counts the products as products.js does: three live, one in the works (Chris, 2026-11-26)', () => {
    render(
      <MemoryRouter>
        <About />
      </MemoryRouter>,
    );
    expect(screen.getByRole('heading', { level: 3, name: 'Three live products, a fourth in the works, and a growing client roster' })).toBeInTheDocument();
    expect(document.body.textContent).not.toMatch(/Four live products/);
    expect(catalog.filter((product) => product.status === 'live')).toHaveLength(3);
  });
});

describe('CustomCursor', () => {
  it('is a small dot that sits exactly on the pointer and becomes a thin ring over links', async () => {
    vi.stubGlobal('matchMedia', (/** @type {string} */ query) => ({
      matches: query === '(pointer: fine)',
      media: query,
      addEventListener() {},
      removeEventListener() {},
    }));
    render(
      <>
        <CustomCursor />
        <a href="/x">link</a>
      </>,
    );
    await act(async () => {
      await new Promise((resolve) => requestAnimationFrame(() => resolve(undefined)));
    });
    const dot = /** @type {HTMLElement} */ (document.querySelector('[data-cursor-dot]'));
    const shape = /** @type {HTMLElement} */ (dot.firstElementChild);
    expect(shape.style.width).toBe(`${CURSOR_DOT}px`);
    fireEvent.mouseMove(window, { clientX: 120, clientY: 80 });
    expect(dot.style.transform).toBe('translate3d(120px, 80px, 0px)');
    act(() => {
      fireEvent.mouseOver(screen.getByRole('link', { name: 'link' }));
    });
    expect(shape.style.width).toBe(`${CURSOR_RING}px`);
    expect(CURSOR_RING).toBeLessThan(30);
    expect(document.body).toHaveClass('custom-cursor');
  });
});
