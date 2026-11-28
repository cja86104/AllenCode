# Flagship services — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Add Immersive Web Experiences and Intelligent AI Systems as the two flagship services everywhere a service appears, each with a home chapter (world on and off) built from a real, approved excerpt and a real screen.

**Architecture:** Data first (`src/data/services.js` gains both, first, with `tagline` and `terms`); every consumer already reads the data, so the pages, footer, structured data and path bar follow. Chapters join `SERVICE_CHAPTERS` first, which also puts them first on the business road. A chapter appears only once its excerpt and screen exist, so the AI chapter can land after its screen does.

**Tech Stack:** Vite 5, React 18, React Router 6, Tailwind 3, Vitest, Playwright, ffmpeg (system) for the loop.

**Spec:** `docs/superpowers/specs/2026-11-27-flagship-services-design.md`

## Global Constraints

- Names, taglines, summaries and scope items are Chris's words, verbatim from the spec.
- Terms line on both cards and both chapters, exactly: `Timeline and deposit set per project, after scoping.`
- No `startingPrice`, no price, no buy button. No sound; loops muted.
- Real code only: each excerpt verbatim from its repository at a recorded commit, `approved: { by: 'Chris', on: … }` only once Chris has approved it.
- Every new or changed JS file starts with `// @ts-check`; no `@ts-ignore`, `@ts-expect-error`, `as any`, `eslint-disable`. No new dependencies.
- Budget (`tools/budget/check.mjs`) holds; Lighthouse accessibility and SEO 100; CLS no worse.
- Build and test in the cloud copy; files go back to Chris's folder with CRLF; Chris commits; no branches.

## Review Focus

1. A service with `terms` never shows "Timeline:" or a stray " · " (the old line) anywhere: card, chapter, phone. Test in Task 1 and Task 4.
2. The other seven services render exactly as before (their timeline · deposit line, their order after the flagships). Test in Task 1.
3. The eight-item scope lists fit their chapter's words box at 1280 × 800 and 1024 × 768 without overlapping the screen (`e2e/chaptertext.spec.js`). Test in Task 4.
4. The business road with two more stops still passes the world's guards on every tier. Test in Task 4.
5. A chapter whose excerpt is unapproved or whose screen is missing is left out of both the 2D chapters and the road (Intelligent AI Systems until its screen lands). Test in Task 4.

---

### Task 1: The services in the data and on the Services page

**Files:** `src/data/services.js`, `src/pages/Services.jsx`, `src/scenes/ServiceChapters.jsx` (`ServiceText`); Tests: `tests/InnerPages.test.jsx`, `tests/ServiceChapters.test.jsx`.

**Interfaces — Produces:** two entries at the head of `services`: `{ slug: 'immersive-web-experiences' | 'intelligent-ai-systems', name, tagline, summary, scope: string[], terms }` (no `startingPrice`, `priceNote`, `deposit` or `timeline`). The JSDoc type of a service gains optional `tagline` and `terms`; `timeline` and `deposit` become optional and present whenever `terms` is absent.

- [x] Step 1: Tests: `/services` lists Immersive Web Experiences first and Intelligent AI Systems second, each with its tagline, summary, every scope item and the terms line, and no "·" line; the seven others follow in today's order with their `timeline · deposit` line unchanged; no "$" on the page. `ServiceText` shows the terms line in place of "Timeline: …" when a service has `terms`, and the tagline above the summary when it has one.
- [x] Step 2: Run. Expected: FAIL.
- [x] Step 3: Implement. On a card the tagline sits between the name and the summary, in the card's existing label style (mono, ember); the terms line takes the `timeline · deposit` line's place and style. Check first that nothing reads `startingPrice` for every service (`CheckoutModal` is unmounted).
- [x] Step 4: Run, then `npm run verify`. Expected: pass.

### Task 2: Everywhere else a service is named

**Files:** `src/components/ContactForm.jsx` (`PROJECT_TYPES`), `src/pages/Services.jsx` (its meta description), `public/llms.txt`, `src/seo/structuredData.js` users; Tests: `tests/ContactForm.test.jsx`, `tests/structuredData.test.js`, `tests/InnerPages.test.jsx`.

- [x] Step 1: Tests: the brief's project types start `Immersive Web Experience`, `Intelligent AI System`, then today's seven in order, and the form's default project type stays `Custom SaaS Build` (today's first, so a visitor arriving with no choice is unchanged — Ruling in the ledger if the implementer finds a reason otherwise); the footer lists both first (built from the data); the Services ItemList has nine Services, these two at positions 1 and 2 with their summaries; the Services meta description names both; `llms.txt` lists both first with their summaries and "Timeline and deposit set per project, after scoping." and no price.
- [x] Step 2: Run. Expected: FAIL.
- [x] Step 3: Implement.
- [x] Step 4: Run, then `npm run verify`. Expected: pass.

### Task 3: The two excerpts

**Files:** create `src/content/excerpts/service-immersive.js`, `src/content/excerpts/service-ai-systems.js`; modify `src/content/excerpts/index.js`; Tests: the excerpt registry tests that already cover every excerpt (schema, provenance, secret-like content).

- [x] Step 1: `service-immersive`: `file: 'drive.js'`, `repo: 'cja86104/AllenCode'`, `path: 'src/world/drive.js'`, `lines: [28, 39]`, `commit: 'dee2b316c1b75bb6045b4147221f77c250a11fbc'`, the twelve lines verbatim (read them from that file at that commit), `becomes: 'the drive between pages in this site\u2019s Code World'`, `approved: { by: 'Chris', on: '2026-11-27' }` (Chris: "2 approved").
- [x] Step 2: `service-ai-systems`: `file: 'blocker-notes.ts'`, `repo: 'cja86104/ai-website-powerhouse'`, `path: 'lib/generation/blocker-notes.ts'`, `lines: [30, 46]`, `commit: 'b6db4aed3cf9536539a92919a06f017b1269d4fc'`, the seventeen lines verbatim, `becomes: 'AI Website Powerhouse pausing for a person, then resuming on their word'`. `approved` is set only once Chris approves these lines; until then the entry is a draft and never renders.
- [x] Step 3: Run the registry tests and `npm run verify`. Expected: pass. `npm run excerpts:verify` with both repos mounted runs on Chris's machine (owed, as before).

### Task 4: The chapters, on both sides

**Files:** `src/scenes/ServiceChapters.jsx` (`SERVICE_CHAPTERS`, `ServiceText`'s scope layout), `src/data/serviceScreens.js`, `src/world/roads.js` (unchanged logic; it follows `SERVICE_CHAPTERS`); Tests: `tests/ServiceChapters.test.jsx`, `tests/serviceScreens.test.js`, `tests/worldRoads.test.js`, the world guard tests, `e2e/chaptertext.spec.js`, `e2e/services.spec.js`.

**Interfaces — Consumes:** Task 1's entries, Task 3's excerpt ids. **Produces:** `SERVICE_CHAPTERS` starting `{ slug: 'immersive-web-experiences', excerptId: 'service-immersive' }`, `{ slug: 'intelligent-ai-systems', excerptId: 'service-ai-systems' }`; `serviceScreens` gains both keys (the AI one `null` until Task 6).

- [x] Step 1: Tests: with the world off and door a, the first chapter is Immersive Web Experiences (tagline, summary, scope, terms), the AI chapter is absent while its excerpt is a draft or its screen is `null`, and the six existing chapters follow unchanged; the business road's first stop is Immersive Web Experiences and the AI stop is absent until both exist; a scope of eight items sets in two columns from 1024 px wide and fits its words box (`chaptertext`); the world's guards pass on every tier.
- [x] Step 2: Run. Expected: FAIL.
- [x] Step 3: Implement. The scope list takes two columns from 1024 px when it has more than four items (every item kept); phones keep today's compact form.
- [x] Step 4: Run, then `npm run verify` and `npm run test:e2e`. Expected: pass. Tune only `WORLD_SCALE` if a guard fails, and record why.

### Task 5: The Immersive Web Experiences loop

**Files:** a recorder under `tools/media/` (reuse `tools/previews/record.mjs`'s stepped-frame method), `public/media/services/immersive-web-experiences.jpg` and `.mp4`, `src/data/serviceScreens.js`; Tests: `tests/serviceScreens.test.js`.

- [x] Step 1: Record from the production build (`npm run preview`), world on, muted: a drive between two pages and a stretch of road past at least two signs, the camera at most a third as fast as the 2026-11-16 loops, each sign readable for at least one second. Poster JPEG q90 `subsampling=0`, at most 400 KB, its real width and height; the mp4 within the existing loop limit. Nothing in it shows a price.
- [x] Step 2: `serviceScreens['immersive-web-experiences']` = the poster, the video, its real size and an alt naming what it shows. Test the entry's size against the file.
- Ruling (Task 5): the business road's landmark sides are counted from the road's end, not its start; the loop is 1120 x 700 (poster 1280 x 800) to fit 700 KB at CRF 30 or better.
- [ ] Step 3: Chris watches the loop and approves it (owed, recorded in the ledger); `npm run verify`.

### Task 6: The Intelligent AI Systems screen (waits on Chris)

- [ ] Step 1: Chris supplies a real screenshot or recording of AI Website Powerhouse paused on a blocker with its "I've done this — continue" button (or another screen he names) and approves Task 3's AI excerpt.
- [ ] Step 2: Set `approved` on `service-ai-systems`; add the screen to `serviceScreens` at its real size (JPEG q90 `subsampling=0`, at most 400 KB); the chapter and road stop appear (Task 4's tests now expect them). `npm run verify`; `npm run test:e2e`.
- Before Step 2, know what it moves (final review, 2026-11-27):
  - **Registry.** The draft lives in `src/content/excerpts/drafts.js`, not in the registry, so it is not bundled. On approval move `service-ai-systems` from `drafts.js` into `src/content/excerpts/index.js` (import and list entry) and set `approved`; the test "the registry the site imports holds no draft" (`tests/excerpts.test.js`) then still passes, and the drafts tests that name the AI excerpt go (or move to the next draft). Tests that bring the draft in by hand (`registry: { ...excerpts, ...draftExcerpts }` in `tests/ServiceChapters.test.jsx` and `tests/worldRoads.test.js`) read it from `index.js` again.
  - **World scale.** The AI stop makes 13 business stops. `WORLD_SCALE.a` (`src/world/surroundings.js`) must be raised again, as it was for Immersive: `tests/worldSurroundings.test.js` "opening at its full density" fails at the low tier (measured 0.194 > 0.1 in a simulation with the thirteenth stop). Tune only `WORLD_SCALE.a` and record why, as Task 4 did.
  - **Ten tests pin today's state and need updating:** the stop counts in `tests/worldJourney.test.js`, `tests/worldRoute.test.js` and `tests/worldRoads.test.js` (twelve business stops become thirteen); the "AI absent" tests in `tests/ServiceChapters.test.jsx`, `tests/serviceScreens.test.js` and `tests/worldRoads.test.js`; the seven-`pre` count in `tests/ServiceChapters.test.jsx`; the AI-absent assertion in `e2e/services.spec.js`; and the `ROAD`/`SERVICES` lists in `e2e/worldbusiness.spec.js` and `e2e/services.spec.js` (the AI stop second, after Immersive).
  - **Road sides.** The `tests/worldRoadLayout.test.js` side-keeping test ("keeps every business stop that was on the road before Immersive Web Experiences on the side it had") is written for one stop added in front and must be rewritten for two; restore in it a lateral-distance check as well (each landmark's distance from the road `≈ LATERAL`). Immersive's landmark changes side when the AI stop lands (+1 to −1): Chris sees that and approves it.
  - **Short screens.** The AI chapter's eight items use the compact form on short desktop frames (`wordsCompact` in `src/scenes/ServiceChapters.jsx`); add it to `e2e/chaptertext.spec.js` beside Immersive (full at 1024 × 768 and 1280 × 720, compact at 1024 × 700 and 1280 × 600) and re-measure `LONG_SCOPE_MIN_HEIGHT` if its longer items need more room.

### Task 7: Gates and record

- [x] Step 1: `npm run verify`; `npm run test:e2e`; Lighthouse 12 on `/` and `/services`, phone and desktop, world on and off: accessibility and SEO 100, CLS no worse than the baseline.
- [ ] Step 2: Chris, on his iPhone and desktop with `?meter=1`, one scroll of the business road (world on) and of door a (world off): p95 at most 25 ms.
- [x] Step 3: Blueprint Progress row; `CLAUDE.md` if any new script or workflow; stop for Chris's review and commit.
