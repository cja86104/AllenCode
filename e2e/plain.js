// @ts-check
import { expect, test as base } from '@playwright/test';

/**
 * The plain site's browser tests (Code World W6): with the world on by default, these test the site a
 * visitor gets with the world off (reduced motion, no WebGL2, or "Plain view"), so each page starts
 * with the visit's choice set to plain, exactly as the footer's toggle sets it.
 */
export const test = base.extend({
  page: async ({ page }, use) => {
    await page.addInitScript(() => {
      try {
        window.sessionStorage.setItem('allencode:world', '0');
      } catch {
        // Storage blocked: the test would see the world; nothing to set.
      }
    });
    await use(page);
  },
});

export { expect };
