// @ts-check
import { readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import HowIWork from '../src/components/HowIWork.jsx';
import Builder, { BUILDER } from '../src/scenes/Builder.jsx';
import { excerpts } from '../src/content/excerpts/index.js';

describe('How I work', () => {
  it('the three principles render with their existing titles, as a changelog in order', () => {
    render(<HowIWork />);
    expect(screen.getByRole('heading', { level: 2, name: 'Three rules that never bend.' })).toBeInTheDocument();
    const items = within(screen.getByRole('list')).getAllByRole('listitem');
    expect(items.map((item) => within(item).getByRole('heading', { level: 3 }).textContent)).toEqual([
      'Solo, on purpose',
      'Precision over speed-hacking',
      'Acquisition-ready from day one',
    ]);
    expect(items[0]).toHaveTextContent('01');
    expect(items[2]).toHaveTextContent('a product built to be sold has to survive scrutiny from the first commit, not the last.');
  });
});

describe('The builder', () => {
  const renderBuilder = () =>
    render(
      <MemoryRouter>
        <Builder />
      </MemoryRouter>,
    );

  it('the builder photo has alt text and no data-aiwp-slot', () => {
    const { container } = renderBuilder();
    const photo = screen.getByRole('img', { name: 'Chris Allen, founder of Allen Code Co.' });
    expect(photo).toHaveAttribute('src', '/media/builder/chris-allen.jpg');
    expect(photo).toHaveAttribute('loading', 'lazy');
    expect(container.querySelector('[data-aiwp-slot]')).toBeNull();
  });

  it('tells the story in the existing words and links to the full story', () => {
    renderBuilder();
    expect(screen.getByRole('heading', { level: 2, name: BUILDER.title })).toBeInTheDocument();
    expect(screen.getByText(/nothing leaves the pass unless it's right/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Read the full story/ })).toHaveAttribute('href', '/about');
  });

  it('without the renderer, the code of his story sits beside the photo once Chris approves it, and never before', () => {
    renderBuilder();
    const code = document.querySelector('[data-chapter="builder"] pre');
    if (excerpts.builder.approved) {
      expect(code?.textContent).toBe(excerpts.builder.code);
      expect(screen.getByText('About.jsx')).toBeInTheDocument();
    } else {
      expect(code).toBeNull();
      expect(screen.getByRole('img', { name: BUILDER.photo.alt })).toBeInTheDocument();
    }
  });

  it('the portrait is a 4:5 JPEG of at most 150 KB, so the characters land on it quickly', () => {
    const file = join(process.cwd(), 'public', BUILDER.photo.src);
    expect(statSync(file).size).toBeLessThanOrEqual(150 * 1024);
    const bytes = readFileSync(file);
    expect(bytes[0]).toBe(0xff);
    expect(bytes[1]).toBe(0xd8);
    expect(BUILDER.photo.width / BUILDER.photo.height).toBeCloseTo(0.8);
  });
});
