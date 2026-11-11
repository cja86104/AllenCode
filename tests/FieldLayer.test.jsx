// @ts-check
import { afterEach, describe, expect, it } from 'vitest';
import { act, render } from '@testing-library/react';
import FieldLayer from '../src/field/FieldLayer.jsx';
import { fieldBus } from '../src/field/fieldBus.js';
import ambient from '../src/content/excerpts/ambient.js';

/** @param {HTMLElement} container */
const texture = (container) => /** @type {HTMLElement | null} */ (container.querySelector('[data-field="css"]'));

afterEach(() => {
  act(() => fieldBus.set({ mode: 'pending' }));
});

describe('FieldLayer: one texture from the first paint to the renderer (Task 9.3b)', () => {
  it('draws the approved ambient excerpt from the first render, before the renderer loads', () => {
    expect(ambient.approved).not.toBeNull();
    const { container } = render(<FieldLayer />);
    const pre = texture(container)?.querySelector('pre');
    expect(pre?.textContent).toContain(ambient.code.split('\n')[0]);
  });

  it('keeps the same texture element while the renderer draws (hidden) and after it falls back (shown)', () => {
    const { container } = render(<FieldLayer />);
    const first = texture(container);
    expect(first).not.toBeNull();
    expect(first?.style.visibility).not.toBe('hidden');

    act(() => fieldBus.set({ mode: 'webgl' }));
    expect(texture(container)).toBe(first);
    expect(first?.style.visibility).toBe('hidden');

    act(() => fieldBus.set({ mode: 'static' }));
    expect(texture(container)).toBe(first);
    expect(first?.style.visibility).not.toBe('hidden');
  });
});
