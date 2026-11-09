// @ts-check
import { afterEach, describe, expect, it } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import DoorProvider from '../src/door/DoorProvider.jsx';
import Fork from '../src/door/Fork.jsx';
import { fieldBus } from '../src/field/fieldBus.js';

afterEach(() => {
  window.sessionStorage.clear();
  fieldBus.set({ door: null });
});

const renderFork = () =>
  render(
    <DoorProvider>
      <Fork />
    </DoorProvider>,
  );

describe('Fork', () => {
  it('offers both doors as buttons in a labeled group, neither chosen yet', () => {
    renderFork();
    expect(screen.getByRole('group', { name: 'What brings you here?' })).toBeInTheDocument();
    const a = screen.getByRole('button', { name: "I'm building a product or business" });
    const b = screen.getByRole('button', { name: 'I want a site for me or my family' });
    expect(a).toHaveAttribute('aria-pressed', 'false');
    expect(b).toHaveAttribute('aria-pressed', 'false');
  });

  it('choosing a door marks it pressed and records it', () => {
    renderFork();
    fireEvent.click(screen.getByRole('button', { name: 'I want a site for me or my family' }));
    expect(screen.getByRole('button', { name: 'I want a site for me or my family' })).toHaveAttribute('aria-pressed', 'true');
    expect(screen.getByRole('button', { name: "I'm building a product or business" })).toHaveAttribute('aria-pressed', 'false');
    expect(fieldBus.get().door).toBe('b');
  });
});
