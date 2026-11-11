// @ts-check
import { expect, test } from '@playwright/test';

const HOME = '/';

test('/ shows a canvas when WebGL2 is available', async ({ page }) => {
  await page.goto(HOME);
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
  await page.goto(HOME);
  await expect(page.locator('[data-field="css"]')).toBeVisible();
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveCount(0);
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
});

test('the scroll engine is on with normal motion', async ({ page }) => {
  await page.goto(HOME);
  await expect(page.locator('html')).toHaveAttribute('data-scroll-engine', 'on');
});

test('with reduced motion data-scroll-engine is off', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(HOME);
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
  await page.goto(HOME);
  await loseFieldContext(page);
  await restoreFieldContext(page);
  await expect(page.locator(freshCanvas)).toHaveCount(1);
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('[data-field="css"]')).toBeHidden();
});

test('a lost WebGL context that never comes back restarts on a fresh canvas after the wait', async ({ page }) => {
  await page.goto(HOME);
  await loseFieldContext(page);
  await expect(page.locator(freshCanvas)).toHaveCount(1, { timeout: 6000 });
  await expect(page.locator('[data-field="css"]')).toBeHidden();
});

test('when the GPU cannot give a new context, the page falls back to the static field', async ({ page }) => {
  await page.goto(HOME);
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
  await expect(page.locator('[data-field="css"]')).toBeVisible({ timeout: 6000 });
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveCount(0);
  await expect(page.locator('[data-code-beside]')).toBeVisible();
});

test('after three restarts in one visit the page settles on the static field', async ({ page }) => {
  await page.goto(HOME);
  for (let i = 0; i < 3; i += 1) {
    await loseFieldContext(page);
    await restoreFieldContext(page);
    await expect(page.locator(freshCanvas)).toHaveCount(1);
  }
  await loseFieldContext(page);
  await restoreFieldContext(page);
  await expect(page.locator('[data-field="css"]')).toBeVisible();
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveCount(0);
});

test('moving between pages keeps the same single canvas, so the field never restarts', async ({ page }) => {
  await page.goto(HOME);
  const canvas = page.locator('canvas[data-field="webgl"]');
  await expect(canvas).toHaveAttribute('data-ready', 'true');
  await canvas.evaluate((el) => el.setAttribute('data-marked', 'first'));
  await page.getByRole('navigation', { name: 'Primary' }).getByRole('link', { name: 'About' }).click();
  await expect(page).toHaveURL(/\/about$/);
  await expect(page.locator('canvas')).toHaveCount(1);
  await page.goBack();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.locator('canvas')).toHaveCount(1);
  await expect(page.locator('canvas[data-marked="first"]')).toHaveCount(1);
});

test('every page shows the field and runs the scroll engine (Chris, 2026-11-09)', async ({ page }) => {
  await page.goto('/about');
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveCount(1);
  await expect(page.locator('html')).toHaveAttribute('data-scroll-engine', 'on');
});

test('the home page is indexable', async ({ page }) => {
  await page.goto(HOME);
  await expect(page).toHaveTitle(/Allen Code Co/);
  await expect(page.locator('meta[name="robots"][content*="noindex"]')).toHaveCount(0);
});

test('an inner page shows its content before, and without, the renderer', async ({ page }) => {
  await page.route(/FieldScene-[^/]*\.js$/, (route) => route.abort());
  await page.goto('/about');
  await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
  await expect(page.locator('[data-field="css"]')).toBeVisible();
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('the page shell is clear on every page, so the field shows through', async ({ page }) => {
  const shellBackground = () =>
    page.locator('main').evaluate((main) => getComputedStyle(/** @type {HTMLElement} */ (main.parentElement)).backgroundColor);
  await page.goto('/about');
  expect(await shellBackground()).toBe('rgba(0, 0, 0, 0)');
  await page.goto(HOME);
  expect(await shellBackground()).toBe('rgba(0, 0, 0, 0)');
});

test('with reduced motion / shows the code beside its result and no canvas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(HOME);
  await expect(page.locator('[data-code-beside]')).toBeVisible();
  await expect(page.locator('[data-code-beside] pre')).toContainText('ReactDOM.createRoot');
  await expect(page.locator('[data-code-beside]')).toContainText('Welcome to Allen Code Co.');
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
  await page.goto(HOME);
  await expect(page.locator('[data-field="css"] pre')).toContainText('usePageMeta');
  await expect(page.locator('[data-code-beside]')).toBeVisible();
});

test('the texture painted with the page is the same element while the renderer draws and after it falls back (Task 9.3b)', async ({ page }) => {
  // A new texture element after the renderer loads would be a new, late largest paint (Task 9.3 Step 3).
  await page.goto(HOME, { waitUntil: 'domcontentloaded' });
  const texture = page.locator('[data-field="css"]');
  await expect(texture.locator('pre')).toContainText('usePageMeta');
  await texture.evaluate((el) => el.setAttribute('data-first-paint', ''));
  await expect(page.locator('canvas[data-field="webgl"][data-ready="true"]')).toHaveCount(1);
  await expect(page.locator('[data-field="css"][data-first-paint]')).toHaveCount(1);
  await expect(texture).toBeHidden();
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
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveCount(0, { timeout: 6000 });
  await expect(page.locator('[data-field="css"][data-first-paint]')).toBeVisible();
  await expect(page.locator('[data-field="css"]')).toHaveCount(1);
});

test('the prebuilt page carries the texture with real code, before any script runs (Task 9.3b)', async ({ request }) => {
  for (const path of ['/', '/about']) {
    const body = await (await request.get(path)).text();
    expect(body).toMatch(/data-field="css"[^>]*><pre>[^<]*usePageMeta/);
  }
});
