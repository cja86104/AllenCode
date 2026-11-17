// @ts-check
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';
import { canvas, inChapter, near, open, restRect, takeFamily } from './world.js';

/**
 * Code World W3: with family/ taken, door B's chapters run along the family road as door A's run
 * along the business road: Hearth, each template as its own chapter, then done for you, each resting
 * at its landmark while its code flies into its picture.
 */

const ROAD = ['hearth', 'evergreen', 'keepsake', 'vow', 'gather', 'folio', 'done-for-you'];

/**
 * Checks a chapter's flight lands on its landmark and its loop takes over there and plays.
 * @param {import('@playwright/test').Page} page
 * @param {string} id The road stop.
 * @param {string} flight The flight's key prefix.
 */
async function landsAndPlays(page, id, flight) {
  await inChapter(page, id, 0.15);
  await expect(canvas(page)).toHaveAttribute('data-section', `rest:${id}`);
  await inChapter(page, id, 0.5);
  await expect(canvas(page)).toHaveAttribute('data-flight', new RegExp(`^${flight}:`));
  await inChapter(page, id, 0.97);
  const target = page.locator(`[data-world-stop="${id}"] [data-world-target]`);
  await expect(target).toHaveCSS('opacity', '1');
  const box = await target.boundingBox();
  if (!box) throw new Error('no box');
  expect(near(box, await restRect(page)), `${id}: the loop over its landmark`).toBe(true);
  const video = target.locator('video');
  await expect
    .poll(() => video.evaluate((el) => !(/** @type {HTMLVideoElement} */ (el).paused) && /** @type {HTMLVideoElement} */ (el).currentTime > 0), { timeout: 8000 })
    .toBe(true);
}

test('taking family/ lays door B along the road: Hearth, the five templates, done for you, then the builder', async ({ page }) => {
  await open(page);
  await takeFamily(page);
  const ids = await page.locator('[data-world-stop]').evaluateAll((els) => els.map((el) => /** @type {HTMLElement} */ (el).dataset.worldStop));
  // Then where the roads meet (W4).
  expect(ids).toEqual([...ROAD, 'workshop', 'your-idea']);
  const order = await page.evaluate(() => {
    const done = /** @type {HTMLElement} */ (document.querySelector('[data-world-stop="done-for-you"]'));
    const builder = /** @type {HTMLElement} */ (document.querySelector('[data-chapter="builder"]'));
    return done.compareDocumentPosition(builder) & Node.DOCUMENT_POSITION_FOLLOWING;
  });
  expect(order).toBeTruthy();
});

test('Hearth types, flies into its landmark in the world, then its loop takes over exactly there', async ({ page }) => {
  test.setTimeout(60000);
  await open(page);
  await takeFamily(page);
  await landsAndPlays(page, 'hearth', 'door-b-intro');
});

test('each template types, flies into its landmark, then its loop takes over, numbered n / 5', async ({ page }) => {
  test.setTimeout(120000);
  await open(page);
  await takeFamily(page);
  for (const [n, id] of ['evergreen', 'keepsake', 'vow', 'gather', 'folio'].entries()) {
    await landsAndPlays(page, id, `template-${id}`);
    await expect(page.locator(`[data-world-stop="${id}"]`)).toContainText(`${n + 1} / 5`);
  }
});

test('done for you rests on the road: its words, no landmark, no rest rect, the scrim on', async ({ page }) => {
  await open(page);
  await takeFamily(page);
  await inChapter(page, 'done-for-you', 0.5);
  await expect(canvas(page)).toHaveAttribute('data-section', 'rest:done-for-you');
  await expect(page.locator('[data-world-stop="done-for-you"] [data-chapter="done-for-you"]')).toBeVisible();
  expect(await canvas(page).getAttribute('data-rest-rect')).toBeNull();
  await expect(page.locator('[data-world-scrim]')).toHaveCSS('opacity', '1');
});

test('arriving straight at Vow (a returning visitor): the three before have landed, its flight follows its scroll', async ({ page }) => {
  await page.addInitScript(() => window.sessionStorage.setItem('allencode:door', 'b'));
  await open(page);
  await expect(page.locator('[data-world-stop="vow"]')).toBeAttached();
  await inChapter(page, 'vow', 0.5);
  await expect.poll(() => canvas(page).getAttribute('data-landed'), { timeout: 8000 }).toBe('hearth,evergreen,keepsake');
  await expect(canvas(page)).toHaveAttribute('data-flight', /^template-vow:/);
});

test('switching to business in the nav mid-road leaves the family road behind', async ({ page }) => {
  await open(page);
  await takeFamily(page);
  await inChapter(page, 'keepsake', 0.5);
  await page.getByRole('group', { name: 'Show the site for' }).first().getByRole('button', { name: 'Business' }).click();
  await expect(page.locator('[data-world-stop="vow"]')).toHaveCount(0);
  await expect(page.locator('[data-world-stop="my-teachers-toolbox"]')).toBeAttached();
  await expect(canvas(page)).toHaveAttribute('data-road', 'a');
  await expect(canvas(page)).not.toHaveAttribute('data-flight', /^template-keepsake:/);
});

test('reduced motion with the switch and door b: today’s door B page, no world', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => window.sessionStorage.setItem('allencode:door', 'b'));
  await page.goto('/?world=1');
  await expect(page.locator('[data-door-b-intro]')).toBeAttached();
  await expect(page.locator('[data-template-chapter]')).toHaveCount(1);
  await expect(page.locator('[data-world-stop]')).toHaveCount(0);
  await expect(page.locator('canvas[data-world]')).toHaveCount(0);
});

test('no accessibility violations at Hearth, at a template and at done for you', async ({ page }) => {
  test.setTimeout(60000);
  await open(page);
  await takeFamily(page);
  const check = async () => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  };
  await inChapter(page, 'hearth', 0.97);
  await check();
  await inChapter(page, 'vow', 0.97);
  await check();
  await inChapter(page, 'done-for-you', 0.5);
  await check();
});

test('the rail’s current stop reads down the line beside it, never out over the page or past either end (Chris, 2026-11-17)', async ({ page }) => {
  await open(page);
  await takeFamily(page);
  for (const id of ROAD) {
    await inChapter(page, id, 0.5);
    const box = await page.evaluate(() => {
      const rect = (/** @type {Element | null} */ el) => {
        if (!el) throw new Error('missing rail part');
        const r = el.getBoundingClientRect();
        return { left: r.left, right: r.right, top: r.top, bottom: r.bottom, width: r.width, height: r.height };
      };
      const rail = /** @type {HTMLElement} */ (document.querySelector('[data-rail]'));
      const ends = rail.querySelectorAll(':scope > span');
      return {
        label: rect(rail.querySelector('[aria-current="step"] span')),
        line: rect(rail.querySelector(':scope > div')),
        top: rect(ends[0]),
        bottom: rect(ends[ends.length - 1]),
      };
    });
    // Written down the line, as "empty file" and "shipped" are.
    expect(box.label.height, id).toBeGreaterThan(box.label.width);
    // Beside the line, on its left, close to it.
    expect(box.label.right, id).toBeLessThanOrEqual(box.line.left);
    expect(box.line.left - box.label.right, id).toBeLessThan(24);
    // Never past either end's label.
    expect(box.label.top, id).toBeGreaterThanOrEqual(box.top.bottom);
    expect(box.label.bottom, id).toBeLessThanOrEqual(box.bottom.top);
  }
});
