// @ts-check
import { fireEvent, render, screen } from '@testing-library/react';
import { MemoryRouter, useLocation } from 'react-router-dom';
import { describe, expect, it } from 'vitest';
import IdeaSketch from '../src/scenes/IdeaSketch.jsx';
import { IDEA_CHAPTER } from '../src/content/visitorTurn.js';

/** Shows the current address so a test can read what the brief will pick up. */
function Address() {
  const { pathname, search } = useLocation();
  return <output data-testid="address">{`${pathname}${search}`}</output>;
}

const renderIdea = (entry = '/') =>
  render(
    <MemoryRouter initialEntries={[entry]}>
      <IdeaSketch />
      <Address />
    </MemoryRouter>,
  );

/** @param {string} text */
function submitIdea(text) {
  const input = screen.getByLabelText(IDEA_CHAPTER.label);
  fireEvent.change(input, { target: { value: text } });
  fireEvent.submit(input.closest('form') ?? input);
}

const editorText = () => document.querySelector('[data-idea-code]')?.textContent ?? '';

describe('IdeaSketch', () => {
  it('is a labeled form field that caps input at 120 characters', () => {
    renderIdea();
    const input = screen.getByLabelText(IDEA_CHAPTER.label);
    expect(input).toHaveAttribute('maxLength', '120');
    expect(screen.getByRole('button', { name: IDEA_CHAPTER.submit })).toHaveAttribute('type', 'submit');
  });

  it('works with no animation: submitting shows the line and lists the blocks it asked for', () => {
    renderIdea();
    submitIdea('a booking site for my bakery');
    expect(editorText()).toContain('booking site');
    const blocks = screen.getByRole('list', { name: IDEA_CHAPTER.sketchCaption });
    expect(blocks).toHaveTextContent('Booking calendar');
    expect(blocks).toHaveTextContent('Navigation');
    expect(blocks).toHaveTextContent('Call to action');
  });

  it('a line longer than 120 characters is cut to 120 when submitted', () => {
    renderIdea();
    submitIdea('b'.repeat(300));
    expect(editorText().replace(/\s/g, '')).toHaveLength(120);
  });

  it('pasted HTML renders as text', () => {
    const { container } = renderIdea();
    submitIdea('<img src=x onerror="alert(1)"><b>shop</b>');
    expect(container.querySelector('img')).toBeNull();
    expect(container.querySelector('b')).toBeNull();
    expect(editorText()).toContain('<img src=x');
  });

  it('emoji and other scripts are kept in the DOM', () => {
    renderIdea();
    submitIdea('café 🎂 for グランマ');
    expect(editorText()).toContain('café 🎂 for グランマ');
  });

  it('submitting carries the idea to the brief, in the address', () => {
    renderIdea();
    submitIdea('a menu for my diner');
    const address = new URL(screen.getByTestId('address').textContent ?? '', 'https://example.test');
    expect(address.pathname).toBe('/');
    expect(address.searchParams.get('idea')).toBe('a menu for my diner');
    expect(screen.getByRole('link', { name: IDEA_CHAPTER.carriedLink })).toHaveAttribute('href', '#brief');
  });

  it('an empty idea asks for a few words and changes nothing', () => {
    renderIdea();
    submitIdea('   ');
    expect(screen.getByRole('alert')).toHaveTextContent(IDEA_CHAPTER.empty);
    expect(screen.getByLabelText(IDEA_CHAPTER.label)).toHaveAttribute('aria-invalid', 'true');
    expect(screen.getByTestId('address')).toHaveTextContent(/^\/$/);
  });

  it('an idea already in the address is shown on arrival', () => {
    renderIdea('/?idea=wedding%20photos');
    expect(screen.getByLabelText(IDEA_CHAPTER.label)).toHaveValue('wedding photos');
    expect(screen.getByRole('list', { name: IDEA_CHAPTER.sketchCaption })).toHaveTextContent('Photo gallery');
  });
});
