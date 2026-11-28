# Living Source Phase 4: the layer stack, its steps and the provenance — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task
> (Chris, 2026-11-28: native, no subagents; "finish 3 then do 4 you dont have to stop after 3").

**Goal:** On the world-off home, every code-to-screen chapter becomes C's layer stack: the real source, its
characters in flight and the real screen as planes in CSS 3D that scroll pulls apart and settles flat, with
`01 Source / 02 Transformation / 03 Result` to jump between steps and the excerpt's provenance beside it.

**Architecture:** Two pure modules (the timeline and the glyph plan) and three components (`LayerStack`,
`StepTabs`, `Provenance`) live in `src/scenes/layers/`, loaded as their own chunk the first time a world-off chapter
needs them (the home chunk is at 13.97 of 16 kB). A chapter takes the stack when the home passes `layers`
(the world off); the world's roads never pass it, so the 3D world keeps today's WebGL flight. The glyphs travel by
CSS: each span holds its start and end as custom properties and one `--t` on the plane drives them all, so a scroll
frame changes one style, not hundreds.

**Tech Stack:** React 18, Tailwind 3, CSS 3D transforms (no WebGL), Vitest, Playwright + axe. JavaScript, `// @ts-check`.

**Spec:** `docs/superpowers/specs/2026-11-27-living-source-2d-design.md` ("A", "D", "The rules of C").
**Mockups:** the design canvas linked in the spec (C, desktop and phone).

## Global Constraints

- CSS 3D only (`perspective`, `transform-style: preserve-3d`); never WebGL for the stack. Planes, top to bottom: source
  (the excerpt verbatim), characters in flight, the real result (the chapter's screen, loop or photo).
- Tilted `rotateX(52deg) rotateZ(-28deg)` while pulled apart; flat and face-on (`rotateX(0) rotateZ(0)`) when the
  result lands, so the finished screen is read straight. Depths (desktop): source 260 px, characters 130 px, screen 0
  while apart; source 140 px on the Source step. Phone: 150 / 75 / 0, source 80.
- Steps: `01 Source`, `02 Transformation` (`Flight` on a phone), `03 Result`.
- One ease `cubic-bezier(.16, 1, .3, 1)`, 500–700 ms for layer moves.
- Reduced motion and no WebGL2: the stack flat and face-on (the result, its code beside it), no tilt, no movement;
  every control still works.
- Phone: the stack about 320 px wide; the three steps as three full-width buttons.
- Honesty: the excerpt is real and the result is the real screen; no copy says the browser compiles the excerpt.
  Provenance: repository, path, line range, commit, what it produces (`excerpt.becomes`), approval date; **no
  outbound link** until Chris names a repository public (spec answer 4).
- Orange `#f97316` on `#0a0a0a`; JetBrains Mono for code, labels and steps. No glow, no gradient.
- Budgets: entry 152 kB (151.13 now: nothing here may land in it), home chunk 16 kB, any other chunk 12 kB.
- `// @ts-check`, no `eslint-disable`; Chris commits.

## Decisions (Chris, 2026-11-28, and this plan's)

1. **The middle plane** (Chris: "Characters travel in the stack"): the excerpt's real characters start laid out as the
   code and travel inside the middle plane to points over the screen as the visitor scrolls, on today's flight timing
   (`chapterTimeline`). The WebGL field stays as the background; a chapter in the stack does not claim a WebGL flight.
2. **Scope** (Chris: "All code-to-screen"): the service chapters with a screen, the four products, door B's opening,
   each template and the builder. The technical-audits chapter is not code-to-screen (its code checks itself) and
   keeps its form.
3. **Where the steps sit:** under the stack, in the stage column (desktop a row of three, phone three full-width
   buttons), with the provenance line under them. The desktop mockup put them in the words column; there they would
   push the services' scope lists out of the frame.
4. **Steps are navigation, not tabs:** each is a button that moves the chapter to that step (a glide to its point in the
   section's scroll; under reduced motion it switches the flat view at once). The current step is
   `aria-current="step"`; the group is `role="group"` named "Steps".
5. **The step points:** Source at 5 % of the section's scroll, Transformation at 40 %, Result at 92 %.
6. **Not in this phase:** spec D's "the lines that matter highlight as their output appears" needs Chris to choose
   those lines per excerpt; recorded for him, not guessed.

## Review Focus

1. A chapter whose screen is a video: the loop plays only once the result has landed flat. → Task 3.
2. Reduced motion: no tilt and no motion anywhere, steps still switch the view, focus stays on the button. → Task 2, Task 3.
3. A long excerpt (30 lines, the maximum) on a phone: the source plane scales its code to fit 320 px, never overflows. → Task 1.
4. The world on: chapters keep today's flight, no stack, no layers chunk requested. → Task 3.
5. Scrolling fast through several chapters: only the chapter on screen updates its `--t`, at most once a frame. → Task 2.

---

### Task 1: The timeline and the glyph plan

**Files:** Create `src/scenes/layers/layerTimeline.js`, `src/scenes/layers/glyphPlan.js`; Test `tests/layerTimeline.test.js`, `tests/glyphPlan.test.js`.

**Interfaces — Produces:**
- `STEPS = [{ id: 'source', n: '01', label: 'Source', short: 'Source', at: 0.05 }, { id: 'transformation', n: '02',
  label: 'Transformation', short: 'Flight', at: 0.4 }, { id: 'result', n: '03', label: 'Result', short: 'Result', at: 0.92 }]`
- `layerTimeline(progress: number): { step: 'source'|'transformation'|'result', travel: number, apart: number,
  tilt: number, codeOpacity: number, glyphOpacity: number, screenOpacity: number, landed: boolean }` — `travel` is
  `chapterTimeline(progress).flight`; `apart` rises 0 → 1 over the first half of the travel; `tilt` 1 until the
  handoff, then falls to 0 with it; `screenOpacity` 0.35 → 1 over the travel; `landed` when the handoff is 1;
  `step` is source before the travel starts, result once the handoff starts, transformation between.
- `stepAt(step) → number` (the `at` above).
- `glyphPlan(code: string, opts: { max: number, aspect: number }): Array<{ ch: string, x0: number, y0: number, x1: number, y1: number, d: number }>`
  — coordinates in shares of the plane (0..1). Start: the character's column and line in the code, scaled so the
  widest line and all lines fit (`x0 = col / maxCols`, `y0 = line / lines`). End: a point of a jittered grid over the
  plane with the screen's aspect, deterministic (seeded by index). At most `max` glyphs, spread evenly over the
  code's non-space characters. `d` (0..0.4) staggers each glyph's start by its line.

- [x] Step 1: tests — `layerTimeline(0)` is source, tilt 1, apart 0, codeOpacity 1, glyphOpacity 0;
  `layerTimeline(0.4)` is transformation, apart 1; `layerTimeline(1)` is result, tilt 0, landed, screenOpacity 1,
  codeOpacity 0, glyphOpacity 0; monotone `tilt` (never rises); each `STEPS[i].at` gives that step.
  `glyphPlan` on a 3-line excerpt: only non-space characters, in order; `max` respected on a 30-line excerpt (≤ max,
  first and last characters kept); all coordinates within 0..1; same input → same output; `d` within 0..0.4.
- [x] Step 2: run, expect FAIL (modules missing). Step 3: implement. Step 4: run, expect PASS; lint, typecheck.

### Task 2: The stack, the steps, the provenance

**Files:** Create `src/scenes/layers/LayerStack.jsx`, `StepTabs.jsx`, `Provenance.jsx`, `src/scenes/layers/index.js`
(the chunk's entry, re-exporting the three); `src/index.css` (the glyph transform rule); Test `tests/LayerStack.test.jsx`.

**Interfaces — Produces:**
- `LayerStack({ excerpt, screen, progress, flat, view, size }: { excerpt: Excerpt, screen: { src: string, alt: string,
  width: number, height: number, video?: string }, progress: number, flat: boolean, view: StepId, size: 'desktop'|'phone' })`
  — `<div data-layer-stack data-step={step}>` with `perspective` 2200 px (desktop) / 1200 px (phone); the inner
  `preserve-3d` box at the screen's aspect, its transform from `layerTimeline` (or, when `flat`, from `view`:
  source shows the code plane over a dimmed screen, transformation the characters at rest at their ends, result the
  screen), 700 ms on the one ease. Planes: source (`data-plane="source"`, the excerpt in `CodeLines`, scaled to fit),
  characters (`data-plane="flight"`, `aria-hidden`, spans with `--x0 --y0 --x1 --y1 --d`, the plane's `--t` =
  `travel`), screen (`data-plane="result"`, `MediaLoop` active only when `landed`, else the image). The screen keeps
  its `alt`; the code plane is `aria-hidden` (the chapter's words describe it, as today). Phone: `max` 80 glyphs;
  desktop 220.
- `StepTabs({ current, onPick, size })` — `role="group" aria-label="Steps"`, three buttons `01 Source` …, the current
  `aria-current="step"`, 44 px tall (phone 48 px, full width, a 3-column grid).
- `Provenance({ excerpt })` — one mono line: `repo · path · lines a–b · commit · approved <date>`, then
  `excerpt.becomes`; no link.
- CSS: `[data-plane="flight"] > span { transform: translate(calc((var(--x0) + (var(--x1) - var(--x0)) * clamp(0, (var(--t) - var(--d)) / 0.6, 1)) * 100cqw), …) }`
  with the plane as a size container (`container-type: size`).

- [x] Step 1: tests — renders three planes with the data attributes; at `progress` 0 the box's transform contains
  `rotateX(52deg)`, at 1 `rotateX(0deg)`; `--t` on the flight plane equals `layerTimeline(p).travel`; with a video
  screen, `MediaLoop` is active only at 1; `flat` + `view="source"`: no `rotateX(52deg)`, the code plane shown;
  StepTabs marks the current step and calls `onPick` with the id; Provenance shows repo, path, `lines 37–52`, commit,
  `becomes`, and no `a` element.
- [x] Step 2: run, expect FAIL. Step 3: implement. Step 4: run, expect PASS; lint, typecheck.

### Task 3: The service chapters take the stack

**Files:** Modify `src/pages/Home.jsx` (pass `layers={!world}` and preload the chunk), `src/scenes/ServiceChapters.jsx`
(`ServiceChapters` and `ServiceChapterFor` take `layers?: boolean`; a `LayerChapter` used when `layers`);
Create `src/scenes/layers/useStepJump.js`; Test `tests/ServiceChapters.test.jsx`, `e2e/layers.spec.js`.

**Interfaces — Produces:**
- `useStepJump(sectionRef): (step: StepId) => void` — glides to `top + stepAt(step) * (height - innerHeight)`
  (`glideTo`, instant under reduced motion) and keeps focus on the button.
- `LayerChapter` (pinned, motion): words as today (left), the stack in the stage box, `StepTabs` and `Provenance`
  under it; no `useImageFlight`. Static (reduced motion or no renderer): words, then the flat stack with its code
  beside it and the same steps switching `view` at once.
- The stack component loads with `React.lazy(() => import('./layers/index.js'))`; until it arrives the stage holds
  its box empty (no shift: the box has its size).

- [x] Step 1: unit — `ServiceChapterFor` with `layers` renders `[data-layer-chapter]` and does not claim a field flight
  (`fieldBus.get().transform` stays null); without `layers` it renders today's `FlightChapter` (unchanged tests pass).
- [x] Step 2: e2e `e2e/layers.spec.js` (plain fixture): door A at 1280 × 720 — at the first service chapter's top the
  stack is tilted and `01 Source` is current; at 40 % it is apart and `02` current; at its end it is flat (`matrix`
  with no rotation: the computed transform is `none` or an identity 2D matrix) and `03` current; pressing `03 Result`
  from the top glides there; the provenance line shows the excerpt's repo and commit and holds no link; the world on
  (`?world=1`): no `[data-layer-stack]` and no `layers` chunk requested; reduced motion: no element has a 3D transform,
  the steps switch `data-step` at once; phone 390 × 844: stack ≤ 340 px wide, three step buttons in one row, each
  ≥ 48 px tall; axe clean on door A.
- [x] Step 3: run, expect FAIL. Step 4: implement. Step 5: run, expect PASS; `npm run verify`.

### Task 4: Products, door B's opening, the templates and the builder

**Files:** Modify `src/scenes/ProductChapter.jsx`, `src/scenes/DoorBIntro.jsx`, `src/scenes/TemplateChapter.jsx`,
`src/scenes/Builder.jsx`, `src/pages/Home.jsx`; Test their unit files and `e2e/layers.spec.js`.

Each takes `layers` the same way and, when given, renders its stage as `LayerStack` + `StepTabs` + `Provenance`
with its own screen (product: its loop or image; door B intro: Hearth's; template: its loop; builder: the photo).
Door B's templates: each segment's own `local` progress drives its stack; the steps jump within the segment
(`templateSegmentY` points).

- [x] Step 1: unit — each with `layers` renders `[data-layer-stack]`, none claims a field flight; without it, unchanged.
- [x] Step 2: e2e — door A products, door B intro, the second template, the builder: tilted at their start, flat at
  their end, steps jump; axe clean on door B; the chapter-text checks (`e2e/chaptertext.spec.js`) still hold.
- [x] Step 3: run, expect FAIL. Step 4: implement. Step 5: run, expect PASS; `npm run verify`, `npm run test:e2e`.

### Task 5: Measured and written down

- [x] `npm run verify` (entry unchanged at about 151.13 kB; home ≤ 16; layers chunk ≤ 12), `npm run test:e2e`.
- [x] Lighthouse on `/` (phone, phone without WebGL, desktop) against the baseline: CLS no worse, accessibility 100.
- [x] The baseline doc's "After Phase 4", `CLAUDE.md` (the layers module and the `layers` prop), the spec's Phase 4 note.
- [x] Screenshots for Chris: a chapter at Source, Transformation and Result, desktop and phone.

## Done (2026-11-28)

`npm run verify` exit 0, 702/702 unit tests: entry script 151.13 kB (unchanged), CSS 8.59 kB, home 14.82 kB, the
layers chunk 2.25 kB (loaded once the home page knows the world is off). `npm run test:e2e` 316/316. Lighthouse on `/`
(phone 74, phone without WebGL 86 with the known 0.199, desktop 100; accessibility and SEO 100), as after Phase 3.

Rulings (the ledger has each with its cost):
- The stack separates over the first quarter of the travel (the plan said half), so it is fully apart at 40 %.
- `StepTabs` takes `phone`, not `size`; a generic `LayerChapter` (in `layerSlot.jsx`) serves products, door B's
  opening and the builder; the templates have their own (a segment per template, the steps moving within it).
- On a desktop the stack takes 85 % of its stage, so its tilted planes stay on screen (at 1440 px they ran past the
  window's edge); the phone's stack is 320 px; the steps and provenance are never narrower than 480 px on a desktop
  (the builder's portrait made "02 Transformation" overflow). Found in screenshots; each has a test now.
- The provenance shows the short commit (7 characters), as the mockup did.
- The current step's number is full-strength dark on orange (axe: 70 % was 4.41:1).
- Five browser tests that checked the WebGL flight on the world-off home now check the stack
  (`services`, `products`, `doorb`); the lost-context check moved to the gate's flight (`gate.spec.js`), the
  world-off home's last field flight.
- Not done here: spec D's "the lines that matter highlight as their output appears" needs Chris to choose the lines.
