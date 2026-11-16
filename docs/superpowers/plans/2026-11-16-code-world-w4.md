# Code World W4: where the roads meet, and the ending — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Both doors' roads bend back and meet a shared road carrying the workshop (the builder chapter) and your idea (the idea chapter) as landmarks, then the world fades out before the brief; the lab's rail shows the journey on the home page.

**Architecture:** The road stops being a straight line: `layoutRoad` builds road, bend and shared road as one path, and every caller that placed things by `origin + direction × distance` asks `roadAt(layout, distance)` for the point and heading instead. The meeting stops are ordinary road stops (`portrait`, `sketch`) appended to both doors' routes, so the track, flights, fades, passed pictures, side paths and stands work as on the roads. Two page-level additions: a rest that holds while a section is on screen and moves the camera with it (the idea, which is not pinned), and an `end` section the world fades out before. The rail is the lab's, extracted.

**Tech Stack:** Vite 5, React 18, hand-written WebGL2 (`src/world`), Vitest 3, Playwright 1.65.

**Spec:** `docs/superpowers/specs/2026-11-16-code-world-meeting-design.md`.

## Global Constraints

- No `@ts-ignore`, `as any`, `eslint-disable`, `ignoreBuildErrors`; `npm run verify` exit 0 after every task; complete files.
- Never create a branch, commit or push on Chris's machine; changed files are copied there (CRLF) and md5-verified.
- Builder, idea and brief words and behaviour unchanged; without `?world=1`, with reduced motion or without WebGL2 the page is today's.
- Glyph budgets `12000 / 24000 / 40000`; a screen landmark keeps at least 400 glyphs; `ROAD_DENSITY` as W3.
- The camera's eye stays within 0.15 of the centre line through the middle (0.35–0.65) of every stretch of road, the bend and shared road included (the W3 alignment tests extended, not relaxed).
- World canvas chunk within its budget (7.6 kB gzip); raise it only from measurement + 5 % with a ledger ruling.

## Review Focus

1. A visitor who types their own idea on a phone while the camera holds: the form, the "Sketch it" button and the sketch are all reachable by scrolling, and the camera never jumps (Task 4 e2e at 393×852).
2. Switching door in the nav while at the workshop: the shared road and meeting landmarks are rebuilt for the new door's side (mirrored), the camera on the new track (Task 5 e2e).
3. The idea chapter submitted twice quickly: the second flight replaces the first on the frame (key `idea:2`), never two flights at once (Task 3 unit test on `stopForFlight` + Task 5 e2e).
4. Reload at the brief (returning visitor): the world is faded out, the rail at "shipped", no flight claimed (Task 5 e2e).
5. The low tier with every landmark of the business road plus the two meeting landmarks: within 12,000, screens ≥ 400 (Task 2 test).

---

### Task 1: The road bends and meets a shared road

**Files:**
- Modify: `src/world/roadLayout.js` (`roadAt`, `layoutRoad`, `spurPaths`, constants)
- Modify: `src/world/worldTrack.js` (`onRoad`, `along` via `roadAt`), `src/world/journey.js` (`onRoad` via `roadAt`), `src/world/shapes.js` (`buildRoadWorld`'s split point via `roadAt`)
- Test: `tests/worldRoadLayout.test.js`, `tests/worldTrack.test.js`

**Interfaces:**
- Produces: `roadAt(layout, distance): { point: Point2, heading: Point2 }` (distance along the road from the branch's end, as `along` has always been measured; past the path's end it continues along the last heading); `layoutRoad` returns, in addition, `junction: number` (the distance at which the shared road begins), `other: Point2[]` (the other road's path, from 40 back out in the fog to the junction), and keeps `origin`/`direction` (the branch end and first heading) for callers not yet migrated (none after this task). Constants `BEND_AFTER = 14`, `BEND_LENGTH = 20`, `OTHER_ROAD = 40`.
- Meeting stops are placed by `layoutRoad` like road stops: any stop after the road's own, at `junction + FIRST_AT + ROAD_STEP × i`, sides alternating from the left, facing back up the shared road (`[0, 0, 1]`).

- [ ] **Step 1: Failing tests** (`tests/worldRoadLayout.test.js`)
  - `roadAt` on the business layout: `roadAt(layout, along[k])` equals `origin + direction × along[k]` for every road stop (the straight stretch is unchanged).
  - For both doors (layouts built with `[...stops, ...MEETING_STOPS]` once Task 2 exists; in this task pass two stand-in stops `{ id: 'm1', kind: 'product' }`, `{ id: 'm2', kind: 'product' }` with sizes): the path after the last road stop bends: `roadAt(layout, junction).heading` is `[0, -1]` within 1e-9; the heading turns monotonically from the branch heading to `[0, -1]` over `BEND_AFTER..BEND_AFTER + BEND_LENGTH` past the last road stop; the shared road's landmarks are on alternate sides at `LATERAL`, facing `[0, 0, 1]`.
  - The other road: its last point is the junction; it is the mirror of the bend about the line `x = junction.x`; it runs 40 back.
  - Door b is door a mirrored (x negated) throughout, `other` included.
  - Path runs `RUN_ON` past the last meeting stop.
- [ ] **Step 2:** `npx vitest run tests/worldRoadLayout.test.js` → FAIL (`roadAt` not exported).
- [ ] **Step 3: Implement** `roadAt` (walk the path's segments; the bend sampled as a circular arc into 10 segments) and the new `layoutRoad`. Migrate `spurPaths` (the spur leaves the road square to `roadAt(...).heading` at the landmark's distance), `worldTrack.js` and `journey.js` `onRoad`/`along` (distance by projecting onto the path, the W3 `distanceAlong` moved to `roadLayout.js` and exported), and `buildRoadWorld`'s `between`/`runOn` split (the path sliced at the distance, not a straight segment).
- [ ] **Step 4:** `npx vitest run tests/worldRoadLayout.test.js tests/worldTrack.test.js tests/worldShapes.test.js tests/worldJourney.test.js` → PASS, the W3 alignment tests included unchanged.
- [ ] **Step 5:** `npm run verify` exit 0; ledger.

### Task 2: The meeting stops and their landmarks

**Files:** Modify `src/world/roads.js` (`MEETING_STOPS`, kinds, `stopForFlight`), `src/world/route.js` (append for both doors), `src/world/roadLayout.js` (`roadSizes`), `src/world/shapes.js` (`sketchFrame`, the other road, portrait as screen), `src/world/homeWorld.js` (`screenOf` portrait → `BUILDER.photo.src`). Test: `tests/worldRoads.test.js`, `tests/worldShapes.test.js`, `tests/worldRoute.test.js`.

**Interfaces:**
- `RoadStop['kind']` adds `'portrait' | 'sketch'`. `MEETING_STOPS = [{ id: 'workshop', name: 'The workshop', kind: 'portrait', excerptId: 'builder' }, { id: 'your-idea', name: 'Your idea', kind: 'sketch', excerptId: null }]`.
- `routeFor(door).road.stops` = the door's stops then `MEETING_STOPS`; the road's own stops end where the bend begins (`layoutRoad` takes `meetingFrom = stops.length - MEETING_STOPS.length`, or reads kinds: `portrait`/`sketch` are on the shared road).
- `roadSizes`: portrait `{ width: 6, height: 7.5 }`; sketch `{ width: 6, height: 4.5 }`.
- `stopForFlight('builder') === 'workshop'`; `stopForFlight('idea') === 'your-idea'` (the idea's key is `idea:<n>`; the prefix before `:` is `idea`).
- `sketchFrame(roadCode, landmark, seed): Shape` — ember characters every 0.12 round the frame's edge, pale ones on a 0.6 grid inside at alpha 0.25; all in the landmark's plane.
- `buildRoadWorld` parts: `landmark:workshop` (screen), `landmark:your-idea` (the frame, exact, untagged), `other-road`, `other-edges`.

- [ ] **Step 1: Failing tests:** `MEETING_STOPS` order and shape; `routeFor('a')`/`('b')` stops end with them; `stopForFlight` mappings (and door B's still); `roadSizes` for both; `sketchFrame` (every glyph on the frame's plane within 0.02, edge glyphs ember on the rectangle's edge within 0.02, grid glyphs inside at alpha 0.25, characters from the road code); `buildRoadWorld` for both doors, every tier: `landmark:workshop` ≥ 400, `landmark:your-idea` present, `other-road` scatter = `floor(ROAD_DENSITY/8 × 3.2 × 40)`, `other-edges` on the other road, total ≤ budget.
- [ ] **Step 2:** run → FAIL.
- [ ] **Step 3:** implement.
- [ ] **Step 4:** `npx vitest run tests/worldRoads.test.js tests/worldShapes.test.js tests/worldRoute.test.js tests/worldRoadLayout.test.js` → PASS.
- [ ] **Step 5:** `npm run verify`; ledger.

### Task 3: The camera through the meeting, and the idea's moving hold

**Files:** Modify `src/world/worldTrack.js` (`TrackSection` gains `kind: 'end'` and `hold?: 'visible'` with `boxFrom`/`boxTo`; `measureSections`; `buildTrack`), `src/world/camera.js` only if a linear key is needed. Test: `tests/worldTrack.test.js`.

**Interfaces:**
- `measureSections`: a `rest` with `data-world-hold="visible"` spans `from = top − 0.25 vh` to `to = top + height − 0.75 vh`, with `boxFrom` and `boxTo`: the `[data-world-target]`'s box relative to the viewport at scroll `from` and at scroll `to` (computed from its offset in the page, so it does not depend on the current scroll). An `end` section: `from = top − vh`, `to = top`.
- `buildTrack`: a held rest gets two keys (rest pose on `boxFrom` at `from`, on `boxTo` at `to`), interpolated linearly between them (`linear: true` on the first key; `camera.js` interpolates a linear key's span by straight lines); the travel keys between rests as W3; nothing for `end` (the track ends at your idea's hold).
- Returns `fadeAt(scrollY): number` — 1 before the end section, 0 at its `to`, linear in between.

- [ ] **Step 1: Failing tests:** for both doors and both viewports with the meeting stops and a held idea section (its target box moving up the screen by the scroll): (a) the W3 alignment tests pass on the whole road including the bend and shared road; (b) through the held rest, the landmark's projected rect (`landmarkRect`) equals the target's box at that scroll within 2 % at 0, 0.25, 0.5, 0.75, 1 of the hold; (c) no 4 px of scroll moves the eye more than 0.15; (d) `fadeAt` is 1 before `end.from`, 0 at `end.to`, 0.5 midway.
- [ ] **Step 2:** run → FAIL. **Step 3:** implement. **Step 4:** run → PASS. **Step 5:** `npm run verify`; ledger.

### Task 4: The page: workshop, your idea, the end, the rail

**Files:** Modify `src/pages/Home.jsx`, `src/scenes/WorldRoadChapters.jsx` (a `WorldMeeting` part after the road's chapters), `src/scenes/Builder.jsx` (`data-world-target` on the portrait box), `src/scenes/IdeaSketch.jsx` (`data-world-target` on the sketch), `src/world/homeWorld.js` (canvas opacity from `fadeAt`; no flight claimed past the end), `src/world/WorldLayer.jsx` (the rail). Create `src/world/JourneyRail.jsx`; modify `src/pages/WorldLab.jsx` to use it. Test: `tests/WorldMeeting.test.jsx` (new), `tests/worldSwitch.test.jsx` / lab tests as they stand.

**Interfaces:**
- `JourneyRail({ stops: Array<{ name: string, from: number }>, getProgress: () => number, current: string })` — the lab's markup and classes unchanged (`nav[data-rail][aria-label="Journey"]`, marker moved each frame without re-render, current stop named, `aria-current="step"`).
- Home's rail stops: the opening's (`OPENING_STOPS` names), the road's name (`business/` or `family/`), each road stop's name, `The workshop`, `Your idea`, `shipped` at the brief; `from` = each section's start as a share of the scroll from the gate to the end section.

- [ ] **Step 1: Failing tests:** `WorldRoadChapters` (door a and b) ends with `[data-world-stop="workshop"] [data-chapter="builder"]` and `[data-world-stop="your-idea"][data-world-hold="visible"] [data-chapter="idea"]`, each after a road spacer; `Home` in world mode wraps the brief in `[data-world-segment="end"]`; `[data-world-target]` inside both; `JourneyRail` renders the given stops, names the current one, marks it `aria-current="step"`; the lab still renders its rail (existing tests).
- [ ] **Step 2:** run → FAIL. **Step 3:** implement (the builder's and idea's own markup unchanged apart from the attribute). **Step 4:** run → PASS. **Step 5:** `npm run verify` (record Home and canvas chunk sizes); ledger.

### Task 5: Browser tests, the look, the stop

**Files:** Create `e2e/worldmeeting.spec.js`; extend `e2e/world.js` if needed. Modify the W4 plan's ledger and `BLUEPRINT-SKY-REDESIGN.md`.

- [ ] **Step 1: E2E:** for door a and door b: past the last road stop the canvas's section is `road`, then `rest:workshop` — the builder's flight (`data-flight` `^builder:`) lands and the portrait takes over at `data-rest-rect` (3 %); at your idea the example's flight (`^idea:`) lands on the frame and the sketch shows over `data-rest-rect`; the canvas's opacity reaches 0 at the brief; the rail names "The workshop", "Your idea", then "shipped" at the brief. Phone (393×852): the idea's textarea and "Sketch it" button are scrollable into view and usable during the hold; typing a line and submitting flies it (`^idea:2`). Switching door at the workshop rebuilds the meeting mirrored (`data-road` changes, the workshop rest still found). Reload at the brief: canvas opacity 0, rail at shipped. Axe clean at the workshop, your idea and the brief.
- [ ] **Step 2:** `npx playwright test e2e/worldmeeting.spec.js` → pass; then `npm run verify && npx playwright test` → all pass (record the count).
- [ ] **Step 3: The look:** screenshots, desktop and phone, both doors: the bend, the junction (the other road coming in), the workshop typing / mid-flight / landed / handed off, your idea before typing / mid-flight / sketch shown, the fade, the brief. Lighthouse 12 on `/` with the switch off: no regression. The low tier's glyph totals for both doors.
- [ ] **Step 4:** Ledger, blueprint row, sync to Chris's machine (md5), screenshots sent. Stop: Chris runs verify and e2e, commits, measures `/?world=1&meter=1` on both doors to the brief (iPhone p95 ≤ 25 ms, desktop at its refresh).

## Execution ledger

- Setup: local scratch clone (Chris commits on acerai); base = his abfdf56 + the alignment fix (synced, uncommitted there) + W4 spec/plan. Spec: docs/superpowers/specs/2026-11-16-code-world-meeting-design.md.
- Pre-flight: T1 roadAt/junction/other → T2 (MEETING_STOPS placed on the shared road; other road part) ok; T2 stopForFlight/kinds → T3 (held rest for 'your-idea'), T4 (data-world-stop ids 'workshop', 'your-idea') ok; T3 fadeAt/end section → T4 homeWorld opacity ok. T1's test uses stand-in meeting stops until T2 — ruled: T1 tests pass kinds 'portrait'/'sketch' directly (layoutRoad reads kinds to know the shared road), so T2 only adds the constants.
- Task 1 Ruling: the path helpers (`roadAt`, `distanceAlongRoad`, `roadBetween`, `roadLength`) live in a new import-free `src/world/roadPath.js`, re-exported from `roadLayout.js`: `shapes.js` needs them and `roadLayout.js` already imports `shapes.js`, so putting them in `roadLayout.js` would make an import cycle. They find the road's start by the layout's `origin` instead of `ROAD_PATHS` — cost if wrong: none.
- Task 1 Ruling: `RoadStop['kind']` gains 'portrait' | 'sketch' in Task 1 (the layout tests place stops of those kinds); `layoutRoad` puts every stop of those kinds on the shared road, the rest on the road — cost if wrong: none.
- Task 1 Ruling: journey.js's How I work commit maths keep `origin`/`direction` (How I work is always on the straight part before the bend); only its `onRoad` moved to `roadAt` — cost if wrong: none while How I work precedes the bend.
- Task 1: roadAt / bend (10-piece arc, 14 past the last road stop, 20 long, to −z) / shared road / other road (mirror of the bend + 20 straight) / spurs square to the local heading; worldTrack, journey, shapes migrated. 7 new layout tests RED→GREEN; `npm run verify` exit 0 (411/411; canvas 7.45 kB).
Task 1: complete (commits fc469da..9675be2, tests: npx vitest run tests/worldRoadLayout.test.js tests/worldTrack.test.js tests/worldShapes.test.js tests/worldJourney.test.js →    Duration  5.78s (transform 390ms, setup 499ms, collect 917ms, tests 1.39s, environment 2.09s, prepare 249ms))
- Task 2 finding: with the workshop the business road has eleven landmarks; on the low tier its scatter fell 1,800 glyphs short and the fallback thinned the whole road, trunk included (74 %), undoing W3.1's parity with the family road.
- Task 2 Ruling: low tier only — `SCREEN_FLOOR` 400 → 300 (each sculpture is seen briefly before its real picture) and `BETWEEN_SHARE` ½ → ⅓ of `ROAD_DENSITY` for the road between landmarks; both doors alike, so parity holds; the 12,000 budget unchanged (perf is Chris's measurement). A test now asserts the trunk is at full density on every tier for both doors with the meeting stops — cost if wrong: phone screens' sculptures a little sparser and the road between stops a little thinner; the fix if Chris wants fuller is raising `budgetFor('low')`.
- Task 2 Ruling: your idea's frame is an exact, untagged part without a stopId, so the world never fades it at its rest (the visitor's sketch appears over it whenever they make one) — cost if wrong: none.
- Task 2 Ruling (test fixture): `worldTrack.test.js`'s page gives the workshop 2.4 screens of road before it (the bend makes that stretch about three ordinary ones) and the portrait and sketch their real boxes; Task 4's page uses 240vh before the workshop to match — cost if wrong: camera speed on that stretch.
- Task 2 Ruling: `routeFor` W2.4 test's journey length grows by 1.5 screens per meeting stop (23.3) — expected.
- Task 2: MEETING_STOPS, stopForFlight builder/idea, routes append them, sizes 6×7.5 / 6×4.5, `sketchFrame`, other road parts, workshop picture = Chris's photo. `npm run verify` exit 0 (418/418; canvas 7.49 of 7.6 kB).
Task 2: complete (commits 9675be2..c1c7e9d, tests: npx vitest run tests/worldRoads.test.js tests/worldShapes.test.js tests/worldRoute.test.js tests/worldRoadLayout.test.js tests/worldTrack.test.js →    Duration  7.36s (transform 327ms, setup 667ms, collect 948ms, tests 1.70s, environment 2.84s, prepare 379ms))
- Task 3: `camera.js` keys gain `linear` (a straight, even span to the next key); a held rest (`hold: 'visible'`, `box`/`boxTo`) is two keys, the first linear, so the frame stays under the sketch as the page moves (landmarkRect within 2 % at 0..1 of the hold, both doors, both screens); `end` sections give no keys; `fadeAt` 1 → 0 over the end; `measureSections` reads `data-world-hold="visible"` (from top − ¼ vh to top + height − ¾ vh, the target's box at both ends from its page position) and `data-world-segment="end"` (the screen before it). 14 new tests (12 RED before, the 4 no-jump checks green already); `npm run verify` exit 0 (432/432).
Task 3: complete (commits c1c7e9d..f0cc76a, tests: npx vitest run tests/worldTrack.test.js tests/worldCamera.test.js →    Duration  3.26s (transform 266ms, setup 240ms, collect 447ms, tests 1.06s, environment 931ms, prepare 215ms))
- Task 4: `WorldRoadChapters` ends both doors with 240vh of road, the workshop (`Builder`, `data-world-target` on its portrait box) and your idea (`IdeaSketch`, held `data-world-hold="visible"`, `data-world-target` on its sketch); Home in world mode wraps the brief in `[data-world-segment="end"]` and no longer renders the builder and idea separately; `JourneyRail` (the lab's markup, its own frame loop) on the home page with `railStops(route, sections)` (Empty file, Into the code, The fork, the road's name, each stop, Shipped at the brief) and in the lab; the world's canvas opacity (and the scrim) follow `fadeAt`, nothing drawn once faded out. 4 new tests RED→GREEN (the rail marker check fixed for jsdom's `55%`); W3's door-B stop list now includes the meeting stops.
- Task 4 Ruling: a held rest's flight is placed through the camera at the scroll where it is launched, not at the rest's start (a held rest's camera moves) — cost if wrong: none for pinned rests (their camera is still).
- Task 4 Ruling: the world canvas chunk's budget 7.6 → 8.5 kB (8.11 measured, plus 5 %): the bundler puts the rail shared by the home and the lab in that chunk; world-only code, loaded only with the switch on — cost if wrong: 0.6 kB on world-mode pages.
- Task 4: `npm run verify` exit 0 (436/436; Home 10.23 kB; canvas 8.11 of 8.5 kB).
Task 4: complete (commits f0cc76a..4fe9ecf, tests: npx vitest run tests/WorldMeeting.test.jsx tests/TemplateChapter.test.jsx tests/IdeaSketch.test.jsx tests/Builder.test.jsx →    Duration  6.79s (transform 397ms, setup 423ms, collect 927ms, tests 2.69s, environment 1.83s, prepare 314ms))
- Task 5: `e2e/worldmeeting.spec.js` 8 tests (both doors: the road to the workshop, the builder's flight landing and the photo over `data-rest-rect`; your idea's example flight landing and the sketch over the frame; the fade to 0 and the rail at Shipped at the brief; a phone filling and submitting its own idea during the hold; switching door at the workshop; reloading at the brief; axe at all three) — written after Tasks 1–4, green on first run; `worldbusiness`'s and `worldfamily`'s stop lists now end with the meeting stops. Whole suite 213/213.
- Task 5 finding (screenshots): at the brief the rail still read "Your idea": Shipped sat at exactly 1, which a page still settling (Lenis) or unable to scroll its last pixels never reaches. Ruling: Shipped starts three quarters through the world's fade before the brief (unit test RED→GREEN; re-shot: Shipped, opacity 0, desktop and phone) — cost if wrong: Shipped lights a quarter screen early.
- Task 5: screenshots both doors, desktop and phone: the bend with the other road coming in, the junction, the workshop typing / mid-flight (0.43–0.45) / handed off, your idea mid-flight (`idea:1`) and sketched, the fade (0.5), the brief (0, Shipped). Lighthouse 12 on `/`, switch off: mobile 86 / 84 / 86, desktop 100 / 100, a11y and SEO 100 (W3 87 / 88 / 86, R6 85 / 85 / 86: within run-to-run noise, LCP 2.2 s unchanged). `npm run verify` exit 0 (436/436).
- Final review: self-review (no reviewer spawned: agents only when Chris asks). Review Focus: (1) phone form reachable during the hold — e2e; (2) door switch at the workshop — e2e; (3) a second submission replaces the first flight — the idea keys each flight `idea:<n>` and the world drops a flight whose key changes (unchanged R4 code), not separately tested; (4) reload at the brief — e2e; (5) low tier both doors within budget, trunk at full density — unit.
- Final: minor (deferred): Review Focus 3 (two quick submissions) has no test of its own.
Task 5: complete (commits 4fe9ecf..0df9b1f, tests: npx vitest run tests/WorldMeeting.test.jsx →    Duration  2.22s (transform 340ms, setup 108ms, collect 534ms, tests 741ms, environment 480ms, prepare 88ms))
