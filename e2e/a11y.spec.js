// @ts-check
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from './plain.js';
import { openWithDoor } from './door.js';

/** @param {import('@playwright/test').Page} page */
async function seriousViolations(page) {
  const results = await new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();
  return results.violations
    .filter((v) => v.impact === 'serious' || v.impact === 'critical')
    .map((v) => ({ id: v.id, impact: v.impact, help: v.help, targets: v.nodes.slice(0, 5).map((n) => n.target.join(' ')) }));
}

for (const path of ['/', '/products', '/services', '/templates', '/about', '/contact']) {
  test(`no serious or critical accessibility violations on ${path}`, async ({ page }) => {
    await page.goto(path);
    await expect(page.locator('main h1').first()).toBeAttached();
    await page.waitForTimeout(1200);
    expect(await seriousViolations(page)).toEqual([]);
  });
}

for (const door of /** @type {const} */ (['a', 'b'])) {
  test(`no serious or critical accessibility violations on / with door ${door} open`, async ({ page }) => {
    await openWithDoor(page, door);
    await expect(page.locator('[data-chapter="brief"]')).toBeAttached();
    await page.waitForTimeout(1200);
    expect(await seriousViolations(page)).toEqual([]);
  });
}

test('no serious or critical accessibility violations with a path bar menu open, or the phone’s sheet (Living Source Phase 3)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto('/services');
  await page.getByRole('navigation', { name: 'Where you are' }).getByRole('button', { name: 'pages' }).click();
  await expect(page.locator('[data-path-row]').first()).toBeVisible();
  await page.waitForTimeout(600);
  expect(await seriousViolations(page)).toEqual([]);
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto('/services');
  await page.locator('[data-path-chip]').click();
  await expect(page.locator('[data-path-sheet]')).toBeVisible();
  await page.waitForTimeout(600);
  expect(await seriousViolations(page)).toEqual([]);
});
