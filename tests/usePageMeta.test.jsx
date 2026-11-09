// @ts-check
import { describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import usePageMeta from '../src/hooks/usePageMeta.js';

const robots = () => document.head.querySelector('meta[name="robots"]');

describe('usePageMeta', () => {
  it('usePageMeta adds robots noindex and removes it on unmount', () => {
    const { unmount } = renderHook(() => usePageMeta('Title', 'Description', { noindex: true }), {
      wrapper: MemoryRouter,
    });
    expect(robots()?.getAttribute('content')).toBe('noindex, nofollow');
    unmount();
    expect(robots()).toBeNull();
  });

  it('adds no robots tag by default and still sets the title', () => {
    renderHook(() => usePageMeta('Plain page', 'Description'), { wrapper: MemoryRouter });
    expect(robots()).toBeNull();
    expect(document.title).toBe('Plain page');
  });
});
