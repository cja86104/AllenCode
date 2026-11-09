# Source to Screen Implementation Plan (Master Blueprint)

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (chosen by Chris: native execution) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. In this repo Chris makes every commit, so "Stop" steps replace commit steps.

**Goal:** Replace the public site with the scroll-driven "Source to Screen" experience (real code lifting off a file and landing as real products, two doors, the visitor's own idea) on the existing Vite and React stack, with lint, typecheck and tests in place.

**Architecture:** One lazily loaded WebGL2 glyph renderer (`FieldScene`, mounted above `<Routes>` and enabled per route) draws a faint ambient field of source characters and, at most, one transformation at a time: a real code excerpt laid out as an editor whose characters fly to a target layout (headline text, a product's poster frame, a wireframe). Scenes drive each transformation's progress from GSAP ScrollTrigger under Lenis. Without WebGL2, or with reduced motion, every chapter shows its code beside its result. All real text stays in the DOM. The experience is built at the unlinked, noindex route `/preview` and swapped onto `/` in Phase 6, so every phase leaves the live site deployable.

**Tech Stack:** Vite 5, React 18, React Router 6.30, Tailwind 3, GSAP 3.15 with ScrollTrigger, Lenis 1.3, hand-written WebGL2, ESLint 9 flat config, TypeScript 5 (JSDoc with `// @ts-check`), Vitest 3 with Testing Library, Playwright 1.65, ffmpeg.

**Spec:** `docs/superpowers/specs/2026-11-08-allencode-sky-redesign-design.md` (the file keeps its original name; its content is the Source to Screen spec).

## Progress (read at the start of every session, update after every phase)

| Phase | Status | Verified by |
|---|---|---|
| 0 Foundation and tooling | Complete | 0.1: `npm run verify` exit 0; 0.2: `npm run test:e2e` 1/1; 0.5: `npm run verify` exit 0 (28/28), `npm run test:e2e` 11/11, home page pixel-identical to baseline |
| 1 Field rename and glyph engine | Complete, awaiting Chris's review | `npm run verify` exit 0 (68/68 unit), `npm run test:e2e` 16/16, `/` pixel-identical to the pre-redesign baseline; main bundle 130.17 kB gzip |
| 2 Gate, awakening, fork | Complete, awaiting Chris's review | `npm run verify` exit 0 (93/93 unit), `npm run test:e2e` 24/24, `/` pixel-identical to the pre-redesign baseline; main bundle 130.58 kB gzip |
| 3 Door A service chapters | Built; all four excerpts approved; MVP (UnderFire) and custom-build (Founders Helm) screens registered; lost GPU contexts recover; waiting on the Crew Advisors screen and a corrected UnderFire screen | `npm run verify` exit 0 (121/121 unit), `npm run test:e2e` 36/36, `/` pixel-identical to the pre-redesign baseline; main bundle 130.69 kB gzip |
| 4 Product chapters and captures | Complete, awaiting Chris's review | `npm run verify` exit 0 (144/144 unit), `npm run test:e2e` 41/41, `/` pixel-identical to the pre-redesign baseline; main bundle 130.75 kB gzip |
| 5 Door B, templates, previews | Complete, awaiting Chris's review of the Door B copy (`src/content/doorB.js`) | `npm run verify` exit 0 (165/165 unit), `npm run test:e2e` 45/45; `/` identical except the footer's Templates column; main bundle 132.13 kB gzip |
| 6 Your idea, builder, brief, nav, swap to `/` | Not started | |
| 7 Inner pages, router, transitions, retirements | Not started | |
| 8 Full-repo gates, performance, a11y, SEO | Not started | |

## Session rules (replace the unavailable `blueprint-guardian` agent)

1. Start of session: read this file and the spec, then state which task is next.
2. Read each file before editing it. Make the smallest change that completes the task.
3. After every task run its verification command and `npm run verify`; run `npm run test:e2e` whenever a task touches routes, scenes or the renderer.
4. Until Task 6.4 swaps the home page, compare a full-page screenshot of `/` against the baseline at the end of every phase; any difference stops the phase.
5. End of phase: tick the boxes, update the Progress table with the real verification output, then stop for Chris's review and commit.
6. Never create a branch, commit or push. Chris does all of that.
7. Dependencies are installed and tests run outside Chris's folder (it holds Windows-only binaries); only source and config files are copied back, and Chris runs `npm install` after any phase that changes dependencies.

## Global Constraints

- Signature color is `#f97316` (orange-500) on near-black `#0a0a0a`. Locked.
- No `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `as any`, `eslint-disable` or `ignoreBuildErrors`. No placeholder or mock content. Complete files only. Work in named phases with a stop between each.
- Every new or changed JS file starts its leading comments with `// @ts-check` (enforced by `tests/policy.test.js`).
- Chris makes all git commits and pushes. No branches are created.
- No audio, no autoplaying media with sound.
- No prices and no buy buttons on any rendered surface. `startingPrice` in `src/data/services.js` and `price` in `src/data/templates.js` stay in the data, untouched.
- **Real code only.** Every code excerpt shown is verbatim from a real repository at a recorded commit and approved by Chris before it ships (spec section 5). No invented code.
- Approved copy, verbatim: opening line "It all starts with an empty file…" and headline "Welcome to Allen Code Co. What would you like to build today?" (changed by Chris 2026-11-09; was "We build software that ships.")
- Fonts: JetBrains Mono for code and labels, Instrument Serif (italic) for display, Space Grotesk for interface text.
- Stack is unchanged: Vite 5, React 18, React Router 6, Tailwind 3, Vercel; `api/` routes are untouched. The repo stays JavaScript.
- Core Web Vitals targets: LCP under 2.5 s, CLS under 0.1, INP under 200 ms.
- Products come from `src/data/products.js`: My Teachers Toolbox, UnderFire AI and Founders Helm are `live`; Crew Advisors is `coming-soon` with `url: null`.
- The spec and blueprint keep their file names.

## Review Focus

1. No WebGL2, a GPU context that cannot be recovered, or reduced motion: every chapter shows its code beside its result, all text readable, no canvas left behind (Tasks 1.7, 2.2, 3.2, 3.5, 4.3, 5.4). A lost context is recovered first: the field restarts on a fresh canvas (Task 3.5).
2. Fonts slow or blocked: the glyph atlas waits for JetBrains Mono and the chapter shows its static state meanwhile; no characters drawn in a fallback font (Task 1.2).
3. "Type your idea" input that is empty, very long, pasted HTML, emoji or other scripts: the DOM keeps the visitor's text safely escaped and capped at 120 characters; the flight uses only characters in the atlas; the sketch always has a header, a hero and a call to action (Task 6.1).
4. Blocked storage, switching doors mid-scroll, route changes, back and forward, and StrictMode double mounts leave no stray ScrollTriggers, Lenis instances, canvases or GPU resources (Tasks 1.6, 2.1).
5. Excerpt honesty: an unapproved excerpt or one without full provenance never renders, and secret-like content fails the tests (Task 1.5).

## File Structure

- `src/field/` (renamed from `src/sky/` in Task 1.1): `capabilities.js`, `governor.js`, `types.js`, `environment.js`, `fieldBus.js`, `glyphAtlas.js`, `layouts.js`, `syntax.js`, `transformation.js`, `shaders.js`, `glyphRenderer.js`, `FieldStage.jsx`, `CssField.jsx`, `FieldScene.jsx`, `FieldLayer.jsx`, `CodeBeside.jsx`.
- `src/scroll/ScrollEngine.jsx` (Phase 0, unchanged).
- `src/content/excerpts/`: `index.js` (registry and schema) plus one file per excerpt.
- `src/door/`: `doorStorage.js`, `DoorProvider.jsx`, `Fork.jsx`.
- `src/scenes/`: `Gate.jsx`, `Awakening.jsx`, `ServiceChapter.jsx`, `ProductChapter.jsx`, `DoorBIntro.jsx`, `TemplateChapter.jsx`, `IdeaSketch.jsx`, `Builder.jsx`, `BriefChapter.jsx`.
- `src/components/`: `MediaLoop.jsx`, `ContactForm.jsx`.
- `src/pages/Preview.jsx` (renamed from `SkyPreview.jsx`; replaced by the new home in Task 6.4).
- `tools/excerpts/verify.mjs`, `tools/media/` (product and service captures), `tools/previews/` (template preview pages and recorder); media outputs in `public/media/`.
- `tests/` (Vitest) and `e2e/` (Playwright).

---

## Phase 1: Field rename and glyph engine

### Task 1.1: Rename sky to field

**Files:** Move `src/sky/*` to `src/field/*` with these renames: `skyBus.js` to `fieldBus.js` (`createSkyBus` to `createFieldBus`, `skyBus` to `fieldBus`, `useSky` to `useField`, `SkyState` to `FieldState`), `SkyLayer.jsx` to `FieldLayer.jsx` (`SKY_ROUTES` to `FIELD_ROUTES`, `useIsSkyRoute` to `useIsFieldRoute`), `SkyScene.jsx` to `FieldScene.jsx`, `SkyStage.jsx` to `FieldStage.jsx`, `CssSky.jsx` to `CssField.jsx`; `src/pages/SkyPreview.jsx` to `src/pages/Preview.jsx` at route `/preview`; `data-sky` attributes to `data-field`; `.css-sky` to `.css-field`; `e2e/sky.spec.js` to `e2e/field.spec.js`; `tests/skyBus.test.js` to `tests/fieldBus.test.js`. Modify `src/App.jsx`, `src/scroll/ScrollEngine.jsx`, `src/index.css`, `public/robots.txt`, the tests that import these modules.

- [x] **Step 1:** Update the tests and e2e specs to the new names and route first. Run `npx vitest run` and `npm run test:e2e`. Expected: FAIL on missing modules and the 404 at `/preview`.
- [x] **Step 2:** Apply the renames. `rg -n -i "sky" src tests e2e public/robots.txt` returns nothing.
- [x] **Step 3:** Run `npm run verify` and `npm run test:e2e`. Expected: PASS, same counts as Phase 0.
- [x] **Step 4:** Removing the old files from Chris's folder needs deletion permission: request it once for the AllenCode folder, or move the old files to `_to_delete/` if declined.

### Task 1.2: Glyph atlas

**Files:** Create `src/field/glyphAtlas.js`, `tests/glyphAtlas.test.js`.

**Produces:**
- `collectGlyphs(texts: string[]) => string[]`: unique non-whitespace characters, in first-seen order.
- `createGlyphAtlas(chars: string[], opts: {cell: number, font: string, createCanvas?: (w: number, h: number) => HTMLCanvasElement}) => {canvas: HTMLCanvasElement, columns: number, rows: number, cell: number, indexOf(char: string): number}` with `columns = 16`; `indexOf` returns -1 for characters not in the atlas.
- `loadAtlasFont(family: string) => Promise<boolean>` using `document.fonts.load`, resolving `false` (never rejecting) when the font cannot load within 3 s.

- [x] **Step 1:** Tests: `collectGlyphs drops whitespace and duplicates`; `atlas has 16 columns and enough rows`; `indexOf maps each character to its draw position and returns -1 for unknown characters`; `each character is drawn centered in its cell` (fake canvas records `fillText` calls); `loadAtlasFont resolves false when the font never loads` (fake `document.fonts`).
- [x] **Step 2:** Run `npx vitest run tests/glyphAtlas.test.js`. Expected: FAIL (module missing). Implement. Run again. Expected: PASS.

### Task 1.3: Syntax and layouts

**Files:** Create `src/field/syntax.js`, `src/field/layouts.js`, `tests/syntax.test.js`, `tests/layouts.test.js`. Modify `src/field/types.js`.

**Produces (types in `types.js`):** `Box = {x, y, w, h}`; `GlyphPoint = {x, y, char, color: [r, g, b]}`; `TargetPoint = {x, y, color: [r, g, b]}`.
- `tokenizeLine(line: string) => {text: string, kind: 'keyword'|'type'|'string'|'plain'}[]` and `SYNTAX_COLORS` (keyword `#f97316`, type `#8cc7ff`, string `#a6d98c`, plain `#d1d1cc`, as 0..1 RGB).
- `codeLayout(code: string, box: Box, metrics: {charWidth: number, lineHeight: number, padding: number}) => GlyphPoint[]`: one point per non-whitespace character at `x = box.x + padding + (col + 0.5) * charWidth`, `y = box.y + padding + (row + 0.5) * lineHeight`.
- `imageLayout(image: {data: Uint8ClampedArray, width: number, height: number}, box: Box, step: number) => TargetPoint[]`: row-major samples.
- `pointsFromAlpha(alpha: Uint8ClampedArray, width: number, height: number, step: number) => Float32Array` (normalized pairs where alpha is above 128) and `textLayout(mask: {alpha: Uint8ClampedArray, width: number, height: number}, box: Box, step: number, color: [number, number, number]) => TargetPoint[]`.

- [x] **Step 1:** Tests: `keywords, capitalized types and quoted strings get their kinds`; `codeLayout skips whitespace and places row 2 column 4 exactly`; `codeLayout colors a keyword orange`; `imageLayout returns floor(w/step) by floor(h/step) samples with 0..1 colors`; `a fully opaque 4x4 mask with step 2 yields 4 points`; `textLayout keeps only opaque samples`.
- [x] **Step 2:** Run, see FAIL, implement, run. Expected: PASS.

### Task 1.4: Transformation

**Files:** Create `src/field/transformation.js`, `tests/transformation.test.js`.

**Produces:** `createTransformation(opts: {source: GlyphPoint[], targets: TargetPoint[], budget: number, seed: number, indexOf: (char: string) => number}) => Transformation` where `Transformation = {count: number, start: Float32Array, end: Float32Array, glyph: Float32Array, original: Float32Array, seed: Float32Array, row: Float32Array, srcColor: Float32Array, dstColor: Float32Array}`.

Rules from the approved prototype: targets are first downsampled evenly to at most `budget`; original characters take evenly spaced targets in reading order; every other particle is a copy of a real source character (`source[i % source.length]`) starting on that character's position; characters missing from the atlas are dropped from the source.

- [x] **Step 1:** Tests: `count equals the target count capped at the budget`; `every glyph index is a character from the source code`; `original characters keep reading order (their target y never decreases)`; `characters not in the atlas are dropped`; `the same seed gives identical buffers`; `an empty source or empty targets gives count 0`.
- [x] **Step 2:** Run, see FAIL, implement, run. Expected: PASS.

### Task 1.5: Excerpt registry

**Files:** Create `src/content/excerpts/index.js`, `tools/excerpts/verify.mjs`, `tests/excerpts.test.js`. Modify `package.json` (script `excerpts:verify`).

**Produces:** `Excerpt = {id: string, file: string, repo: string, path: string, lines: [number, number], commit: string, code: string, becomes: string, approved: {by: 'Chris', on: string} | null}`; `excerpts: Readonly<Record<string, Excerpt>>`; `getExcerpt(id: string) => Excerpt | null` returning null for unapproved excerpts.

- [x] **Step 1:** Tests: `every excerpt has repo, path, line range, a 7-to-40-character commit and non-empty code`; `line count equals the line range`; `no excerpt is longer than 30 lines`; `no excerpt contains secret-like content` (patterns: `sk-`, `sk_live_`, `pk_live_`, `eyJ` JWT prefixes, `-----BEGIN`, `AKIA`, `ghp_`, and `KEY=`/`SECRET=`/`TOKEN=` assignments); `getExcerpt returns null for an unapproved excerpt`; `ids are unique`.
- [x] **Step 2:** Run, see FAIL, implement. `tools/excerpts/verify.mjs` checks each excerpt against `git show <commit>:<path>` in a local checkout given by `EXCERPT_REPOS` (JSON map of repo to path) and reports any mismatch.
- [x] **Step 3:** Run `npm run verify` and `npm run excerpts:verify` (AllenCode only at this point). Expected: PASS.

### Task 1.6: Glyph renderer and ambient field

**Files:** Create `src/field/glyphRenderer.js`; rewrite `src/field/shaders.js`; modify `src/field/FieldStage.jsx`, `src/field/FieldScene.jsx`; delete `src/field/starfield.js` (with the Task 1.1 permission); create `src/content/excerpts/ambient.js` holding the site's own source used by the ambient field (provenance per Task 1.5; approved in the Phase 1 review); create `e2e/renderer.spec.js`.

**Produces:** `createGlyphRenderer(canvas: HTMLCanvasElement, opts: {atlas: Atlas}) => {resize(w: number, h: number, dpr: number): void, setAmbient(points: GlyphPoint[] | null, count: number): void, setTransformation(t: Transformation | null): void, setProgress(p: number): void, setFade(f: number): void, render(timeMs: number): void, destroy(): void}`. Two programs: ambient (drifting faint characters with depth parallax from `fieldBus.progress`) and transformation (the prototype's motion: staggered lift, arc, landing, characters stay characters, color mixes to the target).

- [x] **Step 1:** E2E tests: `/preview draws a non-empty field` (screenshot of the canvas has lit pixels above a threshold); `scrolling changes the field` (two screenshots differ); `a lost WebGL context swaps to the CSS field`; `navigating away and back leaves exactly one canvas`; `the home page does not download the renderer`.
- [x] **Step 2:** Run. Expected: FAIL. Implement; the governor sets the ambient count from the capability tier (3500, 1800, 700 starting values).
- [x] **Step 3:** Run `npm run verify` and `npm run test:e2e`. Expected: PASS.

### Task 1.7: Static fallbacks

**Files:** Create `src/field/CodeBeside.jsx`, `tests/CodeBeside.test.jsx`; rewrite `src/field/CssField.jsx` and the `.css-field` rules in `src/index.css`.

**Produces:** `<CodeBeside excerpt={Excerpt} result={ReactNode} />` renders the excerpt in a `<pre>` (with its file name and a text alternative) beside the result. `CssField` becomes a faint static code texture.

- [x] **Step 1:** Tests: `CodeBeside renders the code verbatim, the file name and the result`; e2e `with reduced motion /preview shows CodeBeside and no canvas`; `with WebGL2 unavailable the CSS field renders and the text is present`.
- [x] **Step 2:** Run, see FAIL, implement, run `npm run verify` and `npm run test:e2e`. Expected: PASS. Stop: Phase 1 review (visual review of `/preview` on desktop and phone; Chris approves the ambient excerpt).

---

## Phase 2: Gate, awakening and fork

### Task 2.1: Door state and the fork

**Files:** Create `src/door/doorStorage.js`, `src/door/DoorProvider.jsx`, `src/door/Fork.jsx`, `tests/doorStorage.test.js`.

**Produces:** `readDoor() => 'a'|'b'|null`, `writeDoor(door: 'a'|'b') => void` (both safe when storage throws); `useDoor() => {door, setDoor}`; `setDoor` also writes `fieldBus.door`.

- [x] **Step 1:** Tests: `readDoor returns null when storage throws`; `writeDoor does not throw when storage is full`; `a written door is read back`; `setDoor updates fieldBus`.
- [x] **Step 2:** Run, see FAIL, implement, run. Expected: PASS.

### Task 2.2: Gate and awakening

**Files:** Create `src/scenes/Gate.jsx`, `src/scenes/Awakening.jsx`, `src/content/excerpts/gate.js` (an excerpt of this site's own source), `e2e/gate.spec.js`. Modify `src/pages/Preview.jsx`.

- [x] **Step 1:** E2E: `the approved line and headline are real text in the DOM`; `choosing a door persists across reload`; `with storage blocked the fork still works and reappears on reload`; `the fork buttons are reachable by keyboard`; `with reduced motion the gate shows the code beside the headline and no canvas`; `scrolling through the awakening draws characters that end on the headline` (screenshot comparison at progress 0 and 1).
- [x] **Step 2:** Run. Expected: FAIL. Implement: the gate types the excerpt into the empty file as the visitor scrolls; the awakening's transformation lands it on `textLayout` of the headline; the `h1` fades in as the particles fade.
- [ ] **Step 3:** Measure frame time at phone and desktop widths and tune the tier budgets; record the values in the ledger.
- [x] **Step 4:** Run `npm run verify` and `npm run test:e2e`. Expected: PASS. Stop: Phase 2 review (Chris approves the gate excerpt and the motion).

---

## Phase 3: Door A service chapters

### Task 3.1: Service excerpts and targets

**Files:** Create `src/content/excerpts/service-*.js` (four), `tools/media/capture.mjs`, `public/media/services/*.jpg`.

- [x] **Step 1:** Confirm spec 14.D (the Founders Helm repository) with Chris.
- [ ] **Step 2:** Propose one real excerpt per service from the product repositories (sign-in for MVP, dashboard for custom build, OpenRouter routing or streaming for AI integration, any file for the audit) and stop for Chris to approve each; record provenance and approval.
- [ ] **Step 3:** Capture each target from public product pages only (never signed-in screens, never credentials) with `capture.mjs` (Playwright screenshot, cropped to the target, JPEG q85, at most 150 KB). Test: `tests/media.test.js` asserts every service target exists and is at most 150 KB.

### Task 3.2: Service chapter

**Files:** Create `src/scenes/ServiceChapter.jsx`, `tests/ServiceChapter.test.jsx`, `e2e/services.spec.js`. Modify `src/pages/Preview.jsx`.

- [x] **Step 1:** Tests: `each service renders its name, summary and timeline from services.js`; `no service chapter renders a dollar amount or a startingPrice value`; `the audit chapter highlights lines instead of flying`; e2e `door a reaches each service chapter and each lands on its target`.
- [x] **Step 2:** Run, see FAIL, implement, run `npm run verify` and `npm run test:e2e`. Expected: PASS. Stop: Phase 3 review.

---

## Phase 4: Product chapters and captures

### Task 4.1: Product loops

**Files:** Create `tools/media/make-loops.mjs`, `public/media/products/<slug>.mp4` and `<slug>.jpg`, `tests/media.products.test.js`. Modify `src/data/products.js` (add `previewVideo` and `poster` to the three live products).

- [x] **Step 1:** Test `every live product has a loop and poster, coming-soon products have neither, posters are at most 150 KB and loops at most 2 MB`. Run. Expected: FAIL.
- [x] **Step 2:** Capture 4 to 6 public screens per live product (My Teachers Toolbox through its public demo) with the built-in browser; never signed-in screens, never credentials. `make-loops.mjs` composes a 6 to 8 second muted H.264 loop (`+faststart`) and a poster per product.
- [x] **Step 3:** Run the test. Expected: PASS. Tell Chris these loops are replaceable with his own recordings.

### Task 4.2: MediaLoop

**Files:** Create `src/components/MediaLoop.jsx`, `tests/MediaLoop.test.jsx`.

**Produces:** `<MediaLoop src: string, poster: string, alt: string />`: muted, looping, `playsInline`, `preload="none"`, plays only while in view.

- [x] **Step 1:** Tests: `renders the poster with its alt text`; `video is muted, looping and playsInline`; `plays when intersecting and pauses when not`; `never has sound`. Run, see FAIL, implement, run. Expected: PASS.

### Task 4.3: Product chapter

**Files:** Create `src/content/excerpts/product-*.js`, `src/scenes/ProductChapter.jsx`, `tests/ProductChapter.test.jsx`, `e2e/products.spec.js`. Modify `src/pages/Preview.jsx`.

- [x] **Step 1:** Propose one excerpt per product (file named for the product, for example `teachers-toolbox.tsx`) and stop for Chris's approval. Crew Advisors' excerpt comes from `crewadvisors` and is shown typing, unfinished.
- [x] **Step 2:** Tests with real `products` data: `exactly 3 live dots and 3 Open live site links`; `Crew Advisors has no live dot and no link and says coming soon`; `each counter's final text equals its stats value exactly`; `a product without stats renders no counters`; e2e `the code lands on the poster, then the loop plays, and the live link has rel noopener`.
- [x] **Step 3:** Run, see FAIL, implement (the transformation's targets are `imageLayout` of the poster; at the end the MediaLoop crossfades in), run `npm run verify` and `npm run test:e2e`. Expected: PASS. Stop: Phase 4 review.

---

## Phase 5: Door B, templates and previews

### Task 5.1: Template data

**Files:** Modify `src/data/templates.js`, `src/pages/Templates.jsx` (remove `data-aiwp-slot`). Create `tests/templates.data.test.js`.

- [x] **Step 1:** Tests: `the eight existing templates keep their prices in the data` (ignite 89, launchpad 99, monoline 59, terminal 69, gridview 129, control-panel 149, studio 89, atelier 95); `hearth, evergreen, keepsake, vow, gather and folio exist with status concept and no price`; `ids are unique`; `no template has a slot field`; `every template names an excerpt, a previewVideo and a poster that exist`.
- [x] **Step 2:** Run, see FAIL, implement the data model and categories (Family and Memories, Events, Personal and Creative).

### Task 5.2: Preview pages, their excerpts and videos

**Files:** Create `tools/previews/previews.config.js`, `tools/previews/build.mjs`, `tools/previews/record.mjs`, `tools/previews/src/<id>.html` (14), `public/media/templates/<id>.mp4` and `<id>.jpg`, `src/content/excerpts/template-*.js`.

- [x] **Step 1:** Build one static preview page per template from a few shared layouts; each carries a visible "Concept preview" label. Each template's excerpt is taken verbatim from its preview source (real code), with provenance pointing at this repository.
- [x] **Step 2:** `record.mjs` scrolls each page for 6 to 8 seconds, capturing frames with the DevTools screencast, and encodes with the system ffmpeg (H.264, muted, `+faststart`) plus a poster.
- [x] **Step 3:** Run `npx vitest run tests/templates.data.test.js`. Expected: PASS.

### Task 5.3: Templates page and brief prefill

**Files:** Modify `src/pages/Templates.jsx`, `src/pages/Contact.jsx`. Create `tests/Templates.test.jsx`.

- [x] **Step 1:** Read both files. Tests: `no template shows a price or a Buy button`; `every template links to /contact?template=<id>`; `concept templates say Concept preview, coming soon`; `Contact prefills the message from the template query parameter`.
- [x] **Step 2:** Run, see FAIL, implement, run `npm run verify`. Expected: PASS.

### Task 5.4: Door B scenes

**Files:** Create `src/scenes/DoorBIntro.jsx`, `src/scenes/TemplateChapter.jsx`, `tests/TemplateChapter.test.jsx`, `e2e/doorb.spec.js`. Modify `src/pages/Preview.jsx`.

- [x] **Step 1:** Tests: `door b shows the template chapter and door a does not`; `each template compiles from its excerpt to its poster, then its loop`; `no template chapter shows a price`; e2e `choosing door b then scrolling reaches the family-site transformation`.
- [x] **Step 2:** Run, see FAIL, implement (the Door B intro lands the Hearth preview's code on the Hearth poster). Write the Door B copy in plain language, show it to Chris at the stop, and revise on his notes.
- [x] **Step 3:** Run `npm run verify` and `npm run test:e2e`. Expected: PASS. Stop: Phase 5 review.

---

## Phase 6: Your idea, builder, brief, nav, and the swap to `/`

### Task 6.1: Type your idea

**Files:** Create `src/scenes/IdeaSketch.jsx`, `tests/sketchLayout.test.js`, `tests/IdeaSketch.test.jsx`. Modify `src/field/layouts.js`.

**Produces:** `sketchBlocks(idea: string) => {kind: 'header'|'hero'|'calendar'|'grid'|'gallery'|'list'|'posts'|'cta', label: string}[]` and `sketchLayout(blocks, box: Box) => TargetPoint[]`.

- [ ] **Step 1:** Tests: `every sketch has a header, a hero and a cta`; `booking adds a calendar; shop a grid; photos a gallery; menu a list; blog posts`; `an empty idea gives the base sketch`; `input is capped at 120 characters`; `pasted HTML renders as text`; `emoji and other scripts are kept in the DOM and skipped in the flight`; `submitting carries the idea to /contact as the first line of the brief`.
- [ ] **Step 2:** Run, see FAIL, implement (a labeled input that works with no animation), run. Expected: PASS.

### Task 6.2: How I work and the builder

**Files:** Modify `src/components/HowIWork.jsx`. Create `src/scenes/Builder.jsx`, `tests/Builder.test.jsx`.

- [ ] **Step 1:** Tests: `the three principles render with their existing titles`; `the builder photo has alt text and no data-aiwp-slot`. Implement the changelog layout and the builder scene, reusing existing copy verbatim. Run `npm run verify`. Expected: PASS.

### Task 6.3: Contact form and the brief

**Files:** Create `src/components/ContactForm.jsx`, `src/scenes/BriefChapter.jsx`, `tests/ContactForm.test.jsx`. Modify `src/pages/Contact.jsx`.

- [ ] **Step 1:** Read `Contact.jsx` and `api/send-contact-email.js`. Tests: `submits the same payload to /api/send-contact-email as before` (field names read from the file); `shows the existing success and error states`; `prefills from template and idea query parameters`.
- [ ] **Step 2:** Run, see FAIL, extract the form without changing behavior, use it in `Contact.jsx` and `BriefChapter` (the cursor returns to an empty file, now theirs). Run `npm run verify`. Expected: PASS.

### Task 6.4: Door-aware nav, skip link, and the swap

**Files:** Modify `src/components/Nav.jsx`, `src/App.jsx`, `src/field/FieldLayer.jsx`, `public/robots.txt`, `e2e/smoke.spec.js`. Create `src/pages/Home.jsx` (rewritten to compose every scene in order), `tests/Nav.test.jsx`, `e2e/swap.spec.js`.

- [ ] **Step 1:** Tests: `primary action is Start a project for door a and Browse templates for door b`; `skip link is the first focusable element`; e2e `/ renders the Source to Screen experience`, `/preview no longer exists`, `every inner route still loads`, `tab order never traps focus inside a pinned scene`. Remove the "home page unchanged" e2e tests; this task changes the home page on purpose.
- [ ] **Step 2:** Run, see FAIL, implement: nav actions, door switcher and skip link; `/` renders the new home; `FIELD_ROUTES` becomes `['/']`; the `/preview` route and its robots line are removed.
- [ ] **Step 3:** Run `npm run verify` and `npm run test:e2e`. Expected: PASS. Stop: Phase 6 review, the last step before the new home goes live.

---

## Phase 7: Inner pages, router, transitions, retirements

### Task 7.1: Router migration and View Transitions

**Files:** Modify `src/App.jsx`, `src/main.jsx`. Create `e2e/transitions.spec.js`.

- [ ] **Step 1:** Migrate `BrowserRouter` to `createBrowserRouter` with `RouterProvider` (Phase 0 finding b), keeping every route path, `ScrollToTop`, `Analytics`, the 404 route and the Vercel rewrite unchanged; enable `viewTransition` on links. E2E: `every route still loads by URL and by link`; `with startViewTransition removed, navigation still updates URL and content`.
- [ ] **Step 2:** Run `npm run verify` and `npm run test:e2e`. Expected: PASS.

### Task 7.2: Products and Product detail

**Files:** Modify `src/pages/Products.jsx`, `src/pages/ProductDetail.jsx`, `src/components/ProductCard.jsx`, `tools/legacy-files.js`.

- [ ] **Step 1:** Read `docs/PRODUCT-IMAGES.md` first. Restyle with the new tokens; preserve the single `image` field behavior. Test `product detail renders for every slug and Crew Advisors shows no link`. Remove the rewritten files from the legacy list; they gain `// @ts-check`.
- [ ] **Step 2:** Run `npm run verify`. Expected: PASS.

### Task 7.3: Services and Templates pages

**Files:** Modify `src/pages/Services.jsx`, `src/pages/Templates.jsx`, `tools/legacy-files.js`.

- [ ] **Step 1:** Restyle. Test `Services page renders no dollar amount`. Remove both files from the legacy list. Run `npm run verify`. Expected: PASS.

### Task 7.4: About, Contact, footer, 404, checkout success

**Files:** Modify `src/pages/About.jsx`, `src/pages/Contact.jsx`, `src/pages/NotFound.jsx`, `src/pages/CheckoutSuccess.jsx`, `src/components/Footer.jsx`, `tools/legacy-files.js`.

- [ ] **Step 1:** Restyle; keep copy and behavior. Remove the files from the legacy list. Run `npm run verify`. Expected: PASS.

### Task 7.5: Retirements

- [ ] **Step 1:** List the remaining references: `rg -n "data-aiwp-slot|ScrambleText|WireframeCube|CodeTerminal|CustomCursor|Marquee|CheckoutModal" src`. `CheckoutModal` is retired only if nothing uses it once templates have no buy button.
- [ ] **Step 2:** Deleting files on Chris's machine needs permission: request it once with the exact files, or move them to `_to_delete/` if declined. Decide on `CursorGlow.jsx` and `Noise.jsx` with Chris.
- [ ] **Step 3:** Run `npm run verify` and `npm run test:e2e`. Expected: PASS and the search returns nothing. Stop: Phase 7 review.

---

## Phase 8: Full-repo gates, performance, accessibility, SEO

### Task 8.1: Zero exclusions

**Files:** Modify `tsconfig.json` (`checkJs: true`), `eslint.config.js`, `tests/policy.test.js`; delete `tools/legacy-files.js`; fix any file with findings.

- [ ] **Step 1:** Remove the legacy list and turn `checkJs` on. Run `npm run lint` and `npm run typecheck`. Fix each finding at its root cause (no directives).
- [ ] **Step 2:** Run `npm run verify`. Expected: PASS with zero exclusions.

### Task 8.2: Performance, accessibility and SEO

**Files:** Create `e2e/a11y.spec.js`, `e2e/seo.spec.js`. Append results to this file.

- [ ] **Step 1:** Install `@axe-core/playwright`. Tests: `no serious or critical accessibility violations on /, /products, /services, /templates, /about and /contact`; `with JavaScript disabled the static shell still has the title, description and canonical`.
- [ ] **Step 2:** Run Lighthouse against `npm run preview` (mobile and desktop); record LCP, CLS and total blocking time against the targets, and the JavaScript sizes from `npm run build`; set the JavaScript budget from these numbers. Fix regressions.
- [ ] **Step 3:** Record what a crawler sees without JavaScript and give Chris the prerender decision (spec section 11).
- [ ] **Step 4:** Run `npm run verify` and `npm run test:e2e`. Expected: PASS. Update the Progress table. Stop: final review.

## Execution ledger

Task numbers in Phase 0 entries are unchanged. References to later tasks inside those entries use the numbering of the Sky plan in force when they were written; the Source to Screen plan above replaces it.

Baseline before any change (2026-11-08): `npm run build` passed; JS 408.06 kB (129.10 kB gzip), CSS 24.05 kB (5.46 kB gzip).

- Task 0.1: complete (tests: `npm run verify` → exit 0; lint clean, typecheck clean, 3/3 tests, build ok). Gates proven by planted violations: policy test, lint and typecheck each failed on a probe file and passed after it was removed. The production bundle hash was unchanged.
- Task 0.1: Ruling: this section is the ledger, not a git-ignored workspace, because Chris commits and reviews every phase. Cost if wrong: none.
- Task 0.1: Ruling: installs and test runs happen in a Linux scratch copy, and only source and config files are copied back, because the folder's `node_modules` holds Windows-only binaries (`@rollup/rollup-win32-*`, `@esbuild/win32-x64`) that a Linux install would replace. Chris runs `npm install` on Windows after each phase that changes dependencies. Cost if wrong: one extra install.
- Task 0.1: Ruling: ESLint stays on 9.x although npm marks it unsupported, because eslint-plugin-react and eslint-plugin-jsx-a11y do not declare ESLint 10 support. Revisit when they do. Cost if wrong: no upstream fixes for ESLint 9.
- Task 0.1: Ruling: `tools/legacy-files.js` is the single legacy list used by both ESLint and the policy test (the plan had it inline in the ESLint config). `src/components/ScrambleText.jsx` contains an existing `eslint-disable`; it is legacy and retired in Task 6.5. Cost if wrong: none; the list only shrinks and Task 7.1 deletes it.
- Task 0.1: Ruling: `api/**` is excluded from lint because the spec keeps the serverless routes untouched. Cost if wrong: unlinted code in `api/`.
- Task 0.1: Ruling: the two file-system tests run in Vitest's Node environment (`@vitest-environment node`) because jsdom replaces `URL`. Cost if wrong: none.
- Task 0.1: Ruling: added dev dependencies the plan did not list: `@types/node` (Node types for tests and tools), `@testing-library/dom` (required peer of Testing Library 16), `@types/eslint-plugin-jsx-a11y` (types for the ESLint config); added `tests/setup.js`. Vitest pinned to 3.x, which supports Vite 5. Cost if wrong: none.
- Task 0.1: Ruling: `skipLibCheck` is on, so `tsc` checks this repo's code but not third-party `.d.ts` files; `react/prop-types` is off because props are typed with JSDoc and checked by `npm run typecheck`. Neither suppresses an error in this repo's code. Cost if wrong: a type bug inside a dependency's own declarations goes unflagged.

- Task 0.2: complete (tests: `npm run test:e2e` → 1/1 pass; `npm run verify` → exit 0, 3/3 tests, build ok).
- Task 0.2: Ruling: e2e tests and media capture run in the cloud workspace against its installed Chrome, through the `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH` variable in `playwright.config.js`, because the device VM cannot download a browser. Unset, Playwright uses its own Chromium as normal. Cost if wrong: none on Chris's machine.
- Task 0.2: Ruling: the preview server runs on a fixed port (`--port 4173 --strictPort`) so a busy port fails loudly instead of testing the wrong server; `test-results/` and `playwright-report/` were added to `.gitignore`. Cost if wrong: none.
- Task 0.2: Ruling: Task 4.2 now records with the DevTools screencast plus the system ffmpeg, and Task 6.1 now includes the data-router migration; both texts were updated above (findings b and c). Cost if wrong: Task 6.1 touches `main.jsx` and `App.jsx` routing, covered by the e2e route test.
- Task 0.3: complete (tests: `npx vitest run tests/capabilities.test.js tests/governor.test.js` → 14/14; `npm run verify` → exit 0, 17/17).
- Task 0.3: Ruling: "restores 5 percent" means 5 percent of the base per window (linear recovery), and the governor evaluates non-overlapping 24-sample windows and ignores non-finite or negative frame times; both behaviors have tests. Cost if wrong: recovery is slower or faster than intended, tuned in Task 1.2.
- Task 0.4: complete (tests: `npx vitest run tests/tokens.test.js` → 1/1; `npm run verify` → exit 0, 18/18). Full-page screenshots of `/` before and after are pixel-identical (0 differing pixels); the JS bundle is byte-identical; CSS grew 0.03 kB.
- Task 0.5: complete (tests: `npm run verify` → exit 0, 28/28 unit tests; `npm run test:e2e` → 11/11). Full-page screenshot of `/` is pixel-identical to the pre-redesign baseline. Bundle: main JS 130.11 kB gzip (baseline 129.10 kB); the sky chunk (GSAP, Lenis, WebGL) is 54.25 kB gzip and loads only on sky routes.
- Task 0.5: Ruling: type checking is opt-in per file with `// @ts-check` (`checkJs: false`, `strict: true`) instead of `checkJs: true` over listed folders, because `tsc` follows imports and checking `App.jsx` pulled in 55 errors from 16 legacy files. `tests/policy.test.js` now fails any non-legacy file without `// @ts-check`, and `@ts-nocheck` is banned. Task 7.1 switches `checkJs` on for everything. Cost if wrong: none; the policy test enforces the opt-in.
- Task 0.5: Ruling: `ScrollEngine` is mounted inside the lazily loaded `SkyScene`, not directly in `App.jsx` as the plan said, because mounting it in `App.jsx` put GSAP and Lenis in every page's bundle (+54 kB gzip on the live home page). Guarded by the e2e test "the home page does not download the scroll engine or the WebGL starfield". Cost if wrong: none.
- Task 0.5: Ruling: `setGlyphTargets` is not added until Task 1.1, which first uses it, so no unused code ships. Task 0.5's Produces block lists it; Task 1.1 adds it to `Starfield`. Cost if wrong: none.
- Task 0.5: Ruling: the app shell keeps its `bg-[#0a0a0a]` background on regular routes and clears it only on sky routes. Removing it everywhere revealed the hero's `CursorGlow`, which is hidden behind that background on the live site today; the live site is left exactly as it is. Guarded by the e2e test "the page shell stays opaque on regular routes and clears only on sky routes". Cost if wrong: none.
- Task 0.5: Ruling: `tests/setup.js` gives jsdom a minimal `matchMedia` because GSAP's ScrollTrigger calls it on registration; Lenis's recommended CSS rules were added to `src/index.css` (without `!important`). Cost if wrong: none.
- Task 0.5: Ruling: files that used CRLF line endings (`src/App.jsx`, `src/hooks/usePageMeta.js`, `public/robots.txt`) keep CRLF; the repo's `* text=auto` normalizes them in git either way. Cost if wrong: none.
- Task 0.5: Note: the `/_vercel/insights/script.js` 404 seen under `vite preview` is Vercel Analytics, which only exists on Vercel; it predates this work. Instrument Serif could not be confirmed visually because the sandbox cannot reach Google Fonts, so screenshots show the Georgia fallback.
- Re-plan (2026-11-08): the starfield concept was replaced by Source to Screen after a throwaway prototype (cloud workspace only, never in this repo) that Chris and his wife reviewed and approved. Phases 1 to 7 of the Sky plan were rewritten as Phases 1 to 8 above; Phase 0 carries over unchanged. Chris decided: real code only, no template prices or buy buttons for now, and the spec and blueprint keep their file names.

- Task 1.1: complete (tests: `npx vitest run` and `npm run test:e2e` red on the new names first, then `npm run verify` → exit 0, 28/28; `npm run test:e2e` → 11/11). Old `src/sky` files removed from Chris's folder with his deletion permission.
- Task 1.2: complete (tests: `npx vitest run tests/glyphAtlas.test.js` → 7/7, red first).
- Task 1.3: complete (tests: `npx vitest run tests/syntax.test.js tests/layouts.test.js` → 10/10, red first).
- Task 1.4: complete (tests: `npx vitest run tests/transformation.test.js` → 7/7, red first).
- Task 1.5: complete (tests: `npx vitest run tests/excerpts.test.js` → 9/9, red first). The ambient excerpt was checked byte for byte against `git show b670193:src/hooks/usePageMeta.js` lines 35 to 52 in Chris's checkout (identical SHA-256).
- Task 1.5: Ruling: drafts (excerpts Chris has not approved) render only on the unlinked, noindex `/preview` route, through `getExcerpt(id, { includeDrafts })`, which `FieldLayer` enables for that route only, so Chris can see an excerpt before approving it. Everywhere else only approved excerpts render. Cost if wrong: none on live pages; Task 6.4 removes `/preview`.
- Task 1.6: complete (tests: `npx vitest run tests/resolveTransform.test.js` → 3/3; e2e `renderer.spec.js` 3/3, red first; `npm run verify` → exit 0; `npm run test:e2e` → 16/16 after Task 1.7). Reviewed visually at six scroll points.
- Task 1.6: Ruling: the renderer interface differs from the plan: `setAmbient(glyphs, capacity)` takes atlas indices (ambient positions are random, not an editor layout), plus `setAmbientCount`, `setAmbientState` and `setTransformState`. Scenes request a transformation by putting a `TransformSpec` on `fieldBus.transform`; the lazy chunk resolves it (`resolveTransform.js`, `editorMetrics.js`, both new). Phase 1 supports text targets only; image targets are added in Phase 4 where they are first used. Cost if wrong: Phase 4 extends `TransformSpec`.
- Task 1.6: Ruling: capabilities now report `ambientCount` (3500/1800/700) and `transformBudget` (4000/2500/1200) instead of `starCount`. Cost if wrong: retuned in Task 2.2 Step 3.
- Task 1.6: Ruling: the field self-hosts JetBrains Mono 500 and Instrument Serif italic (Fontsource, OFL-1.1) inside its lazy chunk, because the field waits for its font and must not depend on a third-party CDN; live pages still use Google Fonts and are unaffected. Cost if wrong: two font families defined twice on `/preview`.
- Task 1.6: Ruling: the `/preview` route is lazy-loaded so it adds nothing to the live pages' bundle (main bundle 130.17 kB gzip against the 129.10 kB baseline). Cost if wrong: none.
- Task 1.6: Ruling (found in visual review, not by a test): sparse landing text dropped original characters; `resolveTransform` now samples more finely until there are two landing places per code character (test "sparse landing text is sampled more densely so every original character is kept", red first). Note: the first two `resolveTransform` tests were run only after the implementation existed.
- Task 1.6: Ruling (found in visual review, then pinned by a red-first e2e test): `overflow-x: hidden` on the app shell made it a scroll container and broke `position: sticky`; field routes now use `overflow-x: clip`, regular routes keep their original classes. Cost if wrong: horizontal overflow on field routes in browsers older than Safari 16.
- Task 1.7: complete (tests: `npx vitest run tests/CodeBeside.test.jsx tests/fieldBus.test.js` red first; `npm run verify` → exit 0, 68/68; `npm run test:e2e` → 16/16).
- Task 1.7: Ruling: reduced motion now uses the static field and code-beside-result chapters with no canvas (spec section 8), so `FieldStage` lost its reduced-motion path; `fieldBus.mode` ('pending', 'webgl', 'static') tells chapters which form to show. Code displays turn ligatures off so `=>` shows as typed. Cost if wrong: none.
- Task 1.7: Ruling: test infrastructure: `tests/setup.js` calls Testing Library's `cleanup` after each test (automatic cleanup needs Vitest globals, which are off); `pngjs` and `@types/pngjs` added for pixel checks in e2e. Cost if wrong: none.
- Phase 1 review: Chris approved the ambient excerpt (`usePageMeta.js` lines 35 to 52 at b670193) on 2026-11-08; `approved` set in `src/content/excerpts/ambient.js`.
- Phase 1: dependencies changed (`@fontsource/jetbrains-mono`, `@fontsource/instrument-serif`, `pngjs`, `@types/pngjs`): Chris runs `npm install`.

- Task 2.1: complete (tests: `npx vitest run tests/doorStorage.test.jsx` → 6/6 and `tests/Fork.test.jsx` → 2/2, both red first). The door test file is `.jsx` (it renders the provider), not `.js` as planned.
- Task 2.1: Ruling: the fork's button group carries the screen-reader label "What brings you here?" (new wording, not visible on screen); Chris may reword it. `DoorProvider` wraps the whole app because the nav reads the door in Task 6.4 (+0.41 kB gzip on the shared bundle). Cost if wrong: none.
- Task 2.2: complete (tests: `npx vitest run` → 93/93; `npm run test:e2e` → 24/24; reviewed visually at desktop and phone widths). The gate excerpt is this site's entry point, `src/main.jsx` lines 1 to 10 at 43ddef6, a draft until Chris approves it.
- Task 2.2: Ruling: the gate and the awakening are one pinned section in `src/scenes/Gate.jsx` (the plan listed `Awakening.jsx` separately), with the timing as a pure, tested function (`gateTimeline.js`) and the headline geometry shared by the canvas and the h1 (`headline.js`); `CodeLines.jsx` is shared by the gate and `CodeBeside`. The Phase 1 renderer check is retired and its e2e checks now run against the gate. Cost if wrong: none.
- Task 2.2: Ruling (found in visual review): the renderer drew the code at its starting positions before the flight, so the "empty file" showed a ghost copy; the renderer now draws nothing at transformation progress 0. The first e2e test for this proved too weak (it counted the title bar and missed the dimmed ghost); it was rewritten to read only the code area and confirmed by restoring the bug (2291 code pixels) and the fix (0). Cost if wrong: none.
- Task 2.2: Ruling (found in visual review, then pinned by a red-first e2e test): on phones the editor overflowed (532 px on a 390 px screen); `TransformSpec.codeScale` and `editorSize(code, scale)` now scale the editor and the starting characters together. Cost if wrong: small code on phones (about 8.8 px for `main.jsx` at 390 px).
- Task 2.2: Not done: Step 3 (tune the tier budgets from measured frame times). This environment renders WebGL in software, so its frame times say nothing about real devices; budgets are unchanged. Chris checks `/preview` on his phone and reports any stutter.
- Phase 2: tests not watched red first: the `CodeLines` unit tests and the first six gate e2e tests (written before the scene but first run after it existed).
- Phase 2 review: Chris approved the gate excerpt (`src/main.jsx` lines 1 to 10 at 43ddef6) and the fork's screen-reader label "What brings you here?" on 2026-11-08.

- Task 3.1: Step 2 partly done: four real excerpts generated verbatim from fresh clones and checked with `excerpts:verify` (all "ok"): `underfireai` `components/auth/auth-form.tsx` 42 to 69 @ bee33d2 (MVP sprints), `Solo-Founder-OS` `app/(dashboard)/dashboard/page.tsx` 128 to 152 @ 80ffcd6 (custom builds), `crewadvisors` `lib/ai/chat-client.ts` 31 to 54 @ 4b4c3b4 (AI integration), `crewadvisors` `middleware.ts` 51 to 73 @ 4b4c3b4 (audits). They are drafts until Chris approves them.
- Task 3.1: Ruling: Step 3 (capture targets from public pages) replaced by Chris's decision on 2026-11-09 to supply real signed-in screenshots for MVP sprints (UnderFire), custom builds (Founders Helm) and AI integration (Crew Advisors). The product marketing images were rejected because they are AI-generated with garbled interface text ("Foundersheim", "Full Autezme"). Until a screenshot is registered in `src/data/serviceScreens.js`, its chapter shows the code beside the service copy; `tests/serviceScreens.test.js` checks every registered screen exists, is at most 400 kB and matches its recorded size. Cost if wrong: none; the chapters are complete without the flight.
- Task 3.1: Finding outside this repo: underfireai.com's sign-in page renders in Times New Roman (no web fonts load; computed font "Times New Roman"). Reported to Chris, not changed.
- Task 3.2: complete (tests: `npx vitest run tests/chapterTimeline.test.js tests/ServiceChapters.test.jsx` red first, then 9/9; `npm run verify` → exit 0, 111/111; `npm run test:e2e` → 29/29). The services e2e tests were written after the chapters and not watched fail first. The flight path was reviewed visually at desktop and phone widths with a temporary image in the cloud workspace only, then reverted (`git diff` identical, no `TEMP` left).
- Task 3.2: Ruling: image targets were added in Phase 3 rather than Phase 4 because the service chapters need them: `TransformSpec.target` is now a typed text-or-image target, and `FieldStage` decodes image targets and reads their pixels before resolving (tests red first). Cost if wrong: none.
- Task 3.2: Ruling (found in visual review, then pinned by red-first unit tests): the gate's cleanup cleared a transformation the next chapter had already claimed, so flights never drew. `fieldBus` now has keyed ownership (`claimTransform`, `releaseTransform`, `setTransformProgress`); a scene can only clear or move the transformation it owns. Cost if wrong: none.
- Task 3.2: Ruling (found in visual review): on phones the pinned chapter's text collided with the editor; pinned chapters on narrow screens leave out the scope list (it remains in the static and desktop forms). Cost if wrong: phone visitors see the scope list only in the static form.
- Task 3.2: Ruling: the chapters live in one file, `src/scenes/ServiceChapters.jsx` (the plan named `ServiceChapter.jsx`), with pure `chapterTimeline.js` and a shared `useSectionProgress.js` hook (extracted from the gate). The fifth service, acquisition-readiness consulting, has no chapter; the spec names four. The visible label "Timeline:" before each timeline is new wording. Cost if wrong: one more chapter or a reworded label.
- Task 3.2: An `eslint-disable-line` was typed in a draft and removed before any run: the effect now computes its geometry inside the effect from honest dependencies (`flightGeometry` is pure).
- Task 3.3 (2026-11-09): Chris supplied two screens. Founders Helm: a saved copy of `foundershelm.com/dashboard`, rendered with scripts blocked using its own published stylesheets and fonts (fetched from `www.foundershelm.com`), 1800 x 1125 JPEG, 152 kB, registered for custom builds. Chris chose to keep it as saved, including the workspace label "John Allen's Workspace" and the empty account figures. UnderFire AI: his screenshot of the live landing page, cropped to 1416 x 660 above the "Packs from $25" button and the browser scrollbar, JPEG, 115 kB, registered for MVP sprints. AI integration stays code-only until the Crew Advisors screen arrives. Cost if wrong: one file swap in `public/media/services/` and `src/data/serviceScreens.js`.
- Task 3.3: Ruling (Chris, 2026-11-09): the MVP excerpt is now the UnderFire landing hero, `app/page.tsx` lines 334 to 352 @ bee33d2 (badge, headline and pitch, the exact words on the screen it lands on, no price), replacing the sign-in handler. `excerpts:verify` reports "ok". Still a draft until Chris approves it. At 1440 px the 135-character lines draw at about 9 px mid-flight (the sign-in code drew at about 10.5 px). Cost if wrong: switch back to `components/auth/auth-form.tsx` 42 to 69.
- Task 3.3: Ruling (Chris, 2026-11-09): the UnderFire screen is used now although it shows the font bug (Times New Roman instead of Inter); Chris will send a corrected screenshot later. Cause found in `underfireai` @ bee33d2: `app/layout.tsx` defines `--font-inter`, but `tailwind.config.ts` sets `sans` to `['Inter', 'var(--font-sans)', ...]`, and `--font-sans` is never defined, which invalidates the whole `font-family` so the browser falls back to its default serif (`display` and `mono` reference undefined `--font-display` and `--font-mono` the same way). Not changed here; it is another repo. Cost if wrong: the MVP chapter shows the serif headline until the swap.
- Task 3.3: Ruling (found in visual review of the real screens, then pinned by red-first unit tests): dark product screens landed as near-black characters, so the screen never visibly formed before the real image took over. `imageLayout` now lifts every sampled color toward white by `IMAGE_COLOR_FLOOR` (0.3); brighter parts stay brighter, so the screen's layout still reads. Cost if wrong: one constant to tune.
- Task 3.3: Added `e2e/services.spec.js` "a chapter with a screen flies its code onto that screen as the visitor scrolls", proven against a broken flight (claim removed: 8 bright pixels in the stage against more than 400 required) and passing with the flight restored. `visibleCodePixels` moved from `e2e/gate.spec.js` to the shared `e2e/pixels.js`. Verification: `npm run verify` exit 0, 113/113; `npm run test:e2e` 30/30; main bundle 130.66 kB gzip (unchanged).
- Phase 4 note (Chris, 2026-11-09): the My Teachers Toolbox product chapter uses the MTT landing page (public, so it can be captured without signing in). It is not a service-chapter stand-in.
- Task 3.4 (2026-11-09): Chris approved the four service excerpts (`service-mvp`, `service-custom`, `service-ai`, `service-audit`); each records `approved: { by: 'Chris', on: '2026-11-09' }` (tests red first). A phone report of "no animation" was a stale page on the phone, not a fallback; the live deploy at `28fd0dd` was confirmed running WebGL in Chromium with iPhone 13, Pixel 7 and desktop emulation.
- Task 3.4: Ruling (Chris, 2026-11-09: "too far apart section to section", "you can't even see where it says scroll to enter", on phone and web): runways shortened, gate 400vh to 280vh, flight chapters 300vh to 220vh, audit 250vh to 180vh; the fork section loses `min-h-[70vh]` for `py-16 lg:py-20`; static chapters `py-24` to `py-16`; preview footer `pb-24` to `pb-16`. Page length 14.9 to 10.7 screens on desktop (1440 x 900), 16.3 to 12.1 on a phone (390 x 844). Timelines keep their ratios. Cost if wrong: retune the four heights.
- Task 3.4: Ruling (cause found by measurement, pinned by red-first e2e at 1440 and 390 wide): "Scroll to enter" was below the screen at load (y 909 on a 900 px screen) because the sticky nav took 57 px of page flow above the pinned gate frame. On field routes the nav is now `fixed` over the page (`Nav overlay`); regular routes keep `sticky`, and `/` stays pixel-identical to the pre-redesign baseline. Pinned frames use `.pin-frame` (`100vh`, then `100dvh`) so a phone's toolbar never hides a frame's bottom, matching the `innerHeight` the scenes lay out against. The cue is larger and brighter (`text-xs`, white at 80 percent) and fades over the first tenth of the gate instead of 6 percent. The static gate pads `pt-24` to clear the overlaid nav. Cost if wrong: revert the `overlay` prop.
- Task 3.4: verification: `npm run verify` exit 0, 114/114; `npm run test:e2e` 32/32. Main bundle 130.70 kB gzip (+0.04 kB, the nav's `overlay` prop).
- Task 3.5 (Chris, 2026-11-09: "fix recover animation auto on phone"): a lost GPU context no longer drops the page to the static field for the rest of the visit. `src/field/contextRecovery.js` (`watchContext`) cancels the loss event so the browser may restore the context, stops drawing, and asks for one restart when the context is restored or after `RESTORE_WAIT_MS` (2 s) of the page being visible; time in the background does not count. `FieldScene` remounts `FieldStage` with a new key, so each restart gets a new canvas and context and picks up the current transformation from `fieldBus`. After `MAX_FIELD_RESTARTS` (3) in one visit the page settles on the CSS field; a GPU that cannot give a new context also falls back. Tests: 7 unit tests for the watcher and 4 e2e tests replacing "a lost WebGL context swaps to the CSS field" (restored, never restored, no new context, restart cap), all red first except "no new context", which already held and still does; plus "after a lost context is restored mid-flight, the fresh canvas keeps drawing the flight", proven against a disabled restart (fails) and passing with it. Cost if wrong: tune the wait or the cap.
- Task 3.5: verification: `npm run verify` exit 0, 121/121; `npm run test:e2e` 36/36; `/` pixel-identical; main bundle 130.69 kB gzip (the field chunk carries the watcher). Not verified on a real phone: Safari's engine cannot be downloaded in the workspace; the restore path uses the standard `webglcontextlost`/`webglcontextrestored` events Safari implements.
- Task 4.1 (2026-11-09): Ruling (Chris, 2026-11-09: "use landing page for MTT"): the My Teachers Toolbox loop is made from its public landing page, not its public demo. All three loops come from public landing pages only (`www.myteacherstoolbox.com`, `www.underfireai.com`, `www.foundershelm.com`), captured by `tools/media/capture-products.mjs` with headless Chromium at 1440 x 900 (scale 1.25) instead of the built-in browser, so Chris can re-run it (`npm run media:capture`, then `npm run media:loops`). Frames: My Teachers Toolbox 4 (hero, "Everything you need.", "Do the math on your own week.", the second row of tools); UnderFire AI 5 (hero cropped above its "Packs from $25" button, features, interview formats, five steps, FAQ); Founders Helm 5 (hero, "Not another tab.", "Ship the page", the AI advisor, "Everything else you were also paying for."). The capture refuses any frame whose visible text shows a dollar figure or a withdrawn My Teachers Toolbox claim ("46 countries", "new teachers", "first-year teacher"); it refused MTT's FAQ (subscription prices in its open answer), and its "Three steps" frame was dropped because its steps had not animated in. Founders Helm's hero and AI advisor frames carry an explicit `notPrices` reason: their dollar figures are sample MRR, deal and churn values inside product illustrations, the same kind of figure as the approved custom-build screen. Cost if wrong: drop or move those two frames and re-run.
- Task 4.1: `tools/media/make-loops.mjs` crossfades the frames (0.5 s fades, holds scaled so every loop is 7.5 s), ends on the first frame so it loops without a jump (last vs first frame: mean difference 2.4 to 3 of 255, compression only), and encodes 1280 x 800 H.264 at 30 fps, CRF 24, `+faststart`, no audio track; the poster is that first frame. Sizes: My Teachers Toolbox loop 455 KB and poster 106 KB, UnderFire AI 666 KB and 93 KB, Founders Helm 552 KB and 96 KB. `previewVideo` and `poster` were added to the three live products in `src/data/products.js` (CRLF kept; no page reads them yet, and `/` stays pixel-identical). The UnderFire loop shows the Times New Roman font bug until Chris fixes it and re-runs the two scripts. These loops are replaceable with Chris's own recordings.
- Task 4.2 (2026-11-09): `src/components/MediaLoop.jsx` adds, beyond the four planned tests: an `active` prop (default true) so the product chapter can hold the loop until the code has landed; no playback with reduced motion (the poster stays); the `muted` attribute set directly (React sets only the property, and iOS autoplays inline video only with the attribute) and any unmuting undone at once; a blocked autoplay keeps the poster; `pause()` only after it started playing. 7 tests, red first.
- Task 4.1 and 4.2 verification: `npm run verify` exit 0, 133/133; `npm run test:e2e` 36/36; `/` pixel-identical; main bundle 130.74 kB gzip (+0.05 kB, the new `products.js` fields).
- Note (2026-11-09): this session continued on a second computer (`C:\Users\cja86`), where the repo sits at `Desktop\AllenCode\AllenCode` and is checked out with CRLF line endings. Its tree at `ae12da2` matched the workspace exactly once line endings were normalized.
- Task 4.3 (Chris, 2026-11-09: "approved continue"): the product excerpts, each verbatim and approved: `product-my-teachers-toolbox` (`teachers-toolbox.tsx`, My-Teachers-Toolbox `app/_landing/Hero.tsx` 58 to 86 @ e9bc8fc, generated on Chris's machine from `git show` of that commit, never from his uncommitted working tree); `product-underfire-ai` (`underfire.ts`, `lib/ai/mood-engine.ts` 37 to 52 @ bee33d2); `product-founders-helm` (`founders-helm.tsx`, Solo-Founder-OS `components/marketing/sections/hero.tsx` 19 to 41 @ 80ffcd6); `product-crew-advisors` (`crew-advisors.ts`, `lib/advisor/checkin-scheduler.ts` 9 to 38 @ 4b4c3b4). Passed over and offered: MTT's AI tier routing (publishes model and provider choices) and UnderFire's personality-to-behavior prompt mapping.
- Task 4.3: what service and product chapters share (layout, `flightGeometry`, the editor a flight leaves, the transform claim and release as `useImageFlight`, `EditorPanel`) moved unchanged from `ServiceChapters.jsx` to `src/scenes/flight.jsx`; the 17 gate and service e2e tests passed before and after. `EditorPanel` gained optional `visible` and `cursor` props for a file still being written.
- Task 4.3: `src/scenes/ProductChapter.jsx` (default `ProductChapters`) renders every product in `products.js` order after the service chapters on door A. A live product with a loop flies its code onto the loop's poster (`imageLayout` of the poster) while its first `COUNTERS_SHOWN` (4) stats count up over the first 55 percent of the chapter; at the handoff the `MediaLoop` fades in and turns `active`, so it plays only once the code has landed. Without the renderer or with reduced motion it shows the copy, the code and the loop side by side, counters at their values. Status: a pulsing ember dot, "Live" and an "Open live site" link (`target="_blank"`, `rel="noopener noreferrer"`, "opens in a new tab" for screen readers); a product that is not live says "Coming soon", has no dot, no link, and its file types from 15 to 65 percent of its characters as the visitor scrolls and never finishes, cursor blinking (still at 65 percent with reduced motion). Ruling (found by a red test): `countText` counts only a value that begins with its number; a range such as `K–5` is not a quantity and stays as it is.
- Task 4.3: tests: `tests/ProductChapter.test.jsx` (10, with the real `products` data: every product in order with its excerpt, 3 live dots and 3 links, Crew Advisors coming soon with no dot or link and an unfinished file, counters end on their exact values, no counters without stats, the static code beside the poster, and `countText`), `e2e/products.spec.js` (5: order after the services; the code lands on the poster, then the loop plays muted, and the live link has `rel` noopener; counters count with the scroll and end exact; Crew Advisors types and never finishes; reduced motion shows code beside the poster and plays nothing). The e2e tests were written after the component; the loop test was proven by holding the loop inactive (fails: "Received: false") and passes with it restored.
- Phase 4 verification: `npm run verify` exit 0, 144/144; `npm run test:e2e` 41/41; `/` pixel-identical to the pre-redesign baseline; main bundle 130.75 kB gzip (the chapters ship in the lazy `/preview` chunk, 6.46 kB gzip).
- Task 5.1 (2026-11-09): `src/data/templates.js` (legacy, unchanged otherwise): `slot` removed; the eight originals keep `price`, `tags` and `image`; all 14 templates get `status`, `previewVideo`, `poster` and `excerpt` (`template-<id>`); six concepts added without a price (Hearth, Evergreen, Keepsake in Family and Memories; Vow, Gather in Events; Folio in Personal and Creative) with plain-language tags. Ruling: every template, the original eight included, is `concept`, because Chris called the existing entries stand-ins for ideas (decision 4); one word per template changes this when a real template ships. Ruling (found at the end-of-phase screenshot): `Footer.jsx` lists `templateCategories`, so `/` now differs from the baseline in exactly one place, the footer's Templates column gaining the three new categories (diff box x 1039 to 1197, y 6731 to 6815; page height unchanged). Recorded as intended rather than worked around; the Phase 6 swap replaces the footer anyway. Cost if wrong: one extra export for the footer.
- Task 5.2 (2026-11-09): `tools/previews/previews.config.js` holds each concept's invented content (no prices, no reviews, no testimonials, drawn landscapes instead of photos); `tools/previews/build.mjs` renders it with five shared layouts (landing, portfolio, dashboard, family, event) into `tools/previews/src/<id>.html`, each with a fixed "Concept preview" label and fonts loaded from the repo's own Fontsource packages so a re-record matches. Fixed during review: `.wrap` shorthand padding was beating `section` padding (no vertical spacing) and layout shorthands were wiping side padding; the event band's drawing now fills its width; the dashboards gained a "Recent activity" card so their loops have something to scroll; the drawing's gradient is written across short lines so excerpts stay readable. `tools/previews/record.mjs` films each page at 1280 x 800: 0.6 s hold, 5.4 s eased scroll, 1 s hold, then a 0.5 s crossfade to the first frame (7.0 s, seams 1.5 to 4.8 of 255). Ruling: frames are DevTools captures stepped one per frame instead of a live screencast, so the motion is smooth on any machine. Loops 145 to 206 KB, posters 29 to 61 KB, no audio track.
- Task 5.2: proposed excerpts (verbatim lines of `tools/previews/src/<id>.html`, to be pinned to the commit in which Chris commits those pages, then approved): `atelier` 42 to 50; `control-panel` 52 to 72; `evergreen` 45 to 64; `folio` 42 to 50; `gather` 43 to 62; `gridview` 52 to 72; `hearth` 45 to 64; `ignite` 49 to 64; `keepsake` 45 to 64; `launchpad` 49 to 64; `monoline` 42 to 50; `studio` 42 to 50; `terminal` 42 to 50; `vow` 43 to 62. Each covers what that template's poster shows (header and hero; the dashboards' sidebar and first two cards).
- Task 5.3 (2026-11-09): `src/pages/Templates.jsx` (legacy): no price, no Buy button, no checkout; each card plays its loop while hovered or focused (posters on touch screens), says "Concept preview, coming soon" and links "Ask about this template" to `/contact?template=<id>`; the page copy no longer says "Buy once". `src/pages/Contact.jsx` (legacy): `?template=<id>` prefills the message ("I'd like to talk about the <name> template.") and picks a new project type "Website from a template" (the API route takes the type as free text, unchanged); labels are now tied to their fields with `htmlFor` and `id` (found by the tests: the fields had no accessible names). Tests: `tests/templates.data.test.js` (7) and `tests/Templates.test.jsx` (7), red first.
- Tasks 5.1 to 5.3 verification: `npm run verify` exit 0, 158/158; `npm run test:e2e` 41/41; `/` identical except the footer's Templates column (above).
- Task 5.2 excerpts (Chris, 2026-11-09: "its good continue", after reviewing the previews): Chris committed the preview pages in `ebbc6f8`; the 14 `template-<id>` excerpts are the proposed ranges of `tools/previews/src/<id>.html` at that commit, approved 2026-11-09, verified line for line on Chris's machine (`excerpts:verify`).
- Task 5.4 (2026-11-09): Door B's words live in `src/content/doorB.js` so Chris can edit them in one place. `src/scenes/DoorBIntro.jsx` ("What I can make you"): the Hearth excerpt flies onto the Hearth poster, then its loop plays (the same 220vh flight as the product chapters), beside the plain-language intro. `src/scenes/TemplateChapter.jsx`: Ruling: one pinned chapter cycles through the Door B templates after Hearth (Evergreen, Keepsake, Vow, Gather, Folio, taken from the data by category) instead of one chapter each, so Door B stays as tight as Door A (each template gets 0.9 of a screen; whole page 11.5 screens at 1440 x 900). Each segment holds its code for the first 15 percent, flies by 65 percent, then plays its loop; only the active segment claims the field. Found while testing: the first timing (flight from 8 percent) left about 65 px to read the code, so the hold was raised to 15 percent and pinned by a unit test. Each template links "Ask about this template" to `/contact?template=<id>`, and "See every template" links to `/templates`. Without the renderer or with reduced motion each template's code sits beside its preview. Tests: `tests/TemplateChapter.test.jsx` (6, red first, including the whole preview page: door B shows the intro and template chapter and no products; door A the reverse) and `e2e/doorb.spec.js` (4: the family-site transformation and its loop; each template compiled in turn then playing; reduced motion; no price). The cycle test was proven by pinning the active segment to the first template (fails: "element(s) not found").
- Task 5.4: two Phase 4 e2e tests read the page straight after a scroll jump and could run before React re-rendered (the Crew Advisors test failed 1 time in 3); both now wait with `expect.poll` (8 of 8, then 3 repeats of the product and Door B specs).
- Note: preview screenshots must be taken from a fresh `npm run build`; a `dist` left by a deliberately broken e2e check showed a stuck chapter that the source did not have.
- Phase 5 verification: `npm run verify` exit 0, 165/165; `npm run test:e2e` 45/45; `/` differs from the baseline only in the footer's Templates column (identical to the end of Task 5.3); main bundle 132.13 kB gzip (+1.38 kB: the Templates page, which loads with the main app, now uses `MediaLoop`).

## Phase 0 findings

Recorded 2026-11-08 during Task 0.2.

- **(a) GSAP licensing:** GSAP and all its plugins, including ScrollTrigger, are free for commercial use under the standard no-charge license (effective 2025-04-30). The license prohibits using GSAP in no-code visual animation or site-building tools that compete with Webflow. This site is a permitted use. Check the license before putting GSAP inside AWP or ColabMotion. Sources: https://gsap.com/community/standard-license/ and https://webflow.com/blog/gsap-becomes-free
- **(b) View Transitions and the router:** installed react-router-dom is 6.30.4. Its source only calls `document.startViewTransition` inside `RouterProvider` (data router). Under the current `BrowserRouter`, `viewTransition` on `<Link>` does nothing, and `useViewTransitionState` (used by `<NavLink viewTransition>`) throws. Task 6.1 therefore migrates to `createBrowserRouter`.
- **(c) Headless browser and video:** the device VM cannot download Playwright's browser (network allowlist returns 403) or install system packages (no root). The cloud workspace has Google Chrome for Testing 153 at `/usr/bin/google-chrome`; Playwright drives it through `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`, and WebGL2 works in it headless. Playwright's built-in `recordVideo` fails there because its bundled ffmpeg build is missing; capturing frames with the DevTools screencast and encoding with the system ffmpeg works (verified: 41 frames encoded to a 1.7 s H.264 MP4). On Chris's Windows machine, `npx playwright install chromium` once is enough and the variable stays unset.
