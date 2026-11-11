# Code World: Design Spec

Date: 2026-11-10. Status: Chris's answers to section 8 folded in (2026-11-10); ready for the W1 plan. Prototype: `docs/superpowers/plans/2026-11-10-code-world-prototype.md` (passed, see section 1).

## 1. Purpose and why now

The home page becomes one continuous scroll journey through a world built from this site's real code, from an empty file to shipped work, at the level Chris asked for after walking fiabamia.com (2026-11-10: "what we have done is cool but i want it on this level"). The prototype at `/lab/world` proved it on Chris's own devices: desktop (high tier, 40,000 glyphs) median 10.0 ms, 95th percentile 10.1 ms (a 100 Hz display, no dropped frames); newest iPhone in Safari (low tier, 12,000 glyphs) median 17.0 ms, 95th percentile 17.0 ms (60 frames a second, no dropped frames). Chris: "looks good on both".

Success means:
1. A first-time visitor scrolls one unbroken journey: empty file, into the code, the road, the fork, their road's landmarks, the workshop, their idea, then the brief.
2. Every landmark is real: built from an approved excerpt and resolving into the real screen, loop or photo it stands for.
3. Nothing already earned is lost: per-page prerender (Phase 9), JavaScript-off reading, accessibility 100, SEO 100, reduced-motion and no-WebGL journeys, and the prototype's frame times on the same devices.
4. "What do you do and how do I hire you" stays obvious: the headline, the fork's two promises, each stop's words and the brief are real DOM text, readable at every stop.
5. Award level as well as business (Chris, 2026-11-10: "we are looking to win awards with this site. as well as business"). See section 6, Craft.

## 2. Hard constraints (carried from the Source to Screen spec and blueprint)

- Real code only: every glyph comes from an approved excerpt (`approved` not null); unapproved excerpts never render.
- Approved copy unchanged: "It all starts with an empty file…" and "Welcome to Allen Code Co. What would you like to build today?".
- Palette locked: `#f97316` on `#0a0a0a`; JetBrains Mono glyphs, Instrument Serif italic display, Space Grotesk interface. The signposts' words are white (Chris, 2026-11-10); the road keeps its ember edges.
- No audio. No prices or buy buttons for services or templates (product pages keep their own pricing).
- No new runtime dependencies: the world renderer stays hand-written WebGL2 (`src/world/`); GSAP and Lenis as today.
- No `@ts-ignore`, `@ts-expect-error`, `as any`, `eslint-disable`, `suppressHydrationWarning` or other suppression; `// @ts-check` everywhere.
- Chris makes every commit; no branches. Work in phases with a stop after each.

## 3. The journey

The camera path is built from the visitor's road, not hand-placed per screen: a sequence of stops, each a landmark set beside the road (alternating sides), each given the same scroll length. The rail on the right runs "empty file" to "shipped" (Chris: "keep shiped for now") and names the current stop.

**Shared opening (every visitor)**
1. Empty file: the `gate` excerpt types itself into the editor (as today and in the lab).
2. The headline: the approved headline in the DOM as the camera reaches the file, as today's gate hands over.
3. Into the code: the camera pushes through the file; its characters stream past.
4. The road: a road of the `ambient` excerpt with ember edges, running to the fork.
5. The fork: the road itself splits in two (Chris, 2026-11-10: "def road"), a white signpost on each branch, `business/` and `family/`, each with its promise in DOM text. Before a door is chosen the journey ends here (as today).

**Business road (door a)**: products first, then services, then how I work (Chris, 2026-11-10: "products first": proof before the offer).
- Three product landmarks: My Teachers Toolbox, UnderFire AI, Founders Helm, each resolving into its real loop (as the prototype's UnderFire does), with name, tagline and stats.
- Crew Advisors (coming soon): its sculpture never resolves; its approved excerpt keeps typing and stops unfinished with a blinking cursor, as on the products page.
- Four service landmarks, in today's order: MVP sprints (`service-mvp`), custom SaaS builds (`service-custom`), AI integration (`service-ai`), technical audits (`service-audit`). Each sculpture resolves into its service screen (`serviceScreens.js`), with the service's name, summary and scope as the stop's words.
- How I work: the three principles as commits along the road's edge, each "✓ shipped" as it is passed.

**Family road (door b)**: what I can make you, the templates, done for you.
- Hearth (Door B's opening) resolving into its loop, with Door B's words from `doorB.js`.
- Evergreen, Keepsake, Vow, Gather, Folio as small houses of their preview code, each resolving into its preview loop, with "Ask about this template".
- Done for you, as a stop with its words.

**Both roads meet**
- The workshop: Chris's story (the approved `builder` excerpt) as a portrait-shaped sculpture resolving into his photo, with the builder's words and "Read the full story".
- Your idea: the visitor types into `your-idea.txt`; their characters fly ahead and build the sketch as the last landmark (today's `IdeaSketch` flight, in 3D).
- Then the world ends and the page continues as a plain page: the brief (`your-project.md` and the contact form) and the footer, like FiabaMia's plain ending. The rail reaches "shipped" at the brief.

Choosing a road at the split (Chris, 2026-11-10: the road splits): the camera comes to rest where the road divides and holds there; the scroll does not run on until a road is taken. The visitor takes a branch by tapping or clicking it (or its signpost), by swiping or trackpad-scrolling left or right over the world, or with the ← and → keys; the two signposts are also real buttons, so keyboard and screen-reader visitors choose exactly as today. Taking a branch turns the camera onto it and the journey continues down it (the door is stored as today). Scrolling back up to the split offers the choice again; the nav's door switcher takes the visitor back to the split and onto the other branch.

## 4. Architecture

- `src/world/` grows from the prototype: `camera.js` gains a path builder (`buildJourney(door, stops)`: keyframes from the stop list, so adding a landmark moves the rest); `shapes.js` gains landmark builders (screen, house, portrait, commit marker, unfinished sculpture); `landmark.js` generalises to any landmark's real screen (`landmarkRect` per landmark); the renderer keeps one buffer and one draw, with a fade range per landmark.
- The home page's chapters keep their DOM: each stop's words are today's chapter components in their static form (the code-beside-result layout used for reduced motion), so the prebuilt HTML, JavaScript-off reading and crawlers get the full content, and the world layers over and around it. The pinned 220vh flight chapters are retired once the world replaces them (phase W6).
- The home page is the whole journey. Every inner page also gets a short stretch of road of its own (Chris, 2026-11-10: "not later give them a short stretch of road"): about one and a half screens at the top of the page, the page's own code resolving into its header (Products: the four product sculptures at the roadside; Services, Templates, About, Contact, each product page: their own landmark), then the page continues as a plain page. Moving between pages travels: the camera runs along the road from one page's stretch to the next during the view transition. One canvas, mounted once above the routes as the field is today, kept across navigation.
- Prerender (Phase 9) unchanged in principle: the home's prebuilt HTML is the first-visit state (no door; the journey to the fork); the stored door applies after hydration as today.
- Budgets: the world chunk loads after first paint like `FieldScene`; its own budget line, set from measurement in W1 (the lab's is 8.08 kB gzip; the full world's shape builders and landmarks add to it).

## 5. Fallbacks and resilience

- Reduced motion, no WebGL2, or a GPU context that cannot be recovered: today's static chapters (code beside its result) in the same order, with no canvas left behind.
- Lost context: restart on a fresh canvas as the field does (`contextRecovery.js`), then the static journey.
- Low-end devices: the tier budget (12,000 / 24,000 / 40,000 glyphs) and the live governor lowering the scatter (not the landmarks) when frame time rises.
- A visitor who jumps (a link to a stop, a flick, back and forward) gets the right frame: the camera stays a pure function of progress.

## 6. Craft (the award bar)

Juries (Awwwards, FWA, CSS Design Awards) score design, usability, creativity and content, on mobile as much as desktop, and drop sites that stutter, shift or hide their content. So, at every phase:
- Every frame on time: the iPhone and desktop measurements of section 7 at every stop of both roads, not just on average.
- No loader and no blank first paint: the first paint is the empty file (prebuilt HTML), and the world starts after it.
- No layout shift on any page (CLS under 0.1 on mobile and desktop).
- Every motion means something: characters only ever come from the code they stand for, and every landmark ends as the real thing.
- Details: the cursor, focus states, hover states on landmarks and signposts, the rail, the transitions between pages along the road, and type at chapter size (`chapterType.js`) at every stop.
- Readable without the world: every stop's words are real text over a quiet backdrop (the prototype's fade), JavaScript-off and reduced-motion journeys complete.
- A submission kit at the end (W8): a screen recording of both roads on desktop and phone, the stills, and the credits.

## 7. Performance and verification

- On Chris's devices after each phase: iPhone (Safari) and desktop, `?meter=1`, two full scrolls; median at the display's refresh and 95th percentile at most 25 ms on the iPhone, no regression on desktop.
- Lighthouse against `npm run preview` before and after each phase on `/`, mobile and desktop, as in Phase 9: no regression in LCP, CLS or TBT; accessibility and SEO 100.
- `npm run verify` and `npm run test:e2e` at every stop; the lab's tests become the home's.

## 8. Phases (a stop after each)

- W1: The engine on the home page behind a switch (`/?world=1`): the shared opening and fork from the lab, the path builder, the home's DOM layered over it. The live home unchanged without the switch.
- W2: The business road: three products, Crew Advisors unfinished, four services, how I work.
- W3: The family road: Hearth, the five templates, done for you.
- W4: The workshop, your idea in 3D, the plain ending, the rail to "shipped".
- W5: Inner pages: each page's short stretch of road, and travelling along the road between pages.
- W6: Gates and the swap: prerender, JavaScript-off, accessibility, Lighthouse and the iPhone measurement on every page; then the world becomes the default.
- W7: Retirement: the pinned flight chapters, their timelines and the flat code field that the world replaced; `/lab/world` removed.
- W8: The award submission kit (section 6).

## 9. Decisions (Chris, 2026-11-10)

1. The fork: the road itself splits ("def road"); how a branch is taken is in section 3.
2. The business road leads with the products ("products first").
3. Inner pages get their own short stretch of road in this project, not later ("not later give them a short stretch of road").
4. The bar: "we are looking to win awards with this site. as well as business" (section 6).
