// @ts-check
import { expect, test } from '@playwright/test';

/** Code world prototype (docs/superpowers/plans/2026-11-10-code-world-prototype.md), Task P2. */
const LAB = '/lab/world';
const PAGES = ['/', '/products', '/products/underfire-ai', '/services', '/templates', '/about', '/contact'];

test('the lab draws the world on one canvas, with no errors, and asks not to be indexed', async ({ page }) => {
  /** @type {string[]} */
  const errors = [];
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('pageerror', (error) => errors.push(error.message));
  await page.goto(LAB);
  await expect(page.locator('canvas[data-world][data-ready="true"]')).toHaveCount(1);
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
  expect(errors).toEqual([]);
});

test('the world is drawn in JetBrains Mono: the exact face of the glyph atlas is loaded before the first frame', async ({ page }) => {
  await page.goto(LAB);
  await page.locator('canvas[data-world][data-ready="true"]').waitFor();
  expect(await page.locator('canvas[data-world]').getAttribute('data-atlas-font')).toBe('loaded');
});

test('the lab is not in the sitemap, is disallowed in robots.txt, and no page links to it', async ({ request }) => {
  expect(await (await request.get('/sitemap.xml')).text()).not.toContain('/lab');
  expect(await (await request.get('/robots.txt')).text()).toMatch(/Disallow: \/lab\//);
  for (const path of PAGES) {
    expect(await (await request.get(path)).text(), path).not.toMatch(/href="[^"]*\/lab\//);
  }
});

test('the site never downloads the lab: the home page requests no WorldLab chunk', async ({ page }) => {
  /** @type {string[]} */
  const scripts = [];
  page.on('request', (r) => {
    if (r.resourceType() === 'script') scripts.push(r.url());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(scripts.some((url) => /WorldLab-/.test(url))).toBe(false);
});

test('scrolling moves the camera: the drawn frame changes between the top and the middle', async ({ page }) => {
  await page.goto(LAB);
  const canvas = page.locator('canvas[data-world][data-ready="true"]');
  await expect(canvas).toHaveCount(1);
  const top = await canvas.getAttribute('data-progress');
  await page.evaluate(() => window.scrollTo(0, (document.documentElement.scrollHeight - innerHeight) / 2));
  await expect.poll(async () => Number(await canvas.getAttribute('data-progress'))).toBeGreaterThan(0.4);
  expect(Number(top)).toBeLessThan(0.05);
});

test('?meter=1 shows the frame meter: frames, median and 95th percentile', async ({ page }) => {
  await page.goto(`${LAB}?meter=1`);
  const meter = page.locator('[data-frame-meter]');
  await expect(meter).toContainText(/median \d+(\.\d)? ms/);
  await expect(meter).toContainText(/p95 \d+(\.\d)? ms/);
  await expect.poll(async () => Number((await meter.getAttribute('data-frames')) ?? 0)).toBeGreaterThan(10);
});

test('with reduced motion the lab is a plain page: the stops in words and a way home, no canvas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(LAB);
  await expect(page.locator('canvas')).toHaveCount(0);
  for (const stop of ['Empty file', 'Into the code', 'The road', 'The fork', 'First landmark']) {
    await expect(page.getByText(stop, { exact: true })).toBeVisible();
  }
  await expect(page.getByRole('link', { name: /allencodeco\.com/ })).toHaveAttribute('href', '/');
});

test('without WebGL2 the lab is the same plain page', async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value(/** @type {string} */ type, /** @type {unknown[]} */ ...rest) {
        if (type === 'webgl2') return null;
        return Reflect.apply(original, this, [type, ...rest]);
      },
    });
  });
  await page.goto(LAB);
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.getByText('The road', { exact: true })).toBeVisible();
});
