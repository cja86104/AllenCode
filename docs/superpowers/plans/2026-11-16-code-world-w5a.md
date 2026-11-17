# Code World W5a: the inner pages' stretches Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** With the world switched on, every inner page opens on a 1.5-screen stretch of road whose
lead code lands as the page's `h1`; the canvas stays mounted across navigation.

**Architecture:**
- **Stops:** `stretches.js` picks each page's stops from the existing road stops.
- **Layout and shapes:** `stretchLayout.js` lays a straight road, its landmarks and the camera keys.
  `buildStretchWorld` builds the shapes within the tier's budget.
- **Frame:** `stretchWorld.js` draws a frame from the page's spacer and its `h1`.
- **Mount:** the shell mounts the world for the home page and for every stretch page (`worldPageFrom`).
  `WorldCanvas` hands the frame to the home's world or the stretch's.

**Tech Stack:** React 18, React Router 6, hand-written WebGL2 (`src/world`), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-16-code-world-inner-pages-design.md`

## Global Constraints

- No `@ts-ignore`, `as any`, `eslint-disable`, `ignoreBuildErrors`, or error suppression of any kind.
- No placeholders or mock data; approved excerpts only (reused).
- The prebuilt HTML and the plain site are unchanged: the stretch exists only in world mode, after hydration.
- Glyph budgets: `budgetFor(tier)` on every stretch. Bundle: `code world canvas` ≤ 8.5 kB gzip.
- `npm run verify` after every task; `npm run test:e2e` at the end.

## Review Focus

1. Navigating home → stretch page → home: the home's world is rebuilt, not left showing the stretch.
2. A page with no stretch (404, checkout success) in world mode: the field, not a blank canvas.
3. The `h1`'s opacity is restored on navigation away mid-stretch (no invisible headline).
4. A narrow phone (390 × 844): the flight lands on the `h1`'s lines, and the rest box fits the stage.
5. A resize mid-stretch re-measures the spacer and re-places the flight.

---

### Task 1: The stretches

**Files:** Create `src/world/stretches.js`; Test `tests/worldStretches.test.js`.

**Interfaces:** Produces `stretchFor(pathname: string): { id: string, stops: RoadStop[], lead: RoadStop, sources: Record<string, string> } | null`.

- [ ] Test: `/products` → stop ids `['underfire-ai','founders-helm','crew-advisors','my-teachers-toolbox']`, lead `my-teachers-toolbox`; `/products/crew-advisors` → one stop, kind `unfinished`; `/services` → `['custom-saas-builds','custom-web-development','ui-ux-design','ai-integration','technical-audits','mvp-sprints']`; `/templates` → `['keepsake','vow','gather','folio','evergreen']`; `/about` → `[workshop]` kind `portrait`; `/contact` → one stop, kind `audit`, excerpt `gate`; `/`, `/checkout-success`, `/nope`, `/products/nope` → `null`; trailing slash tolerated; every stop's code is in `sources`.
- [ ] Run, fail; implement from `businessRoadStops`, `familyRoadStops`, `MEETING_STOPS` and the `gate` excerpt (cached per pathname); run, pass; verify; commit.

### Task 2: The stretch's road, landmarks and camera

**Files:** Create `src/world/stretchLayout.js`; Test `tests/worldStretchLayout.test.js`.

**Interfaces:**
- Consumes `roadSizes`, `restPose`, `chapterLayout`, `landmarkRect`, `frameCamera`.
- Produces `layoutStretch(stops, sizes, viewport): { path: Point2[], landmarks: Landmark[], keys: CameraKey[] }`.
- Produces `STRETCH = { screens: 1.5, drive: 1 / 1.5, landFrom: 1.05 / 1.5 }`.

- [ ] Test: the landmarks alternate sides with the lead last, centred on the road at its end and facing back up it. The keys run from `at` 0 to 1 in order. From `at` = `STRETCH.drive` to 1 the camera is still at the lead's rest pose, where `landmarkRect` matches the stage box fitted to the lead's aspect within 2 px, on desktop (1440 × 900) and phone (390 × 844). The camera moves smoothly (a step of 0.001 moves the eye < 0.5).
- [ ] Run, fail; implement; run, pass; verify; commit.

### Task 3: The stretch's shapes

**Files:** Modify `src/world/shapes.js` (export `buildStretchWorld`); Test `tests/worldShapes.test.js`.

**Interfaces:** Produces `buildStretchWorld(tier, { road, stops }, seed, { stops, layout }, landed?): Array<{ name, shape, stopId? , cursor? }>`, with parts `road`, `edges`, `landmark:<id>`, `landed:<id>` (tagged as on the home road).

- [ ] Test: on every tier and every stretch, the total ≤ `budgetFor(tier)`; there is one landmark per stop; Crew Advisors has a cursor; the gate is a slab; with a picture, `landed:<id>` is tagged `-place`.
- [ ] Run, fail; implement; run, pass; verify; commit.

### Task 4: Left-aligned landing text

**Files:** Modify `src/field/types.js`, `src/field/resolveTransform.js`; Test `tests/resolveTransform.test.js` (or the existing one).

**Interfaces:** Text targets take optional `align: 'left' | 'center'` (default `'center'`, unchanged).

- [ ] Test: with `align: 'left'`, every landing point of a one-line short text lies in the left half of a wide box; without it, centred as today.
- [ ] Run, fail; implement; run, pass; verify; commit.

### Task 5: The stretch in the site

**Files:**
- Create `src/world/stretchWorld.js`.
- Modify `src/world/worldSwitch.js`, `src/App.jsx`, `src/world/WorldLayer.jsx`, `src/world/WorldCanvas.jsx`, `src/world/homeWorld.js` (export `screenOf`; `reset()`).
- Test `tests/worldSwitch.test.js`, `e2e/worldpages.spec.js`.

**Interfaces:**
- Produces `worldPageFrom({ on, pathname }): 'home' | 'stretch' | null`.
- Produces `useWorldPage()`. `useWorldHome()` stays, meaning page `'home'`.
- Produces `createStretchWorld({ renderer, atlas, tier, canvas }).frame({ stretch, now })` and `.release()`.

- [ ] Test (unit): `worldPageFrom` gives home on `/`, stretch on every stretch path, and null on the others or when off.
- [ ] Test (e2e):
  - With the switch: `/products` has `[data-world-stretch]`, and the canvas reads `data-page="stretch:products"`.
  - Scrolling through the stretch, `data-stretch-progress` rises to 1.00 and the flight lands (`data-flight="stretch:products"`). The `h1` is opacity 1 after and 0 at the top.
  - Navigating by the nav to Services keeps the same canvas element (a mark set on it survives) and reads `stretch:services`.
  - Back home it reads the home's sections again.
  - `/checkout-success` shows the field.
  - Without the switch, no stretch on any page.
  - Reduced motion: no stretch.
  - axe on `/products?world=1` passes.
- [ ] Run, fail; implement; run, pass; verify; commit.

### Task 6: The look and the record

- [ ] Screenshots, desktop and phone: each stretch page at the start, mid-drive, at rest, mid-flight and landed.
- [ ] `npm run verify`; `npm run test:e2e`.
- [ ] Lighthouse on `/products` and `/` with the switch off: no regression.
- [ ] Blueprint row; sync to Chris's machine with md5 checks.
