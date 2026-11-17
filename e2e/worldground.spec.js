// @ts-check
import { expect, test } from '@playwright/test';
import { canvas, inChapter, open, scrollTo, spanOf, takeBusiness } from './world.js';

/**
 * The Code World's ground and the cursor's ripples (Chris, 2026-11-16): a grid that rolls with the
 * road's hills, and, on a desktop, faint grid nodes that light dim orange where the mouse passes over
 * the ground off the road, then fade back to black. The canvas marks how many ripples are lit
 * (`data-ripples`) and how many glyphs are drawn around the camera (`data-cut`).
 */

/**
 * Sweeps the mouse across the lower corners of the screen, over the ground beside the road; it ends on
 * the left, which is open ground both on the opening and at a rest (where the camera looks across the
 * road, so the right corner can be on it).
 * @param {import('@playwright/test').Page} page
 */
async function sweepGround(page) {
  const { width, height } = page.viewportSize() ?? { width: 1280, height: 720 };
  await page.mouse.move(width * 0.96, height * 0.92);
  await page.mouse.move(width * 0.8, height * 0.8, { steps: 4 });
  await page.mouse.move(width * 0.04, height * 0.92);
  await page.mouse.move(width * 0.2, height * 0.8, { steps: 4 });
}

/** The number of lit ripples the canvas reports. @param {import('@playwright/test').Page} page */
const ripples = async (page) => Number((await canvas(page).getAttribute('data-ripples')) ?? '0');

test.describe('the ground and its ripples', () => {
  test('on the road, the mouse over the ground lights ripples, and they fade back to none', async ({ page }) => {
    await open(page);
    const journey = await spanOf(page, '[data-world-journey]');
    await scrollTo(page, journey.from + (journey.to - journey.from) * 0.85);
    await sweepGround(page);
    await expect.poll(() => ripples(page), { timeout: 3000 }).toBeGreaterThan(0);
    // Each fades within its life (1.2 s) once the mouse is still.
    await expect.poll(() => ripples(page), { timeout: 4000 }).toBe(0);
  });

  test('the gate stays clean: the mouse lights nothing before the world’s own file shows', async ({ page }) => {
    await open(page);
    await expect(canvas(page)).toHaveAttribute('data-section', 'gate');
    await expect(canvas(page)).toHaveAttribute('data-editor', '0.00');
    await sweepGround(page);
    await page.waitForTimeout(300);
    expect(await ripples(page)).toBe(0);
  });

  test('a touch lights nothing: the ripples are for a mouse', async ({ page }) => {
    await open(page);
    const journey = await spanOf(page, '[data-world-journey]');
    await scrollTo(page, journey.from + (journey.to - journey.from) * 0.85);
    const { width, height } = page.viewportSize() ?? { width: 1280, height: 720 };
    await page.evaluate(
      ([w, h]) => {
        for (let i = 0; i < 12; i += 1) {
          window.dispatchEvent(new PointerEvent('pointermove', { pointerType: 'touch', clientX: w * (0.04 + i * 0.015), clientY: h * 0.9 }));
        }
      },
      [width, height],
    );
    await page.waitForTimeout(300);
    expect(await ripples(page)).toBe(0);
  });

  test('the long business road is drawn around the camera: fewer glyphs than the whole, re-cut as it travels', async ({ page }) => {
    await open(page);
    await takeBusiness(page);
    await inChapter(page, 'mvp-sprints', 0.5);
    const first = Number(await canvas(page).getAttribute('data-cut'));
    expect(first).toBeGreaterThan(0);
    await inChapter(page, 'technical-audits', 0.5);
    await expect.poll(async () => Number(await canvas(page).getAttribute('data-cut')), { timeout: 5000 }).not.toBe(first);
    await inChapter(page, 'founders-helm', 0.5);
    await sweepGround(page);
    await expect.poll(() => ripples(page), { timeout: 3000 }).toBeGreaterThan(0);
  });
});
