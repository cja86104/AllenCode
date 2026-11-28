# Allen Code Co Website — Claude Code Instructions

## Blueprint Guardian (MANDATORY)

**At the start of every session, invoke the blueprint-guardian agent before writing any code:**
```
/agent blueprint-guardian
```

**After completing any phase or batch, invoke it again to verify completion and get the next step.**

If the agent is not available in the session, follow the "Session rules" section of the master
blueprint instead; they were written to stand in for it.

## Master Blueprint

The master blueprint for the current redesign is the file named below. Read its Progress table at the start of every session and update it after every phase:
```
Blueprint: BLUEPRINT-SKY-REDESIGN.md
```

## The 2D experience (Living Source)

The world-off site (Plain view, no WebGL2, reduced motion) has its own spec and plans, kept separate from
the 3D world's: spec `docs/superpowers/specs/2026-11-27-living-source-2d-design.md`, plans
`docs/superpowers/plans/2026-11-27-living-source-phase-*.md`, baseline `docs/living-source/baseline.md`.
Put no 3D detail in those files and no 2D detail in the 3D world's.

## Validation

This repo uses npm. The scripts that exist in `package.json`:

- `npm run verify` — the full gate: lint, typecheck, unit tests, build, then the size budget. Run it after every change.
- `npm run lint` — ESLint with zero warnings allowed. Inline `eslint-disable` comments are turned off by config.
- `npm run typecheck` — `tsc`, with `checkJs` on for every file and no exclusion list.
- `npm test` — Vitest unit tests.
- `npm run build` — Vite production build, then the server bundle (`dist-ssr/`), then `tools/prerender/prerender.mjs`, which writes every sitemap page to its own HTML in `dist/` and the shell to `dist/spa.html` (Phase 9). `npm run preview` answers like Vercel (`tools/prerender/vercelPreview.mjs`).
- `npm run budget` — fails if the gzip size of the entry script, entry CSS, home chunk, renderer chunk or any other chunk passes its limit (`tools/budget/check.mjs`).
- `npm run test:e2e` — Playwright browser tests, including accessibility (`e2e/a11y.spec.js`) and SEO (`e2e/seo.spec.js`). Run it whenever a change touches routes, scenes or the renderer. On a new machine, or after Playwright is updated, run `npx playwright install chromium` once first, or every test fails with "Executable doesn't exist".
- `npm run excerpts:verify` — checks every code excerpt on the site still matches its source repo at the recorded commit.
- `npm run media:capture` and `npm run media:loops` — capture product screens and build their loops.
- `npm run baseline:capture` — records the 2D (world-off) site as a baseline: every sitemap page on desktop
  and phone, plus the home with each door and with reduced motion, as a scroll video, a frame per screen of
  scroll and a full-page PNG, into `baseline-captures/<date>/` (git-ignored; Playwright empties `test-results/`
  on every run, so captures never go there). Run it against `npm run preview -- --port 4173`, not the dev server.
  `?meter=1` shows frame times with the world on or off.

Chris runs `npm install` himself after any change to dependencies.

## Product Images

**Before adding or replacing any product image, read `docs/PRODUCT-IMAGES.md` first.**

Short version: a product with a real-screen loop (`previewVideo` + `poster` in
`src/data/products.js`) shows the loop on the home page chapter, the `/products` grid and its
`/products/<slug>` hero; `image` is the fallback for a product without one. An `image` must be
**4:3**, saved as `public/images/products/product-<slug>.jpg` at q90 / `subsampling=0`. On the
detail page `showcaseImage` overrides `image`. Verify with `npm run verify`.

## Service Screens

The screen each home-page service chapter's code lands on is set in `src/data/serviceScreens.js`
(`src`, `alt`, and the image's real `width` and `height`; files under `public/media/services/`, at
most 400 KB, JPEG q90 / `subsampling=0`). The alt text names no dollar amounts: services show no
prices.

A screen may also loop a video (`video`, at most 700 KB, muted, H.264 at CRF 30 or better). The Immersive Web Experiences loop
is filmed from the production build by `tools/media/record-immersive.mjs` (needs ffmpeg on PATH and Playwright's Chromium; run `npm run build`, then
`npm run preview -- --port 4173`, then the plain command `node tools/media/record-immersive.mjs`; its header says how,
and how slow it must stay); it encodes in `tools/media/out/` and copies to `public/` only once the
loop fits, at 1280 × 800 or, failing that, 1120 × 700. Re-film it after any change to the world or that chapter.

## Link Previews

The image and words a link preview shows (Facebook, LinkedIn, X, iMessage, Slack) are set once in
`index.html` (`og:*`, `twitter:*`); the build copies them into every prebuilt page, each with its own
title and description. The image is `public/og-allencodeco.png`, 1200 × 630 (previews crop to about
1.91:1, so a square design goes centered on black, not stretched). When the image changes, give it a
new file name and update both `og:image` and `twitter:image`: the platforms cache previews by image
address. The home page's title (its tagline) is in `index.html` and `src/pages/Home.jsx`, and must match.

## Chapter Text

The words beside a home-page chapter's code and screen (services, products, templates) take their
sizes from `src/scenes/chapterType.js`, so every chapter reads at the same size. Change a size there,
not in one chapter.
