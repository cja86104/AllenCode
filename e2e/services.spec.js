// @ts-check
import { expect, test } from '@playwright/test';
import { visibleCodePixels } from './pixels.js';

const HOME = '/';
const SLUGS = ['mvp-sprints', 'custom-saas-builds', 'ai-integration', 'technical-audits'];

test('door a reaches the four service chapters in order, then the shared close', async ({ page }) => {
  await page.goto(HOME);
  await page.getByRole('button', { name: "I'm building a product or business" }).click();
  const expected = ['gate', ...SLUGS, 'how-i-work', 'builder', 'idea', 'brief'];
  const chapters = page.locator('[data-chapter]');
  await expect(chapters).toHaveCount(expected.length);
  const order = await chapters.evaluateAll((els) => els.map((el) => el.getAttribute('data-chapter')));
  expect(order).toEqual(expected);
});

test('door b does not show the service chapters', async ({ page }) => {
  await page.goto(HOME);
  await page.getByRole('button', { name: 'I want a site for me or my family' }).click();
  await expect(page.locator('[data-chapter="mvp-sprints"]')).toHaveCount(0);
});

test('no service price appears anywhere on the page', async ({ page }) => {
  await page.goto(HOME);
  await page.getByRole('button', { name: "I'm building a product or business" }).click();
  await expect(page.locator('[data-chapter="technical-audits"]')).toBeVisible();
  const text = await page.locator('body').innerText();
  expect(text).not.toMatch(/\$\s?\d/);
});

test('the audit chapter checks its lines as the visitor scrolls', async ({ page }) => {
  await page.goto(HOME);
  await page.getByRole('button', { name: "I'm building a product or business" }).click();
  const audit = page.locator('[data-chapter="technical-audits"]');
  const top = await audit.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const span = await audit.evaluate((el) => el.getBoundingClientRect().height - window.innerHeight);
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top));
  await expect(audit.locator('[data-checked]')).toHaveCount(0);
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + span * 0.5));
  await expect.poll(() => audit.locator('[data-checked]').count()).toBeGreaterThan(5);
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + span));
  await expect(audit.locator('[data-checked]')).toHaveCount(23);
});

test('with reduced motion the audit chapter shows its code without the checking', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(HOME);
  await page.getByRole('button', { name: "I'm building a product or business" }).click();
  const audit = page.locator('[data-chapter="technical-audits"]');
  await expect(audit.locator('[data-audit-line]')).toHaveCount(23);
  await expect(audit.locator('[data-checked]')).toHaveCount(0);
});

test('a chapter with a screen flies its code onto that screen as the visitor scrolls', async ({ page }) => {
  await page.goto(HOME);
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: "I'm building a product or business" }).click();
  const mvp = page.locator('[data-chapter="mvp-sprints"]');
  const screen = mvp.getByRole('img', { name: /UnderFire AI landing page/ });
  const code = mvp.locator('pre');
  const top = await mvp.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const span = await mvp.evaluate((el) => el.getBoundingClientRect().height - window.innerHeight);

  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top));
  await expect(code).toHaveCSS('opacity', '1');
  await expect(screen).toHaveCSS('opacity', '0');

  // Mid-flight the editor's code is hidden and the field draws it, in the stage on the right.
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + span * 0.5));
  await expect(code).toHaveCSS('opacity', '0');
  const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };
  const stage = { x: Math.round(width * 0.42), y: Math.round(height * 0.14), width: Math.round(width * 0.54), height: Math.round(height * 0.74) };
  await expect.poll(async () => visibleCodePixels(await page.screenshot({ clip: stage }))).toBeGreaterThan(400);

  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + span));
  await expect(screen).toHaveCSS('opacity', '1');
});

test('after a lost context is restored mid-flight, the fresh canvas keeps drawing the flight', async ({ page }) => {
  await page.goto(HOME);
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
  await page.getByRole('button', { name: "I'm building a product or business" }).click();
  const mvp = page.locator('[data-chapter="mvp-sprints"]');
  const top = await mvp.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const span = await mvp.evaluate((el) => el.getBoundingClientRect().height - window.innerHeight);
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + span * 0.5));
  await expect(mvp.locator('pre')).toHaveCSS('opacity', '0');

  await page.locator('canvas[data-field="webgl"]').evaluate((el) => {
    el.setAttribute('data-before-loss', '');
    const ext = /** @type {HTMLCanvasElement} */ (el).getContext('webgl2')?.getExtension('WEBGL_lose_context');
    ext?.loseContext();
    setTimeout(() => ext?.restoreContext(), 100);
  });
  await expect(page.locator('canvas[data-field="webgl"][data-ready="true"]:not([data-before-loss])')).toHaveCount(1);

  const { width, height } = page.viewportSize() ?? { width: 0, height: 0 };
  const stage = { x: Math.round(width * 0.42), y: Math.round(height * 0.14), width: Math.round(width * 0.54), height: Math.round(height * 0.74) };
  await expect.poll(async () => visibleCodePixels(await page.screenshot({ clip: stage }))).toBeGreaterThan(400);
});
