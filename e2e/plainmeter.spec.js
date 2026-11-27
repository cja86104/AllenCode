// @ts-check
import { readFileSync } from 'node:fs';
import { expect, test } from './plain.js';
import { expect as worldExpect, test as base } from '@playwright/test';
import { canvas } from './world.js';

/** The frame readout with the world off (Living Source, Phase 1, Task 1): `?meter=1` reads the same either way. */

test('/?meter=1 shows one readout that counts frames while the page scrolls', async ({ page }) => {
  await page.goto('/?meter=1');
  const meter = page.locator('[data-frame-meter]');
  await expect(meter).toHaveCount(1);
  await page.evaluate(() => window.scrollTo(0, 2000));
  await expect.poll(async () => Number(await meter.getAttribute('data-frames')), { timeout: 10000 }).toBeGreaterThan(0);
  expect(await meter.textContent()).toMatch(/^plain · /);
});

test('/ has no readout without ?meter=1', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-frame-meter]')).toHaveCount(0);
});

test('the prebuilt home page carries no readout', () => {
  expect(readFileSync('dist/index.html', 'utf8')).not.toContain('data-frame-meter');
});

base('with the world on, /?world=1&meter=1 shows the world’s own readout, not the plain one', async ({ page }) => {
  await page.goto('/?world=1&meter=1');
  await canvas(page).and(page.locator('[data-ready="true"]')).waitFor();
  const meter = page.locator('[data-frame-meter]');
  await worldExpect(meter).toHaveCount(1);
  await worldExpect(meter).toHaveText(/· frames \d+/);
  await worldExpect(meter).not.toHaveText(/^plain · /);
});
