// @ts-check
import { expect, test } from '@playwright/test';

/** Pages reached from the primary nav, with a word their headline contains. */
const NAV_PAGES = [
  { link: 'Products', path: '/products', heading: /Live in the market/ },
  { link: 'Services', path: '/services', heading: /Custom work/ },
  { link: 'Templates', path: '/templates', heading: /Start from a design/ },
  { link: 'About', path: '/about', heading: /I run one studio/ },
  { link: 'Contact', path: '/contact', heading: /Tell me what you're building/ },
];

test('every route still loads by link from the nav, and the logo leads home', async ({ page }) => {
  await page.goto('/');
  const nav = page.getByRole('navigation', { name: 'Primary' });
  for (const { link, path, heading } of NAV_PAGES) {
    await nav.getByRole('link', { name: link }).click();
    await expect(page).toHaveURL(new RegExp(`${path}$`));
    await expect(page.getByRole('heading', { level: 1, name: heading })).toBeVisible();
    await expect.poll(() => page.evaluate(() => window.scrollY)).toBeLessThan(5);
  }
  await page.getByRole('link', { name: 'AllenCode Co.' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole('heading', { level: 1, name: /Welcome to Allen Code Co/ })).toHaveCount(1);
});

test('a product card opens its showcase, and the showcase leads back', async ({ page }) => {
  await page.goto('/products');
  await page.locator('[data-product-card="underfire-ai"]').getByRole('link', { name: /Open the showcase/ }).click();
  await expect(page).toHaveURL(/\/products\/underfire-ai$/);
  await expect(page.getByRole('heading', { level: 1, name: 'UnderFire AI' })).toBeVisible();
  await page.getByRole('link', { name: /allencode\/products\/underfire-ai/ }).click();
  await expect(page).toHaveURL(/\/products$/);
});

test('links move pages with a view transition where the browser has one', async ({ page }) => {
  await page.addInitScript(() => {
    const original = document.startViewTransition;
    if (typeof original !== 'function') return;
    const counter = /** @type {Window & { __transitions?: number }} */ (window);
    counter.__transitions = 0;
    // Counts each call and passes it through untouched.
    document.startViewTransition = new Proxy(original, {
      apply(target, thisArg, args) {
        counter.__transitions = (counter.__transitions ?? 0) + 1;
        return Reflect.apply(target, thisArg ?? document, args);
      },
    });
  });
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect.poll(() => page.evaluate(() => /** @type {Window & { __transitions?: number }} */ (window).__transitions ?? 0)).toBeGreaterThan(0);
});

test('with startViewTransition removed, navigation still updates the address and the content', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(document, 'startViewTransition', { value: undefined, configurable: true });
  });
  await page.goto('/');
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'Services' }).click();
  await expect(page).toHaveURL(/\/services$/);
  await expect(page.getByRole('heading', { level: 1, name: /Custom work/ })).toBeVisible();
});

test('template previews play on their own when on screen, with no hover', async ({ page }) => {
  await page.goto('/templates');
  await page.mouse.move(5, 5);
  const video = page.locator('[data-template] video').first();
  await video.scrollIntoViewIfNeeded();
  await expect.poll(() => video.evaluate((el) => /** @type {HTMLVideoElement} */ (el).paused), { timeout: 8000 }).toBe(false);
});

test('product pages keep their own pricing (Chris, 2026-11-09); services show no price', async ({ page }) => {
  await page.goto('/products/my-teachers-toolbox');
  await expect(page.getByRole('heading', { level: 2, name: 'Simple, honest pricing' })).toBeVisible();
  await page.goto('/services');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  const text = await page.locator('main').innerText();
  expect(text).not.toMatch(/\$\s?\d/);
});

test('a page whose code cannot load shows a way to reload, not a crash screen', async ({ page }) => {
  await page.route(/\/assets\/Home-[^/]*\.js$/, (route) => route.abort());
  await page.goto('/');
  await expect(page.getByRole('heading', { level: 1, name: "This page didn't load." })).toBeVisible();
  await expect(page.getByRole('button', { name: 'Reload the page' })).toBeVisible();
  await expect(page.getByText('Unexpected Application Error')).toHaveCount(0);
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });

  test('asking about a template far down the page opens the brief at the top, filled in', async ({ page }) => {
    await page.goto('/templates');
    const last = page.locator('[data-template]').last();
    await last.scrollIntoViewIfNeeded();
    expect(await page.evaluate(() => window.scrollY)).toBeGreaterThan(2000);
    const id = await last.getAttribute('data-template');
    await last.getByRole('link', { name: /Ask about this template/ }).tap();
    await expect(page).toHaveURL(new RegExp(`/contact\\?template=${id}$`));
    // At the top at once: a smooth scroll that a phone cuts short is what left visitors at the bottom.
    await expect.poll(() => page.evaluate(() => window.scrollY), { timeout: 300 }).toBeLessThan(5);
    await expect(page.getByRole('heading', { level: 1, name: /Tell me what you're building/ })).toBeInViewport();
    await expect(page.getByLabel('What are you building?')).toHaveValue(/template\.$/);
  });

  test('every template preview on the page plays by itself as it comes on screen', async ({ page }) => {
    await page.goto('/templates');
    const videos = page.locator('[data-template] video');
    const count = await videos.count();
    expect(count).toBeGreaterThan(10);
    for (let i = 0; i < count; i += 1) {
      const video = videos.nth(i);
      await video.scrollIntoViewIfNeeded();
      await expect.poll(() => video.evaluate((el) => /** @type {HTMLVideoElement} */ (el).paused), { timeout: 6000 }).toBe(false);
    }
  });
});
