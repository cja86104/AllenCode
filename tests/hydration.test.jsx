// @ts-check
import { afterEach, beforeAll, beforeEach, describe, expect, it, vi } from 'vitest';
import { execFileSync } from 'node:child_process';
import { act, waitFor } from '@testing-library/react';
import { hydrateRoot } from 'react-dom/client';
import App from '../src/App.jsx';
import { DOOR_STORAGE_KEY } from '../src/door/doorStorage.js';

/** Messages React and its DOM warnings use for a server and client tree that disagree. */
const MISMATCH = /hydrat|did not match|server rendered|#418|#423|#425/i;

/** Server HTML for each path, rendered in a Node process of its own (see tests/support/renderPages.js). */
let pages = /** @type {Record<string, string>} */ ({});

beforeAll(() => {
  const out = execFileSync(process.execPath, ['tests/support/renderPages.js', '/', '/contact'], { encoding: 'utf8', stdio: ['ignore', 'pipe', 'inherit'] });
  pages = JSON.parse(out);
}, 60_000);

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}

beforeEach(() => {
  vi.stubGlobal('ResizeObserver', ResizeObserverStub);
});

/** @type {import('react-dom/client').Root | null} */
let root = null;
const originalSize = { w: window.innerWidth, h: window.innerHeight };

/** @param {number} w @param {number} h */
function setViewport(w, h) {
  Object.defineProperty(window, 'innerWidth', { configurable: true, value: w });
  Object.defineProperty(window, 'innerHeight', { configurable: true, value: h });
}

/**
 * Renders `url` on the server, puts its HTML in the page and hydrates it with the real app, as the
 * browser does with a prebuilt page.
 * @param {string} url
 */
async function hydrate(url) {
  // The build renders each page from its path alone; the query only exists in the browser.
  const html = pages[new URL(url, 'https://www.allencodeco.com').pathname];
  if (html === undefined) throw new Error(`No server HTML rendered for ${url}.`);
  window.history.replaceState(null, '', url);
  const container = document.createElement('div');
  container.id = 'root';
  container.innerHTML = html;
  document.body.appendChild(container);
  const recoverable = vi.fn();
  const consoleError = vi.spyOn(console, 'error');
  await act(async () => {
    root = hydrateRoot(container, <App />, { onRecoverableError: recoverable });
  });
  const mismatches = () =>
    [...recoverable.mock.calls, ...consoleError.mock.calls].map((call) => call.map(String).join(' ')).filter((text) => MISMATCH.test(text));
  return { container, mismatches };
}

/** @param {HTMLElement} container @param {string} text */
const someFieldHas = (container, text) =>
  [...container.querySelectorAll('textarea')].some((field) => field.value.includes(text));

afterEach(() => {
  act(() => root?.unmount());
  root = null;
  document.body.innerHTML = '';
  window.sessionStorage.clear();
  setViewport(originalSize.w, originalSize.h);
  vi.restoreAllMocks();
  vi.unstubAllGlobals();
});

describe('hydrating a prebuilt page', () => {
  it('a returning visitor with a door in session storage hydrates the first-visit page, then sees their door', async () => {
    window.sessionStorage.setItem(DOOR_STORAGE_KEY, 'a');
    const { container, mismatches } = await hydrate('/');
    await waitFor(() => expect(container.querySelector('[data-chapter="mvp-sprints"]')).not.toBeNull());
    expect(mismatches()).toEqual([]);
  });

  it('a link with an idea hydrates, then the idea reaches the sketch and the brief', async () => {
    window.sessionStorage.setItem(DOOR_STORAGE_KEY, 'a');
    const { container, mismatches } = await hydrate('/?idea=a%20bakery%20site');
    await waitFor(() => expect(someFieldHas(container, 'a bakery site')).toBe(true));
    expect(mismatches()).toEqual([]);
  });

  it('a contact link for a template hydrates, then the brief asks about that template', async () => {
    const { container, mismatches } = await hydrate('/contact?template=ignite');
    await waitFor(() => expect(someFieldHas(container, "I'd like to talk about the Ignite — SaaS Landing template.")).toBe(true));
    const type = /** @type {HTMLSelectElement | null} */ (container.querySelector('select'));
    expect(type?.value).toBe('Website from a template');
    expect(mismatches()).toEqual([]);
  });

  it('a phone-sized window hydrates the page the server laid out at its default size', async () => {
    setViewport(390, 844);
    const { container, mismatches } = await hydrate('/');
    await waitFor(() => expect(container.textContent).toContain('What would you like'));
    expect(mismatches()).toEqual([]);
  });
});
