// @ts-check
import { afterEach, describe, expect, it } from 'vitest';
import { cleanup, render, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { fieldBus } from '../src/field/fieldBus.js';
import { ProductChapterFor } from '../src/scenes/ProductChapter.jsx';
import DoorBIntro from '../src/scenes/DoorBIntro.jsx';
import Builder from '../src/scenes/Builder.jsx';
import TemplateChapter from '../src/scenes/TemplateChapter.jsx';
import { products } from '../src/data/products.js';

afterEach(() => {
  cleanup();
  fieldBus.set({ mode: 'pending', transform: null });
});

const live = products.filter((p) => p.status === 'live');

/** @param {import('react').ReactElement} ui */
const inRouter = (ui) => render(<MemoryRouter>{ui}</MemoryRouter>);

/** @type {Array<[string, () => import('react').ReactElement, string]>} */
const CASES = [
  ...live.map((p) => /** @type {[string, () => import('react').ReactElement, string]} */ ([`product ${p.slug}`, () => <ProductChapterFor product={p} includeDrafts={false} layers />, `[data-product="${p.slug}"]`])),
  ['door B’s opening', () => <DoorBIntro includeDrafts={false} layers />, '[data-door-b-intro]'],
  ['the builder', () => <Builder layers />, '[data-chapter="builder"]'],
  ['the templates', () => <TemplateChapter includeDrafts={false} layers />, '[data-template-chapter]'],
];

describe('C’s stack in every code-to-screen chapter (Living Source Phase 4, Task 4)', () => {
  for (const [name, ui, selector] of CASES) {
    it(`${name}: pinned with the renderer, the stack and its steps, and no WebGL flight claimed`, async () => {
      fieldBus.set({ mode: 'webgl' });
      inRouter(ui());
      const chapter = /** @type {HTMLElement} */ (document.querySelector(selector));
      expect(chapter).toHaveAttribute('data-layer-chapter');
      expect(chapter.querySelector(':scope > .pin-frame')).not.toBeNull();
      expect(await within(chapter).findByRole('group', { name: 'Steps' })).toBeInTheDocument();
      expect(chapter.querySelector('[data-layer-stack]')).not.toBeNull();
      expect(fieldBus.get().transform).toBeNull();
    });

    it(`${name}: flat without the renderer, its code beside the stack`, async () => {
      inRouter(ui());
      const chapter = /** @type {HTMLElement} */ (document.querySelector(selector));
      expect(chapter).toHaveAttribute('data-layer-chapter');
      expect(chapter.querySelector(':scope > .pin-frame')).toBeNull();
      await within(chapter).findAllByRole('group', { name: 'Steps' });
      expect(chapter.querySelector('pre')).not.toBeNull();
    });
  }

  it('the templates keep naming their order for the path bar, one segment drawn at a time', async () => {
    fieldBus.set({ mode: 'webgl' });
    inRouter(<TemplateChapter includeDrafts={false} layers />);
    const chapter = /** @type {HTMLElement} */ (document.querySelector('[data-template-chapter]'));
    expect(chapter.getAttribute('data-template-order')?.split(' ').length).toBeGreaterThan(1);
    expect(chapter.querySelectorAll('[data-door-b-template]')).toHaveLength(1);
  });

  it('without layers (the world’s roads) the chapters keep today’s form', () => {
    inRouter(
      <>
        <ProductChapterFor product={live[0]} includeDrafts={false} />
        <DoorBIntro includeDrafts={false} />
        <Builder />
        <TemplateChapter includeDrafts={false} />
      </>,
    );
    expect(document.querySelector('[data-layer-chapter]')).toBeNull();
  });
});
