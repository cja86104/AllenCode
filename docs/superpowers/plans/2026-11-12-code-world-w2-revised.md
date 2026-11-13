# Code World W2 (revised) Implementation Plan: today's chapters, inside the world

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Behind `/?world=1`, the home page plays exactly as it does today (the gate's empty file typing and flying into the headline, then every door A chapter with its box, typing, counts and flight) while the world is the place it happens: the camera enters the world after the gate, travels the business road, and rests at each chapter's landmark while that chapter's code flies, in 3D, into the landmark and becomes its picture.

**Architecture:** Today's chapter components run unchanged over the world. The world's canvas serves the field's transformation contract (`fieldBus`), so chapters drive their flights exactly as today, and draws each flight in 3D onto the resting landmark's plane. The camera follows the page through a track measured from the DOM: the gate, the world opening, then for each road stop a stretch of road (travel) and the chapter's pinned span (rest, framed so the landmark lands exactly on the chapter's screen box).

**Tech Stack:** Vite 5, React 18, React Router 6.30, Tailwind 3, hand-written WebGL2 (`src/world/`), GSAP + Lenis, Vitest 3, Playwright 1.65.

**Spec:** `docs/superpowers/specs/2026-11-12-code-world-chapters-design.md` (approved by Chris 2026-11-12: "continue with plan"), amending `docs/superpowers/specs/2026-11-10-code-world-design.md`. Supersedes W2.5 and W2.6 of `docs/superpowers/plans/2026-11-12-code-world-w2.md`; W2.1 to W2.4 there stand (their ledger is the record).

## Global Constraints

- Every today's animation stays: the gate (box, typing, flight into the headline, "Scroll to enter"), each product and service chapter (box, typing, counting stats, flight, hand-off to the loop or screen), Crew Advisors (box typing unfinished, cursor), the audit (lines checked one by one), How I work (changelog). Their components' behaviour is not changed; only attributes for measuring may be added.
- A landmark never appears as a finished picture without its code flying into it.
- One WebGL renderer at a time: in world mode the world serves the flights; `FieldLayer` does not run.
- The camera never jumps: no step of the eye larger than the road's speed limit, no sideways reversal mid-turn (Chris saw one at the fork in W2).
- Real code only: every glyph from an approved excerpt (the signposts' words and the cursor `▌` excepted, as before).
- Palette locked: `#f97316` on `#0a0a0a`. No new runtime dependencies. `// @ts-check`; no `@ts-ignore`, `as any`, `eslint-disable` or other suppression.
- Behind the switch only: without `?world=1`, with reduced motion, no WebGL2 or a failed world, `/` is today's page. Door B in world mode as W1 left it.
- Tier glyph budgets unchanged (12,000 / 24,000 / 40,000); a flight uses the field's transformation budgets (`TRANSFORM_BUDGETS`: low 1,200, medium 2,500, high 4,000), world tier `low`/`mid`/`high` → `low`/`medium`/`high`.
- Chris makes every commit; no branches. Stop after R6 for Chris.

## Review Focus

1. Rotating or resizing the phone mid-chapter: the rest pose, the flight's plane and the hand-off box are recomputed, and the real screen still lands on its landmark.
2. Arriving mid-road (reload, back/forward, a fast flick): every landmark already passed shows its picture, the current chapter's flight is where its scroll says, nothing ahead has landed.
3. Switching doors in the nav mid-road: the business chapters leave, the flight is released, the camera goes to door B's W1 journey without a jump.
4. Reduced motion, no WebGL2, or a lost context with the switch on: today's page, `FieldLayer` running, no world canvas.
5. Phone performance: the world's glyphs plus a flight stay inside the tier's budgets; the iPhone p95 bar holds.

Tests: 1 → R3 and R4; 2 → R4; 3 → R4; 4 → R4; 5 → R3 (budget) and R6 (Chris's meter).

## File Structure

- Create `src/world/restPose.js`: the camera that puts a landmark exactly on a screen box.
- Create `src/world/worldTrack.js`: the page's camera track from measured sections.
- Create `src/world/worldFlight.js`: a resolved transformation placed on a plane in the world; and `landedShape`, a landmark's picture in characters.
- Create `src/field/loadTarget.js`: `FieldStage`'s target loader, moved so the world shares it.
- Create `src/scenes/WorldRoadChapters.jsx`: door A's chapters in road order, each after a stretch of road.
- Modify `src/world/camera.js`, `journey.js` (remove `aside`), `shapes.js` (road edges, spurs, stands), `roadLayout.js` (road runs on), `worldRenderer.js`, `worldShaders.js` (fade ranges, flight program), `WorldCanvas.jsx`, `WorldLayer.jsx`, `src/scenes/WorldJourney.jsx` (opening only), `src/pages/Home.jsx`, `src/scenes/ProductChapter.jsx`, `src/scenes/ServiceChapters.jsx` (export one chapter; `data-world-target` markers), `src/field/FieldStage.jsx` (imports `loadTarget`), `tailwind.config.js` (drop `wide`), `tools/budget/check.mjs`.
- Delete `src/scenes/RoadStop.jsx`, `src/scenes/WorldScreen.jsx` and their tests (W2.5's).
- Tests: `tests/worldRestPose.test.js`, `tests/worldTrack.test.js`, `tests/worldFlight.test.js`, `tests/worldShapes.test.js`, `tests/worldRoadLayout.test.js`, `tests/worldJourney.test.js`, `tests/worldCamera.test.js`, `e2e/worldbusiness.spec.js` (rewritten), `e2e/worldhome.spec.js`.

---

### Task R1: Rest poses, and the camera without `aside`

**Files:** Create `src/world/restPose.js`; Modify `src/world/camera.js`, `src/world/journey.js`; Test `tests/worldRestPose.test.js`, `tests/worldCamera.test.js`, `tests/worldJourney.test.js`.

**Interfaces:**
- Produces `restPose(landmark: { center: Vec3, facing: Vec3, width: number }, box: { x: number, y: number, w: number, h: number }, viewport: { width: number, height: number }, fov = 52): { eye: Vec3, target: Vec3, fov: number }`. Square on (the view direction is `-facing`, level); distance `d = f × width / box.w` with `f = (viewport.height / 2) / tan(fov / 2)`; eye and target slid together along the landmark's right-hand direction (`[facing.z, 0, -facing.x]`) by `-(box.x + box.w/2 - viewport.width/2) × width / box.w` and up by `(box.y + box.h/2 - viewport.height/2) × width / box.w`.
- Produces `restPoseForward(eye: Vec3, target: Vec3, fov = 52)`, a fixed pose (How I work's), unchanged by the viewport.
- `frameCamera`, `cameraAt` and `buildJourney` lose `aside` (W2.5) and are as at W2.4.

- [ ] **Step 1:** Tests:
  - For 1440×900 and 393×852, with today's `flightGeometry(code, screen, w, h).targetBox` for UnderFire AI's loop and MVP Sprints' screen, `landmarkRect(restPose(...), viewport, landmark)` is within 1 px of the box on every side.
  - For a landmark facing `[1, 0, 0]` the same holds.
  - `restPose(...).eye` minus `target` is parallel to `facing`.
  - `cameraAt` results have no `aside`; `frameCamera` at aspect ≥ 1 returns its input unchanged; `buildJourney('a', …)` keys carry no `aside`.

  Run `npx vitest run tests/worldRestPose.test.js tests/worldCamera.test.js tests/worldJourney.test.js`: FAIL (module missing; `aside` present).
- [ ] **Step 2:** Implement. Delete W2.5's wide-screen journey test. Run: PASS. `npm run verify`.

### Task R2: The page's camera track

**Files:** Create `src/world/worldTrack.js`; Test `tests/worldTrack.test.js`.

**Interfaces:**
- Consumes `restPose`, `cameraAt`, `frameCamera`, `routeFor(door)`, the road layout.
- Produces `/** @typedef {{ kind: 'gate' | 'opening' | 'travel' | 'rest' | 'after', from: number, to: number, stopId?: string, box?: Box }} TrackSection */`: page positions in scroll pixels (`from`/`to`: the scroll at which the section's camera span begins and ends; a `rest` spans its chapter's pinned frame, with `box` its screen box measured from `[data-world-target]` while pinned).
- Produces `buildTrack(route: Route, sections: TrackSection[], viewport: { width: number, height: number }): { keys: CameraKey[], progressAt(scrollY: number): number, sectionAt(scrollY: number): TrackSection | null }`. Keys over one 0..1 track: `gate` holds the journey's first key still; `opening` runs W1's keys from "Into the code" to the branch's end (the fork, and with a door the turn); each `travel` gets one key on the road's centre line midway between its neighbours' eyes; each `rest` two still keys at its section's ends with `restPose(landmark, box, viewport)` (How I work: W2's commit view); `after` holds the last pose still. `progressAt` maps scroll to the track piecewise-linearly through the sections.
- Produces `measureSections(root: Document): TrackSection[]`: from `[data-world-segment]` elements (`data-world-segment` = kind, `data-world-stop` = stop id), their tops and heights, and each chapter's pinned span `[top, top + height - innerHeight]`.

- [ ] **Step 1:** Tests, on synthetic sections for 1440×900 and 393×852 (gate 0–1620, opening, then for each of the nine stops a travel of 720 then a rest of 1080, then after):
  - `progressAt` is monotonic and continuous; each `rest`'s span maps to a still camera equal to its `restPose`.
  - The fork glitch: through the opening's turn onto business/, the eye's x never increases (desktop and phone).
  - No jump: walking scroll 0 → end in 4 px steps, no step moves the eye more than 0.15 units.
  - Between two rests the eye stays at least 2 units from every landmark centre (never through a landmark).
  - `sectionAt` returns the rest for a scroll inside a chapter's pinned span.

  Run: FAIL (module missing).
- [ ] **Step 2:** Implement. Run: PASS. `npm run verify`.

### Task R3: The flight, in the world

**Files:** Create `src/world/worldFlight.js`, `src/field/loadTarget.js`; Modify `src/field/FieldStage.jsx`, `src/world/worldRenderer.js`, `src/world/worldShaders.js`; Test `tests/worldFlight.test.js`.

**Interfaces:**
- `src/field/loadTarget.js` exports `loadTarget(spec)` (moved verbatim from `FieldStage.jsx`, which imports it).
- Produces `toWorldFlight(resolved: { transformation: Transformation, sizes: { from: number, to: number } }, { camera, viewport, plane: { point: Vec3, normal: Vec3 } }): WorldFlight` where `WorldFlight = { count, start: Float32Array /* xyz */, end: Float32Array /* xyz */, glyph, meta /* vec4 as the field's aMeta */, srcColor, dstColor, sizeFrom: number, sizeTo: number /* world units */, normal: Vec3 }`: each start/end pixel unprojected through `camera` onto `plane`; sizes are the CSS sizes times the plane's world-per-pixel.
- Produces `landedShape(image: { data, width, height }, landmark: Landmark, code: string, step: number): Shape`: the landmark's picture in characters, as a landed flight leaves it (the image sampled with `imageLayout`'s colour lift on the landmark's plane, the code's characters in reading order), for landmarks already passed.
- Renderer: `render(camera, time, { fades?: Array<{ start: number, count: number, amount: number }> /* at most 4 */, cursor?, flight?: { progress: number, fade: number } })` (the W2.4 `fade`/`hidden` pair become `fades`); `setFlight(flight: WorldFlight | null)`; a second program, `FLIGHT_VERTEX_SHADER`: the field's `TRANSFORM_VERTEX_SHADER` motion (same delay, easing, copies emerging, size and colour change) in world space, with the arc lifting characters along `normal` toward the camera by `0.35 × arc × landmark width` and swaying in the plane.

- [ ] **Step 1:** Tests:
  - A pixel unprojected by `toWorldFlight` and projected back through the same camera lands within 0.5 px (several pixels, square-on and turned planes).
  - `sizeFrom`/`sizeTo` project back to the CSS sizes within 2 %.
  - `landedShape` lies on the landmark's plane, inside its rect, uses only the code's characters, and its colours are the image's lifted to `IMAGE_COLOR_FLOOR`.
  - The flight's budget follows the world's tier (`low` → 1,200 …).

  Run: FAIL.
- [ ] **Step 2:** Implement; `FieldStage` behaviour unchanged (its e2e stays green). Run: PASS. `npm run verify`, `npm run test:e2e`.

### Task R4: The page in world mode

**Files:** Create `src/scenes/WorldRoadChapters.jsx`; Modify `src/world/WorldCanvas.jsx`, `src/world/WorldLayer.jsx`, `src/scenes/WorldJourney.jsx`, `src/pages/Home.jsx`, `src/scenes/ProductChapter.jsx`, `src/scenes/ServiceChapters.jsx`, `tailwind.config.js`, `tools/budget/check.mjs`; Delete `src/scenes/RoadStop.jsx`, `src/scenes/WorldScreen.jsx`; Test `e2e/worldbusiness.spec.js` (rewritten), `e2e/worldhome.spec.js`.

**Interfaces:**
- `ProductChapter.jsx` exports `ProductChapterFor({ product, includeDrafts })` (what `ProductChapters` renders for one product); `ServiceChapters.jsx` exports `ServiceChapterFor({ slug, excerptId, includeDrafts })`. The element each chapter hands off at (the loop's or screen's box; Crew Advisors' `EditorPanel`; the audit's panel) carries `data-world-target`. Nothing else in them changes.
- `<WorldRoadChapters stops={RoadStop[]} />`: for each stop, `<div data-world-segment="travel" data-world-stop={id} style={{ height: '80vh' }} />` then the stop's chapter (`ProductChapterFor` / `ServiceChapterFor` / `HowIWork`) inside `<div data-world-segment="rest" data-world-stop={id}>`.
- `Home` (world mode): `<Gate>` inside `data-world-segment="gate"`; `WorldJourney` (opening only: no "Empty file" stop, which the gate is; no road stops) as `data-world-segment="opening"`; door `a`: `WorldRoadChapters`; then Builder, idea, brief as today (`data-world-segment="after"`). Not world mode: today's page.
- `WorldLayer`: `fieldBus.set({ mode: 'webgl' })` once the world draws (not `'static'`); the canvas gets `measureSections(document)` on layout, resize and door change, and builds its camera from `buildTrack`.
- `WorldCanvas` with a route: serves `fieldBus.transform` (`loadTarget` → `resolveTransform` with the world atlas and tier budget → `toWorldFlight` on the plane of the landmark the key names, or of the world's editor for `gate:` keys, through the current rest camera) and draws it with `fieldBus.transformProgress` and the field's fade; hides the world's editor while the gate section is current; fades the current rest's landmark sculpture out over its first 15 % (the box is the code now); draws `landedShape` in place of the sculpture for every landmark whose rest ends above the current scroll. Marks: `data-section` (kind:stopId), `data-flight` (the claimed key), `data-flight-progress`, `data-rest-rect` (the current landmark's box), `data-landed` (comma-separated stop ids whose picture is drawn).
- `WorldLayer` also renders `<div data-world-scrim aria-hidden>`, fixed between the canvas and the page, shown while a `rest` section is current: on a screen at least as wide as tall a gradient from the left (`from-night/85 via-night/40 to-transparent` over the left 55 %); otherwise from the top (`from-night/85 to-transparent` over the top 45 %), so a chapter's words read over the world (the spec's call).

- [ ] **Step 1:** Tests (`e2e/worldbusiness.spec.js`, rewritten; helpers scroll to a section's marked positions):
  - The page starts with the gate's editor box typing; its flight is served by the world (`data-flight` begins `gate:`) and the headline appears; the world's editor is hidden until then.
  - After the gate, scrolling enters the world and reaches the fork; taking business/ lists the nine chapters in order (`[data-world-stop]`).
  - At each product and service chapter: the editor box types; mid-flight `data-flight` is that chapter's key and the DOM code is hidden (the chapter's own `mode === 'webgl'` path); after the hand-off the loop or screen is visible and its box is within 3 % of `data-rest-rect`.
  - Crew Advisors shows its editor box (file name, unfinished code, cursor) over its landmark, and no flight.
  - The audit checks its lines one by one; How I work's changelog types.
  - Passed landmarks show their picture: after UnderFire AI's chapter, the canvas reports UnderFire AI landed (`data-landed` lists it); before it, not.
  - Reload mid-road at Founders Helm's rest: My Teachers Toolbox and UnderFire AI are landed, Founders Helm's flight follows its scroll (Review Focus 2).
  - Rotate 1440×900 → 393×852 mid-chapter: the hand-off box and `data-rest-rect` agree within 3 % (Review Focus 1).
  - Switch to family in the nav mid-road: no business chapter, no `data-flight`, no jump (Review Focus 3).
  - Reduced motion with the switch: today's page, `FieldLayer`'s canvas, no world canvas (Review Focus 4).
  - The scrim is shown at a chapter's rest and hidden on the road between chapters.
  - axe: no violations at the gate, a product chapter and How I work.
  - `worldhome.spec.js`'s W1.4 tests updated for the gate before the opening.

  Run: FAIL.
- [ ] **Step 2:** Implement. Budget lines from the build (measured + 5 %), `Home` ≤ 16 kB. Run: PASS. `npm run verify`, `npm run test:e2e`.

### Task R5: The road's edges, side paths, and a stand under each landmark

**Files:** Modify `src/world/roadLayout.js`, `src/world/shapes.js`; Test `tests/worldRoadLayout.test.js`, `tests/worldShapes.test.js`.

**Interfaces:**
- `layoutRoad`'s path runs `RUN_ON = 120` units past the last stop; the fog hides its end.
- `roadEdges(code, { path, width, spacing, highlights?: Point2[] })`: edge characters within 0.8 of a highlight point are ember at full alpha and 1.6 × size; `buildRoadWorld` passes How I work's commit points as highlights; `commitMarks` is removed.
- The onward edges start one `spacing` past the branch's end.
- Produces `spurPaths(layout): Array<{ stopId: string, path: Point2[] }>` in `roadLayout.js`: for each landmark, a straight spur from the road's centre line at the landmark's place along the road, sideways (left or right, the landmark's side) to the landmark's foot (its centre on the ground, stopping 0.6 short of its face). `buildRoadWorld` draws each spur as road: `codeRoad` scatter (width 1.6, its share of the scatter budget by length) and `roadEdges` (width 1.6), the edges starting at the main road's edge so the join has no gap and no edge crosses the main road. How I work has no spur.
- Produces `landmarkStand(roadCode: string, landmark: Landmark, seed: number): Shape & { flow: Float32Array }` in `shapes.js`: two posts of ember characters (one every `SLAB_METRICS.lineHeight`), vertical, at ±0.35 across the landmark's face from its centre, from the ground (y = 0) to the landmark's bottom edge; between them three monospace columns (0.12 apart, centred) of pale characters, each glyph with `flow` = the column's height (posts: `flow` 0). All of it is the road's code (`ambient`), separate from the landmark's own code that flies into the picture (Chris: "something separate"); a flight never touches it. `buildRoadWorld` adds a stand per landmark (Crew Advisors' and the audit's too).
- Shapes may carry `flow` (one float per glyph, 0 = still); the renderer packs it as an attribute, and the shader lifts a flowing glyph by `fract(time × 0.00035 / flow + seed) × flow` from its base, wrapping, with alpha faded over the bottom and top 15 % of the column.

- [ ] **Step 1:** Tests:
  - The road runs ≥ 100 units past How I work.
  - Every edge glyph lies within 0.05 of its edge line, commits included.
  - Each commit's stretch has ≥ 4 highlighted glyphs.
  - Near the branch's join, no two glyphs on the same edge are closer than half a spacing, and none is missing (gap ≤ 1.5 spacings).
  - `spurPaths`: one per landmark (eight, none for How I work), each perpendicular to the road, on its landmark's side, from the road's centre line to within 0.6 to 1.0 of the landmark's foot.
  - The spur edges' first glyphs sit on the main road's edge line (within one spacing), and none lies inside the main road.
  - Every tier stays within budget with the spurs and stands.
  - `landmarkStand`: two posts, every post glyph within 0.02 of its post's vertical line, 0.7 apart, centred under the landmark, from y ≤ 0.05 to within one line height of the landmark's bottom edge, ember; the columns' glyphs between the posts, on three columns 0.12 apart, from the road's code (none outside it), each with `flow` equal to the column's height; posts' `flow` 0; the stand is its own part, outside every landmark's flight and fade range.

  Run: FAIL.
- [ ] **Step 2:** Implement. Run: PASS. `npm run verify`. Screenshots of the road's end from How I work, of two spurs from the road, and of a stand under a landmark (code mid-flow), desktop and phone.

### Task R6: Measure and stop

- [ ] **Step 1:** `npm run verify`, `npm run test:e2e` green. Lighthouse 12 on `/` (switch off) as at W2.6: no regression. Screenshots, desktop and phone: the gate typing, mid-flight into the headline, entering the world, the fork, and for each chapter the box typing, mid-flight, landed and handed off; sent to Chris.
- [ ] **Step 2:** Ledger and blueprint. Stop: Chris pushes and measures `/?world=1&meter=1` (gate to How I work and back, twice; iPhone p95 ≤ 25 ms, desktop no regression from 10.0 / 10.6 ms) and reviews. Then the W3 plan.

## Execution ledger
- Task R1 (2026-11-12): `src/world/restPose.js` (`restPose(landmark, box, viewport, fov = 52)`: square on, distance from the box's width, slid so the landmark lands on the box); W2.5's `aside` removed from `camera.js` (`frameCamera` at aspect ≥ 1 returns its input, `cameraAt` adds nothing) and `journey.js`. Tests: `tests/worldRestPose.test.js` (3), one in `tests/worldCamera.test.js`, one in `tests/worldJourney.test.js` (W2.5's wide-screen test removed), red first (module missing; `aside` present). `npm run verify` exit 0 (338/338).
- Task R1 Ruling: the plan's `restPoseForward` is not built: How I work's pose is W2's commit view, already a still key the track reuses (R2); a function for it would decide nothing — cost if wrong: none.
- Task R2 (2026-11-12): `src/world/worldTrack.js` (`buildTrack(route, sections, viewport)` → `{ keys, progressAt, cameraAt, sectionAt }`: keys at the page's scroll positions: the gate holds the empty file, the opening runs W1's journey, each `rest` holds `restPose` on its box (How I work: down the road past its commits), one key on the road's centre line midway between rests; `TrackSection` kinds `gate`, `opening`, `rest`). Tests: `tests/worldTrack.test.js` (7 × desktop and phone), red first (module missing).
- Task R2 Ruling: the track has no `travel` or `after` sections: any scroll between two measured sections is road (exactly where one chapter slides out and the next slides in: 80vh of road plus the next chapter's 100vh), and past the last section the camera holds — cost if wrong: none; fewer markers on the page.
- Task R2 Ruling: `measureSections` moves to R4, where the page's markers are placed; R2 is the pure track.
- Task R2 finding and fix: the turn test found a sway on phones (and in W1): framing for a narrow screen stepped the camera back along its line of sight, which swings left in the turn, so the eye moved about 0.5 right, then left. The opening is now framed stepping back straight up the road (+z), the same view without the sideways sway; the turn test is monotonic on both screens. Also `between` returns a still key's value exactly between two equal still keys (the gate's hold was off by rounding).
- Task R2 verification: `eslint`, `tsc` clean; `npm run verify` exit 0 (352/352).
- Task R3 (2026-11-12): `src/world/worldFlight.js` (`toWorldFlight`: a resolved transformation's pixels unprojected onto a plane through the camera, sizes in world units, the plane's normal toward the camera and its right/up per CSS pixel; `landedShape`: a landmark's picture in the code's characters, the image sampled with `imageLayout`'s lift; `flightBudgetFor`: the field's `TRANSFORM_BUDGETS` by world tier); `src/field/loadTarget.js` (moved from `FieldStage.jsx`, unchanged); renderer: `render(camera, time, { fades, cursor, flight })` with up to four fade ranges (`MAX_FADES`; W2.4's single fade and hidden range folded in), `setFlight`, and `FLIGHT_VERTEX_SHADER` (the field's transformation motion in world space, arcing toward the camera by `FLIGHT_LIFT` = 2.1, i.e. 0.35 × a screen landmark's width). Tests: `tests/worldFlight.test.js` (6), red first (module missing); one test fix (the size check measured depth to the landmark's centre, not along the view).
- Task R3 verification: `npm run verify` exit 0 (358/358); `npm run test:e2e` 198/199 — the one failure is W2.5's "on a desktop the words stand left of the real screen", which tested the framing R1 removed; R4 rewrites that spec.
- Task R4 (2026-11-12): world mode is today's home page inside the world. `Home`: the gate (`data-world-segment="gate"`), the world opening (`WorldJourney`, now W1's journey only, `data-world-segment="opening"`, without the empty file's words, which the gate carries), then for door A `WorldRoadChapters` (today's chapters in road order, products first, each after 80vh of road, marked `rest`). `ProductChapterFor`/`ServiceChapterFor` exported (the chapters' own per-item choice, unchanged); `data-world-target` on each chapter's hand-off box (loop, screen, Crew Advisors' and the audit's panels). `measureSections` (worldTrack.js). `WorldLayer` sets the field's mode to `webgl`, measures the page (on mount, resize, size changes, new route) into `buildTrack`. `src/world/homeWorld.js`: the home's world each frame (road built with each screen landmark's picture as it is read; the claimed flight resolved with the field's `resolveTransform` and placed through the camera's rest; the world's editor hidden through the gate; the resting landmark's code faded under its box; Crew Advisors' tail and cursor; passed landmarks' pictures; marks `data-section`, `data-flight`, `data-flight-progress`, `data-rest-rect`, `data-landed`, `data-editor`, `data-progress`; the scrim). Renderer: a per-glyph `tag` (sculpture +k, picture −k) and `uPassed`; `buildRoadWorld(…, landed)` splits each screen landmark's share between sculpture and picture. Deleted: `RoadStop.jsx`, `WorldScreen.jsx`, `worldFrame.js` (its route tests kept in `tests/worldRoute.test.js`). Tests: `e2e/worldbusiness.spec.js` rewritten (13), 2 in `tests/worldShapes.test.js`, red first (no gate in world mode, no `data-world-stop`, no tags); `e2e/worldhome.spec.js` updated (the gate before the journey; the road's chapters under `data-world-stop`).
- Task R4 Ruling: the home's world is its own module (`homeWorld.js`) that `WorldCanvas` hands the frame to; the plan put it in `WorldCanvas` — it is a whole job (build, flights, fades, passed landmarks, marks), and the lab's path through `WorldCanvas` stays exactly as it was — cost if wrong: none; one more file.
- Task R4 Ruling: a passed landmark shows its picture by a per-glyph tag and one uniform, not by rebuilding the world as each chapter ends: a rebuild (all of a tier's glyphs) would hitch the phone once per chapter — cost if wrong: one float per glyph (the buffer's stride 9 → 10).
- Task R4 Ruling: each screen landmark's picture is read from its real screen (the loop's poster, the service's screen) at 320 px wide and built into the road as it arrives, rather than kept from the flight that landed: deterministic from the scroll position, so a visitor who arrives mid-road (reload, a stored door) sees every landmark behind already built — cost if wrong: seven small image reads per visit, cached.
- Task R4 Ruling: the tailwind `wide` screen stays (the plan said drop it): the scrim uses it (from the left on a screen at least as wide as tall, from the top otherwise) — cost if wrong: none.
- Task R4 Ruling: budget lines reset from the build, measured plus 5 %: "code world canvas" 7 → 7.6 kB (7.20 measured: the home's world and the flight); "code world journey" 3.9 → 2.3 kB (2.15 measured: its road stops are today's chapters now). `Home` 11.47 of 16 kB.
- Task R4 verification: `eslint`, `tsc` clean; `npm run verify` exit 0 (357/357, budget ok); `npm run test:e2e` 197/197. Seen in a browser: the gate's flight drawn by the world into the headline; UnderFire AI's code lifting off its editor and arcing out toward the camera, landing on its landmark, its loop taking over on it.
- Task R5 (2026-11-12): `roadLayout.js`: the road runs on `RUN_ON` = 60 past its last stop (was 14); `spurPaths(layout)` (a straight side path per landmark, square off the road on its side, from the centre line to 0.6 short of its foot; none for How I work), and `layoutRoad` returns them as `spurs`. `shapes.js`: `roadEdges` takes `from` (the onward edges carry on at the branch's spacing where its last characters left off), `highlights` (How I work's commits: ember, full alpha, 1.6 × size, through a per-glyph `sizes`) and `openings` (the main edge opens where a side path joins); `commitMarks` removed; `landmarkStand(roadCode, landmark, seed)` (two ember posts ±0.35 under the landmark, ground to its bottom edge, three pale columns 0.12 apart of the road's code flowing up between, `flow` = the column's height); `buildRoadWorld` adds `spur-road:id`, `spur-edges:id` and `stand:id` per landmark. Renderer: per-glyph size and `flow` (stride 10 → 11, attribute 5); the world shader lifts a flowing glyph by `fract(y / flow + time × 0.00035 / flow) × flow`, fading over the column's bottom and top 15 %. Tests: 2 in `tests/worldRoadLayout.test.js`, 8 in `tests/worldShapes.test.js` (W2.3's commit-marks test removed), red first (no `spurPaths`, no `landmarkStand`, no highlights, no openings, the edge doubled at the join, the road ending 14 past How I work); 1 in `tests/worldLandmark.test.js` (the packed size and flow), written after the stride change.
- Task R5 Ruling: `RUN_ON` is 60, not 120: the camera's last rest is How I work and the fog's far edge is 46 away, so 60 already ends out of sight; 120 halved the onward road's scatter density (3.4 glyphs a unit on phones) and cost ~340 more edge glyphs for nothing seen — cost if wrong: one constant (a later camera move past How I work would need it longer).
- Task R5 Ruling: the onward road's scatter share 0.10 → 0.15, the trunk's 0.20 → 0.15: the onward road is longer, and the trunk is still the densest stretch (36 vs 7 glyphs a unit on phones) — cost if wrong: two constants.
- Task R5 Ruling: the side paths share the onward road's scatter by area, not by length as planned: half as wide, by length they would be twice as dense as the road they leave — cost if wrong: none visible (a few glyphs each).
- Task R5 Ruling: a side path's scatter and edges start at the main road's edge, not its centre line (`spurPaths` still runs from the centre line, as the plan's test reads): scatter from the centre line would double the road's density at every join — cost if wrong: none.
- Task R5 Ruling: the main road's edge opens (`openings`, radius 0.8 + half a spacing) where a side path joins, so each join reads as a turning, not a line crossed — cost if wrong: one option on `roadEdges`.
- Task R5 Ruling: the onward edges start where the branch's spacing carries them (0 to one spacing past its end), not a full spacing past it: a full spacing left up to two spacings' gap at the join — cost if wrong: none.
- Task R5 Ruling: per-glyph `sizes` on a shape, for the lit commits, rather than a second shape: the edge stays one part — cost if wrong: one optional array.
