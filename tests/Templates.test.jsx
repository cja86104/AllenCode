// @ts-check
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Templates from '../src/pages/Templates.jsx';
import Contact from '../src/pages/Contact.jsx';
import { templates } from '../src/data/templates.js';

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

const renderTemplates = () =>
  render(
    <MemoryRouter>
      <Templates />
    </MemoryRouter>,
  );

describe('Templates page', () => {
  it('no template shows a price or a Buy button', () => {
    const { container } = renderTemplates();
    expect(container.textContent).not.toMatch(/\$\s?\d/);
    expect(screen.queryByRole('button', { name: /buy/i })).toBeNull();
    expect(screen.queryByRole('link', { name: /buy/i })).toBeNull();
    expect(container.textContent).not.toMatch(/buy now|buy once/i);
  });

  it('every template links to /contact?template=<id>', () => {
    renderTemplates();
    const links = screen.getAllByRole('link', { name: /Ask about/ });
    expect(links.map((a) => a.getAttribute('href'))).toEqual(templates.map((t) => `/contact?template=${t.id}`));
  });

  it('concept templates say Concept preview, coming soon', () => {
    renderTemplates();
    for (const template of templates.filter((t) => t.status === 'concept')) {
      const card = /** @type {HTMLElement} */ (document.querySelector(`[data-template="${template.id}"]`));
      expect(within(card).getByText('Concept preview, coming soon')).toBeInTheDocument();
    }
  });

  it('each card shows its poster with alt text and a muted loop, and no slot attribute remains', () => {
    const { container } = renderTemplates();
    for (const template of templates) {
      const card = /** @type {HTMLElement} */ (container.querySelector(`[data-template="${template.id}"]`));
      expect(within(card).getByRole('img', { name: new RegExp(template.name.split(' — ')[0]) })).toHaveAttribute('src', template.poster);
      expect(card.querySelector('video')).toHaveAttribute('src', template.previewVideo);
    }
    expect(container.querySelector('[data-aiwp-slot]')).toBeNull();
  });

  it('lists the new categories as filters', () => {
    renderTemplates();
    for (const category of ['Family and Memories', 'Events', 'Personal and Creative']) {
      expect(screen.getByRole('button', { name: category })).toBeInTheDocument();
    }
  });
});

describe('Contact page', () => {
  it('Contact prefills the message from the template query parameter', () => {
    render(
      <MemoryRouter initialEntries={['/contact?template=hearth']}>
        <Contact />
      </MemoryRouter>,
    );
    const message = /** @type {HTMLTextAreaElement} */ (screen.getByRole('textbox', { name: /What are you building/ }));
    expect(message.value).toContain('Hearth — Family Home Page');
    expect(/** @type {HTMLSelectElement} */ (screen.getByRole('combobox', { name: /Project type/ })).value).toBe('Website from a template');
  });

  it('an unknown or missing template leaves the form empty', () => {
    render(
      <MemoryRouter initialEntries={['/contact?template=not-a-template']}>
        <Contact />
      </MemoryRouter>,
    );
    const message = /** @type {HTMLTextAreaElement} */ (screen.getByRole('textbox', { name: /What are you building/ }));
    expect(message.value).toBe('');
  });
});
