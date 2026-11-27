# The Living Source, Phase 1: Audit and baseline — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Record today's 2D experience (world off) as the baseline every later Living Source phase is measured against: pictures and scroll recordings of every page on desktop and phone, the numbers, a frame meter that works with the world off, and an inventory of every 2D surface and its motion.

**Architecture:** One small product change (the `?meter=1` frame meter, today only inside the world, also shown with the world off), one capture tool beside the existing ones under `tools/`, and one baseline document. No page changes look or behaviour.

**Tech Stack:** Vite 5, React 18, React Router 6.30.4, Playwright (already a dev dependency), Vitest, Lighthouse 12 (run with `npx`, as the earlier Lighthouse rows did).

**Spec:** `docs/superpowers/specs/2026-11-27-living-source-2d-design.md` (Phases, item 1).

## Global Constraints

- 2D only: the world off (Plain view, no WebGL2, reduced motion). No 3D work in this plan.
- Every new or changed JS file starts with `// @ts-check`; no `@ts-ignore`, `@ts-expect-error`, `as any`, `eslint-disable`.
- No new dependencies. Chris runs no `npm install` for this phase.
- The budget in `tools/budget/check.mjs` holds; the entry script stays under 152 kB.
- Build and test in the cloud copy; copy source files back with CRLF; Chris commits. No branches.
- No prices or buy buttons appear in any capture or document.

## Review Focus

1. `?meter=1` with the world ON still shows exactly one meter (the world's), never two. Test in Task 1.
2. The meter stops its animation-frame loop when the page unmounts or the flag goes away (no loop left running after leaving the page). Test in Task 1.
3. The meter never appears without the flag and never in the prebuilt HTML (it renders only after hydration). Test in Task 1.
4. Captures run against a production build (`npm run preview`), not the dev server, so the numbers match what visitors get. Asserted by the tool refusing a base URL that answers with Vite's dev client (Task 2).
5. A capture of the home with no door chosen shows the first visit (headline and fork only); with a door it shows that door's chapters. Test in Task 2 (targets) and checked in the manifest.

---

### Task 1: The frame meter with the world off

**Files:**
- Create: `src/components/PlainFrameMeter.jsx`
- Modify: `src/App.jsx` (`AppShell`, the `FieldLayer` branch)
- Test: `tests/PlainFrameMeter.test.jsx`, `e2e/plainmeter.spec.js`

**Interfaces:**
- Consumes: `createFrameMeter()` from `src/world/frameMeter.js` (`tick(now)`, `report() -> { frames, medianMs, p95Ms }`, `reset()`); the `test` fixture from `e2e/plain.js`.
- Produces: `export default function PlainFrameMeter(): JSX.Element | null`. Its readout is `<p data-frame-meter data-frames={n}>` with the text `plain · frames {n} · median {x.x} ms · p95 {y.y} ms`, styled with the world meter's classes, so `?meter=1` reads the same either way.

- [x] **Step 1: Write the failing unit tests** in `tests/PlainFrameMeter.test.jsx` (fake timers and a stubbed `requestAnimationFrame`):
  - `shows the readout and counts frames`: after 30 stubbed frames 16 ms apart and the 500 ms refresh, the text matches `/^plain · frames \d+ · median 16\.0 ms · p95 16\.0 ms$/` and `data-frames` is above 0.
  - `cancels its frame loop on unmount`: `cancelAnimationFrame` is called with the last id `requestAnimationFrame` returned.
- [x] **Step 2: Run** `npx vitest run tests/PlainFrameMeter.test.jsx`. Expected: FAIL (module not found).
- [x] **Step 3: Implement** `PlainFrameMeter` with a `requestAnimationFrame` loop feeding `tick`, and a 500 ms interval that copies `report()` into state (no re-render per frame). In `AppShell`, render it lazily (`lazy(() => import('./components/PlainFrameMeter.jsx'))`) in the world-off branch only when hydrated and `useSearchParams()` has `meter=1`.
- [x] **Step 4: Run** the unit test. Expected: PASS.
- [x] **Step 5: Write the e2e tests** in `e2e/plainmeter.spec.js`:
  - with the plain fixture, `/?meter=1` then scroll 2,000 px: one `[data-frame-meter]`, its `data-frames` above 0, text starting `plain ·`;
  - with the plain fixture, `/`: no `[data-frame-meter]`;
  - the prebuilt `dist/index.html` contains no `data-frame-meter`;
  - with the world on (`/?world=1&meter=1`, the `e2e/world.js` fixture): exactly one `[data-frame-meter]`, and its text does not start `plain ·`.
- [x] **Step 6: Run** `npx playwright test e2e/plainmeter.spec.js`. Expected: PASS (the world-on case needs WebGL: on a machine without it, it is skipped as the other world specs are).
- [x] **Step 7: Run** `npm run verify`. Expected: exit 0, budget ok.

### Task 2: The baseline capture tool

**Files:**
- Create: `tools/baseline/targets.mjs`, `tools/baseline/capture.mjs`
- Modify: `package.json` (script `"baseline:capture": "node tools/baseline/capture.mjs"`)
- Test: `tests/baselineTargets.test.js`

**Interfaces:**
- Consumes: `sitemapPaths(xml)` from `tools/prerender/routes.mjs`; `DOOR_STORAGE_KEY` (`'allencode:door'`, values `'a' | 'b'`) and the world key `'allencode:world'` (`'0'` = plain).
- Produces: `export function baselineTargets(paths: string[]): Target[]` where `Target = { id: string, path: string, viewport: 'desktop' | 'phone', door: 'a' | 'b' | null, reducedMotion: boolean }`; desktop is 1440 × 900, phone is 390 × 844 with touch. `capture.mjs [baseUrl]` (default `http://localhost:4173`) writes `baseline-captures/<YYYY-MM-DD>/<id>.png` (full page), `<id>.webm` (scroll-through at 600 px a second, top to bottom) and `manifest.json` (target, file names, page height, the time taken).

Note (done): the output folder is `baseline-captures/`, not `test-results/`, because Playwright empties `test-results/` at the start of every e2e run and the first capture was lost that way. The tool also saves per-viewport frames (`<id>/frame-NNN.png`), because full-page shots of pinned scenes come out blank.

- [x] **Step 1: Write the failing test** `tests/baselineTargets.test.js`:
  - given the ten sitemap paths, returns 26 targets: the ten paths × two viewports (door null, motion on) = 20; `/` with door `a` and `b` × two viewports = 4; `/` with door `a`, reduced motion, × two viewports = 2;
  - every `id` is unique and matches `/^[a-z0-9-]+$/` (for example `home-door-a-phone`, `products-underfire-ai-desktop`);
  - every target is plain (the tool always sets `'allencode:world'` to `'0'`), so no target carries a world flag.
- [x] **Step 2: Run** `npx vitest run tests/baselineTargets.test.js`. Expected: FAIL.
- [x] **Step 3: Implement** `baselineTargets` in `targets.mjs`, then `capture.mjs`: read `public/sitemap.xml`; for each target set storage with `addInitScript` (world `'0'`, the door if any), emulate `reducedMotion`, load, scroll through, save the screenshot and the video. Refuse to run if the page source contains `/@vite/client` (the dev server), with the message "Run against `npm run preview`, not the dev server."
- [x] **Step 4: Run** the unit test. Expected: PASS.
- [x] **Step 5: Run** `npm run build`, `npm run preview -- --port 4173` and `npm run baseline:capture`. Expected: 26 PNGs, 26 WebMs and a manifest with 26 entries; open three (home no door phone, home door b desktop, services phone) and check they show what the target names.
- [x] **Step 6: Run** `npm run verify`. Expected: exit 0.

### Task 3: The baseline document

**Files:**
- Create: `docs/living-source/baseline.md`

- [x] **Step 1: Inventory.** One table row per 2D surface (the home with no door, door a's chapters, door b's chapters, the brief, and each of the nine inner pages): its sections, the components that draw them (file paths), and its motion today, read from the code (for example `Reveal.jsx`: fade and rise 40 px once; the gate's glyph flight; `MediaLoop`). A last column names the Living Source phase that changes it (spec, Phases).
- [x] **Step 2: Numbers, dated 2026-11-27 or the day measured.** Lighthouse 12 on the preview build, phone and desktop, every sitemap page with `?world=0`: performance, LCP, CLS, TBT, accessibility, SEO. `npm run budget` output. Unit and e2e counts from `npm run verify` and `npm run test:e2e`. `npm run excerpts:verify` result (on Chris's machine, as before).
- [x] **Step 3: Pictures.** The capture folder's date and file list from Task 2's manifest (the files stay in `baseline-captures/`, which git ignores); four stills copied into the document's folder: home no door and door a, phone and desktop.
- [ ] **Step 4: Chris's devices.** Chris, on his iPhone (Safari) and desktop, with `?world=0&meter=1`: one full scroll of door a, one of door b, then `/services` and `/products/underfire-ai`; the median and p95 of each, and anything that felt slow or rough in his words.

### Task 4: Gates and record

- [x] **Step 1:** `npm run verify`; `npm run test:e2e`. Expected: all pass (world specs on Chris's machine).
- [x] **Step 2:** One row in the blueprint's Progress table: "Living Source 2D, Phase 1: audit and baseline", pointing to this plan and `docs/living-source/baseline.md`, with the real verification output.
- [ ] **Step 3:** Stop for Chris's review and commit.
