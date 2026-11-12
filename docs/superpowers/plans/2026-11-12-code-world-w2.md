# Code World W2 Implementation Plan: the business road

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Behind `/?world=1`, a visitor who takes `business/` travels a road of landmarks built from the site's real code: the three live products resolving into their loops, Crew Advisors typing and never finishing, the four services resolving into their screens, and how I work as three commits, each stop's words real DOM text.

**Architecture:** The road is derived from the site's data (`products.js`, `SERVICE_CHAPTERS`, `serviceScreens.js`), not hand-placed: a stop list, then a layout that sets each landmark beside the road on alternating sides, facing the road, then camera keys that arrive square-on to each one. One landmark at a time hands over to its real thing, so the renderer keeps its one fade range; Crew Advisors uses the same range to hide its untyped code, plus one cursor glyph the renderer can move. The canvas (in the app shell) tells the journey (in the home page) where the landmark is on screen through a small frame bus, and the journey lays the real screen exactly over it.

**Tech Stack:** Vite 5, React 18, React Router 6.30, Tailwind 3, hand-written WebGL2 (`src/world/`), GSAP + Lenis (`vendor-scroll`), Vitest 3, Playwright 1.65.

**Spec:** `docs/superpowers/specs/2026-11-10-code-world-design.md` (sections 2, 3 "Business road", 4, 5, 6, 7; phase W2 in section 8). Builds on W1: `docs/superpowers/plans/2026-11-10-code-world-w1.md` and its ledger.

## Global Constraints

- Real code only: every glyph comes from an approved excerpt (`approved` not null); unapproved excerpts never render. The signposts' words and the cursor glyph `▌` are the only non-excerpt glyphs (the signposts are W1's; the cursor is the editor's own).
- Approved copy unchanged; product, service and principle words come from `products.js`, `services.js` and `PRINCIPLES` unchanged.
- Palette locked: `#f97316` on `#0a0a0a`; JetBrains Mono glyphs, Instrument Serif italic display, Space Grotesk interface; signpost words white, road edges ember.
- No audio. No prices or buy buttons for services (product pages keep their own pricing).
- No new runtime dependencies. No `@ts-ignore`, `@ts-expect-error`, `as any`, `eslint-disable`, `suppressHydrationWarning` or other suppression; `// @ts-check` in every file.
- Behind the switch only: `/` without `?world=1` (and its prebuilt HTML) is unchanged; the family road is W3's (door `b` keeps W1's behaviour).
- Tier budgets unchanged: 12,000 / 24,000 / 40,000 glyphs.
- Chris makes every commit; no branches. Stop after W2.6 for Chris.

## Review Focus

1. A visitor who jumps (a link, a flick, back/forward, a reload mid-road) lands on the right stop with the right landmark resolved or not, and no real screen left over from another stop.
2. Resizing or rotating the phone at a product stop keeps the real screen exactly over its sculpture.
3. Switching doors in the nav while on the business road: the journey rebuilds for the new door with no stale real screen, loop or cursor.
4. Reduced motion, no WebGL2, or a lost context with door `a` stored and the switch on: today's door A chapters, complete, with no canvas and no world screen left behind.
5. Only the loop at the current stop plays; loops for stops already passed or not reached are paused (battery and data on the phone).

Each line has its test in the task that owns the code (W2.2: 1; W2.5: 1, 2, 3, 4, 5).

## File Structure

- Create `src/world/roads.js`: the business road's stops from the site's data.
- Create `src/world/roadLayout.js`: where each landmark stands and the road's extended path.
- Modify `src/world/landmark.js`: `landmarkRect` for any landmark (centre, facing, size); the lab's `LANDMARK` stays.
- Modify `src/world/journey.js`: `buildJourney(door, roadStops)` with per-stop keys and stops; `handoverAt`, `typedAt`, `commitsAt`.
- Modify `src/world/shapes.js`: oriented sculptures and slabs, the unfinished slab with its cursor, commit marks; `buildRoadWorld`.
- Modify `src/world/worldRenderer.js`, `src/world/worldShaders.js`: one movable cursor glyph.
- Create `src/world/worldFrame.js`: the frame bus (canvas → journey).
- Modify `src/world/WorldCanvas.jsx`, `src/world/WorldLayer.jsx`: draw the road for the door taken; publish each frame.
- Create `src/scenes/RoadStop.jsx`: a road stop's words; `src/scenes/WorldScreen.jsx`: the real thing laid over the active landmark.
- Modify `src/scenes/WorldJourney.jsx`, `src/pages/Home.jsx`, `src/scenes/ProductChapter.jsx`, `src/scenes/ServiceChapters.jsx`, `src/components/HowIWork.jsx` (export their text parts only), `tools/budget/check.mjs`.
- Tests: `tests/worldRoads.test.js`, `tests/worldRoadLayout.test.js`, `tests/worldJourney.test.js`, `tests/worldShapes.test.js`, `tests/worldLandmark.test.js`, `tests/worldFrame.test.js`, `e2e/worldbusiness.spec.js`.

---

### Task W2.1: The business road's stops, from the site's data

**Files:** Create `src/world/roads.js`; Test `tests/worldRoads.test.js`.

**Interfaces:**
- Produces `/** @typedef {{ id: string, name: string, kind: 'product' | 'unfinished' | 'service' | 'audit' | 'commits', excerptId: string | null }} RoadStop */`.
- Produces `businessRoadStops({ includeDrafts = false } = {}): RoadStop[]`: products first in `products.js` order: a `live` product with `previewVideo`, `poster` and an approved excerpt (`PRODUCT_EXCERPTS`) is `product`; a product that is not live with an approved excerpt is `unfinished`; then `SERVICE_CHAPTERS` in order: a service with a `serviceScreens` entry and an approved excerpt is `service`, `technical-audits` with an approved excerpt is `audit`; last `{ id: 'how-i-work', name: 'How I work', kind: 'commits', excerptId: null }`. A product or service missing its excerpt or screen is left out, never drawn half-built. `name` is the product's or service's own name.

- [ ] **Step 1:** Tests: with today's data the ids are exactly `['my-teachers-toolbox', 'underfire-ai', 'founders-helm', 'crew-advisors', 'mvp-sprints', 'custom-saas-builds', 'ai-integration', 'technical-audits', 'how-i-work']` and the kinds `product ×3, unfinished, service ×3, audit, commits`; names match `products.js` / `services.js`; with a registry where `product-founders-helm` has `approved: null` Founders Helm is left out and the rest keep their order (pass the registry through an optional `registry` option, as `getExcerpt` takes one). Run `npx vitest run tests/worldRoads.test.js`: FAIL (module missing).
- [ ] **Step 2:** Implement. Run: PASS. `npm run verify`.

### Task W2.2: Landmarks along the road, and the camera through them

**Files:** Create `src/world/roadLayout.js`; Modify `src/world/landmark.js`, `src/world/journey.js`, `src/world/shapes.js` (export `SLAB_METRICS` only); Test `tests/worldRoadLayout.test.js`, `tests/worldLandmark.test.js`, `tests/worldJourney.test.js`.

**Interfaces:**
- Produces `/** @typedef {{ stopId: string, kind: RoadStop['kind'], center: Vec3, facing: Vec3, width: number, height: number }} Landmark */`. `facing` is the unit direction the landmark's face looks (back up the road, toward the arriving camera).
- Produces `roadSizes(stops: RoadStop[], sources: Record<string, string>): Record<string, { width: number, height: number }>`: products 6 × 3.75 (their 1280 × 800 loops); services 6 wide at their `serviceScreens` image's aspect; `audit` and `unfinished` the slab of their code (longest line × `SLAB_METRICS.charWidth`, lines × `SLAB_METRICS.lineHeight`; `SLAB_METRICS = { charWidth: 0.06, lineHeight: 0.145 }` exported from `shapes.js`, which `editorSlab` already uses as its defaults).
- Produces `layoutRoad(stops: RoadStop[], door: 'a' | 'b', sizes: Record<string, { width: number, height: number }>): { path: Point2[], landmarks: Landmark[], commits: Point2[] }`. The road continues from the branch's end, `(-6, -55)` for `a` (mirrored in x for `b`), straight on in the branch's last direction; landmark `k` stands `ROAD_STEP = 14` units on from the previous one (the first 7 units past the branch end), `LATERAL = 4.2` units to the side, sides alternating starting on the road's outer side; centre height 1.8; facing back along the road. The `commits` stop gets three points on the road's edge, 4 units apart, instead of a landmark.
- `landmarkRect(camera, viewport, landmark = LANDMARK)`: the box around the landmark's four corners using its `facing` (its right vector is `facing × up`). The lab's call is unchanged.
- `buildJourney(door, roadStops = [], sizes = {})`: unchanged output for `door = null`, and for a door with no road stops (W1 behaviour, so W1's tests stand and door `b` is untouched until W3). For each road stop after the branch, `STOP_SCREENS = 1.5` screens: an approach key at the stop's start (eye on the road's centre line 11 units before the landmark, looking at it), an arrive key at +0.5 (eye on the landmark's facing axis at `ARRIVE_DISTANCE = 1.25 × width`, fov 52, square on; the target 0.35 × height below the landmark's centre, so the landmark sits in the upper part of the screen and the stop's words have the lower part), a hold key at +1.0 (the same eye). The commits stop's keys run along the edge past its three points. Journey stops: one per road stop (`id`, `name`), after `business/` (which now spans the turn only). Returns also `landmarks: Array<Landmark & { from: number, to: number }>`.
- Produces `handoverAt(journey, progress): { stopId: string, amount: number } | null`: the one landmark handing over: 0→1 over the 0.15 screens before its arrive key, 1 through its hold, 1→0 over the 0.15 screens after; null elsewhere and for `unfinished` and `commits` stops. A pure function of progress.
- Produces `typedAt(journey, progress): number | null`: for the `unfinished` stop, the share of its code typed, 0.15 at its start to 0.65 at its end (`TYPED_FROM`/`TYPED_TO`, as `ProductChapter.jsx`); null elsewhere.
- Produces `commitsAt(journey, progress): number`: how many of the three commits the camera has passed (0..3).

- [ ] **Step 1:** Tests:
  - `layoutRoad`: consecutive landmarks ≥ 14 units apart; sides alternate; every landmark ≥ 3 units from the road's centre line; `b` mirrors `a` in x.
  - `landmarkRect` with a landmark facing straight back (+z) equals today's result for `LANDMARK`.
  - `buildJourney('a', businessRoadStops(), sizes)`: `screens` = 6.8 + 9 × 1.5 = 20.3; the stops are named, in order, the opening's, `The fork`, `business/`, then the nine road stops; every key's progress increases; continuity (no jump over 0.5 units per 0.001 progress) end to end.
  - `roadSizes` with today's data: the three products 6 × 3.75; MVP sprints 6 × (6 × 660 / 1416); the audit's and Crew Advisors' slabs from their code's lines.
  - At each landmark's arrive key, through `frameCamera`, its `landmarkRect` aspect is within 2 % of `width / height`, it is inside the screen at 1440 × 900 and at 393 × 852, and at 393 × 852 its bottom is above 55 % of the screen's height (the words' room).
  - `handoverAt` windows lie inside their own stop and never overlap; it is 1 at every product and service hold and null at Crew Advisors and How I work.
  - Jumping (calling with progress values out of order) gives the same answers as scrolling to them.
  - `typedAt` runs 0.15 to 0.65 across Crew Advisors only.
  - `commitsAt` counts 0, 1, 2, 3 as the commits are passed.
  - `buildJourney(null)` and `buildJourney('b')` deep-equal their W1 results.

  Run: FAIL.
- [ ] **Step 2:** Implement. Run: PASS. `npm run verify` (the W1 journey and lab tests are the contract and stay green).

### Task W2.3: The business road's shapes, and the cursor

**Files:** Modify `src/world/shapes.js`, `src/world/worldRenderer.js`, `src/world/worldShaders.js`; Test `tests/worldShapes.test.js`.

**Interfaces:**
- `screenSculpture(code, { width, height, center, count, facing = [0, 0, 1] }, seed)` and `editorSlab(code, seed, { center, facing = [0, 0, 1], … })` lay out in the landmark's own plane. The default (`[0, 0, 1]`) leaves today's shapes unchanged, byte for byte.
- Produces `unfinishedSlab(code, { center, facing }, seed): Shape & { cursor: number }`: the slab with one extra glyph `▌` (ember) at its end; `cursor` is that glyph's index inside the shape.
- Produces `slabCaret(code, typed: number, { center, facing }): Vec3`: where the cursor stands after `typed` characters (next to the last typed one, on its line).
- Produces `commitMarks(code, points: Point2[], seed): Shape`: a tight ember cluster of the road's own characters at each commit point.
- Produces `buildRoadWorld(tier, sources, seed, road): Array<{ name: string, shape: Shape, stopId?: string, cursor?: number }>`: W1's world (`buildWorld` parts) without the prototype's `landmark`, plus the road's extension (scatter and ember edges along `road.path`), one part per landmark (`product`, `service`: `screenSculpture` of its excerpt; `audit`: `editorSlab`; `unfinished`: `unfinishedSlab`) and `commitMarks`. `sources` maps each excerpt id used to its code. Within the tier's budget: editor, signs, edges, slabs and marks are exact; the rest goes 45 % to the road's scatter and 55 % shared equally among the screen landmarks. `buildWorld` stays as it is, for the lab.
- Renderer: `render(camera, time, fade?, cursor?)`; `cursor: { index: number, position: Vec3, visible: boolean }`. In the shader, the glyph at `uCursorIndex` (−1: none) takes `uCursorPosition` and its alpha is multiplied by `uCursorOn`.

- [ ] **Step 1:** Tests:
  - With `facing = [0, 0, 1]` both shapes equal today's output.
  - With `facing = [1, 0, 0]`, every glyph lies in the plane through the centre perpendicular to `facing` (within 0.21, the sculpture's depth jitter).
  - `slabCaret` after 0 characters is the first character's position, and after the full code it sits right of the last character.
  - `buildRoadWorld` for every tier: total glyphs ≤ budget; every glyph's character is in its source (the cursor is `▌`); each screen landmark gets ≥ 400 glyphs on `low`; a part per road stop with its `stopId`.

  Run: FAIL.
- [ ] **Step 2:** Implement; the renderer change is exercised by W2.4's e2e. Run: PASS. `npm run verify`.

### Task W2.4: The canvas draws the road taken, and says where the landmark is

**Files:** Create `src/world/worldFrame.js`; Modify `src/world/WorldCanvas.jsx`, `src/world/WorldLayer.jsx`; Test `tests/worldFrame.test.js`, `e2e/worldbusiness.spec.js`.

**Interfaces:**
- Produces `worldFrame`: `{ publish(frame), subscribe(listener): () => void, latest(): WorldFrame | null }` with `/** @typedef {{ progress: number, handover: { stopId: string, amount: number, rect: { left: number, top: number, width: number, height: number, visible: boolean } } | null, typed: number | null, commits: number }} WorldFrame */`. A publish with no listeners is free; `latest()` lets a host that mounts mid-journey place its screen at once.
- `WorldCanvas` gains `road?: { door: 'a' | 'b', journey: ReturnType<typeof buildJourney>, sources: Record<string, string> }`. With a road it builds `buildRoadWorld` (the atlas from the opening's sources, every road source and `▌`) and calls `renderer.setShapes` again when the door changes (same context). Each frame it:
  - fades the handing-over landmark's range by `1 − amount`;
  - for Crew Advisors, hides its untyped tail (the fade range from `typed × length` to the end, amount 0) and moves the cursor there, blinking at 530 ms;
  - publishes the frame.

  It sets `data-road`, `data-handover-stop`, `data-handover` (2 decimals) and `data-typed` on the canvas. Without `road` (the lab) everything is as today.
- `WorldLayer` passes `road` built from `useDoor()` (door `a` only in W2), `businessRoadStops()` and the approved excerpts' code.

- [ ] **Step 1:** Tests:
  - Unit `worldFrame`: subscribe, then publish, delivers; unsubscribe stops it; `latest()` holds the last frame.
  - e2e `worldbusiness.spec.js` (`/?world=1`, door `a` taken):
    - `data-road="a"`.
    - At each product and service hold, `data-handover-stop` is that stop and `data-handover` is `1.00`.
    - At Crew Advisors, `data-typed` rises with the scroll and stays ≤ 0.65, and `data-handover-stop` is absent.
    - Switching the nav to family mid-road sets `data-road` away from `a` and clears the handover (Review Focus 3).
    - The lab's e2e tests are unchanged and green.

  Run: FAIL.
- [ ] **Step 2:** Implement. Run: PASS. `npm run verify`, `npm run test:e2e`.

### Task W2.5: Each stop's words, and the real thing over its landmark

**Files:** Create `src/scenes/RoadStop.jsx`, `src/scenes/WorldScreen.jsx`; Modify `src/scenes/WorldJourney.jsx`, `src/pages/Home.jsx`, `src/scenes/ProductChapter.jsx` (export `ProductText`, `loopOf`), `src/scenes/ServiceChapters.jsx` (export `ServiceText`), `src/components/HowIWork.jsx` (export its `Entry` as `CommitEntry`), `tools/budget/check.mjs`; Test `e2e/worldbusiness.spec.js`.

**Interfaces:**
- `<RoadStop stop={RoadStop} commits={number} />`: the stop's words in the journey's word panel. These are today's chapter text parts, unchanged and in full, as the spec names them (a product's name, tagline, status and stats; a service's name, summary, scope and timeline):
  - product: `ProductText` with `countT = 1`;
  - unfinished: `ProductText`, which already says "Coming soon";
  - service and audit: `ServiceText`;
  - commits: the three `CommitEntry`s, each "✓ shipped" once `commits` has passed it.
  - Heading levels as today (`h2`).
- `<WorldScreen />`: one element, fixed, subscribed to `worldFrame`, placed each frame at `handover.rect` by writing its style (no React render per frame), at opacity `amount`, hidden when there is no handover or the rect is not visible.
  - Product: `MediaLoop` with `active` only at amount 1, wrapped in a link to `/products/<slug>` with today's hover and focus ring.
  - Service: its `serviceScreens` image, with alt.
  - Audit: `EditorPanel` of `service-audit` with every line checked.
  - Marked `data-world-screen={stopId}`. It also renders when it mounts mid-journey from `worldFrame.latest()`.
- `WorldJourney`: lazy-loaded (`React.lazy`, its own chunk). Its Suspense fallback is today's gate and fork markup, the same content the prebuilt HTML painted, so nothing blanks. It renders `RoadStop`s for the road stops and `WorldScreen` once.
- `Home`: in world mode with door `a`, the journey carries services, products and how I work, so `ServiceChapters`, `ProductChapters` and `HowIWork` are not rendered. `Builder`, `IdeaSketch` and `BriefChapter` follow the journey as today. Without the switch, or with reduced motion, no WebGL2 or a failed world, door A is today's page.
- Budget: a line for the `WorldJourney` chunk set from the build (measured plus 5 %). The `Home` line stays at 16 kB and must drop below 15 kB.

- [ ] **Step 1:** Tests (e2e `worldbusiness.spec.js`):
  - Scrolling the business road names every stop in order (the nine names) as the active stop.
  - At each product hold: `[data-world-screen="<slug>"]` is visible, its box within 3 % of the canvas's landmark rect (exposed as `data-handover-rect`), its video's `src` is that product's loop and it is playing; every other `video` on the page is paused (Review Focus 5); it links to the product page.
  - At each service hold the screen is that service's image; at technical audits it is the checked editor.
  - Crew Advisors never shows a world screen.
  - At How I work the three entries read "✓ shipped" one by one as the commits are passed.
  - Every stop's heading and words are in the DOM throughout (`getByRole('heading', { name })` for all nine).
  - In world mode with door `a`, no `[data-product]` flight chapter and no `[data-chapter="mvp-sprints"]` section is rendered, and the Builder follows the journey.
  - Jumping straight to the third product's hold (one `scrollTo`), then to MVP sprints, shows only that stop's screen (Review Focus 1).
  - Resizing 1440 × 900 → 393 × 852 at a product hold keeps the screen within 3 % of the rect (Review Focus 2).
  - Reduced motion with the switch and door `a`: today's door A chapters, no canvas, no world screen (Review Focus 4).
  - At 393 × 852, at every product and service hold, the world screen and the word panel do not overlap, and the word panel fits on screen.
  - axe: no violations at the fork, at a product hold and at How I work.

  Run: FAIL.
- [ ] **Step 2:** Implement. Run: PASS. `npm run verify`, `npm run test:e2e`. Screenshots at every stop, desktop 1440 × 900 and phone 393 × 852, sent to Chris.

### Task W2.6: Measure and stop

- [ ] **Step 1:** Lighthouse 12 on `/` (switch off) against W1.5's numbers, mobile with WebGL off and desktop as in Phase 9: no regression in LCP, CLS or TBT; accessibility and SEO 100. Chris pushes; on his iPhone and desktop he opens `/?world=1&meter=1`, takes `business/`, scrolls to How I work and back to the fork, twice, and reports the meter line. Bar (spec section 7): iPhone p95 ≤ 25 ms, desktop no regression from 10.0 / 10.6 ms.
- [ ] **Step 2:** Record the numbers and Chris's verdict in this plan's ledger and the blueprint. Stop: Chris reviews the business road; then the W3 plan (the family road).

## Execution ledger
- Task W2.1 (2026-11-12): `src/world/roads.js`: `businessRoadStops({ includeDrafts, registry })`: products first in `products.js` order (live with loop and poster: `product`; not live: `unfinished`), then `SERVICE_CHAPTERS` (with a `serviceScreens` entry: `service`; `technical-audits`: `audit`), then How I work (`commits`); a stop without an approved excerpt (or its screen or loop) is left out. Tests: `tests/worldRoads.test.js` (4), red first (module missing). `npm run verify` exit 0 (302/302).
- Task W2.1 Ruling: `roads.js` imports `PRODUCT_EXCERPTS` and `SERVICE_CHAPTERS` from the chapter modules rather than copying them, so the road and today's chapters can never disagree about which excerpt a product or service uses — cost if wrong: the chapter modules may share a chunk with the world (W2.5's budget run shows it).
- Task W2.2 (2026-11-12): `src/world/roadLayout.js` (`roadSizes`: products 6 × 3.75, services 6 wide at their screen's aspect, slabs from their code's lines with `SLAB_METRICS`; `layoutRoad`: the road straight on from the business branch's end, a landmark every 14 units starting 7 past it, 4.2 to the side on alternating sides from the outer (left), facing back up the road; How I work's three commits 4 apart on the road's edge; the family road mirrored in x), `landmark.js` (`landmarkRect(camera, viewport, landmark = LANDMARK)` across the face's own right-hand direction; the lab's box unchanged), `journey.js` (`buildJourney(door, roadStops, sizes)`: 1.5 screens per road stop; `handoverAt`, `typedAt`, `commitsAt`; `buildJourney(null)` and a door without road stops deep-equal W1). Tests: `tests/worldRoadLayout.test.js` (5), 8 more in `tests/worldJourney.test.js`, 2 in `tests/worldLandmark.test.js`, 3 in `tests/worldCamera.test.js`, red first (module missing; the box ignored facing; holds drifted).
- Task W2.2 Ruling: `camera.js` gains still keys (`still: true`, a zero tangent; the curve is cubic Hermite only where a still key is involved, uniform Catmull-Rom exactly as before everywhere else). Uniform Catmull-Rom between two identical keys still moves (pulled by the keys either side), so a landmark's real screen would slide off its sculpture during the hold; with still keys the camera eases in and rests exactly — cost if wrong: none for the lab and W1 (their keys carry no mark; their tests are unchanged and green).
- Task W2.2 Ruling: no approach key per stop (the plan had one at each stop's start): the camera goes straight from one landmark's hold to the next one's arrival, arriving at +0.6 screens (not +0.5) and resting to +1.0. With an approach key the leg from a hold to the next approach was too fast (about 34 units per screen of scroll against the continuity test's 24.6) — cost if wrong: the camera's path between landmarks crosses the road diagonally rather than following its centre line.
- Task W2.2 Ruling: landmarks stand higher instead of the camera looking down: a landmark's centre is at eye height (1.6) + 0.35 × its height, and the camera rests level, square on, so it sits in the upper part of the screen with room for the words below. Looking 0.35 × height below the centre from a level eye (the plan's wording) put the eye 0.49 above the road — cost if wrong: landmarks float a little higher above the road than the prototype's.
- Task W2.2 Ruling: How I work has four keys (quarter points and its end, the camera 8 before, 2 before, 2 past and 6 past the middle commit), one commit passed per quarter; with three, the leg from the audit's slab to the first was over the speed limit.
- Task W2.2 verification: `eslint --max-warnings 0`, `tsc` clean; `npm run verify` exit 0 (321/321); lab and world-home e2e 28/28 (the camera change).
- Task W2.3 (2026-11-12): `src/world/shapes.js`: `screenSculpture` and `editorSlab` take `facing` (turned about the landmark's vertical axis by `orient`; facing +z returns the shape untouched, so today's shapes are identical); `unfinishedSlab` (the slab plus one ember `▌`, `cursor` its index), `slabCaret` (where the cursor stands after n characters), `inkBefore` (glyphs drawn for the first n characters, for hiding the untyped tail), `commitMarks` (24 ember glyphs of the road's code within 0.35 of each commit), `buildRoadWorld` (the opening without the prototype's landmark, the road on past the branch with its edges, a part per stop with `stopId`, Crew Advisors' `cursor`, the commit marks; scatter 45 %: trunk 0.2, branches 0.08 / 0.07, onward 0.1; screens 55 % shared equally). Renderer: `render(camera, time, fade?, cursor?)` with `uCursorIndex` (−1: none), `uCursorPosition`, `uCursorOn`. Tests: 5 in `tests/worldShapes.test.js`, red first (4 failed; the "exactly today's" case passed already, a guard).
- Task W2.3 Ruling: `slabCaret` takes a count of the code's characters (as `EditorPanel` types it), not a share; the canvas converts the journey's share with `Math.round(share × length)` and uses `inkBefore` for the glyphs to hide — cost if wrong: none, one multiplication in W2.4.
- Task W2.3 verification: `eslint --max-warnings 0`, `tsc` clean; `npm run verify` exit 0 (326/326); lab and world-home e2e 28/28 (the shader change). Budget: `shapes.js` is now its own 3.25 kB chunk (the home's journey reaches it through `roadLayout.js`); `WorldCanvas` 3.69 kB; `Home` 15.49 of 16 — W2.5 moves the journey into its own chunk.
- Task W2.4 (2026-11-12): `src/world/worldFrame.js` (`createWorldFrame`, `worldFrame`: publish, subscribe, latest); `src/world/route.js` (`routeFor(door)`: the journey and, for door `a`, the road (stops, layout, approved code), built once per door; `roadGlyphs()`); `WorldCanvas` `route` prop: the road's world (`buildRoadWorld`) rebuilt in place when the door changes, the handing-over landmark faded, Crew Advisors' untyped code hidden and its `▌` at the caret blinking every 530 ms (before its stop it shows 0.15 typed, after it 0.65), `data-road`, `data-handover-stop`, `data-handover`, `data-handover-rect`, `data-typed`, and every frame published; without `route` (the lab) unchanged. `WorldLayer` and `WorldJourney` both take `routeFor(door)`. Tests: `tests/worldFrame.test.js` (6), `e2e/worldbusiness.spec.js` (3), red first (modules missing; no `data-road`).
- Task W2.4 Ruling: one shared `routeFor(door)` (new `src/world/route.js`): the page's height comes from the journey and the canvas reads progress against it, so both must use the same journey, road stops included — cost if wrong: none; one more module.
- Task W2.4 Ruling: a second range in the renderer, `hidden` (`render(camera, time, fade, cursor, hidden)`; `uHideFrom`/`uHideTo`): Crew Advisors' untyped code must stay hidden while it is in view from Founders Helm and MVP sprints, whose hand-overs use `fade` at the same time; the plan's single range could not do both — cost if wrong: two uniforms.
- Task W2.4 Ruling: each stop in `WorldJourney` carries `data-stop-id`, `data-from`, `data-to` and, for a landmark, `data-arrive` and `data-hold` (0..1), so the e2e tests scroll to a stop's real rest instead of hard-coded fractions. Two W1.4 tests scrolled to 0.6 of the journey for the fork (true at 6.8 screens, mid-road at 20.3); they now scroll to the fork's marked middle — test fix.
- Task W2.4 Ruling: `glideDownRoad` glides to the branch's own stop (`business-road` / `family-road`); it glided to the journey's last stop, which with road stops is How I work at the far end (caught reading the code back; the W1.4 tests stay green).
- Task W2.4 finding and fix: `tests/hydration.test.jsx` "a returning visitor with a door…" failed 2 runs in 12 (0 in 12 on Chris's committed W1 code, run side by side). Cause: `useField` passed the live state as React's server snapshot, so a component hydrating late (the gate, inside the lazily loaded home page) read the field's decided mode (`static` with no WebGL) against the prebuilt `pending`, a hydration mismatch. The race was there before W2; the road's modules made the home's chunk slower to load and widened it, and on a slow network it can hit visitors too. Fix: `useField`'s server snapshot is the bus's initial state (what every page is prebuilt with); React re-renders with the live state right after hydrating. Test: `tests/fieldBusHydration.test.jsx` RED (the mismatch every run) → GREEN; the hydration test 0 failures in 12 after.
- Task W2.4 observation (for Chris at W2.5): at Crew Advisors' rest the typed lines are the top of its 30-line slab, so they sit high on the screen, the first line just under the nav; centred and square on as designed.
- Task W2.4 verification: `eslint --max-warnings 0` on `src`, `tests`, `e2e` and `tsc` clean; `npm run verify` exit 0 (333/333); `npm run test:e2e` 187/187.
- Task W2.5 (2026-11-12): `src/scenes/RoadStop.jsx` (a stop's words: `ProductText` for products and Crew Advisors, `ServiceText` for services and the audit, in full; How I work's three `CommitEntry`s, each shipped once passed); `src/scenes/WorldScreen.jsx` (the real thing over the handing-over landmark, placed each frame from `worldFrame` by writing its style: a product's `MediaLoop`, active once fully resolved, inside a link to its page; a service's screen; the audit's file with every line checked; nothing while no landmark hands over); `WorldJourney` renders the road's stops and `WorldScreen`, and is lazy-loaded by `Home` (fallback: the opening the prebuilt page painted); in world mode with door `a`, `Home` leaves out `ServiceChapters`, `ProductChapters` and `HowIWork`. Exports only: `ProductText`, `loopOf`, `ServiceText`, `AuditPanel` (the audit chapter's panel, lifted out unchanged), `CommitEntry`. Tailwind screen `wide` (`min-aspect-ratio: 1/1`). Budget: `Home` 11.24 kB (was 15.49); new line "code world journey" 3.9 kB (3.72 measured). Tests: 11 in `e2e/worldbusiness.spec.js`, red first (no world screens, no road words).
- Task W2.5 Ruling: on a screen wider than tall the stop is laid out as today's chapters, words left and real thing right: rest keys carry `aside` (across: the landmark's right-hand direction at half its width; up: how far it stands above the eye) and `frameCamera` slides the camera sideways and up, eye and target together (square on, the box's shape exact), stepping back when the landmark would not fit right of 40 % of the screen. The plan placed the words bottom-left on every screen; on a desktop the full words (about 400 px) would have been under the real screen, and the phone's lift put the screens under the nav — cost if wrong: one camera framing rule (`asideFor`); phones unchanged.
- Task W2.5 Ruling: on a phone, a stop's words scale down (from bottom left, not below 0.6) when taller than the room under the real screen, as How I work's pinned chapter does: Custom SaaS Builds' full words were 411 px against 376 px of room, and the spec names every one of them — cost if wrong: smaller type on phones for the longest services.
- Task W2.5 Ruling: keyboard visitors reach links in stops not on screen (every stop's words stay in the page, W1.3's ruling); focus there glides the page to that stop, so focus is never on something unseen and Tab walks the road.
- Task W2.5 finding and fix: jumping from one product to the next left the second loop paused (React kept the first `MediaLoop` and changed its source; its in-view and active state were unchanged, so it never played) — `WorldScreen`'s element is keyed by stop; test "each product resolves into its real loop… playing alone" RED (second product paused) → GREEN.
- Task W2.5 Ruling: with the journey in its own chunk the canvas can be ready before the journey's section exists; both world specs' `scrollJourney` wait for the section — test fix. Three W1.4 tests expected door A's chapter after taking business/; in the world the road carries it now, so they expect the road's first stop — test update for W2.5's own change.
- Task W2.5 verification: `npm run verify` exit 0 (334/334; budget all ok); `npm run test:e2e` 199/199. Screenshots at every road stop, desktop 1440 × 900 and phone 393 × 852, sent to Chris.
- Task W2.6 Step 1, Lighthouse 12.8.2 on `/` with the switch off (2026-11-12), same setup as W1.5 and Phase 9 Task 9.3b. Mobile (WebGL off, three runs): performance 85 / 86 / 87, FCP and LCP 2.2 s, TBT 80 to 160 ms, CLS 0.199 every run. Desktop (two runs): 100 / 100, FCP and LCP 0.5 s, CLS 0, TBT 20 ms. Accessibility and SEO 100. Against Phase 9 (9.3b: mobile 86, LCP 2.21 s, CLS 0.199 "the known no-WebGL gate switch"): no regression. Against W1.5 (CLS 0 / 0.199 / 0): the two zeros were the hydration race W2.4 fixed — when the field decided first, the gate's switch to its static layout was folded into a hydration mismatch; it now hydrates as prebuilt, then switches, every time, as Phase 9 measured. The shift itself is the carried limitation in the blueprint ("no-WebGL visitors see one layout shift on the gate"); W6's gates include it.
- Task W2.6 Step 1, Chris's measurements: waiting (push, then `/?world=1&meter=1` on the iPhone and desktop: take `business/`, scroll to How I work and back to the fork, twice; report the meter line). Bar: iPhone p95 ≤ 25 ms; desktop no regression from 10.0 / 10.6 ms.
