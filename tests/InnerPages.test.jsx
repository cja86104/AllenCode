// @ts-check
import { act, fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, Route, Routes } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import ProductDetail from '../src/pages/ProductDetail.jsx';
import Products from '../src/pages/Products.jsx';
import Services from '../src/pages/Services.jsx';
import About from '../src/pages/About.jsx';
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

  it('the products page lists every product, its picture from the image field, without data-aiwp-slot', () => {
    const { container } = render(
      <MemoryRouter>
        <Products />
      </MemoryRouter>,
    );
    for (const product of catalog) {
      const card = /** @type {HTMLElement} */ (container.querySelector(`[data-product-card="${product.slug}"]`));
      expect(card.querySelector('img')).toHaveAttribute('src', product.image);
    }
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
