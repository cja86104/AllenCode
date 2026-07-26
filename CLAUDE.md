# Allen Code Co Website — Claude Code Instructions

## Blueprint Guardian (MANDATORY)

**At the start of every session, invoke the blueprint-guardian agent before writing any code:**
```
/agent blueprint-guardian
```

**After completing any phase or batch, invoke it again to verify completion and get the next step.**

## Product Images

**Before adding or replacing any product image, read `docs/PRODUCT-IMAGES.md` first.**

Short version: one `image` field in `src/data/products.js` drives all three surfaces (home grid,
`/products` grid, `/products/<slug>` hero). Source must be **4:3**. Save as
`public/images/products/product-<slug>.jpg` at q90 / `subsampling=0`. Watch for `video` and
`showcaseImage` — both silently override `image`. Verify with `npm run build` (only validation
script in this repo).

## ⚠ No Master Blueprint Found

No blueprint file was detected in this project root. Add your blueprint file to this directory and update this line with the filename:
```
Blueprint: [YOUR-BLUEPRINT-FILENAME-HERE]
```
