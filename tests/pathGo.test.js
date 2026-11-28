// @ts-check
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { focusHeading, goTo, landingY, templateSegmentY, waitForElement } from '../src/pathbar/go.js';
import { setGlider } from '../src/scroll/glide.js';

/** Gives an element a document position (jsdom lays nothing out). @param {Element} el @param {number} top @param {number} [height] */
function place(el, top, height = 100) {
  el.getBoundingClientRect = () => /** @type {DOMRect} */ ({ top: top - window.scrollY, bottom: top - window.scrollY + height, left: 0, right: 0, width: 0, height, x: 0, y: top, toJSON: () => ({}) });
}

/** @param {number} y */
const setScroll = (y) => Object.defineProperty(window, 'scrollY', { value: y, configurable: true });

/** @param {string} html @returns {HTMLElement} */
function add(html) {
  const holder = document.createElement('div');
  holder.innerHTML = html;
  const el = /** @type {HTMLElement} */ (holder.firstElementChild);
  document.body.append(el);
  return el;
}

/** A glider that arrives at once, recording each move. */
const arriving = () =>
  vi.fn((/** @type {number} */ y) => {
    setScroll(y);
  });

beforeEach(() => {
  vi.useFakeTimers();
  setScroll(0);
  const header = add('<header></header>');
  place(header, 0, 112);
});

afterEach(() => {
  vi.useRealTimers();
  setGlider(null);
  document.body.innerHTML = '';
  setScroll(0);
});

/** Runs goTo with fake timers moving it along. @param {Promise<void>} going */
async function settle(going) {
  await vi.advanceTimersByTimeAsync(10000);
  await going;
}

describe('going to a file (Living Source Phase 3, Task 4)', () => {
  it('landingY: a pinned section at its top; any other less the header; never above the page', () => {
    const pinned = add('<section><div class="pin-frame"></div></section>');
    place(pinned, 2400);
    expect(landingY(pinned, 112)).toBe(2400);
    const plain = add('<section><h2>x</h2></section>');
    place(plain, 2400.4);
    expect(landingY(plain, 112)).toBe(2289);
    place(plain, 40);
    expect(landingY(plain, 112)).toBe(0);
  });

  it('templateSegmentY: inside the segment as useSectionProgress counts it', () => {
    expect(templateSegmentY(1000, 5400, 900, 0, 5)).toBe(1001);
    expect(templateSegmentY(1000, 5400, 900, 2, 5)).toBe(2801);
  });

  it('waitForElement: resolves when the element arrives, null after the wait', async () => {
    const found = waitForElement('[data-late]');
    setTimeout(() => add('<p data-late></p>'), 300);
    await vi.advanceTimersByTimeAsync(400);
    expect(await found).toBeInstanceOf(HTMLElement);
    const missing = waitForElement('[data-never]', 4000);
    await vi.advanceTimersByTimeAsync(4100);
    expect(await missing).toBeNull();
  });

  it('focusHeading: the first heading, made focusable without scrolling', () => {
    const el = add('<section><p>a</p><h2>Title</h2></section>');
    focusHeading(el);
    const heading = /** @type {HTMLElement} */ (el.querySelector('h2'));
    expect(document.activeElement).toBe(heading);
    expect(heading.getAttribute('tabindex')).toBe('-1');
  });

  it('switches the door for a template from door A, glides into its segment (not yet drawn) and focuses it once it is', async () => {
    const glider = vi.fn((/** @type {number} */ y) => {
      setScroll(y);
      // The pinned chapter draws only the segment on screen: keepsake's appears once the page is there.
      const frame = /** @type {HTMLElement} */ (document.querySelector('[data-template-chapter] .pin-frame'));
      frame.innerHTML = '<div data-door-b-template="keepsake"><h2>Keepsake</h2></div>';
    });
    setGlider(glider);
    const setDoor = vi.fn();
    const section = add(
      '<section data-template-chapter data-template-order="evergreen keepsake"><div class="pin-frame"><div data-door-b-template="evergreen"><h2>Evergreen</h2></div></div></section>',
    );
    place(section, 5000, 2700);
    Object.defineProperty(window, 'innerHeight', { value: 900, configurable: true });
    await settle(goTo('03_templates/keepsake', { pathname: '/', navigate: vi.fn(), door: 'a', setDoor, reducedMotion: false }));
    expect(setDoor).toHaveBeenCalledWith('b');
    expect(glider).toHaveBeenCalledWith(templateSegmentY(5000, 2700, 900, 1, 2), false);
    expect(document.activeElement?.textContent).toBe('Keepsake');
  });

  it('a template the pinned chapter does not hold goes to the templates page', async () => {
    setGlider(arriving());
    const navigate = vi.fn((/** @type {string} */ to) => {
      if (to === '/templates') place(add('<main><h1>Templates</h1></main>'), 0);
    });
    place(add('<section data-template-chapter data-template-order="evergreen keepsake"><div class="pin-frame"></div></section>'), 5000, 2700);
    await settle(goTo('03_templates/vow', { pathname: '/', navigate, door: 'b', setDoor: vi.fn(), reducedMotion: false }));
    expect(navigate).toHaveBeenCalledWith('/templates');
  });

  it('routes home from an inner page and waits for the chapter', async () => {
    const glider = arriving();
    setGlider(glider);
    const navigate = vi.fn();
    const going = goTo('04_how-i-work', { pathname: '/services', navigate, door: 'a', setDoor: vi.fn(), reducedMotion: false });
    expect(navigate).toHaveBeenCalledWith('/');
    setTimeout(() => place(add('<section data-chapter="how-i-work"><div class="pin-frame"><h2>How I work</h2></div></section>'), 9000), 500);
    await settle(going);
    expect(glider).toHaveBeenCalledWith(9000, false);
    expect(document.activeElement?.textContent).toBe('How I work');
  });

  it('falls back to the services panel when the home chapter never appears', async () => {
    const glider = arriving();
    setGlider(glider);
    const navigate = vi.fn((/** @type {string} */ to) => {
      if (to === '/services') place(add('<article data-service="intelligent-ai-systems"><h2>Intelligent AI Systems</h2></article>'), 1500);
    });
    await settle(goTo('01_services/intelligent-ai-systems', { pathname: '/', navigate, door: 'a', setDoor: vi.fn(), reducedMotion: false }));
    expect(navigate).toHaveBeenCalledWith('/services');
    expect(glider).toHaveBeenLastCalledWith(1500 - 112, false);
    expect(document.activeElement?.textContent).toBe('Intelligent AI Systems');
  });

  it('a shared branch chosen before a door chooses business', async () => {
    setGlider(arriving());
    const setDoor = vi.fn();
    place(add('<section data-chapter="builder"><div class="pin-frame"><h2>Builder</h2></div></section>'), 7000);
    await settle(goTo('05_who-builds-it', { pathname: '/', navigate: vi.fn(), door: null, setDoor, reducedMotion: false }));
    expect(setDoor).toHaveBeenCalledWith('a');
  });

  it('under reduced motion it jumps', async () => {
    const glider = arriving();
    setGlider(glider);
    place(add('<section data-product="underfire-ai"><h2>UnderFire AI</h2></section>'), 3000);
    await settle(goTo('02_our-work/underfire-ai', { pathname: '/', navigate: vi.fn(), door: 'a', setDoor: vi.fn(), reducedMotion: true }));
    expect(glider).toHaveBeenCalledWith(3000 - 112, true);
  });
});
