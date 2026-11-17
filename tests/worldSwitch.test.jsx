// @ts-check
import { afterEach, describe, expect, it } from 'vitest';
import { act, renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WORLD_STORAGE_KEY, setPlainView, usePlainView, useWorldMode, worldModeFrom, worldPageFrom } from '../src/world/worldSwitch.js';

afterEach(() => window.sessionStorage.clear());

describe('the world switch (Code World W1.3; on by default since W6, Chris 2026-11-17: "Everyone now")', () => {
  it('is off until the page has hydrated, whatever the address says', () => {
    expect(worldModeFrom({ hydrated: false, flag: '1', stored: '1' })).toBe(false);
    expect(worldModeFrom({ hydrated: false, flag: null, stored: null })).toBe(false);
  });

  it('is on by default; ?world=0 turns it off, a visit that turned it off keeps it off, ?world=1 turns it back on', () => {
    expect(worldModeFrom({ hydrated: true, flag: null, stored: null })).toBe(true);
    expect(worldModeFrom({ hydrated: true, flag: null, stored: '1' })).toBe(true);
    expect(worldModeFrom({ hydrated: true, flag: '0', stored: null })).toBe(false);
    expect(worldModeFrom({ hydrated: true, flag: null, stored: '0' })).toBe(false);
    expect(worldModeFrom({ hydrated: true, flag: '1', stored: '0' })).toBe(true);
  });

  it('remembers ?world=0 and ?world=1 for the visit', () => {
    const at = (/** @type {string} */ path) => renderHook(() => useWorldMode(), { wrapper: ({ children }) => <MemoryRouter initialEntries={[path]}>{children}</MemoryRouter> });
    at('/?world=0');
    expect(window.sessionStorage.getItem(WORLD_STORAGE_KEY)).toBe('0');
    expect(at('/about').result.current).toBe(false);
    at('/?world=1');
    expect(window.sessionStorage.getItem(WORLD_STORAGE_KEY)).toBe('1');
    expect(at('/about').result.current).toBe(true);
  });

  it('the plain-view toggle turns it off and on at once, for the visit', () => {
    const { result } = renderHook(() => ({ on: useWorldMode(), plain: usePlainView() }), { wrapper: ({ children }) => <MemoryRouter initialEntries={['/about']}>{children}</MemoryRouter> });
    expect(result.current).toEqual({ on: true, plain: false });
    act(() => setPlainView(true));
    expect(result.current).toEqual({ on: false, plain: true });
    expect(window.sessionStorage.getItem(WORLD_STORAGE_KEY)).toBe('0');
    act(() => setPlainView(false));
    expect(result.current).toEqual({ on: true, plain: false });
    expect(window.sessionStorage.getItem(WORLD_STORAGE_KEY)).toBe('1');
  });
});

describe('which pages the world draws (Code World W5a)', () => {
  it('the home page’s journey, and a stretch on every inner page that has one; nothing when off', () => {
    expect(worldPageFrom({ on: true, pathname: '/' })).toBe('home');
    for (const path of ['/products', '/products/', '/products/underfire-ai', '/products/crew-advisors', '/services', '/templates', '/about', '/contact']) {
      expect(worldPageFrom({ on: true, pathname: path }), path).toBe('stretch');
      expect(worldPageFrom({ on: false, pathname: path }), path).toBeNull();
    }
    expect(worldPageFrom({ on: false, pathname: '/' })).toBeNull();
  });

  it('none on checkout success, an unknown page, an unknown product or the lab', () => {
    for (const path of ['/checkout-success', '/nope', '/products/nope', '/products/underfire-ai/more', '/lab/world']) {
      expect(worldPageFrom({ on: true, pathname: path }), path).toBeNull();
    }
  });
});
