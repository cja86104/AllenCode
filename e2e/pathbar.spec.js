// @ts-check
import { expect as baseExpect, test as worldTest } from '@playwright/test';
import { expect, test } from './plain.js';

/**
 * The path bar (Living Source Phase 3): the Project Explorer of the world-off site, a second bar under the
 * nav on every page, `allencode / 02_our-work / underfire-ai`. These tests start in Plain view (plain.js),
 * except the one that checks the bar stays away where the world will run.
 */

const PAGES = ['/', '/services', '/products', '/products/underfire-ai', '/templates', '/about', '/contact'];

test('on every page, under the nav', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  for (const path of PAGES) {
    await page.goto(path);
    const nav = page.locator('[data-path-bar] nav[aria-label="Where you are"]');
    await expect(nav, path).toBeVisible();
    const header = await page.locator('header').first().boundingBox();
    const bar = await nav.boundingBox();
    expect(header && bar && bar.y + bar.height <= header.y + header.height + 0.5, `${path}: inside the header`).toBe(true);
  }
});

test.describe('prebuilt', () => {
  test.use({ javaScriptEnabled: false });
  test('the bar is in each page’s prebuilt HTML, and shows without JavaScript', async ({ page, request }) => {
    for (const [path, words] of [
      ['/', '00_origin'],
      ['/services', 'services'],
    ]) {
      const html = await (await request.get(path)).text();
      expect(html, path).toContain('data-path-bar');
      expect(html, path).toContain(words);
    }
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto('/');
    await expect(page.locator('[data-path-bar] nav[aria-label="Where you are"]')).toBeVisible();
  });
});

worldTest('hidden where the world will run: never shown before the world arrives, gone once it has', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  /** @type {import('@playwright/test').Route | null} */
  let held = null;
  // Hold only the entry script, the first index-*.js the page asks for; later chunks go through.
  await page.route(/\/assets\/index-[^/]*\.js$/, (route) => {
    if (held) return route.continue();
    held = route;
    return undefined;
  });
  // Held, the module script holds DOMContentLoaded too; the HTML and the pre-paint script are enough.
  await page.goto('/', { waitUntil: 'commit' });
  await baseExpect(page.locator('html')).toHaveAttribute('data-likely-world', '');
  await baseExpect(page.locator('[data-path-bar]')).toBeAttached();
  await baseExpect(page.locator('[data-path-bar]')).toBeHidden();
  await baseExpect.poll(() => held !== null).toBe(true);
  await /** @type {import('@playwright/test').Route} */ (/** @type {unknown} */ (held)).continue();
  await baseExpect(page.locator('nav[data-rail]')).toBeVisible({ timeout: 10000 });
  await baseExpect(page.locator('[data-path-bar]')).toHaveCount(0);
  await baseExpect(page.locator('[data-path-chip]')).toHaveCount(0);
});

test('the phone: one chip in the header row, which fits at 360 px', async ({ page }) => {
  await page.setViewportSize({ width: 360, height: 740 });
  for (const path of ['/', '/products/underfire-ai']) {
    await page.goto(path);
    await expect(page.locator('[data-path-chip]'), path).toBeVisible();
    await expect(page.locator('[data-path-bar]'), path).toBeHidden();
    const header = await page.locator('header').first().boundingBox();
    expect(header?.height ?? 999, `${path}: the header stays one row`).toBeLessThan(72);
    expect(await page.evaluate(() => document.documentElement.scrollWidth), `${path}: no sideways scroll`).toBeLessThanOrEqual(360);
    const chip = await page.locator('[data-path-chip]').boundingBox();
    const menu = await page.getByRole('button', { name: 'Toggle menu' }).boundingBox();
    expect(chip && menu && chip.x + chip.width <= menu.x, `${path}: the chip stays left of the menu button`).toBe(true);
    // The file's name shows in full; where room is short, its parent gives way first.
    const file = page.locator('[data-path-chip] [data-chip-file]');
    // Measured exactly: whole pixels hid a cut of under one (2026-11-27).
    const fits = await file.evaluate((el) => {
      const range = document.createRange();
      range.selectNodeContents(el);
      return range.getBoundingClientRect().width <= el.getBoundingClientRect().width + 0.01;
    });
    expect(fits, `${path}: the file is not cut`).toBe(true);
    // Below 400 px the chip shows the file alone (a parent squeezed to a letter reads as noise); screen
    // readers still hear the parent.
    const parent = await page.locator('[data-path-chip] [data-chip-parent]').boundingBox();
    expect(parent?.width ?? 0, `${path}: the parent takes no room`).toBeLessThanOrEqual(1);
    await expect(page.locator('[data-path-chip]'), path).toHaveAccessibleName(/^(products|\d\d) \/ /);
  }
});

test('by keyboard: a segment opens its menu, ArrowDown enters it, Escape closes it with focus back', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/services');
  const bar = page.getByRole('navigation', { name: 'Where you are' });
  const pages = bar.getByRole('button', { name: 'pages' });
  await pages.focus();
  await page.keyboard.press('Enter');
  await expect(pages).toHaveAttribute('aria-expanded', 'true');
  const rows = page.locator('[data-path-row]');
  await expect(rows).toHaveCount(8);
  await page.keyboard.press('ArrowDown');
  await expect(rows.first()).toBeFocused();
  await page.keyboard.press('ArrowDown');
  await expect(rows.nth(1)).toBeFocused();
  const box = await rows.nth(1).boundingBox();
  expect(box?.height ?? 0, 'a 44 px target').toBeGreaterThanOrEqual(44);
  await page.keyboard.press('Escape');
  await expect(pages).toHaveAttribute('aria-expanded', 'false');
  await expect(pages).toBeFocused();
  await expect(rows).toHaveCount(0);
});

test('a page chosen from a menu is reached by its link', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/services');
  await page.getByRole('navigation', { name: 'Where you are' }).getByRole('button', { name: 'services' }).click();
  await page.locator('[data-path-row]', { hasText: 'about' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.getByRole('navigation', { name: 'Where you are' }).getByRole('button', { name: 'about' })).toHaveAttribute('aria-current', 'location');
  await expect(page.locator('[data-path-row]')).toHaveCount(0);
});

test('the phone’s sheet: the whole tree under the header, closed by the browser’s back button', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/about');
  await page.goto('/services');
  const chip = page.locator('[data-path-chip]');
  await chip.click();
  const sheet = page.locator('[data-path-sheet]');
  await expect(sheet).toBeVisible();
  const header = await page.locator('header').first().boundingBox();
  const box = await sheet.boundingBox();
  expect(box && header && Math.abs(box.y - (header.y + header.height)) <= 1, 'the sheet hangs from the header').toBe(true);
  expect(box?.width ?? 0, 'full width').toBeGreaterThanOrEqual(389);
  await expect(sheet.locator('[data-path-sheet-branch]')).toHaveCount(8);
  await page.goBack();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('[data-path-sheet]')).toHaveCount(0);
  await expect(page.locator('[data-path-chip]')).toHaveAttribute('aria-expanded', 'false');
});
