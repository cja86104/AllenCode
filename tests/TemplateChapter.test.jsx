// @ts-check
import { fireEvent, render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import Home from '../src/pages/Home.jsx';
import DoorProvider from '../src/door/DoorProvider.jsx';
import DoorBIntro from '../src/scenes/DoorBIntro.jsx';
import TemplateChapter, { DOOR_B_TEMPLATES, segmentTimeline } from '../src/scenes/TemplateChapter.jsx';
import { excerpts } from '../src/content/excerpts/index.js';

beforeEach(() => {
  window.sessionStorage.clear();
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

const renderHome = () =>
  render(
    <MemoryRouter initialEntries={['/']}>
      <DoorProvider>
        <Home />
      </DoorProvider>
    </MemoryRouter>,
  );

describe('Door B', () => {
  it('door b shows the template chapter and door a does not', () => {
    renderHome();
    fireEvent.click(screen.getByRole('button', { name: 'I want a site for me or my family' }));
    expect(document.querySelector('[data-door-b-intro]')).not.toBeNull();
    expect(document.querySelector('[data-template-chapter]')).not.toBeNull();
    expect(document.querySelector('[data-product]')).toBeNull();

    fireEvent.click(screen.getByRole('button', { name: "I'm building a product or business" }));
    expect(document.querySelector('[data-door-b-intro]')).toBeNull();
    expect(document.querySelector('[data-template-chapter]')).toBeNull();
    expect(document.querySelector('[data-product]')).not.toBeNull();
  });

  it('each template segment holds its code before flying, lands by 65 percent, then plays', () => {
    expect(segmentTimeline(0.1)).toEqual({ flight: 0, handoff: 0 });
    expect(segmentTimeline(0.4).flight).toBeCloseTo(0.5);
    expect(segmentTimeline(0.65)).toEqual({ flight: 1, handoff: 1 });
    expect(segmentTimeline(1)).toEqual({ flight: 1, handoff: 1 });
  });

  it('the Door B templates are the family, event and personal concepts other than Hearth', () => {
    expect(DOOR_B_TEMPLATES.map((t) => t.id)).toEqual(['evergreen', 'keepsake', 'vow', 'gather', 'folio']);
  });

  it("the intro shows Hearth's real code beside the Hearth poster", () => {
    render(
      <MemoryRouter>
        <DoorBIntro includeDrafts={false} />
      </MemoryRouter>,
    );
    const intro = /** @type {HTMLElement} */ (document.querySelector('[data-door-b-intro]'));
    expect(intro.querySelector('pre')?.textContent).toBe(excerpts['template-hearth'].code);
    expect(within(intro).getByRole('img', { name: /Hearth/ })).toHaveAttribute('src', '/media/templates/hearth.jpg');
    expect(intro.querySelector('video')).toHaveAttribute('src', '/media/templates/hearth.mp4');
  });

  it('each template compiles from its excerpt to its poster, then its loop', () => {
    render(
      <MemoryRouter>
        <TemplateChapter includeDrafts={false} />
      </MemoryRouter>,
    );
    for (const template of DOOR_B_TEMPLATES) {
      const item = /** @type {HTMLElement} */ (document.querySelector(`[data-door-b-template="${template.id}"]`));
      expect(item.querySelector('pre')?.textContent, template.id).toBe(excerpts[template.excerpt].code);
      expect(within(item).getByRole('img', { name: new RegExp(template.name.split(' — ')[0]) })).toHaveAttribute('src', template.poster);
      expect(item.querySelector('video'), template.id).toHaveAttribute('src', template.previewVideo);
      expect(within(item).getByRole('link', { name: /Ask about/ })).toHaveAttribute('href', `/contact?template=${template.id}`);
    }
    expect(screen.getByRole('link', { name: /See every template/ })).toHaveAttribute('href', '/templates');
  });

  it('no template chapter shows a price or a Buy button', () => {
    const { container } = render(
      <MemoryRouter>
        <DoorBIntro includeDrafts={false} />
        <TemplateChapter includeDrafts={false} />
      </MemoryRouter>,
    );
    expect(container.textContent).not.toMatch(/\$\s?\d/);
    expect(container.textContent).not.toMatch(/\bbuy\b/i);
  });
});
