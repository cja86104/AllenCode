# Code World Prototype Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native, as in the blueprint). Steps use checkbox (`- [ ]`) syntax. Chris makes every commit; "Stop" steps replace commit steps. Never create a branch. Session mechanics as in `BLUEPRINT-SKY-REDESIGN.md` ("Session mechanics that worked"): build and test in a cloud copy, sync source back with CRLF, verify by hash.

**Goal:** Prove, before any full spec, that the site can become one continuous scroll journey through a 3D world built from code characters (inspired by fiabamia.com, reviewed 2026-11-10), running smoothly on Chris's phone. Output is a go/no-go with real frame-time numbers and Chris's verdict on the feel.

**Architecture:** An unlinked, noindex lab route `/lab/world`, lazily loaded in its own chunk, so the live site, its prerender and its budget are untouched. The existing hand-written WebGL2 approach is extended to 3D: one instanced draw of glyph quads (the existing `glyphAtlas.js` atlas) with a perspective camera, depth fog and per-glyph colour. The camera moves along a fixed spline driven by scroll progress (the existing `ScrollEngine`: Lenis + GSAP ScrollTrigger). World shapes are generated in code from real approved excerpts (no models, no new dependencies). DOM text for each stop sits over the canvas as today.

**Tech stack:** unchanged (Vite 5, React 18, React Router 6.30, Tailwind 3, GSAP + ScrollTrigger, Lenis, hand-written WebGL2, Vitest, Playwright). No Three.js: Ruling — the world's landmarks are rectilinear (editor, road, screens, signposts), so procedural point generation plus a perspective matrix covers them; a 3D engine would cost ~150 kB+ gzip for features the prototype does not use. Revisit only if Task P3's renderer cannot hold frame time.

**Source:** Chris, 2026-11-10: "what we have done is cool but i want it on this level"; walkthrough findings and the proposed journey are in the blueprint ledger (2026-11-10, "Code world"). The prototype is the first stretch of that journey only.

## Global Constraints

- Real code only: every glyph drawn comes from an approved excerpt in `src/content/excerpts/` (`approved` not null). No invented code, no lorem.
- Signature `#f97316` on `#0a0a0a`; JetBrains Mono glyphs; Instrument Serif italic for display lines. No violet sky: this must not read as a copy of FiabaMia.
- No audio. No `@ts-ignore`, `@ts-expect-error`, `as any`, `eslint-disable`. Every new JS file starts with `// @ts-check`.
- The live site is untouched: `npm run budget` numbers for the entry script, CSS, `Home` and `FieldScene` stay as they are (the lab chunk gets its own budget line, 40 kB gzip). `/lab/world` is not in `public/sitemap.xml`, is not prerendered, carries `noindex, nofollow`, and no page links to it.
- `npm run verify` and `npm run test:e2e` pass at every stop.

## Success criteria (the go/no-go, Task P5)

1. Frame time on Chris's phone over a full scroll of the lab route: median ≤ 16.7 ms, 95th percentile ≤ 25 ms (record the phone model and browser). Desktop: median ≤ 8 ms.
2. Chris's verdict after scrolling it on phone and desktop: "this is the level" or what is missing.
3. Lab chunk ≤ 40 kB gzip; no new runtime dependency.

## Review Focus

1. Lost GPU context or no WebGL2 / reduced motion on `/lab/world`: a plain page with the stop titles and a link home, no blank screen (reuse `capabilities.js`, `environment.js`).
2. Resizing or rotating the phone mid-scroll: camera aspect and canvas size follow; no stretched world.
3. Fast flick-scrolling and jumping to the end: the camera is a pure function of progress, so any progress gives the right frame (no accumulated state).
4. Leaving the route: canvas, GPU buffers, ScrollTriggers and Lenis are released (same rule as Review Focus 4 of the blueprint).
5. Low-end phone: the governor lowers glyph count rather than dropping frames.

## The prototype's journey (one stretch, ~8 screens of scroll)

| Progress | Stop | What happens |
|---|---|---|
| 0.00–0.15 | Empty file | The gate's empty editor; the approved `gate` excerpt types in (as today). DOM line: "It all starts with an empty file…" |
| 0.15–0.30 | Into the code | The camera pushes into the editor; its characters become 3D glyphs that stream past the camera (FiabaMia's "tunnel" moment, ours made of code). |
| 0.30–0.60 | The road | You land on a road made of streaming characters from the `ambient` excerpt, receding into fog, with ember sparks; the far horizon is faint code. Rail label: "empty file → shipped". |
| 0.60–0.75 | The fork | The road splits; two glyph-built signposts read `business/` and `family/` (DOM labels projected onto them). The prototype follows `business/`. |
| 0.75–1.00 | First landmark | UnderFire AI: a screen-shaped sculpture of glyphs from its approved product excerpt, which resolves into its real poster (`public/media/products/underfire-ai.jpg`) as the camera arrives, then its loop plays. DOM: product name and tagline at chapter size (`chapterType.js`). |

## File Structure

- `src/world/camera.js`: path keyframes and `cameraAt(progress)` (pure).
- `src/world/shapes.js`: procedural point generators (pure, seeded).
- `src/world/worldRenderer.js`: WebGL2 3D instanced glyph renderer.
- `src/world/worldShaders.js`: vertex/fragment shaders (perspective, fog, fade).
- `src/world/frameMeter.js`: frame-time recorder and report.
- `src/pages/WorldLab.jsx`: the route: canvas, stops, rail, fallbacks.
- Modify `src/App.jsx` (lazy route), `tools/budget/check.mjs` (lab line), `public/robots.txt` (Disallow `/lab/`).
- Tests: `tests/worldCamera.test.js`, `tests/worldShapes.test.js`, `tests/frameMeter.test.js`, `e2e/worldlab.spec.js`.

### Task P1: Camera path and world shapes (pure, no rendering)

**Interfaces:**
- Produces `cameraAt(progress: number): { eye: [number, number, number], target: [number, number, number], fov: number }` (progress clamped to 0..1; Catmull-Rom through the keyframes of the table above).
- Produces in `shapes.js`, each returning `{ positions: Float32Array, glyphs: Uint16Array, colors: Float32Array }` (xyz per glyph, atlas index per glyph, rgba per glyph), deterministic for a seed: `editorSlab(code, seed)`, `codeRoad(code, { length, width }, seed)`, `forkSigns(labels, seed)`, `screenSculpture(code, { width, height }, seed)`, and `budgetFor(tier: 'low' | 'mid' | 'high'): number` (12 000 / 24 000 / 40 000 glyphs).

- [x] **Step 1:** Tests: `cameraAt` is continuous (no jump > 0.5 world units between progress steps of 0.001), clamps outside 0..1, passes through each keyframe at its stop; every shape uses only characters of its source excerpt (no glyph index outside `collectGlyphs([code])`); same seed gives identical arrays; `codeRoad` points stay within its width; the sum of all shapes at each tier is ≤ `budgetFor(tier)`. Run: FAIL (modules missing).
- [x] **Step 2:** Implement. Run: PASS. `npm run verify`. Stop.

### Task P2: Renderer and the lab route

**Interfaces:** Consumes Task P1. Produces `createWorldRenderer(canvas, atlas): { setShapes(list), render(camera, time), resize(w, h, dpr), destroy() }` and the frame meter `createFrameMeter(): { tick(now), report(): { frames, medianMs, p95Ms } }`.

- [x] **Step 1:** Tests: `frameMeter` median and p95 on a known sequence; e2e `/lab/world` has one canvas with `data-ready="true"`, no console errors, `meta robots` noindex, is absent from the sitemap and from every page's links, and `/` still loads without the lab chunk (network: no `WorldLab-` request). Run: FAIL.
- [x] **Step 2:** Implement the renderer (one instanced draw; atlas from `glyphAtlas.js`; perspective from `cameraAt`; fog to `#0a0a0a`; ember tint for sparks), the route (lazy, noindex via `usePageMeta(..., { noindex: true })`), the governor tier choice (`governor.js`), the reduced-motion / no-WebGL2 plain page, and `?meter=1` showing median and p95 on screen. Run: PASS. `npm run verify`, `npm run test:e2e`. Stop: Chris opens `/lab/world` locally (`npm run preview`).

### Task P3: Scroll, stops and the rail

- [ ] **Step 1:** Tests (e2e): scrolling to progress 0, 0.2, 0.45, 0.68, 0.9 shows the matching DOM stop text; jumping straight to the end shows the landmark stop (no accumulated state); resizing 1440 x 900 to 390 x 844 mid-scroll keeps the canvas at the window size; navigating away leaves no canvas and `html[data-scroll-engine]` off. Run: FAIL.
- [ ] **Step 2:** Wire `ScrollEngine` progress to `cameraAt`; stop text fades in at its range; right-hand rail "empty file → shipped" with the current stop. Run: PASS. Screenshots at each stop, desktop and phone. Stop: Chris reviews the feel.

### Task P4: The landmark resolves into the real screen

- [ ] **Step 1:** Tests: from progress 0.85 the poster image is visible over the sculpture's footprint (DOM image positioned from the projected sculpture corners); at 1.0 the UnderFire loop plays; the sculpture's glyphs come only from UnderFire's approved excerpt. Run: FAIL.
- [ ] **Step 2:** Implement the resolve (glyph opacity out, poster in, as the existing chapter flight does). Run: PASS. `npm run verify`, `npm run test:e2e`. Stop.

### Task P5: Measure and decide

- [ ] **Step 1:** Chris opens `/lab/world?meter=1` on his phone (deployed to a Vercel preview, since a phone cannot reach the local server) and on his desktop, scrolls top to bottom twice, and reports the median and p95 shown, plus the phone model.
- [ ] **Step 2:** Record the numbers and Chris's verdict in the blueprint. Go: write the full "Code world" spec (both roads, every service, product and template landmark, the workshop, the idea, the plain-page ending, the prerender and fallback layers). No-go: record why and what would change it. Stop.

## Open questions for Chris (ask at Task P2's stop, not before)

1. Which phone (model and browser) is the measuring phone?
2. The rail's words: "empty file → shipped" or something in his voice?

## Execution ledger

- Task P1 (2026-11-10): `src/world/camera.js` (`CAMERA_KEYS`: seven stops at progress 0, 0.15, 0.3, 0.45, 0.6, 0.75, 1, named empty file, into the code, the road, the fork, first landmark; `cameraAt(progress)`: uniform Catmull-Rom through the stops, clamped, a pure function of progress) and `src/world/shapes.js` (`seeded` mulberry32; `editorSlab`, `codeRoad`, `forkSigns`, `screenSculpture`, `distanceToPath`, `budgetFor`, `ROAD_PATHS`, `buildWorld`). World units are about a metre: the empty file at z = 0, the fork at z = -40, the UnderFire landmark at (-6, 1.8, -58). Sources are the approved `gate`, `ambient` and `product-underfire-ai` excerpts. Tests: `tests/worldCamera.test.js` (5) and `tests/worldShapes.test.js` (7), red first (modules missing).
- Task P1 Ruling: shapes carry the character itself (`glyphs`: UTF-16 codes), not an atlas index as the plan's interface said — a shape then does not depend on the atlas's order, and the renderer (Task P2) maps characters to atlas cells once; the test "only characters of its own source" checks the characters directly — cost if wrong: one lookup table in P2.
- Task P1 Ruling: every shape also carries one `size` (glyph height in world units: editor 0.096, road 0.09, signs 0.26, landmark 0.07) — the signposts must read from far away and the road must not; per-shape rather than per-glyph keeps the buffer small — cost if wrong: a per-glyph size attribute in P2.
- Task P1 Ruling: `buildWorld(tier, sources, seed)` added (not in the plan's interface list) so the budget test checks the real composition: editor and signs exact, then the rest of the tier's budget split road trunk 40 percent, business branch 20, family branch 15, landmark 25.
- Task P1 Ruling: the shape tests compare positions to 1e-5, not 1e-9 — positions are 32-bit floats (what the GPU reads), and 1.8 + 1.875 stored as float32 is 3e-9 over; the code is unchanged.
- Task P1 verification: `npm run verify` exit 0 (269/269 unit); the site's bundles are byte-identical (nothing imports `src/world/` yet). Synced 4 files (CRLF, hashes match).
- Task P2 (2026-11-10): `src/world/matrix.js` (`perspective`, `lookAt`, `multiply`, `transformPoint`; column-major), `src/world/frameMeter.js` (`createFrameMeter`: intervals between frames, gaps over 250 ms ignored, nearest-rank median and 95th percentile, last 2,000 kept), `src/world/worldShaders.js` (one vertex shader: point sprites sized by distance, fog from 14 to 46 units, fade very close to the camera, ember sparks twinkle; the field's fragment shader reused), `src/world/worldRenderer.js` (`createWorldRenderer(canvas, atlas)`: `setShapes`, `resize`, `render`, `destroy`; `packShapes` maps characters to atlas cells; one buffer, one draw), `src/pages/WorldLab.jsx` (the lab page; tier from `capabilities.js`; `?meter=1` shows tier, frames, median and p95 every 500 ms; the plain page for reduced motion, no WebGL2, a lost context or unapproved code), `src/App.jsx` (lazy `/lab/world` route), `public/robots.txt` (`Disallow: /lab/` for both blocks), `tools/budget/check.mjs` (lab line, 40 kB). Tests: `tests/frameMeter.test.js` (3), `tests/worldMatrix.test.js` (3), `e2e/worldlab.spec.js` (8), red first (modules and route missing).
- Task P2 Ruling: `/lab/world` is a top-level route outside the site's shell (no nav, footer, cursor or code field) — the world's canvas is then the only canvas, and nothing on the site's own routes changes — cost if wrong: none for the prototype.
- Task P2 Ruling: in P2 the camera follows native page scroll (an 800vh page); Lenis and ScrollTrigger come with the stops and the rail in Task P3 — so the world can be scrolled at this stop.
- Task P2 Ruling: the glyph tier comes from `capabilities.js` (`low` / `medium` / `high` mapped to the world's `low` / `mid` / `high`), read once when the page is created (the lab is never server-rendered, so reading the device in a state initializer is safe and the hooks lint rule refuses setting it in an effect); `governor.js`'s live lowering is not wired yet — Review Focus 5 is answered by the measurements in Task P5.
- Task P2 finding and fix: the first screenshots drew the world in a serif fallback, because waiting for the "JetBrains Mono" family loaded weight 400 while the atlas draws weight 500 (`ATLAS_FONT`); the lab now also waits for `document.fonts.load(ATLAS_FONT)`, as the field's stage does, and marks the canvas `data-atlas-font`. Test "the world is drawn in JetBrains Mono" red without the wait ("fallback"), green with it.
- Task P2 test fixes, not code: the frame meter's p95 case (with 1 slow frame in 20, the nearest-rank 95th percentile is the fast value; the case now has 2 in 20); the "no page links to the lab" check now looks for `href="…/lab/` (the bare text "/lab" is in every `</label>`).
- Task P2 seen in the screenshots, for Task P3: on a phone (390 x 844) the empty file is wider than the screen, so its lines run off both sides; the camera needs framing for narrow screens. Headless frame times come from a software GPU (swiftshader: desktop 33 ms median, phone-sized 17 ms) and say nothing about real devices.
- Task P2 verification: `npm run verify` exit 0 (275/275 unit; budget: entry script 146.21 kB (+0.11, the lazy route), CSS 7.35, `Home` 14.11, field 55.82, lab 6.12 of 40); `npm run test:e2e` 164/164. Synced 11 files (CRLF, hashes match).
- Task P2 review (Chris, 2026-11-10: "the business and family letters should be white, they get washed out. also lets make an edge along the path with orange letters, makes it not look so scattered.. on the preview page it took 8 scrolls to get to the doors. if that is the exact length shorten it 10 percent"). (1) `forkSigns`: the words are white at full alpha; the posts stay ember. (2) New `roadEdges(code, { path, width, spacing }, seed)`: a line of ember characters along each side of a road, 0.35 units apart, at half its width (2 cm of jitter), characters from the `ambient` excerpt in reading order; `buildWorld` adds `trunk-edges`, `business-edges` and `family-edges` (exact, about 400 glyphs, taken from the budget before the scatter is split). (3) The journey is 7.2 screens of scroll, from 8 (`JOURNEY_SCREENS` in `WorldLab.jsx`). Ruling: "8 scrolls" read as the page's 8 screens, so the whole journey is 10 percent shorter and the stops keep their places in it; the fork is now at 0.6 of 7.2 screens. Tests: the signposts' words white (red: blue channel 0.09), the edges on both sides at half the width in ember (red: `roadEdges` missing), `buildWorld` lists the three edges (red), e2e "the journey is 7.2 screens of scroll" (new).
- Task P2 note: while syncing, the cloud copy's uncommitted P2 work was dropped by a stash (Chris had not committed P2 yet) and restored from the exact staged copies sent to Chris's folder (11 hashes match); Chris's folder was never affected. From now on the cloud copy pulls only when Chris's repo has new commits.
- Task P2 review verification: `npm run verify` exit 0 (277/277 unit; lab 6.46 kB of 40; entry script 146.21 kB unchanged); `npm run test:e2e` 165/165. Synced 4 files (CRLF, hashes match).
