// @ts-check
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Code World, W2 revised (R4): today's home page plays inside the world. The gate starts it; the
 * world opening follows; with business/ taken, today's chapters run along the road, each resting at
 * its landmark while its code flies into its picture.
 */

const ROAD = [
  'my-teachers-toolbox',
  'underfire-ai',
  'founders-helm',
  'crew-advisors',
  'mvp-sprints',
  'custom-saas-builds',
  'ai-integration',
  'technical-audits',
  'how-i-work',
];
const PRODUCTS = ['my-teachers-toolbox', 'underfire-ai', 'founders-helm'];
const SERVICES = ['mvp-sprints', 'custom-saas-builds', 'ai-integration'];

/** @param {import('@playwright/test').Page} page */
const canvas = (page) => page.locator('canvas[data-world]');

/** @param {import('@playwright/test').Page} page */
async function open(page) {
  await page.goto('/?world=1');
  await canvas(page).and(page.locator('[data-ready="true"]')).waitFor();
  await page.locator('[data-world-journey]').waitFor();
}

/** Scrolls to `y` and waits for the canvas to have drawn there. @param {import('@playwright/test').Page} page @param {number} y */
async function scrollTo(page, y) {
  await page.evaluate((top) => window.scrollTo(0, top), y);
  await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 5000 }).toBeGreaterThan(y - 3);
  await page.waitForTimeout(250);
}

/** The scroll span a section's frame is pinned for (from its top until its last screen). @param {import('@playwright/test').Page} page @param {string} selector */
async function spanOf(page, selector) {
  return page.evaluate((sel) => {
    const el = /** @type {HTMLElement} */ (document.querySelector(sel));
    const rect = el.getBoundingClientRect();
    const from = rect.top + window.scrollY;
    return { from, to: from + rect.height - window.innerHeight };
  }, selector);
}

/** Scrolls to a share (0..1) of a road chapter's pinned span. @param {import('@playwright/test').Page} page @param {string} id @param {number} share */
async function inChapter(page, id, share) {
  const span = await spanOf(page, `[data-world-stop="${id}"]`);
  await scrollTo(page, span.from + (span.to - span.from) * share);
}

/** Takes business/ at the fork and waits for the glide to end. @param {import('@playwright/test').Page} page */
async function takeBusiness(page) {
  const journey = await spanOf(page, '[data-world-journey]');
  await scrollTo(page, journey.to);
  await expect(page.locator('[data-active-stop]')).toHaveAttribute('data-active-stop', 'The fork');
  await page.getByRole('button', { name: /business\// }).click();
  await expect(canvas(page)).toHaveAttribute('data-road', 'a');
  await page.waitForFunction(() => !document.documentElement.classList.contains('lenis-smooth'), undefined, { timeout: 8000 });
}

/** The canvas's box for the resting landmark, in CSS pixels. @param {import('@playwright/test').Page} page */
async function restRect(page) {
  const value = await canvas(page).getAttribute('data-rest-rect');
  if (!value) throw new Error('no rest rect');
  const [left, top, width, height] = value.split(',').map(Number);
  return { left, top, width, height };
}

/** Whether a box lies within 3 % (of the rect's size) of the rect. */
function near(/** @type {{ x: number, y: number, width: number, height: number }} */ box, /** @type {{ left: number, top: number, width: number, height: number }} */ rect) {
  const dx = 0.03 * rect.width;
  const dy = 0.03 * rect.height;
  return Math.abs(box.x - rect.left) <= dx && Math.abs(box.y - rect.top) <= dy && Math.abs(box.width - rect.width) <= dx && Math.abs(box.height - rect.height) <= dy;
}

test.describe('the world starts as today does (Code World R4)', () => {
  test('the gate’s empty file types and flies into the headline, drawn by the world; the world’s own file stays hidden until then', async ({ page }) => {
    await open(page);
    await expect(canvas(page)).toHaveAttribute('data-section', 'gate');
    await expect(page.locator('[data-chapter="gate"] [data-editor-frame]')).toBeVisible();
    await expect(canvas(page)).toHaveAttribute('data-editor', '0.00');
    const gate = await spanOf(page, '[data-world-segment="gate"]');
    await scrollTo(page, gate.from + (gate.to - gate.from) * 0.75);
    await expect(canvas(page)).toHaveAttribute('data-flight', /^gate:/);
    await expect(canvas(page)).toHaveAttribute('data-editor', '0.00');
    await scrollTo(page, gate.to);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    const journey = await spanOf(page, '[data-world-journey]');
    await scrollTo(page, journey.from + 50);
    await expect.poll(async () => Number(await canvas(page).getAttribute('data-editor'))).toBeGreaterThan(0.9);
  });

  test('taking business/ lays today’s chapters along the road, products first', async ({ page }) => {
    await open(page);
    await takeBusiness(page);
    const ids = await page.locator('[data-world-stop]').evaluateAll((els) => els.map((el) => /** @type {HTMLElement} */ (el).dataset.worldStop));
    expect(ids).toEqual(ROAD);
  });
});

test.describe('each chapter plays at its landmark (Code World R4)', () => {
  test('each product types, flies into its landmark in the world, then its loop takes over exactly there', async ({ page }) => {
    test.setTimeout(90000);
    await open(page);
    await takeBusiness(page);
    for (const slug of PRODUCTS) {
      await inChapter(page, slug, 0.15);
      await expect(canvas(page)).toHaveAttribute('data-section', `rest:${slug}`);
      await expect(page.locator(`[data-product="${slug}"] pre`).first()).toBeVisible();
      await inChapter(page, slug, 0.5);
      await expect(canvas(page)).toHaveAttribute('data-flight', new RegExp(`^${slug}:`));
      await inChapter(page, slug, 0.97);
      const target = page.locator(`[data-world-stop="${slug}"] [data-world-target]`);
      await expect(target).toHaveCSS('opacity', '1');
      const box = await target.boundingBox();
      if (!box) throw new Error('no box');
      expect(near(box, await restRect(page)), `${slug}: the loop over its landmark`).toBe(true);
      const video = target.locator('video');
      await expect.poll(() => video.evaluate((el) => !(/** @type {HTMLVideoElement} */ (el).paused) && /** @type {HTMLVideoElement} */ (el).currentTime > 0), { timeout: 8000 }).toBe(true);
    }
  });

  test('each service flies into its landmark, then its screen takes over exactly there', async ({ page }) => {
    test.setTimeout(90000);
    await open(page);
    await takeBusiness(page);
    for (const slug of SERVICES) {
      await inChapter(page, slug, 0.5);
      await expect(canvas(page)).toHaveAttribute('data-flight', new RegExp(`^${slug}:`));
      await inChapter(page, slug, 0.97);
      const target = page.locator(`[data-world-stop="${slug}"] [data-world-target]`);
      await expect(target).toHaveCSS('opacity', '1');
      const box = await target.boundingBox();
      if (!box) throw new Error('no box');
      expect(near(box, await restRect(page)), `${slug}: the screen over its landmark`).toBe(true);
    }
  });

  test('Crew Advisors has its editor box, typing unfinished with its cursor, and no flight', async ({ page }) => {
    await open(page);
    await takeBusiness(page);
    await inChapter(page, 'crew-advisors', 0.6);
    await expect(canvas(page)).toHaveAttribute('data-section', 'rest:crew-advisors');
    const box = page.locator('[data-world-stop="crew-advisors"] [data-world-target] figure');
    await expect(box).toBeVisible();
    await expect(box).toContainText('crew-advisors.ts');
    await expect(page.locator('[data-world-stop="crew-advisors"]')).toContainText('Coming soon');
    expect(await canvas(page).getAttribute('data-flight')).toBeNull();
  });

  test('the audit checks its lines one by one, and How I work ships its commits', async ({ page }) => {
    test.setTimeout(60000);
    await open(page);
    await takeBusiness(page);
    const checked = () => page.locator('[data-world-stop="technical-audits"] [data-checked="true"]').count();
    await inChapter(page, 'technical-audits', 0.2);
    const early = await checked();
    await inChapter(page, 'technical-audits', 0.8);
    expect(await checked()).toBeGreaterThan(early);
    const shipped = () => page.locator('[data-world-stop="how-i-work"] [data-shipped="true"]').count();
    await inChapter(page, 'how-i-work', 0.05);
    const before = await shipped();
    await inChapter(page, 'how-i-work', 0.95);
    expect(await shipped()).toBeGreaterThan(before);
  });

  test('landmarks passed show their picture; ahead they are still code', async ({ page }) => {
    await open(page);
    await takeBusiness(page);
    await inChapter(page, 'underfire-ai', 0.5);
    await expect.poll(() => canvas(page).getAttribute('data-landed'), { timeout: 8000 }).toContain('my-teachers-toolbox');
    expect(await canvas(page).getAttribute('data-landed')).not.toContain('underfire-ai');
    await inChapter(page, 'founders-helm', 0.5);
    await expect.poll(() => canvas(page).getAttribute('data-landed')).toContain('underfire-ai');
    expect(await canvas(page).getAttribute('data-landed')).not.toContain('founders-helm');
  });

  test('arriving straight at Founders Helm (a returning visitor): the two before have landed, its flight follows its scroll', async ({ page }) => {
    await page.addInitScript(() => window.sessionStorage.setItem('allencode:door', 'a'));
    await open(page);
    await expect(page.locator('[data-world-stop="founders-helm"]')).toBeAttached();
    await inChapter(page, 'founders-helm', 0.5);
    await expect.poll(() => canvas(page).getAttribute('data-landed'), { timeout: 8000 }).toBe('my-teachers-toolbox,underfire-ai');
    await expect(canvas(page)).toHaveAttribute('data-flight', /^founders-helm:/);
  });

  test('turning the phone mid-chapter keeps the real screen on its landmark', async ({ page }) => {
    await open(page);
    await takeBusiness(page);
    await inChapter(page, 'underfire-ai', 0.97);
    await page.setViewportSize({ width: 393, height: 852 });
    await page.waitForTimeout(600);
    await inChapter(page, 'underfire-ai', 0.97);
    const target = page.locator('[data-world-stop="underfire-ai"] [data-world-target]');
    await expect
      .poll(async () => {
        const box = await target.boundingBox();
        return box ? near(box, await restRect(page)) : false;
      })
      .toBe(true);
  });

  test('switching to family in the nav mid-road leaves the business road behind', async ({ page }) => {
    await open(page);
    await takeBusiness(page);
    await inChapter(page, 'underfire-ai', 0.5);
    await page.getByRole('group', { name: 'Show the site for' }).first().getByRole('button', { name: 'Family' }).click();
    await expect(page.locator('[data-world-stop]')).toHaveCount(0);
    await expect(canvas(page)).not.toHaveAttribute('data-road', 'a');
    await expect(canvas(page)).not.toHaveAttribute('data-flight', /.+/);
  });

  test('the scrim is behind a resting chapter’s words, and gone on the road between', async ({ page }) => {
    await open(page);
    await takeBusiness(page);
    const scrim = page.locator('[data-world-scrim]');
    await inChapter(page, 'underfire-ai', 0.5);
    await expect(scrim).toHaveCSS('opacity', '1');
    const rest = await spanOf(page, '[data-world-stop="founders-helm"]');
    await scrollTo(page, rest.from - 400);
    await expect(canvas(page)).toHaveAttribute('data-section', 'road');
    await expect(scrim).toHaveCSS('opacity', '0');
  });
});

test('reduced motion with the switch: today’s page, no world', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.addInitScript(() => window.sessionStorage.setItem('allencode:door', 'a'));
  await page.goto('/?world=1');
  await expect(page.locator('[data-chapter="mvp-sprints"]')).toBeAttached();
  await expect(page.locator('[data-product="underfire-ai"]')).toBeAttached();
  await expect(page.locator('canvas[data-world]')).toHaveCount(0);
  await expect(page.locator('[data-world-stop]')).toHaveCount(0);
});

test('no accessibility violations at the gate, at a product chapter and at How I work', async ({ page }) => {
  test.setTimeout(60000);
  await open(page);
  const check = async () => {
    const results = await new AxeBuilder({ page }).analyze();
    expect(results.violations.map((v) => `${v.id}: ${v.nodes.map((n) => n.target.join(' ')).join(', ')}`)).toEqual([]);
  };
  await check();
  await takeBusiness(page);
  await inChapter(page, 'underfire-ai', 0.97);
  await check();
  await inChapter(page, 'how-i-work', 0.5);
  await check();
});
