// @ts-check
import { expect, test } from './plain.js';
import crewExcerpt from '../src/content/excerpts/product-crew-advisors.js';
import { openWithDoor } from './door.js';


/**
 * Scrolls a pinned chapter to a share of its scroll.
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} chapter
 * @param {number} share 0..1
 */
async function scrollChapter(page, chapter, share) {
  const top = await chapter.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const span = await chapter.evaluate((el) => el.getBoundingClientRect().height - window.innerHeight);
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + span * share));
}

/** @param {import('@playwright/test').Page} page */
async function openDoorA(page) {
  await openWithDoor(page, 'a');
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
}

test('door a reaches the four product chapters after the services, in products.js order', async ({ page }) => {
  await openDoorA(page);
  await expect(page.locator('[data-product]')).toHaveCount(4);
  const order = await page.locator('[data-product]').evaluateAll((els) => els.map((el) => el.getAttribute('data-product')));
  expect(order).toEqual(['my-teachers-toolbox', 'underfire-ai', 'founders-helm', 'crew-advisors']);
  const auditBottom = await page.locator('[data-chapter="technical-audits"]').evaluate((el) => el.getBoundingClientRect().bottom);
  const productsTop = await page.locator('[data-product]').first().evaluate((el) => el.getBoundingClientRect().top);
  expect(productsTop).toBeGreaterThanOrEqual(auditBottom);
});

test('the code lands on the poster, then the loop plays, and the live link has rel noopener (C’s stack, Living Source Phase 4)', async ({ page }) => {
  await openDoorA(page);
  const chapter = page.locator('[data-product="my-teachers-toolbox"]');
  const source = chapter.locator('[data-plane="source"]');
  const flight = chapter.locator('[data-plane="flight"]');
  const result = chapter.locator('[data-plane="result"]');
  const video = chapter.locator('video');

  await scrollChapter(page, chapter, 0);
  await expect(source).toHaveCSS('opacity', '1');
  await expect.poll(() => result.evaluate((el) => Number(getComputedStyle(el).opacity))).toBeLessThan(0.5);

  await scrollChapter(page, chapter, 0.5);
  await expect(source).toHaveCSS('opacity', '0');
  await expect(flight).toHaveCSS('opacity', '1');
  expect(await video.evaluate((el) => /** @type {HTMLVideoElement} */ (el).paused)).toBe(true);

  await scrollChapter(page, chapter, 1);
  await expect(result).toHaveCSS('opacity', '1');
  await expect.poll(() => video.evaluate((el) => !(/** @type {HTMLVideoElement} */ (el).paused) && /** @type {HTMLVideoElement} */ (el).currentTime > 0)).toBe(true);
  expect(await video.evaluate((el) => /** @type {HTMLVideoElement} */ (el).muted)).toBe(true);

  const link = chapter.getByRole('link', { name: /Open live site/ });
  await expect(link).toHaveAttribute('href', 'https://myteacherstoolbox.com');
  await expect(link).toHaveAttribute('target', '_blank');
  await expect(link).toHaveAttribute('rel', /noopener/);
});

test('counters count up with the scroll and end on the exact values from products.js', async ({ page }) => {
  await openDoorA(page);
  const chapter = page.locator('[data-product="underfire-ai"]');
  const counters = chapter.locator('[data-counter]');
  await scrollChapter(page, chapter, 0);
  await expect(counters).toHaveText(['0', '0K+', '0', '0']);
  await scrollChapter(page, chapter, 0.3);
  await expect.poll(() => counters.allTextContents()).not.toEqual(['0', '0K+', '0', '0']);
  const midway = await counters.allTextContents();
  expect(midway).not.toEqual(['239', '47K+', '8', '17']);
  await scrollChapter(page, chapter, 0.8);
  await expect(counters).toHaveText(['239', '47K+', '8', '17']);
});

test('Crew Advisors types as the visitor scrolls, never finishes, and has no link', async ({ page }) => {
  await openDoorA(page);
  const chapter = page.locator('[data-product="crew-advisors"]');
  const code = chapter.locator('pre');
  await scrollChapter(page, chapter, 0);
  const early = (await code.textContent())?.length ?? 0;
  await scrollChapter(page, chapter, 1);
  await expect.poll(async () => (await code.textContent())?.length ?? 0).toBeGreaterThan(early);
  const late = (await code.textContent())?.length ?? 0;
  expect(late).toBeLessThan(crewExcerpt.code.length);
  await expect(chapter.locator('[data-cursor]')).toBeVisible();
  await expect(chapter.getByText('Coming soon')).toBeVisible();
  await expect(chapter.getByRole('link')).toHaveCount(0);
  await expect(chapter.locator('[data-live-dot]')).toHaveCount(0);
});

test('with reduced motion the product chapters show their code beside the poster and nothing plays', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openWithDoor(page, 'a');
  const chapter = page.locator('[data-product="founders-helm"]');
  await chapter.scrollIntoViewIfNeeded();
  // The code beside the flat stack (the stack's own source plane is the second pre, shown on its step).
  await expect(chapter.locator('pre').first()).toBeVisible();
  await expect(chapter.getByRole('img', { name: /Founders Helm/ })).toBeVisible();
  await expect(chapter.locator('[data-counter]')).toHaveText(['10', '55+', '40+', '0']);
  await page.waitForTimeout(800);
  expect(await chapter.locator('video').evaluate((el) => /** @type {HTMLVideoElement} */ (el).paused)).toBe(true);
  await expect(page.locator('canvas')).toHaveCount(0);
});
