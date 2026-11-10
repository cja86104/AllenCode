// @ts-check
import { DOOR_STORAGE_KEY } from '../src/door/doorStorage.js';

/**
 * Opens a page with a door already chosen in this session, as a returning visitor would, so
 * chapter tests start where that door's chapters are without playing the fork's transition.
 * @param {import('@playwright/test').Page} page
 * @param {'a' | 'b'} door
 * @param {string} [path]
 */
export async function openWithDoor(page, door, path = '/') {
  await page.addInitScript(
    ([key, value]) => {
      try {
        window.sessionStorage.setItem(key, value);
      } catch {
        // Storage blocked: the test that blocks it sets its own state.
      }
    },
    [DOOR_STORAGE_KEY, door],
  );
  await page.goto(path);
  await fieldRunning(page);
}

/**
 * Waits, when motion is on, until the field and its scroll engine are running. They start after the
 * first paint (Phase 8); before then the stylesheet's smooth scrolling turns a test's jump into a
 * second-long scroll, so a test that scrolls first would read a chapter mid-scroll.
 * @param {import('@playwright/test').Page} page
 */
export async function fieldRunning(page) {
  const reduced = await page.evaluate(() => window.matchMedia('(prefers-reduced-motion: reduce)').matches);
  if (reduced) return;
  await page.locator('html[data-scroll-engine="on"]').waitFor({ state: 'attached', timeout: 10000 });
}
