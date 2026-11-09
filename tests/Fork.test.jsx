// @ts-check
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { act, fireEvent, render, screen } from '@testing-library/react';
import DoorProvider from '../src/door/DoorProvider.jsx';
import Fork, { DOORS, OPEN_MS } from '../src/door/Fork.jsx';
import { fieldBus } from '../src/field/fieldBus.js';
import { setGlider } from '../src/scroll/glide.js';

const A = "I'm building a product or business";
const B = 'I want a site for me or my family';

beforeEach(() => {
  vi.useFakeTimers();
});

afterEach(() => {
  vi.useRealTimers();
  setGlider(null);
  window.sessionStorage.clear();
  fieldBus.set({ door: null, intensity: 1 });
  document.body.innerHTML = '';
});

const renderFork = () =>
  render(
    <DoorProvider>
      <Fork />
      <section data-chapter="mvp-sprints" />
      <section data-door-b-intro />
    </DoorProvider>,
  );

/** @param {number} ms */
const advance = (ms) =>
  act(() => {
    vi.advanceTimersByTime(ms);
  });

describe('Fork', () => {
  it('offers both doors as files to open in a labeled group, neither chosen yet', () => {
    renderFork();
    expect(screen.getByRole('group', { name: 'What brings you here?' })).toBeInTheDocument();
    for (const option of DOORS) {
      const card = screen.getByRole('button', { name: option.label });
      expect(card).toHaveAttribute('aria-pressed', 'false');
      expect(card).toHaveTextContent(option.file);
      expect(card).toHaveAccessibleDescription(option.promise);
    }
    expect(DOORS.map((option) => option.file)).toEqual(['business/', 'family/']);
  });

  it('choosing a door marks it pressed, records it and opens its file', () => {
    renderFork();
    fireEvent.click(screen.getByRole('button', { name: B }));
    const chosen = screen.getByRole('button', { name: B });
    expect(chosen).toHaveAttribute('aria-pressed', 'true');
    expect(chosen).toHaveAttribute('data-opening', 'true');
    expect(chosen).toHaveTextContent('opening family/');
    expect(fieldBus.get().door).toBe('b');
  });

  it('the code field flares when a file opens and settles back', () => {
    renderFork();
    fireEvent.click(screen.getByRole('button', { name: A }));
    advance(200);
    expect(fieldBus.get().intensity).toBeGreaterThan(1.5);
    advance(OPEN_MS + 3000);
    expect(fieldBus.get().intensity).toBe(1);
  });

  it('once the file is open the page glides to that door’s first chapter', () => {
    const glider = vi.fn();
    setGlider(glider);
    renderFork();
    fireEvent.click(screen.getByRole('button', { name: A }));
    advance(OPEN_MS - 50);
    expect(glider).not.toHaveBeenCalled();
    advance(100);
    expect(glider).toHaveBeenCalledTimes(1);
    expect(typeof glider.mock.calls[0][0]).toBe('number');
  });

  it('after the glide both files are back, the chosen one pressed, so the door can be changed', () => {
    renderFork();
    fireEvent.click(screen.getByRole('button', { name: B }));
    advance(OPEN_MS + 3000);
    expect(screen.getByRole('button', { name: B })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: B })).not.toHaveAttribute('data-opening');
    expect(screen.getByRole('button', { name: A })).toHaveAttribute('aria-pressed', 'false');
  });
});
