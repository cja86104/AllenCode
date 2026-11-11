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

- [ ] **Step 1:** Tests: `cameraAt` is continuous (no jump > 0.5 world units between progress steps of 0.001), clamps outside 0..1, passes through each keyframe at its stop; every shape uses only characters of its source excerpt (no glyph index outside `collectGlyphs([code])`); same seed gives identical arrays; `codeRoad` points stay within its width; the sum of all shapes at each tier is ≤ `budgetFor(tier)`. Run: FAIL (modules missing).
- [ ] **Step 2:** Implement. Run: PASS. `npm run verify`. Stop.

### Task P2: Renderer and the lab route

**Interfaces:** Consumes Task P1. Produces `createWorldRenderer(canvas, atlas): { setShapes(list), render(camera, time), resize(w, h, dpr), destroy() }` and the frame meter `createFrameMeter(): { tick(now), report(): { frames, medianMs, p95Ms } }`.

- [ ] **Step 1:** Tests: `frameMeter` median and p95 on a known sequence; e2e `/lab/world` has one canvas with `data-ready="true"`, no console errors, `meta robots` noindex, is absent from the sitemap and from every page's links, and `/` still loads without the lab chunk (network: no `WorldLab-` request). Run: FAIL.
- [ ] **Step 2:** Implement the renderer (one instanced draw; atlas from `glyphAtlas.js`; perspective from `cameraAt`; fog to `#0a0a0a`; ember tint for sparks), the route (lazy, noindex via `usePageMeta(..., { noindex: true })`), the governor tier choice (`governor.js`), the reduced-motion / no-WebGL2 plain page, and `?meter=1` showing median and p95 on screen. Run: PASS. `npm run verify`, `npm run test:e2e`. Stop: Chris opens `/lab/world` locally (`npm run preview`).

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
