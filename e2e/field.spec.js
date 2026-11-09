// @ts-check
import { expect, test } from '@playwright/test';

const PREVIEW = '/preview';

test('/preview shows a canvas when WebGL2 is available', async ({ page }) => {
  await page.goto(PREVIEW);
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('with getContext patched to return null the CSS field renders and the page text is still present', async ({ page }) => {
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
  await page.goto(PREVIEW);
  await expect(page.locator('[data-field="css"]')).toHaveCount(1);
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('the scroll engine is on with normal motion', async ({ page }) => {
  await page.goto(PREVIEW);
  await expect(page.locator('html')).toHaveAttribute('data-scroll-engine', 'on');
});

test('with reduced motion data-scroll-engine is off', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(PREVIEW);
  await expect(page.locator('html')).toHaveAttribute('data-scroll-engine', 'off');
});

/**
 * Marks the current field canvas, then loses its context through WEBGL_lose_context. The extension
 * is kept on window so a test can restore the same context.
 * @param {import('@playwright/test').Page} page
 */
async function loseFieldContext(page) {
  const canvas = page.locator('canvas[data-field="webgl"][data-ready="true"]');
  await expect(canvas).toHaveCount(1);
  await canvas.evaluate((el) => {
    el.setAttribute('data-before-loss', '');
    const gl = /** @type {HTMLCanvasElement} */ (el).getContext('webgl2');
    const ext = gl?.getExtension('WEBGL_lose_context') ?? null;
    /** @type {any} */ (window).__fieldLoseExt = ext;
    ext?.loseContext();
  });
}

/** @param {import('@playwright/test').Page} page */
async function restoreFieldContext(page) {
  await page.evaluate(() => /** @type {any} */ (window).__fieldLoseExt?.restoreContext());
}

const freshCanvas = '[data-field="webgl"][data-ready="true"]:not([data-before-loss])';

test('a lost WebGL context that the browser restores comes back on a fresh canvas', async ({ page }) => {
  await page.goto(PREVIEW);
  await loseFieldContext(page);
  await restoreFieldContext(page);
  await expect(page.locator(freshCanvas)).toHaveCount(1);
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('[data-field="css"]')).toHaveCount(0);
});

test('a lost WebGL context that never comes back restarts on a fresh canvas after the wait', async ({ page }) => {
  await page.goto(PREVIEW);
  await loseFieldContext(page);
  await expect(page.locator(freshCanvas)).toHaveCount(1, { timeout: 6000 });
  await expect(page.locator('[data-field="css"]')).toHaveCount(0);
});

test('when the GPU cannot give a new context, the page falls back to the static field', async ({ page }) => {
  await page.goto(PREVIEW);
  await expect(page.locator('canvas[data-field="webgl"][data-ready="true"]')).toHaveCount(1);
  await page.evaluate(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    Object.defineProperty(HTMLCanvasElement.prototype, 'getContext', {
      configurable: true,
      value(/** @type {string} */ type, /** @type {unknown[]} */ ...rest) {
        if (type === 'webgl2' && !this.hasAttribute('data-before-loss')) return null;
        return Reflect.apply(original, this, [type, ...rest]);
      },
    });
  });
  await loseFieldContext(page);
  await expect(page.locator('[data-field="css"]')).toHaveCount(1, { timeout: 6000 });
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveCount(0);
  await expect(page.locator('[data-code-beside]')).toBeVisible();
});

test('after three restarts in one visit the page settles on the static field', async ({ page }) => {
  await page.goto(PREVIEW);
  for (let i = 0; i < 3; i += 1) {
    await loseFieldContext(page);
    await restoreFieldContext(page);
    await expect(page.locator(freshCanvas)).toHaveCount(1);
  }
  await loseFieldContext(page);
  await restoreFieldContext(page);
  await expect(page.locator('[data-field="css"]')).toHaveCount(1);
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveCount(0);
});

test('navigating away and back leaves exactly one canvas', async ({ page }) => {
  await page.goto(PREVIEW);
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveCount(1);
  await page.getByRole('link', { name: 'Back to the site' }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('canvas')).toHaveCount(0);
  await page.goBack();
  await expect(page).toHaveURL(/\/preview$/);
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveCount(1);
  await expect(page.locator('canvas')).toHaveCount(1);
});

test('home page (/) is unchanged: no canvas', async ({ page }) => {
  await page.goto('/');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('html')).not.toHaveAttribute('data-scroll-engine', /.*/);
});

test('/preview is marked noindex', async ({ page }) => {
  await page.goto(PREVIEW);
  await expect(page.locator('meta[name="robots"]')).toHaveAttribute('content', 'noindex, nofollow');
});

test('the home page does not download the scroll engine or the glyph renderer', async ({ page }) => {
  /** @type {string[]} */
  const scripts = [];
  page.on('response', async (response) => {
    if (response.url().endsWith('.js')) scripts.push(await response.text());
  });
  await page.goto('/');
  await page.waitForLoadState('networkidle');
  expect(scripts.length).toBeGreaterThan(0);
  const markers = ['lenis-smooth', 'ScrollTrigger', 'aGlyph'];
  const found = markers.filter((marker) => scripts.some((source) => source.includes(marker)));
  expect(found).toEqual([]);
});

test('the page shell stays opaque on regular routes and clears only on field routes', async ({ page }) => {
  const shellBackground = () =>
    page.locator('main').evaluate((main) => getComputedStyle(/** @type {HTMLElement} */ (main.parentElement)).backgroundColor);
  await page.goto('/');
  expect(await shellBackground()).toBe('rgb(10, 10, 10)');
  await page.goto(PREVIEW);
  expect(await shellBackground()).toBe('rgba(0, 0, 0, 0)');
});

test('with reduced motion /preview shows the code beside its result and no canvas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(PREVIEW);
  await expect(page.locator('[data-code-beside]')).toBeVisible();
  await expect(page.locator('[data-code-beside] pre')).toContainText('ReactDOM.createRoot');
  await expect(page.locator('[data-code-beside]')).toContainText('We build software');
  await expect(page.locator('canvas')).toHaveCount(0);
  await expect(page.locator('[data-field="css"] pre')).toContainText('usePageMeta');
});

test('with WebGL2 unavailable the CSS field shows real code and the chapter shows code beside result', async ({ page }) => {
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
  await page.goto(PREVIEW);
  await expect(page.locator('[data-field="css"] pre')).toContainText('usePageMeta');
  await expect(page.locator('[data-code-beside]')).toBeVisible();
});
