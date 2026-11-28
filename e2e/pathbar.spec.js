// @ts-check
import { expect as baseExpect, test as worldTest } from '@playwright/test';
import { expect, test } from './plain.js';
import { openWithDoor } from './door.js';
import { services } from '../src/data/services.js';
import { products } from '../src/data/products.js';

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
  // Measured once its 500 ms rise in has settled.
  await page.waitForTimeout(600);
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

/**
 * Opens a segment of the bar and chooses a row by its label.
 * @param {import('@playwright/test').Page} page @param {string} segment @param {string} row
 */
async function choose(page, segment, row) {
  await page.getByRole('navigation', { name: 'Where you are' }).getByRole('button', { name: segment, exact: true }).click();
  await page.locator('[data-path-row]', { has: page.locator(`span:text-is("${row}")`) }).click();
}

/** @param {import('@playwright/test').Page} page @param {string} section */
async function arrivedAt(page, section) {
  await expect(page.locator(`${section} h2`).first()).toBeFocused({ timeout: 10000 });
}

test('goes to a chapter: the page glides there and focus lands on its heading', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWithDoor(page, 'a');
  await page.locator('[data-chapter="brief"]').waitFor({ state: 'attached' });
  await choose(page, '00_origin', '02_our-work');
  await arrivedAt(page, '[data-product="my-teachers-toolbox"]');
  const top = await page.locator('[data-product="my-teachers-toolbox"]').evaluate((el) => el.getBoundingClientRect().top);
  expect(Math.abs(top), 'its pinned frame fills the screen').toBeLessThanOrEqual(2);
});

test('every service is reached: its home chapter, or its panel on /services when the chapter is not shown', async ({ page }) => {
  // Nine trips, one of them through the 4 s wait for a chapter that is not shown.
  test.setTimeout(120000);
  await page.setViewportSize({ width: 390, height: 844 });
  for (const service of services) {
    await openWithDoor(page, 'a');
    await page.locator('[data-chapter="brief"]').waitFor({ state: 'attached' });
    // The field starts after the first paint and redraws the chapters as it does; choose once it runs.
    await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
    const chapter = page.locator(`[data-chapter="${service.slug}"]`);
    const onHome = (await chapter.count()) > 0;
    await page.locator('[data-path-chip]').click();
    await page.locator('[data-path-sheet] [data-path-row]', { has: page.locator(`span:text-is("${service.slug}")`) }).click();
    if (onHome) {
      await arrivedAt(page, `[data-chapter="${service.slug}"]`);
      await expect(page, service.slug).toHaveURL(/\/$/);
    } else {
      await expect(page, service.slug).toHaveURL(/\/services$/);
      await arrivedAt(page, `[data-service="${service.slug}"]`);
      const box = await page.locator(`[data-service="${service.slug}"] h2`).boundingBox();
      const header = await page.locator('header').first().boundingBox();
      expect(box && header && box.y >= header.y + header.height, `${service.slug}: below the header`).toBe(true);
    }
  }
});

test('across doors: a template from door A switches the door, then goes to it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openWithDoor(page, 'a');
  await page.locator('[data-chapter="brief"]').waitFor({ state: 'attached' });
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
  await page.locator('[data-path-chip]').click();
  await page.locator('[data-path-sheet] [data-path-row]', { has: page.locator('span:text-is("keepsake")') }).click();
  await arrivedAt(page, '[data-door-b-template="keepsake"]');
  expect(await page.evaluate(() => sessionStorage.getItem('allencode:door'))).toBe('b');
});

test('from an inner page: pages goes home to a branch', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWithDoor(page, 'a', '/about');
  await choose(page, 'pages', '04_how-i-work');
  await expect(page).toHaveURL(/\/$/);
  await arrivedAt(page, '[data-chapter="how-i-work"]');
});

test('before a door: a branch both doors share chooses business', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/');
  await choose(page, '00_origin', '05_who-builds-it');
  await arrivedAt(page, '[data-chapter="builder"]');
  expect(await page.evaluate(() => sessionStorage.getItem('allencode:door'))).toBe('a');
});

test('with reduced motion it jumps, and a static chapter’s heading lands below the header', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWithDoor(page, 'a');
  await page.locator('[data-chapter="brief"]').waitFor({ state: 'attached' });
  await choose(page, '00_origin', '02_our-work');
  await arrivedAt(page, '[data-product="my-teachers-toolbox"]');
  const heading = await page.locator('[data-product="my-teachers-toolbox"] h2').boundingBox();
  const header = await page.locator('header').first().boundingBox();
  expect(heading && header && heading.y >= header.y + header.height).toBe(true);
});

test('a wheel over the sheet scrolls the sheet, not the page under it', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openWithDoor(page, 'a');
  await page.locator('[data-chapter="brief"]').waitFor({ state: 'attached' });
  await page.locator('[data-path-chip]').click();
  const sheet = page.locator('[data-path-sheet]');
  await expect(sheet).toBeVisible();
  const before = await page.evaluate(() => window.scrollY);
  const box = await sheet.boundingBox();
  await page.mouse.move((box?.x ?? 0) + 100, (box?.y ?? 0) + 200);
  await page.mouse.wheel(0, 400);
  await page.waitForTimeout(700);
  expect(await sheet.evaluate((el) => el.scrollTop), 'the sheet scrolled').toBeGreaterThan(100);
  expect(await page.evaluate(() => window.scrollY), 'the page stayed').toBe(before);
});

/** The file the bar marks as where the visitor is. @param {import('@playwright/test').Page} page */
const currentInBar = (page) => page.locator('[data-path-bar] [aria-current="location"]');

/** Scrolls so a section's middle is at the screen's middle, then lets the bar catch up. @param {import('@playwright/test').Page} page @param {string} selector */
async function scrollToMiddleOf(page, selector) {
  await page.locator(selector).evaluate((el) => {
    const rect = el.getBoundingClientRect();
    window.scrollTo({ top: rect.top + window.scrollY + rect.height / 2 - window.innerHeight / 2, behavior: 'instant' });
  });
}

test('follows the scroll: the origin at the top, then each product as it fills the screen', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWithDoor(page, 'a');
  await page.locator('[data-chapter="brief"]').waitFor({ state: 'attached' });
  await expect(currentInBar(page)).toHaveText('00_origin');
  for (const product of products) {
    await scrollToMiddleOf(page, `[data-product="${product.slug}"]`);
    await expect(currentInBar(page), product.slug).toHaveText(product.slug);
    await expect(page.locator('[data-path-bar]').getByRole('button', { name: '02_our-work' })).toBeVisible();
  }
  await scrollToMiddleOf(page, '[data-chapter="builder"]');
  await expect(currentInBar(page)).toHaveText('05_who-builds-it');
});

for (const reducedMotion of /** @type {const} */ (['no-preference', 'reduce'])) {
  test(`follows door B’s templates one by one (${reducedMotion === 'reduce' ? 'reduced motion' : 'pinned'})`, async ({ page }) => {
    await page.emulateMedia({ reducedMotion });
    await page.setViewportSize({ width: 1280, height: 720 });
    await openWithDoor(page, 'b');
    await page.locator('[data-chapter="brief"]').waitFor({ state: 'attached' });
    if (reducedMotion === 'reduce') {
      await scrollToMiddleOf(page, '[data-door-b-template="keepsake"]');
    } else {
      // Into the second of the pinned chapter's segments.
      await page.locator('[data-template-order]').evaluate((el) => {
        const order = (el.getAttribute('data-template-order') ?? '').split(' ');
        const rect = el.getBoundingClientRect();
        const span = rect.height - window.innerHeight;
        window.scrollTo({ top: rect.top + window.scrollY + span * (1.5 / order.length), behavior: 'instant' });
      });
    }
    await expect(currentInBar(page)).toHaveText('keepsake');
  });
}

test('the path is heard once: no live region in the bar or the chip', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWithDoor(page, 'a');
  await expect(page.locator('[data-path-bar] [aria-live], [data-path-bar] [role="status"], [data-path-bar][aria-live]')).toHaveCount(0);
  await expect(page.locator('header nav[aria-label="Where you are"] [aria-live]')).toHaveCount(0);
});
