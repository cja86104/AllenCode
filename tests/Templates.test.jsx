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

  it('a built template says Ready to build, names its own folder, and is not called a concept', () => {
    renderTemplates();
    const card = /** @type {HTMLElement} */ (document.querySelector('[data-template="evergreen"]'));
    expect(within(card).getByText('Ready to build')).toBeInTheDocument();
    expect(within(card).queryByText('Concept preview, coming soon')).toBeNull();
    expect(within(card).getByText('evergreen/')).toBeInTheDocument();
    expect(within(card).getByRole('img', { name: 'Evergreen, a preview of the family and memories template' })).toBeInTheDocument();
  });

  it('Copper Thistle is ready, under Restaurant, with a live demo link that opens in a new tab', () => {
    renderTemplates();
    const card = /** @type {HTMLElement} */ (document.querySelector('[data-template="copper-thistle"]'));
    expect(within(card).getByText('Restaurant')).toBeInTheDocument();
    expect(within(card).getByText('Ready to build')).toBeInTheDocument();
    expect(within(card).getByText('copper-thistle/')).toBeInTheDocument();
    const demo = within(card).getByRole('link', { name: 'See the live demo (opens in a new tab)' });
    expect(demo).toHaveAttribute('href', 'https://copper-thistle.vercel.app/');
    expect(demo).toHaveAttribute('target', '_blank');
    expect(demo).toHaveAttribute('rel', 'noopener noreferrer');
  });

  it('only a template with a hosted demo offers one, and Launchpad is gone', () => {
    renderTemplates();
    expect(screen.getAllByRole('link', { name: /See the live demo/ })).toHaveLength(1);
    expect(document.querySelector('[data-template="launchpad"]')).toBeNull();
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
