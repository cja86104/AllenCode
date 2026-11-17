// @ts-check
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { canvas, scrollTo } from './world.js';

/**
 * Code World W5a: with the world switched on, each inner page opens on a stretch of road whose lead
 * code lands as the page's headline; the canvas stays mounted from page to page.
 */

const STRETCHES = /** @type {const} */ ([
  ['/products', 'products'],
  ['/products/underfire-ai', 'product:underfire-ai'],
  ['/services', 'services'],
  ['/templates', 'templates'],
  ['/about', 'about'],
  ['/contact', 'contact'],
  // W7 (Chris, 2026-11-17: "Their own word road"): checkout success, and the 404 page for any unknown address.
  ['/checkout-success', 'thank-you'],
  ['/nope', 'lost'],
]);

/** @param {import('@playwright/test').Page} page @param {string} path */
async function openStretch(page, path) {
  await page.goto(`${path}?world=1`);
  await canvas(page).and(page.locator('[data-ready="true"]')).waitFor();
  await page.locator('[data-world-stretch]').waitFor({ state: 'attached' });
}

/** The stretch's span in scroll pixels. @param {import('@playwright/test').Page} page */
async function stretchSpan(page) {
  return page.evaluate(() => {
    const el = /** @type {HTMLElement} */ (document.querySelector('[data-world-stretch]'));
    const from = el.getBoundingClientRect().top + window.scrollY;
    return { from, to: from + el.getBoundingClientRect().height };
  });
}

/**
 * How visible the page's own content is (the page after the stretch, its headline in it), as the
 * product of every opacity from the headline up.
 * @param {import('@playwright/test').Page} page
 */
const headlineOpacity = (page) =>
  page.locator('main h1').first().evaluate((el) => {
    let shown = 1;
    for (let node = /** @type {Element | null} */ (el); node; node = node.parentElement) shown *= Number(getComputedStyle(node).opacity);
    return shown;
  });

test.describe('each inner page’s stretch (Code World W5a)', () => {
  for (const [path, id] of STRETCHES) {
    test(`${path}: drives the stretch, then its code lands as the headline`, async ({ page }) => {
      await openStretch(page, path);
      await expect(canvas(page)).toHaveAttribute('data-page', `stretch:${id}`);
      await expect(canvas(page)).toHaveAttribute('data-stretch-progress', '0.00');
      await expect.poll(() => headlineOpacity(page)).toBe(0);
      const span = await stretchSpan(page);
      await scrollTo(page, span.from + (span.to - span.from) * 0.85);
      await expect(canvas(page)).toHaveAttribute('data-flight', `stretch:${id}`);
      // The page waits for its headline's landing: it does not rise over the world meanwhile.
      expect(await page.locator('[data-world-stretch] + *').evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(0);
      await scrollTo(page, span.to);
      await expect(canvas(page)).toHaveAttribute('data-stretch-progress', '1.00');
      await expect.poll(() => headlineOpacity(page)).toBe(1);
      // Past the stretch the world fades out and the page is today's: half a screen on, or by the
      // bottom of a page too short for that.
      const bottom = await page.evaluate(() => document.documentElement.scrollHeight - window.innerHeight);
      await scrollTo(page, Math.min(span.to + (await page.evaluate(() => window.innerHeight)), bottom));
      await expect(canvas(page)).toHaveCSS('opacity', '0');
    });
  }

  test('the canvas stays mounted from page to page, and back home the journey returns', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStretch(page, '/products');
    await canvas(page).evaluate((el) => {
      /** @type {HTMLElement} */ (el).dataset.mark = 'kept';
    });
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Services' }).click();
    await expect(canvas(page)).toHaveAttribute('data-page', 'stretch:services');
    await expect(canvas(page)).toHaveAttribute('data-mark', 'kept');
    await page.getByRole('link', { name: /allen\s*code/i }).first().click();
    await expect(canvas(page)).toHaveAttribute('data-page', 'home');
    await expect(canvas(page)).toHaveAttribute('data-mark', 'kept');
    await expect(canvas(page)).toHaveAttribute('data-section', 'gate');
  });

  test('leaving mid-stretch leaves no hidden headline behind', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await openStretch(page, '/products');
    const span = await stretchSpan(page);
    await scrollTo(page, span.from + (span.to - span.from) * 0.8);
    await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Services' }).click();
    await expect(canvas(page)).toHaveAttribute('data-page', 'stretch:services');
    // The world is switched off for the next page: the headline must read.
    await page.goto('/services?world=0');
    await expect.poll(() => headlineOpacity(page)).toBe(1);
    await expect(page.locator('[data-world-stretch]')).toHaveCount(0);
  });

  test('a keyboard visitor tabbing into the page mid-stretch sees what has focus', async ({ page }) => {
    // The product page's first link is its way back, at the top of its header.
    await openStretch(page, '/products/underfire-ai');
    const span = await stretchSpan(page);
    await scrollTo(page, span.from + (span.to - span.from) * 0.3);
    await page.locator('[data-world-stretch] + * a').first().focus();
    await expect.poll(() => page.locator('[data-world-stretch] + *').evaluate((el) => Number(getComputedStyle(el).opacity))).toBe(1);
  });

  test('with the world off, a page shows the field, as today', async ({ page }) => {
    await page.goto('/checkout-success?world=0');
    await expect(page.locator('canvas[data-field]')).toBeAttached();
    await expect(page.locator('canvas[data-world]')).toHaveCount(0);
    await expect(page.locator('[data-world-stretch]')).toHaveCount(0);
  });

  test('switched off, no page has a stretch, and every headline reads', async ({ page }) => {
    for (const [path] of STRETCHES) {
      await page.goto(`${path}?world=0`);
      await expect(page.locator('main h1').first()).toBeVisible();
      await expect(page.locator('[data-world-stretch]')).toHaveCount(0);
      await expect(page.locator('canvas[data-world]')).toHaveCount(0);
    }
  });

  test('reduced motion: no stretch, even with the switch', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/products?world=1');
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page.locator('[data-world-stretch]')).toHaveCount(0);
    await context.close();
  });

  test('no accessibility violations on a stretch, at its start and once landed', async ({ page }) => {
    await openStretch(page, '/products');
    const at = async () => (await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze()).violations;
    expect(await at()).toEqual([]);
    const span = await stretchSpan(page);
    await scrollTo(page, span.to);
    expect(await at()).toEqual([]);
  });
});
