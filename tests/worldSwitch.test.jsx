// @ts-check
import { afterEach, describe, expect, it } from 'vitest';
import { renderHook } from '@testing-library/react';
import { MemoryRouter } from 'react-router-dom';
import { WORLD_STORAGE_KEY, useWorldMode, worldModeFrom } from '../src/world/worldSwitch.js';

afterEach(() => window.sessionStorage.clear());

describe('the world switch (Code World W1.3)', () => {
  it('is off until the page has hydrated, whatever the address says', () => {
    expect(worldModeFrom({ hydrated: false, flag: '1', stored: '1' })).toBe(false);
  });

  it('?world=1 turns it on, ?world=0 turns it off, and otherwise the session remembers', () => {
    expect(worldModeFrom({ hydrated: true, flag: '1', stored: null })).toBe(true);
    expect(worldModeFrom({ hydrated: true, flag: '0', stored: '1' })).toBe(false);
    expect(worldModeFrom({ hydrated: true, flag: null, stored: '1' })).toBe(true);
    expect(worldModeFrom({ hydrated: true, flag: null, stored: null })).toBe(false);
  });

  it('remembers ?world=1 for the session, and forgets it with ?world=0', () => {
    renderHook(() => useWorldMode(), { wrapper: ({ children }) => <MemoryRouter initialEntries={['/?world=1']}>{children}</MemoryRouter> });
    expect(window.sessionStorage.getItem(WORLD_STORAGE_KEY)).toBe('1');
    const { result } = renderHook(() => useWorldMode(), { wrapper: ({ children }) => <MemoryRouter initialEntries={['/about']}>{children}</MemoryRouter> });
    expect(result.current).toBe(true);
    renderHook(() => useWorldMode(), { wrapper: ({ children }) => <MemoryRouter initialEntries={['/?world=0']}>{children}</MemoryRouter> });
    expect(window.sessionStorage.getItem(WORLD_STORAGE_KEY)).toBeNull();
  });
});
