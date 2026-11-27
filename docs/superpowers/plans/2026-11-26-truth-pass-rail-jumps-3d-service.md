# Truth pass, rail jumps, and the immersive 3D service — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (chosen by Chris: native execution) to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking. In this repo Chris makes every commit, so "Stop" steps replace commit steps.

**Goal:** Say only what is true on every page and to every crawler; shorten the business road by a quarter (Chris, 2026-11-26) and let a visitor jump to any stop on either road; add an immersive 3D website service with this site as its case study.

**Architecture:** Phase 1 touches data, copy, the rail's names, the nav and the build's head writer (`tools/prerender/html.mjs`, `usePageMeta`). Phase 2 gives the home's world the drive the inner pages already have (`drive.js`, as `stretchWorld.js` uses it), a small jump module registered like `scroll/glide.js`, rail buttons and a Chapters list, and one dimming rect in the world's shader. Phase 3 adds a service through the existing data paths (`services.js` → `SERVICE_CHAPTERS` → the business road), and a `/work/:slug` page with its own stretch, sitemap entry and structured data.

**Tech Stack:** unchanged. Vite 5, React 18, React Router 6.30, Tailwind 3, GSAP 3.15 with Lenis, hand-written WebGL2; Vitest with Testing Library, Playwright with axe, Lighthouse 12.

**Spec:** `docs/superpowers/specs/2026-11-26-truth-pass-rail-jumps-3d-service-design.md`

## Global Constraints

- No `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, `as any`, `eslint-disable`, `suppressHydrationWarning` or `ignoreBuildErrors`. Every new or changed JS file starts with `// @ts-check`.
- No placeholder or mock content. Copy, excerpts and numbers are Chris's or measured; nothing is invented.
- Real code only: a new excerpt is verbatim at a recorded commit, `approved: null` until Chris approves it, and never renders before then.
- No prices and no buy buttons for services or templates. `startingPrice` stays in the data only.
- No new runtime dependencies. The world stays hand-written WebGL2.
- Approved copy unchanged: "It all starts with an empty file…" and "Welcome to Allen Code Co. What would you like to build today?".
- The family road's length and spacing, Plain view's animations and the fork's cards are not changed (Chris, 2026-11-26). The business road is shortened by exactly a quarter, in Task 1.7 only.
- CLS under 0.1 on every page, world on and off. Accessibility and SEO 100. `npm run budget` passes (entry script limit 152 kB).
- `npm run verify` after every task. `npm run test:e2e` whenever a task touches routes, scenes or the renderer. The world's e2e specs run on Chris's machine: the cloud Chrome has no GPU (ledger, 2026-11-19).
- Session rules of the blueprint apply: read each file before editing it, never branch, commit or push, and stop at the end of every phase for Chris's review.

## Review Focus

1. **A jump in every state.** From the gate to the last stop and back; with no door (only the opening's stops); while a flight is mid-way; while Lenis is gliding; during a resize. Each time: no canvas left faded, no drive left running, and `data-active-stop` is the stop chosen. Under StrictMode's double mount: no second ticker or listener.
2. **The rail and the list.** By keyboard: Tab reaches Chapters; Enter opens it; arrow keys and Tab move through it; Escape closes it and focus returns. After a jump, focus is on the stop's heading. On a phone: the list never covers the stop's words once closed, and the rail never blocks the fork's swipe (`touch-action`).
3. **Structured data.** Valid JSON, safe inside `<script>` (no raw `<`), exactly one Organization per page, no price anywhere, the same block in the prebuilt HTML and after hydration.
4. **The new page.** Reads in full without JavaScript, holds its stretch's space before first paint (CLS), spells its own word and not LOST, has its own title, canonical and CreativeWork.
5. **The new road stop.** Every landmark keeps 97–101% of its glyphs on every tier, the opening stays full, and the camera's fastest 4 px of scroll stays within 0.15.

---

## Phase 1: Truth pass

### Task 1.1: The rail names the roads from `roadNames.js`

**Files:** `src/world/rail.js`; Test: `tests/worldJourney.test.js` (or a new `tests/rail.test.js`).

- [x] Step 1: Test: `railStops(routeFor('b'), sections)` names road B `templates/custom/` and road A `business/`, both read from `ROAD_NAMES` in `roadNames.js`.
- [x] Step 2: Run. Expected: FAIL (`family/`).
- [x] Step 3: Delete the local `ROAD_NAMES` in `rail.js` and import the one in `roadNames.js`.
- [x] Step 4: Run the unit suite. Expected: pass.

### Task 1.2: One EMPTY FILE

**Files:** `src/world/JourneyRail.jsx`; Test: `tests/JourneyRail.test.jsx` (new).

- [x] Step 1: Tests: at progress 0 the words "empty file" appear once in the rail's visible text, and the top end label carries the current-stop style; at a middle stop the moving label shows that stop's name; at the last stop the bottom end label is current and no moving label shows. `aria-current="step"` is on the current stop each time.
- [x] Step 2: Run. Expected: FAIL.
- [x] Step 3: Implement (spec, "My calls": the ends name their own stops).
- [x] Step 4: Run. Expected: pass.

### Task 1.3: The Services headline and the About line (wording approved by Chris, 2026-11-26)

**Files:** `src/pages/Services.jsx`, `src/pages/About.jsx`; Test: `tests/InnerPages.test.jsx`.

- [x] Step 1: Chris approved "Custom work, scoped upfront." and "Three live products, a fourth in the works, and a growing client roster"; the `builder` excerpt is kept as it is ("just keep code excerpt").
- [x] Step 2: Tests: the approved lines render; "priced upfront" and "Four live products" appear nowhere in `src/pages`.
- [x] Step 3: Run. Expected: FAIL.
- [x] Step 4: Change the two strings.
- [x] Step 5: Run the unit suite and `npm run excerpts:verify`. Expected: pass (the `builder` excerpt is at its own commit).

### Task 1.4: `llms.txt` matches the site

**Files:** `public/llms.txt`.

- [x] Step 1: Rewrite the Templates line from `src/data/templates.js`: its categories, which entries are `ready` (with their demo links) and which are concepts, built with Vite and React. No prices. The Products and Services lines stay as they are.
- [x] Step 2: Check every sentence against `products.js`, `services.js` and `templates.js`. Nothing in the file is said that the data does not say.

### Task 1.5: Each page's own structured data

**Files:** `src/seo/structuredData.js` (new), `src/hooks/pageMetaContext.js`, `src/hooks/usePageMeta.js`, `src/entry-server.jsx`, `tools/prerender/html.mjs`, `tools/prerender/prerender.mjs`, `src/pages/Services.jsx`, `src/pages/ProductDetail.jsx`, `src/pages/Products.jsx`, `src/pages/Templates.jsx`, `src/pages/About.jsx`, `src/pages/Contact.jsx`; Tests: `tests/structuredData.test.js` (new), `tests/prerenderHtml.test.js`, `tests/serverRender.test.jsx`, `e2e/prerender.spec.js`.

**Interfaces — Produces:**
- Pure builders, each returning a plain object:
  - `serviceList(services)`: an ItemList of Service, provider the Organization, never a price;
  - `softwareApplication(product)`: `operatingSystem: "Web"`, creator Chris; no offers, no ratings;
  - `person()`: from the facts already in `index.html`;
  - `breadcrumbs(path, name)`;
  - `creativeWork(caseStudy)`, used in Phase 3.
- `jsonLdScript(objects)`: the `<script type="application/ld+json" data-page-ld>` markup, with every `<` written as `<`.
- `PageMeta` gains `jsonLd: object[]` (empty by default). `usePageMeta(title, description, { jsonLd })` reports it during the server render, and in the browser keeps one `script[data-page-ld]` in step.
- `applyHead` writes it before `</head>`. The site-wide Organization block in `index.html` is untouched.

- [x] Step 1: Unit tests for each builder: required fields present; no `price`, `offers` or `aggregateRating` key anywhere (deep check); `jsonLdScript` escapes `</script>` in a description.
- [x] Step 2: `prerenderHtml` and `serverRender` tests:
  - `/services` holds an ItemList with one Service per entry in `services.js`;
  - `/products/underfire-ai` holds a SoftwareApplication with its url;
  - `/about` holds a Person;
  - every inner page holds a BreadcrumbList;
  - `/` holds none of its own;
  - every page still holds exactly one Organization.
- [x] Step 3: Run. Expected: FAIL.
- [x] Step 4: Implement.
- [x] Step 5: e2e `prerender.spec.js`: with JavaScript off, each page's blocks parse as JSON and match the above. With JavaScript on, after moving from `/services` to `/about`, only the Person block and its breadcrumbs remain.
- [x] Step 6: `npm run verify`; `npm run test:e2e`. Expected: pass.
- [ ] Step 7: Once deployed, check one page each in Google's Rich Results Test and the Schema.org validator (they read a public address).

### Task 1.6: The primary action in the bar from 640 px

**Files:** `src/components/Nav.jsx`; Tests: `tests/Nav.test.jsx`, `e2e/a11y.spec.js`.

- [x] Step 1: Tests: at 768 px the primary action is visible in the bar next to the menu button and follows the door (`primaryAction`); at 375 px it is in the menu only; at 1280 px the full bar is as today.
- [x] Step 2: Run. Expected: FAIL at 768 px.
- [x] Step 3: Implement: the existing link, shown from `sm` to below `xl`, with no second copy in the accessibility tree at any width.
- [x] Step 4: Run; axe passes on the nav at 375, 768 and 1280 px.

### Task 1.7: The business road about a quarter shorter (Chris, 2026-11-26)

**Files:** `src/world/roadLayout.js` (`roadStepFor('a')`: 32, about three quarters of `BUSINESS_STEP`; 31.5 exactly put every other stop mid-piece), `src/scenes/WorldRoadChapters.jsx` (`ROAD_BEFORE.a`: 80 × 32 / 14 = 182.86vh), and, only if the budget tests show it must, `WORLD_SCALE` for the business road; Tests: `tests/worldRoadLayout.test.js`, `tests/worldRoadShape.test.js`, `tests/worldTrack.test.js`, `tests/worldRoadMotion.test.js`, `tests/worldSurroundings.test.js`, `tests/worldGround.test.js`, `tests/worldJourney.test.js`, `e2e/worldbusiness.spec.js`.

- [x] Step 1: Tests: `roadStepFor('a')` is 32 (a whole number) and `roadStepFor('b')` is 42; the business road's stops stand 32 apart and its page holds 80 × 32 / 14 vh before each; the camera's pace (screens per unit of road) is the same on both roads; the family road's layout is unchanged.
- [x] Step 2: Run. Expected: FAIL.
- [x] Step 3: Implement.
- [x] Step 4: Run the whole unit suite. The guards that must still pass: every landmark keeps 97–101% of its glyphs on every tier, the opening stays full, the long road fits each tier's budget drawn around the camera, and the camera's fastest 4 px of scroll stays within 0.15. Tune `WORLD_SCALE` only if one of them fails, and record why. Done: the landmarks rose to 470 / 777 / 1296 glyphs (low / mid / high) on the shorter road, against 347 / 560 / 886 before; `WORLD_SCALE.a` 1.985 / 1.7 / 1.75 → 1.8 / 1.535 / 1.565 brings them back to 346 / 557 / 885 with the road's density unchanged; the busiest cut 7,653 / 14,080 / 24,072 of 12,000 / 24,000 / 40,000.
- [x] Step 5: `npm run budget` (code world chunks within their lines).
- [ ] Step 6: Chris, on his machine: `npm run test:e2e` (the world specs need a GPU), then a look at the business road on desktop and iPhone.

### Task 1.8: Gates and record

- [x] Step 1: `npm run verify`; `npm run test:e2e`. Result: verify exit 0 (555/555 unit), e2e 257/257 (on the cloud Chrome, whose software WebGL runs the world specs too).
- [x] Step 2: Lighthouse 12 on `npm run preview`, phone and desktop, `/`, `/services`, `/about`: accessibility and SEO 100, CLS under 0.1, no regression against an unchanged `d959438` build on the same machine (numbers in the blueprint row).
- [x] Step 3: Add this plan's row to the blueprint's Progress table with the real output.
- [ ] Step 4: Stop for Chris's review and commit.

---

## Phase 2: Jumps on the road

### Task 2.1: Where each stop is

**Files:** `src/world/rail.js`; Test: `tests/worldJourney.test.js`.

**Interfaces — Produces:** `railStops` entries gain `y`, the scroll offset a jump lands at: the stop's share times `journeyLength`, the same mapping the rail's marker uses (`scrollY / length`). The end entry is Start a project, landing at the brief (the end section's end).

- [x] Step 1: Tests: for both doors and none, every stop's `y` is inside the page; the stops' `y` rise in order; a rest stop's `y` is its section's `from`; Start a project's `y` puts the brief's top on screen. Done in `tests/rail.test.js` (beside the rail's other tests) rather than `worldJourney.test.js`.
- [x] Step 2: Run. Expected: FAIL.
- [x] Step 3: Implement. Each stop also gains an `id` (`empty-file`, `into-the-code`, `the-fork`, `business-road` or `family-road`, each rest's own id, `brief`) for its focus target. `y` is rounded up to a whole pixel (`Math.ceil`): a rest that starts at a fractional offset was landed one pixel short of it, on the road, when the browser rounded the scroll down.
- [x] Step 4: Run. Expected: pass.

### Task 2.2: The drive on the home page

**Files:** `src/world/jump.js` (new), `src/world/homeWorld.js`; Test: `tests/worldJump.test.js` (new).

**Interfaces — Produces:**
- `jump.js`, registered the way `scroll/glide.js` is:
  - `requestJump(y)`: asks the world to drive to `y`;
  - `setJumpHandler(fn | null)`: the home world registers while it runs;
  - with no handler, `requestJump` falls back to `glideTo(y, { instant: true })`.
- A pure `jumpAt(elapsed, request)` returns the drive's half and travel (from `driveAt`), and `scrollNow: true` exactly once, at the swap.
- `homeWorld.frame` plays the drive as `stretchWorld.frame` does:
  - the out half from `renderer.lastCamera`, as the world fades;
  - at the swap, `glideTo(y, { instant: true })`;
  - the in half from behind the camera at the new `y`, as the world fades in.
- A request during a drive changes its target. The in half lands on the newest target.

- [x] Step 1: Unit tests for the pure step (named `jumpStep(jump, now)`, it takes the jump's start and target rather than an elapsed time): no scroll in the out half; the scroll exactly once at the swap, then in from behind; done at the drive's end fully shown, and a jump whose frames were missed still lands; a new target before the swap is where it lands, one after it moves the page again; `requestJump` goes to the world while it runs and otherwise jumps the page at once (reduced motion, no WebGL); a world that goes leaves a newer world's handler in place (`clearJumpHandler(own)`, for StrictMode and a lost GPU context). `tests/worldJump.test.js`, 6 tests.
- [x] Step 2: Run. Expected: FAIL.
- [x] Step 3: Implement. `requestJump(y, onArrive)` takes a callback for the focus move; `homeWorld` clamps `y` to the page's scroll height, and with no `renderer.lastCamera` yet it jumps the page at once.
- [x] Step 4: Run. Expected: pass.

### Task 2.3: The rail's buttons and the Chapters list

**Files:** `src/world/JourneyRail.jsx`, `src/world/WorldLayer.jsx`; Tests: `tests/JourneyRail.test.jsx`, `e2e/worldjump.spec.js` (new).

- [x] Step 1: Unit tests (`tests/JourneyRail.test.jsx`, 8):
  - with a fine pointer, each stop has a mark that jumps to it; with a coarse pointer, none are drawn. Changed while building: the marks are for the pointer only (`aria-hidden`, out of the tab order), and the Chapters list is the one way for keyboards and screen readers, so a screen reader does not hear every stop twice, once as a mark and once in the list;
  - marks are at least 24 px apart where the stops are closer, and in order;
  - Chapters toggles `aria-expanded` and lists every stop, then Start a project;
  - choosing calls `requestJump` with that stop's `y`, closes the list and returns focus;
  - Escape closes the list.
- [x] Step 2: e2e (`?world=1`, door a, desktop and 375×812), `e2e/worldjump.spec.js`, 7 tests:
  - jumping from the gate to the third service rests on it, with its words visible and `data-active-stop` its name (Custom Web Development; the drive's halves are checked in order, `out` then `in`, rather than by timing, since the cloud's software WebGL can take a frame longer than a half; the timing is the unit tests');
  - the canvas's opacity is back to 1 within 1 s;
  - a mark click lands on its stop (Founders Helm);
  - focus is on the stop's heading;
  - Start a project lands on the brief;
  - with no door, the list holds only the opening's stops;
  - axe passes with the list open.
- [x] Step 3: Run. Expected: FAIL.
- [x] Step 4: Implement. Each stop's heading is its focus target: `tabindex="-1"` is set when it is focused (with `preventScroll`), on arrival. The list closes on Escape (focus back to Chapters) and on a pointer down outside it.
- [x] Step 5: Run the unit suite; the e2e. Expected: pass. Ran on the cloud Chrome (its software WebGL runs the world specs); Chris's machine still owed with the rest of `test:e2e`.

### Task 2.4: Readable stops

**Files:** `src/world/worldShaders.js`, `src/world/worldRenderer.js`, `src/world/homeWorld.js`, the chapters' word boxes in `src/scenes/WorldRoadChapters.jsx` (one `data-world-words` mark each); Tests: `tests/worldTrack.test.js` or a new pure test for the rect, `e2e/worldbusiness.spec.js`.

**Interfaces — Produces:** `renderer.setWordsRect(rect | null)`, a screen rect in device pixels. The flight's fragment shader multiplies alpha by 0.25 inside it. Road, ground and landmark glyphs are unchanged. `homeWorld` sets the rect from the current stop's `data-world-words` box while a flight plays, and clears it otherwise.

**As built (2026-11-26):** the rect is passed per frame, `renderer.render(…, { words })`, in clip space (`src/world/wordsRect.js`: `wordsRectNdc`, padded 12 px, y up; `NO_WORDS` when there is no box, an empty box or one off screen), so device pixel ratio never enters it. The dimming is in the flight's **vertex** shader (`uWordsRect`, `uWordsDim` = `WORDS_DIM` 0.25), because the fragment shader is shared with the plain site's field; it dims each glyph whose projected centre is inside the rect. The `data-world-words` marks are on the word boxes in the chapter components themselves (`ServiceChapters.jsx`, `ProductChapter.jsx`, `DoorBIntro.jsx`, `TemplateChapter.jsx`, `Builder.jsx`); `WorldRoadChapters.jsx` only places them. `canvas.dataset.wordsRect` carries the rect for the e2e.

- [x] Step 1: Tests (`tests/wordsRect.test.js`, 3): the rect is the box in clip space, padded, y up; nothing is dimmed for no box, an empty box or a box off screen; the dim is a quarter.
- [x] Step 2: e2e: at MVP Sprints, while its code flies, the canvas's words rect is the words box (padded) and it is gone once the flight ends. Changed while building: the pixel-contrast sample was dropped, because the cloud's software WebGL draws the flight too unevenly frame to frame for a contrast number to mean anything; in its place a before/after screenshot at 800×600 and at 1024×768, halfway through the flight, shown to Chris.
- [x] Step 3: Run. Expected: FAIL.
- [x] Step 4: Implement.
- [x] Step 5: Run. Expected: pass. The canvas has had no line of its own since W7 joined it to the layer: the line is "code world layer and canvas", 17 kB. With all of Phase 2 in it, it measured 18.81 kB; the rail (only ever shown on the home page) now loads as its own chunk when the home page first shows it (`lazy` in `WorldLayer.jsx`, `JourneyRail` 2.52 kB under "any other script chunk", 12 kB), and `spreadMarks` lives with it in `railMarks.js`: the layer is 16.88 kB of 17 kB, no limit raised. That leaves about 0.1 kB of room on the line: the next change to the layer will need its own saving or a recorded decision.

### Task 2.5: Gates and record

- [x] Step 1: `npm run verify`; `npm run test:e2e` (world specs on Chris's machine). Expected: all pass. Result: verify exit 0 (575/575 unit, 72 files); e2e 264/264 on the cloud Chrome (its software WebGL runs the world specs); Chris's machine still owed.
- [x] Step 2: Lighthouse 12 on `/`, phone and desktop, world on and off: no regression in LCP, CLS or TBT; accessibility and SEO 100. Result, against an unchanged `8669d8f` build on the same machine: accessibility and SEO 100 every run; CLS 0 phone, 0.003 desktop, both builds. Desktop world on and off, and phone world off: the same both ways. Phone world on (software WebGL under a 4× slowed CPU, five runs each): median TBT 1,919 ms against 1,411 ms before, LCP 3.88 s against 3.84 s, but the runs spread 1,220–2,208 ms and 1,244–1,926 ms, the long tasks are the same tasks in both builds, and at the gate Phase 2's frame code does nothing (no jump, no flight). Not recorded as "no regression": Step 3 on a real phone decides it.
- [ ] Step 3: Chris, on his iPhone (Safari) and desktop, `?meter=1`: two full scrolls of the business road and ten jumps. iPhone median at the display's refresh and p95 at most 25 ms; desktop no regression. These are also the numbers the case study (Phase 3) and W8 need.
- [x] Step 4: Blueprint row with the real output.
- [ ] Step 5: Stop for Chris's review and commit.

---

## Phase 3: Immersive 3D websites, with this site as the case study

### Task 3.0: Chris's answers (gate)

- [x] Step 1: Chris answered spec open questions 2 to 5 (2026-11-26): the proposed name, summary and scope, no listed price; any excerpt (chosen: `drive.js` `driveAt`); a new, slower loop; after UI / UX Design, `/work/allen-code-co`, THIS SITE.
- [ ] Step 2: Chris gives the service's timeline and deposit terms (the other services' cards show both). Task 3.1 waits for them.

### Task 3.1: The service in the data

**Files:** `src/data/services.js`, `src/components/ContactForm.jsx` (`PROJECT_TYPES`), `src/pages/Services.jsx` (its meta description), `public/llms.txt`; Tests: `tests/ContactForm.test.jsx`, `tests/InnerPages.test.jsx`, `tests/structuredData.test.js`.

- [ ] Step 1: Tests:
  - the Services page shows the new service's name, summary, scope and timeline, and no price;
  - the brief offers its project type;
  - the footer lists it (built from `services.js`);
  - the Services ItemList has one more Service.
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Add the entry with Chris's words and terms, with no `startingPrice` (Chris, 2026-11-26: "prices will very with work so no actual listed priced"); check first that nothing reads `startingPrice` for every service (`CheckoutModal`); add the project type; add the service to the meta description and `llms.txt`.
- [ ] Step 4: Run. Expected: pass.

### Task 3.2: Its excerpt

**Files:** `src/content/excerpts/service-immersive.js` (new), `src/content/excerpts/index.js`; Test: `tests/excerpts.test.js`.

- [ ] Step 1: Copy Chris's chosen lines verbatim at the then-current commit (`repo: cja86104/AllenCode`, path, lines, commit, `becomes`), with `approved: null`.
- [ ] Step 2: Show it to Chris as it will render. He approves (`approved: { by: 'Chris', on: … }`).
- [ ] Step 3: `npm test` (secret patterns, 30-line limit, provenance) and `npm run excerpts:verify` with `EXCERPT_REPOS` pointing at `.`. Expected: pass.

### Task 3.3: Its screen

**Files:** `public/media/services/<slug>.mp4` and `.jpg`, `src/data/serviceScreens.js` (its slug in the type's union, and its entry); and, if Chris chose spec option 4(b), the `custom-web-development` entry. Test: `tests/serviceScreens.test.js`.

- [ ] Step 1: Record the loop from this site's production build (`npm run preview`), muted, with a poster frame. Slower than the 2026-11-16 loops (Chris: they "went too fast down the road … the changing signs looks like a fast flicker"): the recording's scroll speed is set so the camera moves no more than a third as fast as in those loops, and a sign stays readable for at least a second as it passes. It shows the new things: a jump between stops, a drive between pages, a word road. JPEG q90 at `subsampling=0`, at most 400 KB, its real width and height. The ledger does not name the recorder used for the 2026-11-16 service loops: use one under `tools/media/` or `tools/previews/` that fits, or add a small one beside them. Nothing in the loop shows a price.
- [ ] Step 2: Chris approves the loop.
- [ ] Step 3: Tests: the entry's file exists, its size and dimensions match, and its alt text names no dollar amount.
- [ ] Step 4: Run. Expected: pass.

### Task 3.4: On the road and in the chapters

**Files:** `src/scenes/ServiceChapters.jsx` (`SERVICE_CHAPTERS`, at the place Chris chose), and, only if the budgets need it, `WORLD_SCALE` and the road's edge and density settings (as tuned for the two services added 2026-11-16); Tests: `tests/ServiceChapters.test.jsx`, `tests/worldRoadLayout.test.js`, `tests/worldRoadMotion.test.js`, `tests/worldShapes.test.js`, `tests/worldStretches.test.js`, `e2e/worldbusiness.spec.js`, `e2e/services.spec.js`.

- [ ] Step 1: Tests:
  - the business road's stop order with the new service in its place;
  - on every tier, every landmark keeps 97–101% of its glyphs and the opening stays full;
  - the camera's fastest 4 px of scroll stays within 0.15;
  - `/services`' stretch lists the new stop;
  - Plain view's home shows the new chapter with its flight.
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Add it to `SERVICE_CHAPTERS`; tune only what the tests show must be tuned.
- [ ] Step 4: Run; `npm run budget` (code world canvas within 9 kB). Expected: pass.

### Task 3.5: The case study page

**Files:** `src/data/caseStudies.js` (new), `src/pages/CaseStudy.jsx` (new), `src/App.jsx` (route `/work/:slug`; an unknown slug is the 404 page), `public/sitemap.xml` (one `<loc>`, `<lastmod>`), `src/world/stretches.js` (`wordFor` and `stretchFor`); Tests: `tests/InnerPages.test.jsx`, `tests/worldStretches.test.js`, `tests/serverRender.test.jsx`, `e2e/seo.spec.js`, `e2e/prerender.spec.js`, `e2e/worldpages.spec.js`, `e2e/worldcls.spec.js`.

**Interfaces — Produces:** `caseStudies` entries `{ slug, title, summary, sections, numbers: Array<{ label, value, measured }>, serviceSlug, approved }`. A case study with `approved: null` does not render; its address is the 404 page until then. `wordFor('/work/<slug>')` is the word Chris chose. The stretch's lead is the new service's stop.

- [ ] Step 1: Tests:
  - the page renders its title as the one `h1`, its sections and its numbers with their dates;
  - Start a project opens the brief with the new service chosen (`briefPrefill`);
  - an unknown slug is the 404 page;
  - the stretch spells the chosen word, not LOST;
  - the prebuilt HTML holds the page's words, title, canonical, CreativeWork and BreadcrumbList;
  - CLS under 0.1 world on and off;
  - the sitemap test lists it.
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement, in the inner pages' style (`PageHeader`, `DISPLAY`, `PANEL`).
- [ ] Step 4: `npm run budget`. If the entry script passes 152 kB, load the page on demand as the home page is, inside the same Suspense pattern the server render uses.
- [ ] Step 5: Run. Expected: pass.

### Task 3.6: The words and the numbers

**Files:** `src/data/caseStudies.js`.

- [ ] Step 1: Measure, and date each number:
  - Lighthouse 12 on the preview build, phone and desktop, on `/` and on the case study: accessibility, SEO and CLS;
  - Chris's iPhone and desktop frame times from Task 2.5;
  - `npm run budget`'s entry script and world chunk;
  - the unit and e2e test counts;
  - `npm run excerpts:verify`.
- [ ] Step 2: Draft the words from the spec's outline and the files: only what the site does and the numbers just measured.
- [ ] Step 3: Chris edits and approves (`approved: { by: 'Chris', on: … }`).

### Task 3.7: Links in

**Files:** `src/pages/Services.jsx` (the new service's card: "See the case study"), the new chapter's words in `src/scenes/ServiceChapters.jsx` (Plain view and its road stop), `src/pages/About.jsx`; Tests: `tests/InnerPages.test.jsx`, `tests/ServiceChapters.test.jsx`, `e2e/services.spec.js`.

- [ ] Step 1: Tests: each link reaches the case study; no other service's card changes.
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: Run. Expected: pass.

### Task 3.8: Gates and record

- [ ] Step 1: `npm run verify`; `npm run test:e2e` (world specs on Chris's machine); `npm run excerpts:verify`. Expected: all pass.
- [ ] Step 2: Lighthouse 12 on the case study and `/services`, phone and desktop: accessibility and SEO 100, CLS under 0.1.
- [ ] Step 3: Blueprint row with the real output. Stop for Chris's review and commit.

---

## Later rounds (each its own spec and plan; not started here)

- **World craft:** MSDF glyphs for signs and headline landings; the W8 award kit (recordings of both roads on desktop and phone, stills, credits); links to a stop (`/#stop`).
- **Plain view, animations kept** (Chris, 2026-11-26): where the look is identical, drive simple reveals with CSS scroll-driven animations; a product card that morphs into its page's header with a named view transition.
- **Platform:** `rolldown-vite` on Vite 7, then Vite 8 (port `manualChunks`); React 19.2 with React Compiler; React Router 7, as the templates use.
- **WebGPU:** a spike behind WebGL2, only if the Phase 2 frame times leave a reason to want more glyphs.
- **Founding Fathoms** in the catalog, when Chris asks.
