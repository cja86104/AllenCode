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

## Validation

This repo uses npm. The scripts that exist in `package.json`:

- `npm run verify` — the full gate: lint, typecheck, unit tests, build, then the size budget. Run it after every change.
- `npm run lint` — ESLint with zero warnings allowed. Inline `eslint-disable` comments are turned off by config.
- `npm run typecheck` — `tsc`, with `checkJs` on for every file and no exclusion list.
- `npm test` — Vitest unit tests.
- `npm run build` — Vite production build.
- `npm run budget` — fails if the gzip size of the entry script, entry CSS, home chunk, renderer chunk or any other chunk passes its limit (`tools/budget/check.mjs`).
- `npm run test:e2e` — Playwright browser tests, including accessibility (`e2e/a11y.spec.js`) and SEO (`e2e/seo.spec.js`). Run it whenever a change touches routes, scenes or the renderer. On a new machine, or after Playwright is updated, run `npx playwright install chromium` once first, or every test fails with "Executable doesn't exist".
- `npm run excerpts:verify` — checks every code excerpt on the site still matches its source repo at the recorded commit.
- `npm run media:capture` and `npm run media:loops` — capture product screens and build their loops.

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

## Chapter Text

The words beside a home-page chapter's code and screen (services, products, templates) take their
sizes from `src/scenes/chapterType.js`, so every chapter reads at the same size. Change a size there,
not in one chapter.
