// @ts-check
import '@testing-library/jest-dom/vitest';
import { afterEach } from 'vitest';
import { cleanup } from '@testing-library/react';

// Testing Library only cleans up automatically when Vitest globals are enabled; they are not here.
afterEach(() => {
  cleanup();
});

// jsdom does not implement matchMedia, which GSAP's ScrollTrigger calls when it registers.
// This stand-in reports that no media query matches and accepts listeners.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    /** @param {string} query */
    value: (query) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener() {},
      removeEventListener() {},
      addListener() {},
      removeListener() {},
      dispatchEvent: () => false,
    }),
  });
}
