// @ts-check
import { expect, test } from '@playwright/test';

/**
 * Code World W6: with the world on by default, no page jumps as it arrives. An inner page's stretch is
 * reserved before the first paint when the world is likely to run, and the real spacer takes its place
 * in the same frame (CLS was 1.0 on every stretch page before, the page's content pushed out of view).
 */

const PAGES = ['/', '/products', '/products/underfire-ai', '/services', '/templates', '/about', '/contact'];

/** The page's layout shift over its first 3 s, as CLS counts it (no shift right after input). @param {import('@playwright/test').Page} page @param {string} path */
async function shiftOf(page, path) {
  await page.addInitScript(() => {
    /** @type {number[]} */
    const shifts = [];
    Object.assign(window, { __shifts: shifts });
    new PerformanceObserver((list) => {
      for (const entry of list.getEntries()) {
        const shift = /** @type {PerformanceEntry & { value: number, hadRecentInput: boolean }} */ (entry);
        if (!shift.hadRecentInput) shifts.push(shift.value);
      }
    }).observe({ type: 'layout-shift', buffered: true });
  });
  await page.goto(path);
  await page.waitForTimeout(3000);
  return page.evaluate(() => /** @type {number[]} */ (Reflect.get(window, '__shifts')).reduce((sum, value) => sum + value, 0));
}

test.describe('no page jumps as the world arrives', () => {
  for (const path of PAGES) {
    test(`${path}: the world on by default`, async ({ page }) => {
      expect(await shiftOf(page, path)).toBeLessThan(0.1);
      await expect(page.locator('canvas[data-world][data-ready="true"]')).toHaveCount(1);
    });
    test(`${path}: the plain site (?world=0)`, async ({ page }) => {
      expect(await shiftOf(page, `${path}?world=0`)).toBeLessThan(0.1);
      await expect(page.locator('canvas[data-world]')).toHaveCount(0);
    });
  }

  test('a visitor who prefers reduced motion gets no space held for a world that will not come', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/about');
    expect(await page.evaluate(() => document.documentElement.hasAttribute('data-stretch-ahead'))).toBe(false);
    await expect(page.locator('[data-world-stretch]')).toHaveCount(0);
    await context.close();
  });
});
