// @ts-check
import { render, screen, within } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import HowIWork from '../src/components/HowIWork.jsx';
import Builder, { BUILDER } from '../src/scenes/Builder.jsx';

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
    expect(photo).toHaveAttribute('src', '/chris-allen.png');
    expect(photo).toHaveAttribute('loading', 'lazy');
    expect(container.querySelector('[data-aiwp-slot]')).toBeNull();
  });

  it('tells the story in the existing words and links to the full story', () => {
    renderBuilder();
    expect(screen.getByRole('heading', { level: 2, name: BUILDER.title })).toBeInTheDocument();
    expect(screen.getByText(/nothing leaves the pass unless it's right/)).toBeInTheDocument();
    expect(screen.getByRole('link', { name: /Read the full story/ })).toHaveAttribute('href', '/about');
  });
});
