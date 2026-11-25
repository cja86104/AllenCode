// @ts-check
import AxeBuilder from '@axe-core/playwright';
import { expect, test } from '@playwright/test';

/**
 * Code World W6 (Chris, 2026-11-17: "Small toggle in footer"): a "Plain view" switch in the footer and
 * the phone menu turns the world off and on at once, kept for the visit; it is there only where the
 * world can run. Since 2026-11-25 it is in the top bar as well (desktop, from 1280px).
 */

/** @param {import('@playwright/test').Page} page */
const footerToggle = (page) => page.locator('footer').getByRole('button', { name: 'Plain view' });

test.describe('the plain-view toggle', () => {
  test('turns the world off at once, keeps it off for the visit, and back on again', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('canvas[data-world][data-ready="true"]')).toHaveCount(1);
    await expect(footerToggle(page)).toHaveAttribute('aria-pressed', 'false');
    await footerToggle(page).click();
    await expect(footerToggle(page)).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('canvas[data-world]')).toHaveCount(0);
    await expect(page.locator('[data-world-stretch]')).toHaveCount(0);
    expect(await page.evaluate(() => document.documentElement.hasAttribute('data-stretch-ahead'))).toBe(false);
    // Kept for the visit: the next page is plain too, and loads plain.
    await page.goto('/services');
    await expect(page.locator('[data-world-stretch]')).toHaveCount(0);
    await expect(page.locator('canvas[data-world]')).toHaveCount(0);
    await expect(footerToggle(page)).toHaveAttribute('aria-pressed', 'true');
    await footerToggle(page).click();
    await expect(page.locator('canvas[data-world][data-ready="true"]')).toHaveCount(1);
    await expect(page.locator('[data-world-stretch]')).toHaveCount(1);
  });

  test('wins over ?world=1 in the address', async ({ page }) => {
    await page.goto('/about?world=1');
    await expect(page.locator('canvas[data-world][data-ready="true"]')).toHaveCount(1);
    await footerToggle(page).click();
    await expect(page.locator('canvas[data-world]')).toHaveCount(0);
    await expect(page).not.toHaveURL(/world=1/);
  });

  test('is in the top bar too, and stays in step with the footer', async ({ page }) => {
    await page.goto('/about');
    await expect(page.locator('canvas[data-world][data-ready="true"]')).toHaveCount(1);
    const top = page.getByRole('navigation', { name: 'Primary' }).getByRole('button', { name: 'Plain view' });
    await expect(top).toBeVisible();
    await expect(top).toHaveAttribute('aria-pressed', 'false');
    await top.click();
    await expect(page.locator('canvas[data-world]')).toHaveCount(0);
    await expect(top).toHaveAttribute('aria-pressed', 'true');
    await expect(footerToggle(page)).toHaveAttribute('aria-pressed', 'true');
    await footerToggle(page).click();
    await expect(top).toHaveAttribute('aria-pressed', 'false');
    await expect(page.locator('canvas[data-world][data-ready="true"]')).toHaveCount(1);
  });

  test('is in the phone menu too', async ({ browser }) => {
    const context = await browser.newContext({ viewport: { width: 393, height: 852 } });
    const page = await context.newPage();
    await page.goto('/about');
    await page.getByRole('button', { name: 'Toggle menu' }).click();
    const toggle = page.getByRole('navigation', { name: 'Mobile' }).getByRole('button', { name: 'Plain view' });
    await expect(toggle).toHaveAttribute('aria-pressed', 'false');
    await toggle.click();
    await expect(page.locator('canvas[data-world]')).toHaveCount(0);
    await context.close();
  });

  test('is not offered where the world cannot run (reduced motion)', async ({ browser }) => {
    const context = await browser.newContext({ reducedMotion: 'reduce' });
    const page = await context.newPage();
    await page.goto('/about');
    await expect(page.locator('footer')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Plain view' })).toHaveCount(0);
    await context.close();
  });

  test('passes axe in the footer', async ({ page }) => {
    await page.goto('/about');
    await expect(footerToggle(page)).toBeVisible();
    const results = await new AxeBuilder({ page }).include('footer').analyze();
    expect(results.violations).toEqual([]);
  });
});
