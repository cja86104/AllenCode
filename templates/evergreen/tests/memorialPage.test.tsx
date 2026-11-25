import { screen, within } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { memorial } from '../src/content/memorial';
import type { Memorial } from '../src/content/types';
import { renderMemorial } from './render';

const clone = (): Memorial => structuredClone(memorial);
const TODAY = Date.parse('2026-11-24T17:00:00Z');
const BEFORE_SERVICE = Date.parse('2026-09-28T17:00:00Z');

describe('the main memorial', () => {
  beforeEach(() => {
    vi.useFakeTimers({ toFake: ['Date'] });
    vi.setSystemTime(TODAY);
  });
  afterEach(() => {
    vi.useRealTimers();
  });

  it('opens with the name as the only top-level heading, the dates and the place', () => {
    renderMemorial(memorial, { renderedAt: TODAY });
    const headings = screen.getAllByRole('heading', { level: 1 });
    expect(headings).toHaveLength(1);
    expect(headings[0]).toHaveTextContent('Eleanor “Nell” Whitaker');
    expect(screen.getByText('May 12, 1946')).toHaveAttribute('datetime', '1946-05-12');
    expect(screen.getByText('September 18, 2026')).toHaveAttribute('datetime', '2026-09-18');
    expect(screen.getByText('Asheville, North Carolina')).toBeInTheDocument();
    expect(screen.getByRole('link', { name: 'Explore her life' })).toHaveAttribute('href', '#life');
  });

  it('prioritises the portrait and lazy-loads the rest, with responsive sources and true alt text', () => {
    renderMemorial(memorial, { renderedAt: TODAY });
    const images = screen.getAllByRole('img').filter((element) => element.tagName === 'IMG');
    const [portrait, ...rest] = images;
    expect(portrait).toHaveAttribute('loading', 'eager');
    expect(portrait).toHaveAttribute('fetchpriority', 'high');
    expect(portrait?.getAttribute('alt')).toMatch(/^Nell in a brown sweater sitting out on the porch/);
    expect(portrait?.getAttribute('srcset')).toMatch(/ 600w, .* 1200w$/);
    expect(rest.length).toBeGreaterThan(0);
    for (const image of rest) {
      expect(image).toHaveAttribute('loading', 'lazy');
      expect(image).toHaveAttribute('width');
      expect(image).toHaveAttribute('height');
    }
  });

  it('says so when a photograph is still a placeholder', () => {
    const content = structuredClone(memorial);
    const portrait = content.photos.items.find((item) => item.id === content.opening.portraitId);
    if (!portrait) throw new Error('fixture');
    portrait.placeholder = true;
    renderMemorial(content, { renderedAt: TODAY });
    const [image] = screen.getAllByRole('img').filter((element) => element.tagName === 'IMG');
    expect(image?.getAttribute('alt')).toMatch(/^Photo placeholder\. The family’s photograph will show: Nell in a brown sweater/);
  });

  it('links every navigation item to a section that exists', () => {
    const { container } = renderMemorial(memorial, { renderedAt: TODAY });
    const nav = screen.getByRole('navigation', { name: 'Main' });
    const links = within(nav)
      .getAllByRole('link')
      .filter((link) => (link.getAttribute('href') ?? '').includes('#'));
    expect(links.map((link) => link.textContent)).toEqual(['Her life', 'Photographs', 'Gathering', 'Memories']);
    expect(within(nav).getByRole('link', { name: 'Share a memory' })).toHaveAttribute('href', '/share');
    for (const link of links) {
      const id = (link.getAttribute('href') ?? '').split('#')[1] ?? '';
      expect(container.querySelector(`#${id}`)).not.toBeNull();
    }
  });

  it('opens the stories of remembered objects in place', async () => {
    vi.useRealTimers();
    renderMemorial(memorial);
    const summary = screen.getByText(
      (_, element) => element?.tagName === 'SUMMARY' && element.textContent === 'Read the story of the blue recipe tin',
    );
    const details = summary?.parentElement;
    expect(details).not.toHaveAttribute('open');
    if (!summary) throw new Error('missing summary');
    await userEvent.click(summary);
    expect(details).toHaveAttribute('open');
  });

  it('shows the past service by default, and never as upcoming', () => {
    renderMemorial(memorial, { renderedAt: TODAY });
    const section = screen.getByRole('region', { name: 'Gathering to remember Nell.' });
    expect(within(section).getByText('Took place')).toBeInTheDocument();
    expect(within(section).getByText('Saturday, October 3, 2026')).toBeInTheDocument();
    expect(within(section).queryByRole('link', { name: 'Add to calendar' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Service details' })).toBeNull();
  });

  it('shows the upcoming service with a calendar download, and no RSVP, livestream or map that were not configured', () => {
    renderMemorial(memorial, { renderedAt: BEFORE_SERVICE, servicePreview: 'upcoming' });
    const section = screen.getByRole('region', { name: 'Gathering to remember Nell.' });
    expect(within(section).getByText('2:00 p.m. Eastern Time')).toBeInTheDocument();
    expect(within(section).getByRole('link', { name: 'Add to calendar' })).toHaveAttribute('download', 'celebration-of-life.ics');
    expect(within(section).queryByRole('link', { name: /RSVP/i })).toBeNull();
    expect(within(section).queryByRole('link', { name: /livestream|watch/i })).toBeNull();
    expect(within(section).queryByRole('link', { name: /map/i })).toBeNull();
    expect(screen.getByRole('link', { name: 'Service details' })).toHaveAttribute('href', '#gathering');
  });

  it('hides time and place when details are private', () => {
    renderMemorial(memorial, { renderedAt: BEFORE_SERVICE, servicePreview: 'private' });
    const section = screen.getByRole('region', { name: 'Gathering to remember Nell.' });
    expect(within(section).getByText('The family will share details of the gathering directly with those invited.')).toBeInTheDocument();
    expect(within(section).queryByText(/October 3/)).toBeNull();
  });

  it('marks the family-pinned memory and opens long memories in place', () => {
    renderMemorial(memorial, { renderedAt: TODAY });
    const section = screen.getByRole('region', { name: 'What we carry with us.' });
    const items = within(section).getAllByRole('listitem');
    expect(within(items[0] as HTMLElement).getByText('Pinned by the family')).toBeInTheDocument();
    expect(within(section).getAllByText('Pinned by the family')).toHaveLength(1);
    expect(within(section).getAllByText('Keep reading').length).toBeGreaterThan(0);
  });

  it('shows the recipe card beside a typed transcription', () => {
    renderMemorial(memorial, { renderedAt: TODAY });
    const section = screen.getByRole('region', { name: 'Tomato pie' });
    expect(within(section).getByText('375° until it looks right.')).toBeInTheDocument();
    expect(within(section).getByRole('heading', { name: 'Ingredients' })).toBeInTheDocument();
    expect(within(section).getByRole('heading', { name: 'Method' })).toBeInTheDocument();
  });

  it('closes with the family note and the template credit, and a single demonstration note', () => {
    renderMemorial(memorial, { renderedAt: TODAY });
    const note = screen.getByText(
      (_, element) =>
        element?.tagName === 'P' && element.textContent === 'Thank you for remembering Nell with us. Keep telling the stories.',
    );
    expect(note.querySelectorAll('.closing__sentence')).toHaveLength(2);
    expect(screen.getByRole('link', { name: 'Evergreen by Allen Code Co.' })).toHaveAttribute('href', 'https://allencodeco.com');
    expect(screen.getAllByText(/Template preview\./)).toHaveLength(1);
  });
});

describe('content a family has not supplied', () => {
  it('closes up the opening without a portrait', () => {
    const content = clone();
    delete content.opening.portraitId;
    const { container } = renderMemorial(content);
    expect(container.querySelector('.opening')).toHaveClass('opening--no-portrait');
    expect(container.querySelector('.opening__portrait')).toBeNull();
  });

  it('leaves dates out when they are unknown or the family hides them', () => {
    const content = clone();
    delete content.person.born;
    renderMemorial(content);
    expect(screen.queryByText('May 12, 1946')).toBeNull();
    expect(screen.getByText('September 18, 2026')).toBeInTheDocument();

    const hidden = clone();
    hidden.person.showDates = false;
    const { container } = renderMemorial(hidden);
    expect(container.querySelectorAll('.opening__dates')).toHaveLength(0);
  });

  it('says plainly that no memories have been shared yet', () => {
    const content = clone();
    content.memories.items = [];
    renderMemorial(content);
    expect(screen.getByText('No memories have been shared here yet.')).toBeInTheDocument();
  });

  it('removes the memories section when the family is not accepting any and has none', () => {
    const content = clone();
    content.memories.items = [];
    content.privacy.acceptMemories = false;
    renderMemorial(content);
    expect(screen.queryByRole('region', { name: 'What we carry with us.' })).toBeNull();
    expect(screen.queryByRole('link', { name: 'Memories' })).toBeNull();
  });

  it('leaves disabled modules out entirely', () => {
    const content = clone();
    if (!content.modules.recipe) throw new Error('fixture');
    content.modules.recipe.enabled = false;
    renderMemorial(content);
    expect(screen.queryByRole('region', { name: 'Tomato pie' })).toBeNull();
  });

  it('renders contributor text as text, never as HTML', () => {
    const content = clone();
    content.memories.items = [
      { id: 'x', author: '<img src=x onerror=alert(1)>', text: ['<script>alert(1)</script>'], sharedOn: '2026-10-10' },
    ];
    const { container } = renderMemorial(content);
    expect(container.querySelector('script')).toBeNull();
    expect(container.querySelector('img[src="x"]')).toBeNull();
    expect(screen.getByText('<script>alert(1)</script>', { exact: false })).toBeInTheDocument();
  });

  it('renders a very long name and a very short biography without losing the page', () => {
    const content = clone();
    content.person.fullName = 'Maria Guadalupe Fernández-Castellanos de la Torre Whitaker-Montgomery';
    delete content.person.nameLines;
    content.life.intro = [];
    content.life.chapters = content.life.chapters.slice(0, 1);
    renderMemorial(content);
    expect(screen.getByRole('heading', { level: 1 })).toHaveTextContent(content.person.fullName);
    expect(screen.getAllByRole('article').length).toBeGreaterThan(0);
  });
});

describe('printing', () => {
  it('opens every collapsed story while printing and restores them afterwards', () => {
    renderMemorial(memorial);
    const closed = [...document.querySelectorAll('details')];
    expect(closed.length).toBeGreaterThan(0);
    expect(closed.every((details) => !details.open)).toBe(true);
    window.dispatchEvent(new Event('beforeprint'));
    expect(closed.every((details) => details.open)).toBe(true);
    window.dispatchEvent(new Event('afterprint'));
    expect(closed.every((details) => !details.open)).toBe(true);
  });
});
