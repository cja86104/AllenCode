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

test('the journey is 7.2 screens of scroll (Chris, 2026-11-10: eight scrolls to the doors was long; 10 percent shorter)', async ({ page }) => {
  await page.goto(LAB);
  await page.locator('canvas[data-world][data-ready="true"]').waitFor();
  const screens = await page.evaluate(() => document.documentElement.scrollHeight / window.innerHeight);
  expect(screens).toBeCloseTo(7.2, 1);
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

/** @param {import('@playwright/test').Page} page @param {number} progress */
async function scrollToProgress(page, progress) {
  await page.evaluate((p) => window.scrollTo(0, (document.documentElement.scrollHeight - window.innerHeight) * p), progress);
}

test.describe('scroll, stops and the rail (Task P3)', () => {
  test('each part of the journey names its stop', async ({ page }) => {
    await page.goto(LAB);
    await page.locator('canvas[data-world][data-ready="true"]').waitFor();
    await expect(page.locator('html')).toHaveAttribute('data-scroll-engine', 'on');
    for (const [progress, name] of /** @type {Array<[number, string]>} */ ([
      [0, 'Empty file'],
      [0.2, 'Into the code'],
      [0.45, 'The road'],
      [0.68, 'The fork'],
      [0.9, 'First landmark'],
    ])) {
      await scrollToProgress(page, progress);
      await expect(page.locator('[data-active-stop]')).toHaveAttribute('data-active-stop', name);
      await expect(page.locator('[data-active-stop] h2')).toHaveText(name);
      await expect(page.locator('[data-rail] [aria-current="step"]')).toHaveText(name);
    }
  });

  test('jumping straight to the end shows the last stop, with nothing carried over', async ({ page }) => {
    await page.goto(LAB);
    await page.locator('canvas[data-world][data-ready="true"]').waitFor();
    await scrollToProgress(page, 1);
    await expect(page.locator('[data-active-stop]')).toHaveAttribute('data-active-stop', 'First landmark');
    await expect.poll(async () => Number(await page.locator('canvas[data-world]').getAttribute('data-progress'))).toBeGreaterThan(0.98);
  });

  test('the rail runs from "empty file" to "shipped"', async ({ page }) => {
    await page.goto(LAB);
    const rail = page.locator('[data-rail]');
    await expect(rail).toContainText('empty file');
    await expect(rail).toContainText('shipped');
    await expect(rail.locator('li')).toHaveCount(5);
  });

  test('resizing from desktop to a phone mid-journey keeps the canvas at the window size', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LAB);
    await page.locator('canvas[data-world][data-ready="true"]').waitFor();
    await scrollToProgress(page, 0.5);
    await page.setViewportSize({ width: 390, height: 844 });
    await expect
      .poll(() => page.locator('canvas[data-world]').evaluate((c) => [c.clientWidth, c.clientHeight, /** @type {HTMLCanvasElement} */ (c).width]))
      .toEqual([390, 844, 390 * (await page.evaluate(() => Math.min(window.devicePixelRatio || 1, 2)))]);
  });

  test('leaving the lab removes the world, its rail and its stops', async ({ page }) => {
    await page.goto(LAB);
    await page.locator('canvas[data-world][data-ready="true"]').waitFor();
    await page.getByRole('link', { name: /allencodeco\.com/ }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.locator('canvas[data-world]')).toHaveCount(0);
    await expect(page.locator('[data-rail], [data-active-stop]')).toHaveCount(0);
  });
});

test.describe('the landmark resolves into its real screen (Task P4)', () => {
  /** @param {import('@playwright/test').Page} page */
  const screen = (page) => page.locator('[data-landmark-screen]');
  /** @param {import('@playwright/test').Page} page */
  const opacity = (page) => screen(page).evaluate((el) => Number(getComputedStyle(el).opacity));
  /** @param {import('@playwright/test').Page} page */
  const playing = (page) => screen(page).locator('video').evaluate((v) => !(/** @type {HTMLVideoElement} */ (v).paused));

  test('halfway along the road the real screen is not shown and its loop is still', async ({ page }) => {
    await page.goto(LAB);
    await page.locator('canvas[data-world][data-ready="true"]').waitFor();
    await scrollToProgress(page, 0.5);
    await expect.poll(() => opacity(page)).toBe(0);
    expect(await playing(page)).toBe(false);
    await expect(page.locator('canvas[data-world]')).toHaveAttribute('data-landmark-fade', '1.00');
  });

  test('at the end the sculpture has handed over: the real screen is in view, large, and its loop plays', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(LAB);
    await page.locator('canvas[data-world][data-ready="true"]').waitFor();
    await scrollToProgress(page, 1);
    await expect.poll(() => opacity(page)).toBe(1);
    await expect(page.locator('canvas[data-world]')).toHaveAttribute('data-landmark-fade', '0.00');
    const box = await screen(page).boundingBox();
    expect(box).not.toBeNull();
    if (!box) return;
    expect(box.x).toBeGreaterThanOrEqual(0);
    expect(box.x + box.width).toBeLessThanOrEqual(1440);
    expect(box.width).toBeGreaterThan(1440 * 0.3);
    await expect.poll(() => playing(page)).toBe(true);
    await expect(screen(page).locator('img, video').first()).toHaveAttribute('alt', /UnderFire AI/);
  });
});
