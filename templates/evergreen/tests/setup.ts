import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';

// jsdom does not lay out pages, so it has no scrolling to perform.
window.scrollTo = vi.fn() as unknown as typeof window.scrollTo;
Element.prototype.scrollIntoView = vi.fn();

/**
 * A complete in-memory Web Storage. Newer Node releases (25 and later) define their own global
 * `localStorage`, which needs a `--localstorage-file` and otherwise has no working methods; under Vitest
 * it can hide jsdom's storage. Installing this one keeps the tests the same on every Node version.
 */
class MemoryStorage implements Storage {
  private items = new Map<string, string>();

  get length(): number {
    return this.items.size;
  }

  clear(): void {
    this.items.clear();
  }

  getItem(key: string): string | null {
    return this.items.get(String(key)) ?? null;
  }

  key(index: number): string | null {
    return [...this.items.keys()][index] ?? null;
  }

  removeItem(key: string): void {
    this.items.delete(String(key));
  }

  setItem(key: string, value: string): void {
    this.items.set(String(key), String(value));
  }
}

for (const name of ['localStorage', 'sessionStorage'] as const) {
  const storage = new MemoryStorage();
  Object.defineProperty(window, name, { configurable: true, get: () => storage });
  Object.defineProperty(globalThis, name, { configurable: true, get: () => storage });
}

afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

// jsdom does not implement modal dialogs; this stand-in follows the open/close behaviour the lightbox relies on.
if (typeof HTMLDialogElement.prototype.showModal !== 'function') {
  HTMLDialogElement.prototype.showModal = function showModal(this: HTMLDialogElement) {
    this.setAttribute('open', '');
  };
  HTMLDialogElement.prototype.close = function close(this: HTMLDialogElement) {
    this.removeAttribute('open');
    this.dispatchEvent(new Event('close'));
  };
}
