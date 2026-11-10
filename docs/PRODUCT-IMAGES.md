# Product Images — How To Add / Replace Them

Repo: **Allen Code Co. website** (`AllenCode/AllenCode`) — Vite + React 18 + React Router + Tailwind.

This is the exact, verified procedure for putting an image on a product. Follow it top to bottom
and it works the first time. Do not improvise — the two gotchas in §3 are what break it.

---

## 1. Which field shows where (updated 2026-11-09, Source to Screen redesign)

Every product is a single object in **`src/data/products.js`**. Since the redesign, a product that
has a real-screen loop shows the loop, and `image` is the fallback:

| Surface | File that renders it | Shows | Aspect |
|---|---|---|---|
| Home page product chapter | `src/scenes/ProductChapter.jsx` | `previewVideo` + `poster` | 16:10 |
| `/products` grid | `src/pages/Products.jsx` → `ProductCard` | `previewVideo` + `poster`; a coming-soon product with an approved excerpt types its code; otherwise `image` | `aspect-[16/10]` |
| `/products/<slug>` hero | `src/pages/ProductDetail.jsx` | `previewVideo` + `poster`; otherwise `showcaseImage` or `image` | `aspect-[16/10]` (or `heroAspect: '4/3'`) |

`previewVideo` and `poster` come from `npm run media:capture` then `npm run media:loops`
(`tools/media/`), 1280x800, poster at most 150 KB, loop at most 2 MB. `image` still follows the
procedure below and is what a product without a loop shows.

---

## 2. The procedure

### Step 1 — Check the source image is 4:3

```bash
python3 -c "from PIL import Image; im=Image.open('YOUR_FILE'); print(im.size, round(im.size[0]/im.size[1],3))"
```

You want a ratio of **~1.333**. Target size **1400×1050** or larger (the ones in the repo are
1392×1040 and 1456×1088 — both fine).

**If it is not 4:3, stop and regenerate the image.** Do not drop in a banner and hope. A 2.7:1
banner center-cropped into the 4:3 card keeps only ~46% of the width — titles get clipped at both
edges and side elements vanish entirely. This already happened once with a Founders Helm banner;
regenerating at 4:3 was the fix.

### Step 2 — Compress and save into the repo

Filename convention is strict: **`product-<slug>.jpg`**, matching the `slug` field exactly.

```bash
cd <repo root>
python3 -c "
from PIL import Image
im = Image.open('SOURCE_FILE').convert('RGB')
im.save('public/images/products/product-<slug>.jpg', 'JPEG', quality=90, subsampling=0, optimize=True)
"
```

- `quality=90, subsampling=0` — the no-chroma-subsampling part matters. These images are all
  screenshots of UI with small text; default subsampling smears it.
- Always compress. Raw AI-generated exports arrive at 1.1–1.5 MB. Re-encoded they land at
  **160–230 KB**, which is where every image currently in the repo sits. The products grid loads
  all four cards at once, so this is real weight.
- Use `.jpg` even if the source is `.png`. Every product image in the repo is `.jpg`.

### Step 3 — Point the data file at it

In `src/data/products.js`, find the product's object and change **one line**:

```js
image: '/images/products/product-<slug>.jpg',
```

Path is web-root-relative (leading `/`, no `public`). Vite serves `public/` at `/`.

### Step 4 — Verify with a real build

```bash
npm run build
ls dist/images/products/
```

Must be **exit 0** and your new file must appear in `dist/images/products/`. There is no lint,
typecheck, or test script in this repo — `package.json` has only `dev`, `build`, `preview` — so the
build is the whole validation gate. Don't claim done without running it.

---

## 3. The two gotchas that cost time

### `video` beats `image` — silently

`ProductCard.jsx` renders a `<video>` **instead of** the `<img>` whenever `product.video` is set:

```jsx
{product.video ? ( <video src={product.video} … /> ) : ( <img src={product.image} … /> )}
```

So if a product has a `video` field, setting `image` does nothing visible on either grid. UnderFire
AI had `video: '/UnderFireAI.mp4'` pointing at a file that was never in `public/` or tracked in git
— a broken video element sitting where the image should be. **Fix: delete the `video` line.**

Check before you start:

```bash
grep -n "image:\|video:\|showcaseImage:" src/data/products.js
```

### `showcaseImage` beats `image` on the detail page

`ProductDetail.jsx` line 66: `src={product.showcaseImage || product.image}`

An optional detail-page override. UnderFire had `showcaseImage: '/meet-underfire.png'` — also a
file that didn't exist. **Fix: delete the `showcaseImage` line** unless you deliberately want a
different, wider hero image there.

Rule of thumb: **a product should have `image` and nothing else** unless there's a specific reason.

---

## 4. Adding a brand-new product

Beyond the image, two things are positional and easy to get wrong.

### `data-aiwp-slot` numbering

**Retired (2026-11-09).** The redesign removed every `data-aiwp-slot` attribute (spec decision 3), so
the numbering below no longer applies; it is kept only as history.

Every image carries a `data-aiwp-slot` attribute used by the AI Website Powerhouse tooling. The
numbering is **derived from array position**, so inserting a product mid-array renumbers everything
after it:

| Location | Expression | With 4 products |
|---|---|---|
| Home grid | `slot={i + 1}` | 1–4 |
| Products grid | `slot={14 + i}` | 14–17 |
| Detail hero | `18 + productIndex` | 18–21 |
| Founder photo (Home + About) | hardcoded `"5"` | 5 |
| Templates page | `t.slot` from template data | — |

The Home grid (`1 + i`) collides with the hardcoded founder photo slot `5` once you have 5+
products. **Renumber the ranges in `Home.jsx` / `Products.jsx` before adding a fifth product.**

Prefer **appending** new products to the end of the `products` array — it leaves existing slot
numbers stable.

### Required fields

Minimum for a product to render without crashing:

```js
{
  slug: 'kebab-case-slug',            // must match the image filename
  name: 'Product Name',
  url: 'https://…' | null,            // null hides the "Live site" link
  tagline: '…',
  status: 'live' | 'private' | 'coming-soon',   // drives the card badge
  category: '…',
  summary: '…',
  problem: '…',
  solution: '…',
  stack: ['…'],
  results: [{ label: '…', value: '…' }],
  image: '/images/products/product-<slug>.jpg',
}
```

`ProductDetail` treats extras (`stats`, `overview`, `archetypes`, `features`) as optional and
guards them. `status` values are checked literally in `ProductCard.jsx` and `ProductDetail.jsx` —
a typo silently drops the badge. An unknown slug redirects to `/products`.

---

## 5. Working through the Cowork sandbox — known limits

If an agent is editing this repo from the Linux sandbox (mounted at
`/sessions/<session>/mnt/AllenCode/AllenCode`), two hard limits apply:

1. **File deletion is blocked** — `rm` returns `EPERM: operation not permitted` on the mount, even
   for files the agent just created. It can create and overwrite, never delete. So: **overwrite in
   place rather than writing a new filename**, or you'll strand a file the agent can't clean up.
   Any leftovers have to be removed from PowerShell on the Windows side.
2. **`npm ci` / `npm install` fails in-repo** — same `EPERM`, on `rmdir node_modules/fsevents`. It
   leaves a partial `node_modules/` behind. To validate a build, copy the repo out first:

```bash
mkdir -p /tmp/vcheck
tar cf - --exclude=node_modules --exclude=.git . | (cd /tmp/vcheck && tar xf -)
cd /tmp/vcheck && npm install && npm run build
```

Also note bash calls are killed at the end of each invocation — long installs need
`setsid nohup … &` plus a poll, and `git` may leave an undeletable `.git/index.lock` that must be
removed from Windows before the next git command will run.

---

## 6. Checklist

- [ ] Source image is 4:3 (~1.333), ≥1400px wide
- [ ] `grep -n "image:\|video:\|showcaseImage:" src/data/products.js` — no stale overrides
- [ ] Saved as `public/images/products/product-<slug>.jpg`, q90, `subsampling=0`, 160–250 KB
- [ ] `image:` path updated in `src/data/products.js` (leading `/`, no `public`)
- [ ] `video` / `showcaseImage` lines removed if present
- [ ] `npm run build` → exit 0, file present in `dist/images/products/`
- [ ] Slot numbers still sane if a product was inserted rather than appended
- [ ] Old `.svg` placeholder no longer referenced (safe to delete)

---

## 7. Current state (2026-07-25)

All four products are on real 4:3 JPGs:

| Product | Image | Size |
|---|---|---|
| My Teachers Toolbox | `product-my-teachers-toolbox.jpg` | 1456×1088, 192 KB |
| UnderFire AI | `product-underfire-ai.jpg` | 1456×1088, 159 KB |
| Founders Helm | `product-founders-helm.jpg` | 1392×1040, 189 KB |
| Crew Advisors | `product-crew-advisors.jpg` | 1456×1088, 225 KB |

Kirra Companion has a `product-kirra-companion.svg` in `public/images/products/` but **no entry in
`products.js`** — it does not render anywhere. The four `product-*.svg` placeholders for the
products above are now unreferenced and can be deleted.

No product currently uses `video` or `showcaseImage`. The `video` branch in `ProductCard.jsx` is
dead code but was left in place deliberately — it's a working general-purpose branch for when a
real demo video gets added to `public/`.
