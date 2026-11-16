# Code World W3: the family road — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Door B plays inside the Code World the way door A does since R6 (Hearth, the five templates, Done for you, each at its landmark along the family road), and the road looks as full and bright on either door.

**Architecture:** One road builder (`buildRoadWorld`) draws every door's world from a per-tier density of glyphs per unit of ground, so the opening is identical whichever door is taken, and the screens take what the budget leaves. The family road is `layoutRoad`'s existing mirror of the business road, fed by `familyRoadStops`. Door B's chapters are today's components laid along the road one per pinned section, as `WorldRoadChapters` lays door A's; the template chapter is split into one pinned section per template built from today's `TemplateSegment`. Camera, flights, fades, passed pictures, side paths and stands are R4 to R5's code with two stop kinds added (`template`, `words`).

**Tech Stack:** Vite 5, React 18, hand-written WebGL2 (`src/world`), Vitest 3, Playwright 1.65 (Chromium 1243).

**Spec:** `docs/superpowers/specs/2026-11-16-code-world-family-road-design.md` (over `docs/superpowers/specs/2026-11-10-code-world-design.md` section 3 and `docs/superpowers/specs/2026-11-12-code-world-chapters-design.md`).

## Global Constraints

- No `@ts-ignore`, `as any`, `eslint-disable`, `ignoreBuildErrors`; `npm run verify` (lint with zero warnings, `tsc` with `checkJs`, unit tests, build, budget) exit 0 after every task. Complete files only.
- Never create a branch, commit or push; Chris does. Source and config files are copied to Chris's machine (CRLF), verified by md5; tests run here.
- Door B's copy, template order (`DOOR_B_TEMPLATES`), timing within a section, and layout: unchanged. Without `?world=1`, with reduced motion or without WebGL2: today's page, unchanged.
- Glyph budgets stay `12000 / 24000 / 40000` (`budgetFor`) unless Chris raises the low tier after measuring. A screen landmark keeps at least 400 glyphs on every tier.
- Signature colour `#f97316` on `#0a0a0a`; the stand's posts and the road's edges are ember.
- The gate comes first in world mode; the camera never jumps (`tests/worldTrack.test.js`'s 0.15 step limit holds for door `b`).

## Review Focus

1. A visitor who switches door in the nav mid-road (`business` → `family`): the world rebuilds for the new road and the page's `rest` sections re-measure; no landmark from the old road is drawn and the camera is on the new road's track (test in Task 5, after `worldbusiness`'s nav test).
2. A template without a loop or an approved excerpt (a future catalog entry): `familyRoadStops` leaves it out and the page shows the same set, so the road and the page agree (Task 2 test).
3. A phone that lands straight on Vow (reload mid-road, door `b` stored): Hearth, Evergreen and Keepsake show as pictures, Vow's flight follows its scroll (Task 5 e2e).
4. The low tier with six screen landmarks: every screen at or above 400 glyphs, the road scatter at its density, total within 12,000 (Task 1 test over both doors).
5. Reduced motion with `?world=1` and door `b`: today's door B page with no `data-world-stop` and no canvas (Task 5 e2e).

---

### Task 1: One road, as full on every door

**Files:**
- Modify: `src/world/shapes.js` (`codeRoad`, `buildWorld`, `buildRoadWorld`, the scatter constants)
- Modify: `src/world/homeWorld.js:126-136` (no-door world)
- Test: `tests/worldShapes.test.js`

**Interfaces:**
- Consumes: `layoutRoad` (`path`, `spurs`, `landmarks`, `along`), `budgetFor(tier)`.
- Produces: `ROAD_DENSITY` (exported, `Readonly<Record<'low' | 'mid' | 'high', number>>`, glyphs per unit of ground on the opening); `buildRoadWorld(tier, sources, seed, road, landed)` unchanged in signature, with the road scatter sized by area and the screens by the remainder; `buildWorld(tier, sources, seed)` drawing the opening at the same density as `buildRoadWorld`.

- [ ] **Step 1: Write the failing tests** (append to `tests/worldShapes.test.js`, in the R5 describe's style; `stops`, `layout`, `sources` as there)

```js
describe('the road is as full on every door (Code World W3.1)', () => {
  const area = (/** @type {Array<[number, number]>} */ path, /** @type {number} */ width) =>
    width * path.slice(1).reduce((sum, p, i) => sum + Math.hypot(p[0] - path[i][0], p[1] - path[i][1]), 0);
  const count = (/** @type {Array<{ name: string, shape: Shape }>} */ parts, /** @type {string} */ name) => parts.find((p) => p.name === name)?.shape.glyphs.length ?? 0;

  for (const tier of /** @type {const} */ (['low', 'mid', 'high'])) {
    it(`${tier}: the opening's scatter is ROAD_DENSITY per unit of ground, the same with or without a road`, () => {
      const opening = buildWorld(tier, { gate: gate.code, road: ambient.code, landmark: ambient.code }, 1);
      const withRoad = buildRoadWorld(tier, sources, 1, { stops, layout });
      for (const [name, path, width] of [['trunk-road', ROAD_PATHS.trunk, 4], ['business-road', ROAD_PATHS.business, 3.2], ['family-road', ROAD_PATHS.family, 3.2]]) {
        const expected = Math.floor(ROAD_DENSITY[tier] * area(path, width));
        expect(count(opening, name), name).toBe(expected);
        expect(count(withRoad, name), name).toBe(expected);
      }
    });

    it(`${tier}: the road between the landmarks is half the opening's density, the run-on an eighth, the side paths the road's`, () => {
      const parts = buildRoadWorld(tier, sources, 1, { stops, layout });
      const onward = layout.path.slice(ROAD_PATHS.business.length - 1);
      const last = layout.along[layout.along.length - 1];
      const between = Math.floor((ROAD_DENSITY[tier] / 2) * 3.2 * last);
      const runOn = Math.floor((ROAD_DENSITY[tier] / 8) * 3.2 * (area(onward, 1) - last));
      expect(count(parts, 'onward-road')).toBe(between + runOn);
      for (const spur of layout.spurs) {
        const spurLength = Math.hypot(spur.path[1][0] - spur.path[0][0], spur.path[1][1] - spur.path[0][1]) - 1.6;
        expect(count(parts, `spur-road:${spur.stopId}`)).toBe(Math.max(1, Math.floor((ROAD_DENSITY[tier] / 2) * 1.6 * spurLength)));
      }
    });

    it(`${tier}: the screens share what the budget leaves, at least 400 each, and the whole fits`, () => {
      const parts = buildRoadWorld(tier, sources, 1, { stops, layout });
      const screens = stops.filter((s) => s.kind === 'product' || s.kind === 'service');
      const sizes = screens.map((s) => count(parts, `landmark:${s.id}`));
      expect(Math.min(...sizes)).toBeGreaterThanOrEqual(400);
      expect(Math.max(...sizes) - Math.min(...sizes)).toBeLessThanOrEqual(1);
      expect(parts.reduce((sum, p) => sum + p.shape.glyphs.length, 0)).toBeLessThanOrEqual(budgetFor(tier));
    });
  }

  it('the road glows: scatter alpha runs 0.45 to 0.9', () => {
    const road = codeRoad(ambient.code, { path: ROAD_PATHS.trunk, width: 4, count: 2000 }, 1);
    const alphas = Array.from({ length: 2000 }, (_, i) => road.colors[i * 4 + 3]).filter((a) => a < 0.9);
    expect(Math.min(...alphas)).toBeGreaterThanOrEqual(0.45);
    expect(Math.max(...alphas)).toBeLessThanOrEqual(0.9);
  });
});
```

Import `ROAD_DENSITY`, `buildWorld`, `codeRoad`, `ROAD_PATHS` from `shapes.js` as needed. Delete the R5 test "keeps every tier within budget with the side paths and stands, screens still full" (the third test above replaces it).

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run tests/worldShapes.test.js`
Expected: FAIL — `ROAD_DENSITY` is not exported; alpha minimum below 0.45.

- [ ] **Step 3: Implement**

In `src/world/shapes.js`:
- `export const ROAD_DENSITY = Object.freeze({ low: 12, mid: 26, high: 46 });` (glyphs per unit of ground on the opening; the fixed parts plus six screens at 400 leave this much on the low tier — Chris may raise the low budget after measuring).
- `codeRoad`: alpha `0.45 + 0.45 * random()` for a pale glyph (sparks unchanged at 0.9).
- Remove `ROAD_SCATTER` and `SCREEN_SHARE`. A helper `scatterCount(density, path, width)` → `Math.floor(density * width * length(path))`.
- `buildWorld`: trunk, business and family scatter by `ROAD_DENSITY[tier]`; the lone landmark takes the remainder (the lab keeps its look).
- `buildRoadWorld`: opening scatter by `ROAD_DENSITY[tier]`; the onward path split at `layout.along`'s last value into the stretch between landmarks (`ROAD_DENSITY / 2`) and the run-on (`ROAD_DENSITY / 8`), one `codeRoad` each with the counts summed into the one `onward-road` part (or two parts `onward-road` and `run-on-road` — then the test's `count` must sum them; pick one and keep the test honest); side paths at `ROAD_DENSITY / 2`; `perScreen = Math.max(400, Math.floor(remainder / screens.length))` where `remainder` is the budget less every fixed part and every scatter part. If `remainder / screens.length < 400`, scale every scatter count down by `remainder / (400 * screens.length)` so the whole fits (and say so in a comment: the budget, not the density, is the limit).
- `homeWorld.js` keeps calling `buildWorld` for no door; nothing to change there unless `buildWorld`'s signature moves.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tests/worldShapes.test.js tests/worldLandmark.test.js`
Expected: PASS.

- [ ] **Step 5: Look at it**

Run the R5 screenshot script (`/tmp/shoot5.mjs` pattern: `vite preview`, `?world=1`, door `a` stored) at `road-1`, `road-2`, `how-i-work` and, with no door stored, the trunk at the fork; desktop and phone. The business road's opening must look like the family road's did before this task. Record the per-area numbers for each tier in the ledger.

- [ ] **Step 6: Verify and ledger**

Run: `npm run verify`
Expected: exit 0. Ledger line for Task 1 with the density table and the low-tier remainder.

---

### Task 2: The family road's stops, sizes, route and journey

**Files:**
- Modify: `src/world/roads.js` (`RoadStop` kinds; `familyRoadStops`)
- Modify: `src/world/roadLayout.js` (`roadSizes` for `template`; `words` places nothing)
- Modify: `src/world/route.js` (`routeFor('b')`, `roadGlyphs` over both roads)
- Modify: `src/world/journey.js` only if `placeRoad` rejects a stop kind it does not know (check first)
- Test: `tests/worldRoads.test.js`, `tests/worldRoadLayout.test.js`, `tests/worldRoute.test.js`

**Interfaces:**
- Consumes: `templates` (`src/data/templates.js`: `id`, `name`, `excerpt`, `previewVideo`, `poster`), `DOOR_B_TEMPLATES` (`src/scenes/TemplateChapter.jsx`), `getExcerpt`.
- Produces: `RoadStop['kind']` = `'product' | 'unfinished' | 'service' | 'audit' | 'commits' | 'template' | 'words'`; `familyRoadStops({ includeDrafts?, registry? }): RoadStop[]` (`hearth` first, then `DOOR_B_TEMPLATES` in order, each `kind: 'template'`, `excerptId: template.excerpt`, `name: template.name`; then `{ id: 'done-for-you', name: 'Done for you', kind: 'words', excerptId: null }`); `roadSizes` gives a `template` stop `{ width: 6, height: 6 / (1280 / 800) }`; `routeFor('b').road` non-null with `door: 'b'`; `roadGlyphs()` includes both roads' excerpts.

- [ ] **Step 1: Write the failing tests**

`tests/worldRoads.test.js`:
```js
describe('familyRoadStops (Code World W3.2)', () => {
  it('runs Hearth, then door B’s templates in their order, then done for you', () => {
    const stops = familyRoadStops();
    expect(stops.map((s) => s.id)).toEqual(['hearth', ...DOOR_B_TEMPLATES.map((t) => t.id), 'done-for-you']);
    expect(stops.slice(0, -1).every((s) => s.kind === 'template')).toBe(true);
    expect(stops[stops.length - 1]).toEqual({ id: 'done-for-you', name: 'Done for you', kind: 'words', excerptId: null });
    expect(stops[0].excerptId).toBe('template-hearth');
  });
  it('leaves out a template whose excerpt is not approved, keeping the rest in order', () => {
    const registry = Object.fromEntries(Object.entries(excerpts).filter(([id]) => id !== 'template-vow'));
    expect(familyRoadStops({ registry }).map((s) => s.id)).toEqual(['hearth', ...DOOR_B_TEMPLATES.filter((t) => t.id !== 'vow').map((t) => t.id), 'done-for-you']);
  });
});
```
`tests/worldRoadLayout.test.js`:
```js
describe('the family road (Code World W3.2)', () => {
  const stops = familyRoadStops();
  const sizes = roadSizes(stops, sourcesFor(stops));
  const road = layoutRoad(stops, 'b', sizes);
  it('sizes every template as a 16:10 screen 6 wide', () => {
    for (const stop of stops.filter((s) => s.kind === 'template')) expect(sizes[stop.id]).toEqual({ width: 6, height: 6 / (1280 / 800) });
  });
  it('places a landmark per template on the mirrored road, none for done for you, and a side path and stand for each', () => {
    expect(road.landmarks.map((l) => l.stopId)).toEqual(stops.slice(0, -1).map((s) => s.id));
    expect(road.commits).toEqual([]);
    expect(road.spurs.map((s) => s.stopId)).toEqual(road.landmarks.map((l) => l.stopId));
    expect(road.direction[0]).toBeGreaterThan(0); // the family road turns right
    expect(road.along).toHaveLength(stops.length);
  });
});
```
(`sourcesFor` as the file's business tests build sources; add it if the file has none.)

`tests/worldRoute.test.js`: replace "leaves the fork and the family road as W1 had them" with:
```js
it('builds the family road for door b, once, and the atlas covers both roads', () => {
  const route = routeFor('b');
  expect(route.road?.door).toBe('b');
  expect(route.road?.stops.map((s) => s.id)).toEqual(familyRoadStops().map((s) => s.id));
  expect(routeFor('b')).toBe(route);
  expect(routeFor(null).road).toBeNull();
  const glyphs = roadGlyphs();
  for (const code of Object.values(route.road?.sources ?? {})) for (const ch of new Set(code)) expect(glyphs).toContain(ch);
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run tests/worldRoads.test.js tests/worldRoadLayout.test.js tests/worldRoute.test.js`
Expected: FAIL — `familyRoadStops` is not exported; `routeFor('b').road` is null.

- [ ] **Step 3: Implement**

`roads.js`: `familyRoadStops` beside `businessRoadStops` (import `templates` and `DOOR_B_TEMPLATES`; Hearth is `templates.find((t) => t.id === 'hearth')`; a template is a stop only with `previewVideo`, `poster` and an approved excerpt). `roadLayout.js`: `roadSizes` handles `template` as `product`; `layoutRoad` treats `words` as `commits` without pushing commit points (`if (stop.kind === 'commits' || stop.kind === 'words')`, commits only for `commits`). `route.js`: `routeFor` builds the road for both doors (`door === 'a' ? businessRoadStops() : familyRoadStops()`); `roadGlyphs` joins both routes' sources. Check `journey.js`'s `placeRoad` for kind-specific code and extend it the same way.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tests/worldRoads.test.js tests/worldRoadLayout.test.js tests/worldRoute.test.js tests/worldJourney.test.js tests/worldTrack.test.js`
Expected: PASS.

- [ ] **Step 5: Verify and ledger**

Run: `npm run verify`
Expected: exit 0.

---

### Task 3: The world and the camera know templates and a stop of words

**Files:**
- Modify: `src/world/shapes.js:534-546` (`buildRoadWorld`'s stop loop)
- Modify: `src/world/homeWorld.js:73-84` (`screenOf`)
- Modify: `src/world/worldTrack.js:91-103` (`restFor`)
- Test: `tests/worldShapes.test.js`, `tests/worldTrack.test.js`

**Interfaces:**
- Consumes: Task 2's stops and `routeFor('b')`.
- Produces: `buildRoadWorld` for door `b`: a `landmark:<id>` screen sculpture per template (and `landed:<id>` once its picture is read), no part for `done-for-you`; `screenOf(stop)` → the template's `poster` for a `template` stop; `restFor` rests a `words` stop on the road as it rests `commits`.

- [ ] **Step 1: Write the failing tests**

`tests/worldShapes.test.js`:
```js
describe('the family road’s world (Code World W3.3)', () => {
  const stops = familyRoadStops();
  const stopSources = sourcesFor(stops);
  const layout = layoutRoad(stops, 'b', roadSizes(stops, stopSources));
  const sources = { gate: gate.code, road: ambient.code, stops: stopSources };
  it('builds a screen, a stand and a side path per template, nothing for done for you, within every budget', () => {
    for (const tier of /** @type {const} */ (['low', 'mid', 'high'])) {
      const parts = buildRoadWorld(tier, sources, 1, { stops, layout });
      for (const stop of stops.slice(0, -1)) {
        expect(parts.find((p) => p.name === `landmark:${stop.id}`)?.shape.glyphs.length).toBeGreaterThanOrEqual(400);
        expect(parts.find((p) => p.name === `stand:${stop.id}`)).toBeDefined();
        expect(parts.find((p) => p.name === `spur-road:${stop.id}`)).toBeDefined();
      }
      expect(parts.some((p) => p.name.endsWith(':done-for-you'))).toBe(false);
      expect(parts.reduce((sum, p) => sum + p.shape.glyphs.length, 0)).toBeLessThanOrEqual(budgetFor(tier));
    }
  });
});
```
`tests/worldTrack.test.js` (in the existing per-viewport loop's style, with sections built for door `b` the way the file builds door `a`'s — a `rest` per stop with a box for every landmark stop and none for `done-for-you`):
```js
it(`door b: rests on each template's box, and on the road at done for you (${label})`, () => {
  const track = buildTrack(routeFor('b'), sectionsB, viewport);
  const last = sectionsB[sectionsB.length - 1];
  const camera = track.cameraAt((last.from + last.to) / 2);
  const layout = routeFor('b').road?.layout;
  if (!layout) throw new Error('no family road');
  const along = layout.along[layout.along.length - 1];
  const onRoad = [layout.origin[0] + layout.direction[0] * (along - 6), layout.origin[1] + layout.direction[1] * (along - 6)];
  expect(camera.eye[0]).toBeCloseTo(onRoad[0], 3);
  expect(camera.eye[2]).toBeCloseTo(onRoad[1], 3);
});
```
(`along - 6` is How I work's `COMMITS_EYE`; read the constant from `worldTrack.js` rather than the number if it is exported.)

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run tests/worldShapes.test.js tests/worldTrack.test.js`
Expected: FAIL — "The road has no landmark or code for done-for-you"; `restFor` returns null for `words`.

- [ ] **Step 3: Implement**

`shapes.js`: `if (stop.kind === 'commits' || stop.kind === 'words') return;` and `template` falls to the screens branch. `homeWorld.js`: `screenOf` returns `templates.find((t) => t.id === stop.id)?.poster ?? null` for `template`. `worldTrack.js`: `restFor` accepts `kind === 'commits' || kind === 'words'`.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tests/worldShapes.test.js tests/worldTrack.test.js`
Expected: PASS.

- [ ] **Step 5: Verify and ledger**

Run: `npm run verify`
Expected: exit 0.

---

### Task 4: Door B's chapters along the road

**Files:**
- Modify: `src/scenes/DoorBIntro.jsx` (export `DoorBIntroFor`; `data-world-target` on the loop box)
- Modify: `src/scenes/TemplateChapter.jsx` (export `TemplateChapterFor`; `data-world-target` on the segment's loop box)
- Modify: `src/scenes/WorldRoadChapters.jsx` (`door` prop; door `b` stops)
- Modify: `src/pages/Home.jsx:67-90` (door `b` in world mode)
- Test: `tests/TemplateChapter.test.jsx`, `tests/worldJourney.test.js` or a new `tests/WorldRoadChapters.test.jsx`

**Interfaces:**
- Consumes: `familyRoadStops`, `FlightIntro` (DoorBIntro.jsx:46), `TemplateSegment` (TemplateChapter.jsx:96), `segmentTimeline`, `SEGMENT_VH` (90), `DoneForYou`.
- Produces: `DoorBIntroFor({ includeDrafts })` → today's `FlightIntro` for Hearth (or null without an excerpt); `TemplateChapterFor({ template, excerpt, index, count })` → a pinned section `data-template-chapter data-door-b-template={template.id}` of `${SEGMENT_VH + 100}vh` holding one `TemplateSegment` with `active` true and `local` = section progress; `WorldRoadChapters({ door, includeDrafts })` laying door `b`'s stops as it lays door `a`'s.

- [ ] **Step 1: Write the failing tests** (`tests/TemplateChapter.test.jsx`, in its existing render harness with `mode: 'webgl'` and motion allowed)

```js
it('TemplateChapterFor renders one template as its own pinned chapter with its flight target (W3.4)', () => {
  const vow = DOOR_B_TEMPLATES.find((t) => t.id === 'vow');
  const excerpt = getExcerpt(vow.excerpt);
  render(<TemplateChapterFor template={vow} excerpt={excerpt} index={2} count={5} />);
  const section = document.querySelector('[data-template-chapter][data-door-b-template="vow"]');
  expect(section).not.toBeNull();
  expect(section.style.height).toBe('190vh');
  expect(section.querySelector('[data-world-target]')).not.toBeNull();
  expect(section.textContent).toContain('3 / 5');
});

it('WorldRoadChapters lays door B’s stops in road order, each a rest after a stretch of road (W3.4)', () => {
  render(<WorldRoadChapters door="b" includeDrafts={false} />);
  const stops = [...document.querySelectorAll('[data-world-segment="rest"][data-world-stop]')].map((el) => el.getAttribute('data-world-stop'));
  expect(stops).toEqual(familyRoadStops().map((s) => s.id));
  expect(document.querySelector('[data-world-stop="hearth"] [data-door-b-intro] [data-world-target]')).not.toBeNull();
  expect(document.querySelector('[data-world-stop="done-for-you"] [data-chapter="done-for-you"]')).not.toBeNull();
});
```

- [ ] **Step 2: Run them to verify they fail**

Run: `npx vitest run tests/TemplateChapter.test.jsx`
Expected: FAIL — `TemplateChapterFor` is not exported; `WorldRoadChapters` ignores `door`.

- [ ] **Step 3: Implement**

`DoorBIntro.jsx`: lift the Hearth lookup, loop and excerpt into `hearthChapter(includeDrafts)`; `export function DoorBIntroFor({ includeDrafts })` returns `<FlightIntro>` (the default export keeps its decision between flight and static); `data-world-target` on `FlightIntro`'s loop box div. `TemplateChapter.jsx`: `export function TemplateChapterFor({ template, excerpt, index, count })` using `useSectionProgress(sectionRef, true)` and `useField()` for `mode`; `data-world-target` on `TemplateSegment`'s loop box div. `WorldRoadChapters.jsx`: `door === 'a' ? businessRoadStops : familyRoadStops`; `template` → `TemplateChapterFor` (`index` = its position among the template stops after Hearth, `count` = `DOOR_B_TEMPLATES.length`), `hearth` → `DoorBIntroFor`, `words` → `DoneForYou`. `Home.jsx`: in world mode door `b` renders `<WorldRoadChapters door="b" includeDrafts={false} />` where today's `DoorBIntro`, `TemplateChapter`, `DoneForYou` are, then the builder, idea and brief as today; door `a` passes `door="a"`.

- [ ] **Step 4: Run the tests**

Run: `npx vitest run tests/TemplateChapter.test.jsx tests/serverRender.test.jsx tests/hydration.test.jsx`
Expected: PASS (the prebuilt home has no door, so no `data-door-b-intro`, as before).

- [ ] **Step 5: Verify and ledger**

Run: `npm run verify`
Expected: exit 0; budget: `Home` within 16 kB (record the measured size; reset the line from measurement + 5 % if over, as R4 did).

---

### Task 5: Browser tests, the look, and the stop

**Files:**
- Create: `e2e/worldfamily.spec.js`
- Modify: `e2e/worldhome.spec.js:113-116, 145-149` (door B now has stops)
- Modify: `docs/superpowers/plans/2026-11-16-code-world-w3.md` (ledger), `BLUEPRINT-SKY-REDESIGN.md` (Progress row)

**Interfaces:**
- Consumes: `worldbusiness.spec.js`'s helpers (`open`, `scrollTo`, `spanOf`, `inChapter`, `restRect`, `near`); move them to `e2e/world.js` and import from both specs, adding `takeFamily(page)` (ArrowRight at the fork, as `worldhome.spec.js` takes it).

- [ ] **Step 1: Write the failing e2e tests** (`e2e/worldfamily.spec.js`)

```js
test('taking family/ lays door B along the road: Hearth, the five templates, done for you, then the builder', ...)
  // [data-world-stop] ids equal ['hearth', 'evergreen', 'keepsake', 'vow', 'gather', 'folio', 'done-for-you']; '[data-chapter="builder"]' follows.
test('Hearth types, flies into its landmark in the world, then its loop takes over exactly there', ...)
  // as worldbusiness's product test: data-flight 'door-b-intro:<w>x<h>', progress rises with scroll, loop box near data-rest-rect at 0.97.
test('each template types, flies into its landmark, then its loop takes over, numbered n / 5', ...)
  // for 'vow': data-flight 'template-vow:<w>x<h>'; text '3 / 5' visible.
test('done for you rests on the road: its words, no landmark, no rest rect', ...)
  // in its rest: data-section 'rest:done-for-you', no data-rest-rect, the scrim on.
test('arriving straight at Vow (a returning visitor): the three before have landed, its flight follows its scroll', ...)
test('switching to business in the nav mid-road leaves the family road behind', ...)
  // after the switch: data-road 'a', no [data-world-stop="vow"], [data-world-stop="my-teachers-toolbox"] attached.
test('reduced motion with the switch and door b: today’s door B page, no world', ...)
  // [data-door-b-intro] and [data-template-chapter] present, [data-world-stop] count 0, canvas[data-world] count 0.
test('no accessibility violations at Hearth, at a template and at done for you', ...)
```
`worldhome.spec.js`: "→ takes the family road" expects `[data-world-stop="hearth"]`; the family-road expectations at 145-149 likewise.

- [ ] **Step 2: Run them to verify they fail**

Run: `npx playwright test e2e/worldfamily.spec.js e2e/worldhome.spec.js`
Expected: FAIL on the new spec (no `data-world-stop` on door `b`) until Task 4 is in; with Tasks 1 to 4 in, the first run of this task is the check.

- [ ] **Step 3: Run the whole suite**

Run: `npm run verify && npx playwright test`
Expected: exit 0; every e2e test passes (record the count).

- [ ] **Step 4: The look**

Screenshots, desktop and phone, door `b`: the fork, the turn onto family/, Hearth typing / mid-flight / landed / handed off, each template the same, done for you; and door `a`'s road-1 after Task 1 beside door `b`'s road-1: the same density. Lighthouse 12 on `/` with the switch off, as R6: no regression. Send the sheets to Chris.

- [ ] **Step 5: Ledger, blueprint, sync, stop**

Ledger lines for Tasks 1 to 5 with the real output; the blueprint's Code World row updated (W3 built, awaiting review). Copy every changed file to Chris's machine (CRLF, md5-verified). Stop: Chris runs `npm run verify` and `npm run test:e2e`, commits, pushes, and measures `/?world=1&meter=1` taking `family/` and `business/` (iPhone p95 ≤ 25 ms; desktop every frame at its refresh); if he wants the road fuller still on the phone, the next step is raising `budgetFor('low')` and re-measuring, not the density.

## Execution ledger

- Setup: local scratch clone only (Chris commits in his repo); a local snapshot commit mirrors his b3693d8 so task ranges can be cut. Spec read: docs/superpowers/specs/2026-11-16-code-world-family-road-design.md.
- Pre-flight: T1→T3: ROAD_DENSITY / buildRoadWorld signature unchanged; T3 consumes it as is — ok. T2→T3/T4: RoadStop kinds 'template' | 'words', familyRoadStops({includeDrafts, registry}) — T3 shapes/homeWorld/worldTrack and T4 WorldRoadChapters consume the same names — ok. T4→T5: data-world-stop ids 'hearth', template ids, 'done-for-you' — e2e expects the same — ok. T1 test "between + runOn" vs implementation's one-or-two parts: ruled below in T1.
- Task 1 Ruling: the onward road is two parts, `onward-road` (between the landmarks, density/2) and `run-on-road` (density/8); the plan's test allowed either and sums both — one scatter call per density, no mixed-density path — cost if wrong: one more part name.
- Task 1: ROAD_DENSITY low 12 / mid 26 / high 46; low: 6 screens at 508 each after fixed 3159 + scatter; scatter alpha 0.45–0.9. Verified in screenshots: the trunk at the fork identical with or without the road (desktop and phone). `npm run verify` exit 0 (378/378, budget ok).
Task 1: complete (commits 0524740..7c8937a, tests: npx vitest run tests/worldShapes.test.js tests/worldLandmark.test.js →    Duration  2.26s (transform 211ms, setup 198ms, collect 365ms, tests 422ms, environment 826ms, prepare 132ms))
- Task 2 Ruling: `journey.js`'s `placeRoad` gets a `words` branch (one still key on the road, eye 6 before the stop, looking 4 past it, as the commits' last key) rather than throwing on a stop without a landmark — the journey still places every road stop for the page's length — cost if wrong: none in world mode (the track, not the journey, drives the camera).
- Task 2: familyRoadStops (hearth, evergreen, keepsake, vow, gather, folio, done-for-you); roadSizes template = product; layoutRoad skips `words`; routeFor('b') builds the road; roadGlyphs covers both. `npm run verify` exit 0 (382/382).
Task 2: complete (commits 7c8937a..1f91596, tests: npx vitest run tests/worldRoads.test.js tests/worldRoadLayout.test.js tests/worldRoute.test.js tests/worldJourney.test.js tests/worldTrack.test.js →    Duration  5.39s (transform 298ms, setup 560ms, collect 788ms, tests 687ms, environment 2.25s, prepare 371ms))
- Task 3 Ruling: the plan's done-for-you camera test used the R2 `along - 6` eye; added the target check (`along + 10`, How I work's look) so a words rest is pinned as the commits' rest is. The template-rest test passed before the change (the track already rests generically on any landmark with a box) — it guards the family road rather than drives the change — cost if wrong: none.
- Task 3: buildRoadWorld skips `words`; restFor rests `words` like `commits`; screenOf returns a template's poster. `npm run verify` exit 0 (387/387).
Task 3: complete (commits 1f91596..9e435d9, tests: npx vitest run tests/worldShapes.test.js tests/worldTrack.test.js →    Duration  3.25s (transform 250ms, setup 215ms, collect 540ms, tests 1.04s, environment 883ms, prepare 239ms))
- Task 4 Ruling: a split template's number counts the family road's template stops after Hearth (`n / templateStops.length`), not `DOOR_B_TEMPLATES.length` as the plan wrote: today's chapter counts the templates it shows (`items.length`), so a left-out template renumbers the rest the same way — cost if wrong: none while all five have excerpts.
- Task 4 Ruling: each split template chapter keeps today's "all templates" link at the bottom of its pinned frame (today it shows across all five segments) — cost if wrong: one link per section to remove.
- Task 4: `DoorBIntroFor`, `TemplateChapterFor` (190vh, one segment, always active), `data-world-target` on both loop boxes, `WorldRoadChapters({ door })`, Home renders it for door b in world mode. Without the switch: unchanged. `npm run verify` exit 0 (390/390; Home 10.14 kB of 16).
Task 4: complete (commits 9e435d9..d59f7a0, tests: npx vitest run tests/TemplateChapter.test.jsx tests/serverRender.test.jsx tests/hydration.test.jsx →    Duration  8.22s (transform 1.22s, setup 408ms, collect 1.81s, tests 4.19s, environment 1.06s, prepare 274ms))
- Task 5 finding (first e2e run, 4 of 33 failed): the world found a flight's landmark by the flight's key prefix, which is the stop id for door A but `door-b-intro` / `template-<id>` for door B, so door B's flights were never placed; and done for you, shorter than a screen, had a rest of zero scroll, so the camera never rested there. Ruling: `stopForFlight(slug)` in roads.js maps door B's flight slugs to their stops (unit test RED→GREEN), and a stop of words holds in a 160vh pinned frame (`data-words-hold`, unit test RED→GREEN) — the chapters' own slugs and DoneForYou are unchanged — cost if wrong: a new door-B chapter slug needs a line in `stopForFlight`.
- Task 5 Ruling: `worldbusiness`'s nav-switch test expected no stops at all after switching to Family; since W3 the family road has its own, so it now expects no business stop, Hearth's stop present and `data-road` 'b' — cost if wrong: none.
- Task 5 Ruling: the shared e2e steps moved to `e2e/world.js` (with `takeFamily`) as the plan said; `worldhome`'s "→ takes the family road" also checks Hearth's stop.
- Task 5: `npm run verify` exit 0 (392/392; canvas 7.46 of 7.6 kB). e2e: world specs 33/33, then the whole suite 205/205. Screenshots: family road, desktop and phone, 28 each (fork, turn, road, each of Hearth and the five templates typing / mid-flight 0.43–0.52 / landed 0.95–0.98 / handed off 1.00, done for you resting on the road); the road between landmarks side by side on both doors: the same density. Lighthouse 12 on `/`, switch off: mobile 87 / 88 / 86, desktop 100 / 100, a11y and SEO 100 (R6: 85 / 85 / 86, 100 / 100): no regression.
Task 5: complete (commits d59f7a0..f4f57a4, tests: npx vitest run tests/worldRoads.test.js tests/TemplateChapter.test.jsx →    Duration  4.15s (transform 390ms, setup 209ms, collect 931ms, tests 1.56s, environment 941ms, prepare 172ms))
- Final review: self-review (no reviewer spawned: the session spawns agents only when Chris asks). Review Focus: (1) nav switch both ways — e2e in both world specs; (2) a left-out template — unit test, the page and the road both read `familyRoadStops`; (3) arriving at Vow — e2e; (4) low tier with six screens — unit test, and measured: door b low screens 843, door a 516, both roads' trunk at full density on every tier, total within budget; (5) reduced motion door b — e2e. No TODO, console, or suppression in the diff.
- Final: minor (deferred): `buildRoadWorld`'s fallback (scatter scaled down so screens keep 400) runs on no current road or tier and has no test of its own.
