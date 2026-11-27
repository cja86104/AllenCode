// @ts-check
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { canvas, open, scrollTo, spanOf, takeBusiness } from './world.js';

/**
 * Jumps along the journey rail (2026-11-26, Phase 2, Chris: "keep the length but add the jumps"): the
 * Chapters list on every device, a mark per stop on a fine pointer, each playing the drive between pages
 * within the home page and landing on the stop, focus on its heading.
 */

/** @param {import('@playwright/test').Page} page */
const chapters = (page) => page.locator('nav[data-rail]').getByRole('button', { name: 'Chapters' });

/** Records every value the canvas's `data-jump` takes from now on. @param {import('@playwright/test').Page} page */
async function recordJump(page) {
  await page.evaluate(() => {
    const el = /** @type {HTMLElement} */ (document.querySelector('canvas[data-world]'));
    const seen = /** @type {string[]} */ ([]);
    /** @type {any} */ (window).__jumpSeen = seen;
    new MutationObserver(() => {
      const value = el.dataset.jump ?? '';
      if (seen[seen.length - 1] !== value) seen.push(value);
    }).observe(el, { attributes: true, attributeFilter: ['data-jump'] });
  });
}

/** @param {import('@playwright/test').Page} page */
const jumpSeen = (page) => page.evaluate(() => /** @type {string[]} */ (/** @type {any} */ (window).__jumpSeen));

/** Waits for a jump to finish: the drive over and the world fully back. @param {import('@playwright/test').Page} page */
async function landed(page) {
  await expect(canvas(page)).not.toHaveAttribute('data-jump', /.+/, { timeout: 3000 });
}

test('from the gate, Chapters jumps down the business road to a stop: the drive plays, the page lands on its rest, focus on its heading', async ({ page }) => {
  await open(page);
  await takeBusiness(page);
  await scrollTo(page, 0);
  await recordJump(page);
  await chapters(page).click();
  await expect(chapters(page)).toHaveAttribute('aria-expanded', 'true');
  await page.locator('[data-chapters]').getByRole('button', { name: 'Custom Web Development', exact: true }).click();
  await expect(chapters(page)).toHaveAttribute('aria-expanded', 'false');
  await landed(page);
  // Out, then in, then over (`tests/worldJump.test.js` holds the timing). A software-drawn frame can take
  // longer than a half of the drive, so a half may pass unseen here, but never in the wrong order.
  expect((await jumpSeen(page)).join(',')).toMatch(/^(out,)?(in,)?$/);
  const rest = await spanOf(page, '[data-world-stop="custom-web-development"]');
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - rest.from)).toBeLessThan(4);
  await expect(canvas(page)).toHaveAttribute('data-section', 'rest:custom-web-development');
  await expect.poll(() => canvas(page).evaluate((el) => Number(/** @type {HTMLElement} */ (el).style.opacity))).toBeGreaterThan(0.99);
  const focused = await page.evaluate(() => {
    const el = document.activeElement;
    return { tag: el?.tagName, text: el?.textContent, inStop: Boolean(el?.closest('[data-world-stop="custom-web-development"]')) };
  });
  expect(focused).toEqual({ tag: 'H2', text: 'Custom Web Development', inStop: true });
  await expect(page.locator('nav[data-rail] ol [aria-current="step"]')).toHaveText('Custom Web Development');
});

test('on a fine pointer, a stop’s mark on the rail jumps to it', async ({ page }) => {
  await open(page);
  await takeBusiness(page);
  await page.locator('[data-rail-mark="founders-helm"]').click();
  await landed(page);
  await expect(canvas(page)).toHaveAttribute('data-section', 'rest:founders-helm');
  const rest = await spanOf(page, '[data-world-stop="founders-helm"]');
  expect(Math.abs((await page.evaluate(() => window.scrollY)) - rest.from)).toBeLessThan(4);
});

test('Start a project lands on the brief, the world faded out behind it', async ({ page }) => {
  await open(page);
  await takeBusiness(page);
  await chapters(page).click();
  await page.locator('[data-chapters]').getByRole('button', { name: 'Start a project' }).click();
  await landed(page);
  await expect(page.locator('[data-chapter="brief"] h2')).toBeInViewport();
  await expect(page.locator('[data-chapter="brief"] h2')).toBeFocused();
  await expect.poll(() => canvas(page).evaluate((el) => Number(/** @type {HTMLElement} */ (el).style.opacity))).toBeLessThan(0.01);
});

test('before a road is taken, Chapters holds only the opening’s stops, and the fork can be jumped to', async ({ page }) => {
  await open(page);
  await chapters(page).click();
  await expect(page.locator('[data-chapters] button')).toHaveText(['Empty file', 'Into the code', 'The fork']);
  await page.locator('[data-chapters]').getByRole('button', { name: 'The fork' }).click();
  await landed(page);
  await expect(page.locator('[data-active-stop]')).toHaveAttribute('data-active-stop', 'The fork');
  await expect(page.getByRole('button', { name: /business\// }).first()).toBeVisible();
});

test('Chapters by keyboard: open, Escape closes it with focus back, and axe finds nothing serious with it open', async ({ page }) => {
  await open(page);
  await takeBusiness(page);
  await chapters(page).focus();
  await page.keyboard.press('Enter');
  await expect(chapters(page)).toHaveAttribute('aria-expanded', 'true');
  const results = await new AxeBuilder({ page }).include('nav[data-rail]').withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
  await page.keyboard.press('Tab');
  await page.keyboard.press('Escape');
  await expect(chapters(page)).toHaveAttribute('aria-expanded', 'false');
  await expect(chapters(page)).toBeFocused();
});

test('while MVP Sprints’ code flies to its screen, it is dimmed behind the stop’s words, and only then (2026-11-26)', async ({ page }) => {
  await open(page);
  await takeBusiness(page);
  const rest = await spanOf(page, '[data-world-stop="mvp-sprints"]');
  const at = async (/** @type {number} */ share) => {
    await scrollTo(page, rest.from + (rest.to - rest.from) * share);
    return canvas(page).getAttribute('data-words-rect');
  };
  // Mid-flight: the box the world dims is the words' own, in clip space.
  await expect.poll(async () => {
    await at(0.45);
    return canvas(page).getAttribute('data-flight');
  }).toBeTruthy();
  const value = await canvas(page).getAttribute('data-words-rect');
  expect(value).toBeTruthy();
  const [x0, y0, x1, y1] = String(value).split(',').map(Number);
  const box = await page.locator('[data-world-stop="mvp-sprints"] [data-world-words]').boundingBox();
  const view = page.viewportSize();
  if (!box || !view) throw new Error('no words box');
  const pad = 12;
  expect(x0).toBeCloseTo(((box.x - pad) / view.width) * 2 - 1, 1);
  expect(x1).toBeCloseTo(((box.x + box.width + pad) / view.width) * 2 - 1, 1);
  expect(y1).toBeCloseTo(1 - ((box.y - pad) / view.height) * 2, 1);
  expect(y0).toBeCloseTo(1 - ((box.y + box.height + pad) / view.height) * 2, 1);
  // On the road between stops, no flight and nothing dimmed.
  await scrollTo(page, rest.from - 600);
  await expect(canvas(page)).not.toHaveAttribute('data-words-rect', /.+/);
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 375, height: 812 }, hasTouch: true, isMobile: true });

  test('no marks to aim at; Chapters jumps to a stop', async ({ page }) => {
    await open(page);
    await takeBusiness(page);
    await expect(page.locator('[data-rail-mark]')).toHaveCount(0);
    await chapters(page).tap();
    await page.locator('[data-chapters]').getByRole('button', { name: 'MVP Sprints', exact: true }).tap();
    await landed(page);
    await expect(canvas(page)).toHaveAttribute('data-section', 'rest:mvp-sprints');
    await expect(chapters(page)).toHaveAttribute('aria-expanded', 'false');
  });
});
