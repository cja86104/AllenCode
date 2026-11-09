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
}
