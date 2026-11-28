// @ts-check
import { expect, test } from './plain.js';
import { openWithDoor } from './door.js';


/**
 * Scrolls a pinned section to a share of its scroll.
 * @param {import('@playwright/test').Page} page
 * @param {import('@playwright/test').Locator} section
 * @param {number} share 0..1
 */
async function scrollSection(page, section, share) {
  const top = await section.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const span = await section.evaluate((el) => el.getBoundingClientRect().height - window.innerHeight);
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + span * share));
}

/** @param {import('@playwright/test').Locator} video */
const playing = (video) => video.evaluate((el) => !(/** @type {HTMLVideoElement} */ (el).paused) && /** @type {HTMLVideoElement} */ (el).currentTime > 0);

/** @param {import('@playwright/test').Page} page */
async function openDoorB(page) {
  await openWithDoor(page, 'b');
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
}

test('choosing door b then scrolling reaches the family-site transformation', async ({ page }) => {
  await openDoorB(page);
  await expect(page.locator('[data-product]')).toHaveCount(0);
  const intro = page.locator('[data-door-b-intro]');
  const video = intro.locator('video');

  // C's stack (Living Source Phase 4): the source plane, then its characters in flight, then the screen.
  await scrollSection(page, intro, 0);
  await expect(intro.locator('[data-plane="source"]')).toHaveCSS('opacity', '1');
  await expect(intro.getByText('A website that feels like yours.')).toBeVisible();

  await scrollSection(page, intro, 0.5);
  await expect(intro.locator('[data-plane="source"]')).toHaveCSS('opacity', '0');
  await expect(intro.locator('[data-plane="flight"]')).toHaveCSS('opacity', '1');

  await scrollSection(page, intro, 1);
  await expect(intro.getByRole('img', { name: /Hearth/ })).toBeVisible();
  await expect.poll(() => playing(video)).toBe(true);
  expect(await video.evaluate((el) => /** @type {HTMLVideoElement} */ (el).muted)).toBe(true);
});

/** The built templates with a hosted demo, and where their demo button goes. */
const DEMOS = Object.freeze({ evergreen: 'https://evergreen-bay-eight.vercel.app/', 'copper-thistle': 'https://copper-thistle.vercel.app/' });

test('the template chapter compiles each template in turn, then plays its loop', async ({ page }) => {
  await openDoorB(page);
  const chapter = page.locator('[data-template-chapter]');
  const ids = ['evergreen', 'keepsake', 'vow', 'gather', 'folio', 'copper-thistle'];
  for (const [index, id] of [[0, 'evergreen'], [2, 'vow'], [5, 'copper-thistle']].map(([i, slug]) => /** @type {[number, string]} */ ([i, slug]))) {
    const start = index / ids.length;
    const segment = chapter.locator(`[data-door-b-template="${id}"]`);
    await scrollSection(page, chapter, start + 0.05 / ids.length);
    await expect(segment).toBeAttached();
    await expect(chapter.locator('[data-door-b-template]')).toHaveCount(1);
    await expect(segment.locator('[data-plane="source"]')).toHaveCSS('opacity', '1');

    await scrollSection(page, chapter, start + 0.4 / ids.length);
    await expect(segment.locator('[data-plane="source"]')).toHaveCSS('opacity', '0');
    await expect(segment.locator('[data-plane="flight"]')).toHaveCSS('opacity', '1');

    await scrollSection(page, chapter, start + 0.95 / ids.length);
    await expect.poll(() => playing(segment.locator('video'))).toBe(true);
    await expect(segment.getByRole('link', { name: /Ask about/ })).toHaveAttribute('href', `/contact?template=${id}`);
    const demo = segment.getByRole('link', { name: /See the live demo/ });
    if (id in DEMOS) await expect(demo).toHaveAttribute('href', DEMOS[/** @type {keyof typeof DEMOS} */ (id)]);
    else await expect(demo).toHaveCount(0);
  }
  await expect(chapter.getByRole('link', { name: /See every template/ })).toHaveAttribute('href', '/templates');
});

test('with reduced motion door b shows each template’s code beside its poster and nothing plays', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openWithDoor(page, 'b');
  await expect(page.locator('canvas')).toHaveCount(0);
  const items = page.locator('[data-door-b-template]');
  await expect(items).toHaveCount(6);
  const vow = page.locator('[data-door-b-template="vow"]');
  await vow.scrollIntoViewIfNeeded();
  // The code beside the flat stack (the stack's own source plane is the second pre, shown on its step).
  await expect(vow.locator('pre').first()).toBeVisible();
  await expect(vow.getByRole('img', { name: /Vow/ })).toBeVisible();
  await page.waitForTimeout(800);
  expect(await vow.locator('video').evaluate((el) => /** @type {HTMLVideoElement} */ (el).paused)).toBe(true);
});

test('no price appears anywhere on door b', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openWithDoor(page, 'b');
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/\$\s?\d/);
  expect(text).not.toMatch(/\bbuy\b/i);
});

test('door b ends with done-for-you, the builder, the idea and the brief, and its nav offers templates', async ({ page }) => {
  await openWithDoor(page, 'b');
  await expect(page.locator('#brief')).toBeAttached();
  const order = await page.locator('[data-chapter]').evaluateAll((els) => els.map((el) => el.getAttribute('data-chapter')));
  expect(order.slice(-4)).toEqual(['done-for-you', 'builder', 'idea', 'brief']);
  expect(order).not.toContain('how-i-work');
  await expect(page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Browse templates' })).toHaveAttribute(
    'href',
    '/templates',
  );
  await expect(page.locator('#brief [data-brief-action]')).toHaveText('Browse templates');
});
