// @ts-check
import { expect, test } from '@playwright/test';
import { canvas, open } from './world.js';

/**
 * Code World W5b (Chris, 2026-11-17: "Drive on ahead"): moving to a page with a stretch drives there.
 * The camera drives on ahead out of the world it was in, then in to the new road's start, over 0.6 s;
 * the canvas is marked `data-drive` ("out", then "in") while it plays. A page loaded directly opens on
 * its stretch with no drive.
 */

/** Records every value the canvas's `data-drive` takes, from now on, on `window.__drives`. @param {import('@playwright/test').Page} page */
async function recordDrives(page) {
  await page.evaluate(() => {
    const el = /** @type {HTMLCanvasElement} */ (document.querySelector('canvas[data-world]'));
    /** @type {Array<string | null>} */
    const seen = [];
    Object.assign(window, { __drives: seen });
    new MutationObserver(() => {
      const value = el.getAttribute('data-drive');
      if (seen[seen.length - 1] !== value) seen.push(value);
    }).observe(el, { attributes: true, attributeFilter: ['data-drive'] });
  });
}

/** @param {import('@playwright/test').Page} page @returns {Promise<Array<string | null>>} */
const drives = (page) => page.evaluate(() => /** @type {Array<string | null>} */ (Reflect.get(window, '__drives') ?? []));

/** @param {import('@playwright/test').Page} page @param {string} name */
const navTo = (page, name) => page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name, exact: true }).click();

test.describe('the drive between pages', () => {
  test('from one stretch to another: out of the old road, in to the new, then the stretch as before', async ({ page }) => {
    await page.goto('/products?world=1');
    await canvas(page).and(page.locator('[data-ready="true"]')).waitFor();
    await expect(canvas(page)).toHaveAttribute('data-page', 'stretch:products');
    await recordDrives(page);
    await navTo(page, 'Services');
    await expect(page).toHaveURL(/\/services$/);
    await expect(canvas(page)).toHaveAttribute('data-page', 'stretch:services');
    await expect.poll(() => drives(page), { timeout: 4000 }).toEqual(['out', 'in', null]);
    // It ends on the stretch's own camera: at the top of the page, the stretch's start.
    await expect(canvas(page)).toHaveAttribute('data-stretch-progress', '0.00');
    expect(Number(await canvas(page).evaluate((el) => /** @type {HTMLElement} */ (el).style.opacity))).toBeGreaterThan(0.99);
  });

  test('from the home road to a stretch page', async ({ page }) => {
    await open(page);
    await page.evaluate(() => window.scrollTo(0, window.innerHeight * 4));
    await page.waitForTimeout(300);
    await recordDrives(page);
    await navTo(page, 'About');
    await expect(page).toHaveURL(/\/about$/);
    await expect.poll(() => drives(page), { timeout: 4000 }).toEqual(['out', 'in', null]);
    await expect(canvas(page)).toHaveAttribute('data-page', 'stretch:about');
  });

  test('a page loaded directly opens on its stretch with no drive', async ({ page }) => {
    await page.addInitScript(() => {
      /** @type {Array<string | null>} */
      const seen = [];
      Object.assign(window, { __drives: seen });
      new MutationObserver(() => {
        const el = document.querySelector('canvas[data-world]');
        const value = el?.getAttribute('data-drive') ?? null;
        if (value !== null) seen.push(value);
      }).observe(document, { attributes: true, subtree: true, attributeFilter: ['data-drive'] });
    });
    await page.goto('/services?world=1');
    await canvas(page).and(page.locator('[data-ready="true"]')).waitFor();
    await expect(canvas(page)).toHaveAttribute('data-page', 'stretch:services');
    await page.waitForTimeout(800);
    expect(await drives(page)).toEqual([]);
  });
});
