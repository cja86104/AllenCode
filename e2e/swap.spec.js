// @ts-check
import { expect, test } from '@playwright/test';
import { products } from '../src/data/products.js';

const HEADLINE = 'Welcome to Allen Code Co. What would you like to build today?';

test('/ renders the Source to Screen experience', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: HEADLINE })).toHaveCount(1);
  await expect(page.getByText('It all starts with an empty file…')).toHaveCount(1);
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveCount(1);
  await expect(page.getByRole('button', { name: "I'm building a product or business" })).toBeVisible();
  await expect(page.getByLabel('Your idea')).toBeAttached();
  await expect(page.locator('#brief form')).toBeAttached();
});

test('/preview no longer exists', async ({ page }) => {
  await page.goto('/preview');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1, name: HEADLINE })).toHaveCount(0);
  await expect(page.getByText(/not found|404|doesn.t exist/i).first()).toBeVisible();
});

test('robots.txt no longer mentions /preview', async ({ request }) => {
  const body = await (await request.get('/robots.txt')).text();
  expect(body).not.toContain('/preview');
  expect(body).toContain('Allow: /');
});

const INNER_ROUTES = [
  '/products',
  ...products.map((product) => `/products/${product.slug}`),
  '/services',
  '/templates',
  '/about',
  '/contact',
  '/checkout-success',
];

for (const route of INNER_ROUTES) {
  test(`${route} still loads`, async ({ page }) => {
    /** @type {string[]} */
    const errors = [];
    page.on('pageerror', (error) => errors.push(error.message));
    await page.goto(route);
    await expect(page.locator('main h1').first()).toBeVisible();
    await expect(page).toHaveTitle(/Allen Code Co/);
    await expect(page.locator('canvas')).toHaveCount(0);
    expect(errors).toEqual([]);
  });
}

test('skip link is the first focusable element and moves focus to the main content', async ({ page }) => {
  await page.goto('/');
  await page.keyboard.press('Tab');
  const skip = page.getByRole('link', { name: 'Skip to content' });
  await expect(skip).toBeFocused();
  await expect(skip).toBeVisible();
  await page.keyboard.press('Enter');
  await expect(page.locator('main#main')).toBeFocused();
});

test('tab order never traps focus inside a pinned scene', async ({ page }) => {
  await page.goto('/');
  await page.getByRole('button', { name: "I'm building a product or business" }).click();
  /** @type {string[]} */
  const visited = [];
  for (let i = 0; i < 160; i += 1) {
    await page.keyboard.press('Tab');
    const where = await page.evaluate(() => {
      const el = document.activeElement;
      if (!el || el === document.body) return 'body';
      const chapter = el.closest('[data-chapter]');
      return `${chapter ? chapter.getAttribute('data-chapter') : el.closest('footer') ? 'footer' : el.closest('header') ? 'header' : 'other'}`;
    });
    visited.push(where);
    if (where === 'footer') break;
  }
  expect(visited).toContain('idea');
  expect(visited).toContain('brief');
  expect(visited.at(-1)).toBe('footer');
});

test('the idea typed on the home page becomes the first line of the brief', async ({ page }) => {
  await page.goto('/');
  await page.getByLabel('Your idea').fill('a booking site for my bakery');
  await page.getByRole('button', { name: 'Sketch it' }).click();
  await expect(page.locator('[data-sketch-blocks]')).toContainText('Booking calendar');
  await expect(page).toHaveURL(/[?&]idea=a(\+|%20)booking/);
  await expect(page.locator('#brief-message')).toHaveValue('a booking site for my bakery');
  await expect(page.locator('[data-idea-code]')).toContainText('a booking site for my bakery');
});
