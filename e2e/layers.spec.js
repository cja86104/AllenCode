// @ts-check
import AxeBuilder from '@axe-core/playwright';
import { expect as baseExpect, test as worldTest } from '@playwright/test';
import { expect, test } from './plain.js';
import { openWithDoor } from './door.js';

/**
 * C's layer stack (Living Source Phase 4) on the world-off home: the real source, its characters in flight and
 * the real result as planes in CSS 3D, pulled apart by scroll and settled flat on the result, with three steps.
 */

const FLAT = /^(none|matrix\(1, 0, 0, 1, 0, 0\))$/;

/** @param {import('@playwright/test').Page} page @param {string} section @param {number} p */
async function scrollThrough(page, section, p) {
  await page.locator(section).evaluate((el, share) => {
    const rect = el.getBoundingClientRect();
    const span = rect.height - window.innerHeight;
    window.scrollTo({ top: rect.top + window.scrollY + share * span, behavior: 'instant' });
  }, p);
}

/** @param {import('@playwright/test').Locator} chapter */
const boxTransform = (chapter) => chapter.locator('[data-layer-box]').evaluate((el) => getComputedStyle(el).transform);

test('a service chapter: tilted at its source, apart in its transformation, flat on its result', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWithDoor(page, 'a');
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
  const chapter = page.locator('[data-layer-chapter]').first();
  const id = `[data-chapter="${await chapter.getAttribute('data-chapter')}"]`;
  const stack = chapter.locator('[data-layer-stack]');
  const steps = chapter.getByRole('group', { name: 'Steps' });

  await scrollThrough(page, id, 0.02);
  await expect(stack).toHaveAttribute('data-step', 'source');
  expect(await boxTransform(chapter)).toMatch(/^matrix3d/);
  await expect(steps.getByRole('button', { name: '01 Source' })).toHaveAttribute('aria-current', 'step');

  await scrollThrough(page, id, 0.4);
  await expect(stack).toHaveAttribute('data-step', 'transformation');
  const apart = await chapter.locator('[data-plane="source"]').evaluate((el) => getComputedStyle(el).transform);
  expect(apart, 'the source lifted off the screen').toMatch(/^matrix3d/);

  await scrollThrough(page, id, 1);
  await expect(stack).toHaveAttribute('data-step', 'result');
  await expect.poll(() => boxTransform(chapter)).toMatch(FLAT);
  await expect(steps.getByRole('button', { name: '03 Result' })).toHaveAttribute('aria-current', 'step');
});

test('a step button glides the chapter to its step', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWithDoor(page, 'a');
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
  const chapter = page.locator('[data-layer-chapter]').first();
  const id = `[data-chapter="${await chapter.getAttribute('data-chapter')}"]`;
  await scrollThrough(page, id, 0.02);
  await expect(chapter.locator('[data-layer-stack]')).toHaveAttribute('data-step', 'source');
  const result = chapter.getByRole('group', { name: 'Steps' }).getByRole('button', { name: '03 Result' });
  await result.click();
  await expect(chapter.locator('[data-layer-stack]')).toHaveAttribute('data-step', 'result', { timeout: 5000 });
  await expect(result).toBeFocused();
});

test('the provenance names the repository, path, lines and commit, and links nowhere', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWithDoor(page, 'a');
  const provenance = page.locator('[data-layer-chapter] [data-provenance]').first();
  await expect(provenance).toContainText(/\S+\/\S+ · \S+/);
  await expect(provenance).toContainText(/lines \d+–\d+ · commit [0-9a-f]{7}/);
  await expect(page.locator('[data-provenance] a')).toHaveCount(0);
});

test('reduced motion: flat and still, the steps switch the view at once', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWithDoor(page, 'a');
  const chapter = page.locator('[data-layer-chapter]').first();
  await chapter.scrollIntoViewIfNeeded();
  await expect(chapter.locator('[data-layer-stack]')).toHaveAttribute('data-step', 'result');
  const tilted = await page.locator('[data-layer-box], [data-plane]').evaluateAll((els) => els.filter((el) => getComputedStyle(el).transform.startsWith('matrix3d')).length);
  expect(tilted, 'nothing in 3D').toBe(0);
  await chapter.getByRole('button', { name: '01 Source' }).click();
  await expect(chapter.locator('[data-layer-stack]')).toHaveAttribute('data-step', 'source');
  await expect(chapter.getByRole('button', { name: '01 Source' })).toBeFocused();
});

test('the phone: a stack about 320 px wide and three full-width step buttons', async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await openWithDoor(page, 'a');
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
  const chapter = page.locator('[data-layer-chapter]').first();
  await chapter.locator('[data-layer-stack]').waitFor();
  const stack = await chapter.locator('[data-layer-stack]').boundingBox();
  expect(stack?.width ?? 0).toBeLessThanOrEqual(340);
  const buttons = chapter.getByRole('group', { name: 'Steps' }).getByRole('button');
  await expect(buttons).toHaveText(['01 Source', '02 Flight', '03 Result']);
  const boxes = await buttons.evaluateAll((els) => els.map((el) => el.getBoundingClientRect()).map((r) => ({ y: r.y, h: r.height })));
  expect(new Set(boxes.map((b) => Math.round(b.y))).size, 'one row').toBe(1);
  for (const b of boxes) expect(b.h).toBeGreaterThanOrEqual(48);
});

test('axe finds nothing serious with door A’s stacks', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWithDoor(page, 'a');
  await page.locator('[data-layer-stack]').first().waitFor();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
});

worldTest('the world on: chapters keep their flight, no stack, and the stack’s code is never fetched', async ({ page }) => {
  /** @type {string[]} */
  const scripts = [];
  page.on('response', async (response) => {
    if (response.url().endsWith('.js')) scripts.push(await response.text().catch(() => ''));
  });
  await page.addInitScript(() => sessionStorage.setItem('allencode:door', 'a'));
  await page.goto('/?world=1');
  await baseExpect(page.locator('canvas[data-world][data-ready="true"]')).toHaveCount(1, { timeout: 15000 });
  await page.waitForTimeout(1500);
  await baseExpect(page.locator('[data-layer-stack]')).toHaveCount(0);
  baseExpect(scripts.some((text) => text.includes('data-layer-stack'))).toBe(false);
});

for (const [door, name, selector] of /** @type {const} */ ([
  ['a', 'a product', '[data-product="underfire-ai"]'],
  ['b', 'door B’s opening', '[data-door-b-intro]'],
  ['b', 'the builder', '[data-chapter="builder"]'],
])) {
  test(`${name}: tilted at its start, flat at its end`, async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await openWithDoor(page, door);
    await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
    const chapter = page.locator(selector);
    await chapter.locator('[data-layer-stack]').waitFor();
    await scrollThrough(page, selector, 0.02);
    await expect.poll(() => boxTransform(chapter)).toMatch(/^matrix3d/);
    await scrollThrough(page, selector, 1);
    await expect(chapter.locator('[data-layer-stack]')).toHaveAttribute('data-step', 'result');
    await expect.poll(() => boxTransform(chapter)).toMatch(FLAT);
    // Every step's words fit their button, whatever the screen's shape (the builder's portrait is narrow).
    const cut = await chapter.getByRole('group', { name: 'Steps' }).getByRole('button').evaluateAll((els) => els.filter((el) => el.scrollWidth > el.clientWidth + 1).length);
    expect(cut, 'no step label overflows').toBe(0);
  });
}

test('at 1440 px the tilted stack stays inside the window', async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await openWithDoor(page, 'b');
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
  const chapter = page.locator('[data-template-chapter]');
  const n = ((await chapter.getAttribute('data-template-order')) ?? '').split(' ').length;
  await chapter.evaluate((el, count) => {
    const rect = el.getBoundingClientRect();
    window.scrollTo({ top: rect.top + window.scrollY + ((1 + 0.35) * (rect.height - window.innerHeight)) / count, behavior: 'instant' });
  }, n);
  await expect(chapter.locator('[data-layer-stack]')).toHaveAttribute('data-step', 'transformation');
  const right = await chapter.locator('[data-plane]').evaluateAll((els) => Math.max(...els.map((el) => el.getBoundingClientRect().right)));
  expect(right).toBeLessThanOrEqual(1440);
});

test('a template’s steps move within its own segment', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWithDoor(page, 'b');
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
  const chapter = page.locator('[data-template-chapter]');
  const order = ((await chapter.getAttribute('data-template-order')) ?? '').split(' ');
  // Into the second template's segment, at its source.
  await chapter.evaluate((el, n) => {
    const rect = el.getBoundingClientRect();
    window.scrollTo({ top: rect.top + window.scrollY + ((1 + 0.03) * (rect.height - window.innerHeight)) / n, behavior: 'instant' });
  }, order.length);
  const segment = chapter.locator(`[data-door-b-template="${order[1]}"]`);
  await expect(segment.locator('[data-layer-stack]')).toHaveAttribute('data-step', 'source');
  await segment.getByRole('button', { name: '03 Result' }).click();
  await expect(segment.locator('[data-layer-stack]')).toHaveAttribute('data-step', 'result', { timeout: 5000 });
  await expect(chapter.locator(`[data-door-b-template="${order[1]}"]`)).toBeAttached();
});

test('axe finds nothing serious with door B’s stacks', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await openWithDoor(page, 'b');
  await page.locator('[data-layer-stack]').first().waitFor();
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  expect(results.violations.filter((v) => v.impact === 'serious' || v.impact === 'critical').map((v) => v.id)).toEqual([]);
});
