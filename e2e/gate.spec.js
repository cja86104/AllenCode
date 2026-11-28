// @ts-check
import { expect, test } from './plain.js';
import { visibleCodePixels } from './pixels.js';

const HOME = '/';
const DOOR_A = "I'm building a product or business";
const DOOR_B = 'I want a site for me or my family';

test('the approved line and headline are real text in the DOM', async ({ page }) => {
  await page.goto(HOME);
  await expect(page.getByText('It all starts with an empty file…')).toHaveCount(1);
  await expect(page.getByRole('heading', { level: 1, name: 'Welcome to Allen Code Co. What would you like to build today?' })).toHaveCount(1);
});

test('choosing a door persists across reload', async ({ page }) => {
  await page.goto(HOME);
  await page.getByRole('button', { name: DOOR_B }).click();
  await expect(page.getByRole('button', { name: DOOR_B })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByRole('button', { name: DOOR_B })).toHaveAttribute('aria-pressed', 'true');
  await expect(page.getByRole('button', { name: DOOR_A })).toHaveAttribute('aria-pressed', 'false');
});

test('with storage blocked the fork still works and reappears on reload', async ({ page }) => {
  await page.addInitScript(() => {
    Object.defineProperty(window, 'sessionStorage', {
      configurable: true,
      get() {
        throw new Error('storage blocked');
      },
    });
  });
  await page.goto(HOME);
  await page.getByRole('button', { name: DOOR_A }).click();
  await expect(page.getByRole('button', { name: DOOR_A })).toHaveAttribute('aria-pressed', 'true');
  await page.reload();
  await expect(page.getByRole('button', { name: DOOR_A })).toHaveAttribute('aria-pressed', 'false');
});

test('the fork buttons are reachable by keyboard', async ({ page }) => {
  await page.goto(HOME);
  let reached = false;
  for (let i = 0; i < 40 && !reached; i += 1) {
    await page.keyboard.press('Tab');
    reached = await page.evaluate(() => document.activeElement?.getAttribute('data-door-card') === 'a');
  }
  expect(reached).toBe(true);
  await page.keyboard.press('Enter');
  await expect(page.getByRole('button', { name: DOOR_A })).toHaveAttribute('aria-pressed', 'true');
});

test('with reduced motion the gate shows the code beside the headline and no canvas', async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await page.goto(HOME);
  const beside = page.locator('[data-chapter="gate"] [data-code-beside]');
  await expect(beside).toBeVisible();
  await expect(beside.locator('pre')).toContainText('ReactDOM.createRoot');
  await expect(beside).toContainText('Welcome to Allen Code Co.');
  await expect(page.locator('canvas')).toHaveCount(0);
});

test('scrolling types the file into the empty editor', async ({ page }) => {
  await page.goto(HOME);
  const gate = page.locator('[data-chapter="gate"]');
  const code = gate.locator('[data-editor-code]');
  await expect(code).toHaveText('');
  const top = await gate.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const span = await gate.evaluate((el) => el.getBoundingClientRect().height - window.innerHeight);
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + span * 0.35));
  await expect(code).toContainText("import React from 'react';");
  await expect(code).toContainText('</React.StrictMode>');
});

test('the empty file is empty before scrolling: no code is drawn in the editor', async ({ page }) => {
  await page.goto(HOME);
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
  await page.waitForTimeout(400);
  // The blinking cursor is meant to be there; this check is about code being drawn.
  await page.addStyleTag({ content: '.gate-cursor { visibility: hidden; }' });
  const frame = await page.locator('[data-chapter="gate"] [data-editor-frame]').boundingBox();
  expect(frame).not.toBeNull();
  const titleBar = 30;
  // Only the code area: below the title bar (whose file name is meant to show), inside the border.
  const clip = {
    x: (frame?.x ?? 0) + 2,
    y: (frame?.y ?? 0) + titleBar + 2,
    width: (frame?.width ?? 0) - 4,
    height: (frame?.height ?? 0) - titleBar - 4,
  };
  expect(await visibleCodePixels(await page.screenshot({ clip }))).toBe(0);
});

test('after a lost context is restored mid-flight, the fresh canvas keeps drawing the gate’s flight (moved from services.spec.js, Living Source Phase 4)', async ({ page }) => {
  await page.setViewportSize({ width: 1280, height: 720 });
  await page.goto(HOME);
  await expect(page.locator('canvas[data-field="webgl"]')).toHaveAttribute('data-ready', 'true');
  const gate = page.locator('[data-chapter="gate"]');
  const top = await gate.evaluate((el) => el.getBoundingClientRect().top + window.scrollY);
  const span = await gate.evaluate((el) => el.getBoundingClientRect().height - window.innerHeight);
  // At 60 % the editor's code and the headline are both hidden: only the field draws the code in flight.
  await page.evaluate((y) => window.scrollTo(0, y), Math.round(top + span * 0.6));
  await expect(gate.locator('[data-editor-code]')).toHaveCSS('opacity', '0');
  await expect(gate.locator('h1')).toHaveCSS('opacity', '0');

  await page.locator('canvas[data-field="webgl"]').evaluate((el) => {
    el.setAttribute('data-before-loss', '');
    const ext = /** @type {HTMLCanvasElement} */ (el).getContext('webgl2')?.getExtension('WEBGL_lose_context');
    ext?.loseContext();
    setTimeout(() => ext?.restoreContext(), 100);
  });
  await expect(page.locator('canvas[data-field="webgl"][data-ready="true"]:not([data-before-loss])')).toHaveCount(1);
  // Below the header, where nothing but the field draws bright code.
  const clip = { x: 0, y: 120, width: 1280, height: 600 };
  await expect.poll(async () => visibleCodePixels(await page.screenshot({ clip }))).toBeGreaterThan(400);
});

test.describe('on a phone', () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test('the editor fits inside the screen', async ({ page }) => {
    await page.goto(HOME);
    const box = await page.locator('[data-chapter="gate"] [data-editor-frame]').boundingBox();
    expect(box).not.toBeNull();
    expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
    expect((box?.x ?? 0) + (box?.width ?? 999)).toBeLessThanOrEqual(390);
  });
});

for (const viewport of [{ width: 1440, height: 900 }, { width: 390, height: 844 }]) {
  test(`at ${viewport.width}px the scroll cue is on screen when the page opens`, async ({ page }) => {
    await page.setViewportSize(viewport);
    await page.goto(HOME);
    const cue = page.getByText('Scroll to enter');
    await expect(cue).toBeVisible();
    const box = await cue.boundingBox();
    expect(box).not.toBeNull();
    expect((box?.y ?? viewport.height) + (box?.height ?? 0)).toBeLessThanOrEqual(viewport.height);
  });
}
