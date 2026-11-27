# Living UI, scroll feel and the peel — design

Date: 2026-11-27. Parents: `2026-11-10-code-world-design.md` and
`2026-11-26-truth-pass-rail-jumps-3d-service-design.md`. Asked for by Chris after a review of three
sites (oryzo.ai and lusion.co by Lusion; landonorris.com by OFF+BRAND): "ok lets do that 3 -1 test 2".

## What the three sites showed (measured in the built-in browser, 2026-11-27)

- oryzo.ai: three.js r178 (modified by Lusion), Astro, Rive for UI, six canvases, camera paths baked
  in Blender (`hero_camera.buf`, `CAMERA_ANIM.buf`), SMAA, a BRDF table. Fonts: Halyard (variable),
  Literata, DM Mono.
- lusion.co: three.js r158, Astro, one WebGL2 canvas, matcap shading, low and high detail copies of
  each model (`grid_structure_ld.buf` / `_hd.buf`). Fonts: Aeonik, IBM Plex Mono, Lusion Mono.
- landonorris.com: Webflow, three.js r174, Lenis, Rive on every button, the nav, the page transition
  and the signature; the hero helmet is a Draco-compressed `helmet-21.glb` lit by a studio HDRI,
  landing on and lifting off a studio photo; MSDF fonts for text in 3D.

Against this site: Code World already scrolls a keyed camera (`src/world/camera.js`), Oryzo's main
trick, so a Blender export adds little. What is missing is the feel on a phone: `ScrollEngine` runs
`new Lenis()` with defaults, which leaves touch to Safari's own momentum, and the camera is a pure
function of the scroll, so a hard flick rushes down the road (Chris, 2026-11-21: "it scrolls very fast").

## Chris's answers (2026-11-27)

1. #3, animated UI: "Same feel, no Rive". No new dependency; built with what the site already ships
   (CSS, GSAP, framer-motion).
2. #1, scroll feel: "Try all three on lab". Three modes behind a switch, judged on his iPhone.
3. #2, the lab test: "Screen peels to code". A product's real screen peels away to show its real code,
   then rebuilds.

## The three pieces, in Chris's order

### A. Living UI (no Rive) — WITHDRAWN

Chris, 2026-11-27: "no the orange borders and colored buttons... that was allencode about 5 designs
back... even for the non 3d version you should be thinking scrolling animations new cutting edge
design... both have to be to those standards." Being redesigned; the list below is kept only as
what was rejected.

- Buttons: on hover and keyboard focus, an orange fill wipes in from the left (about 220 ms) and the
  arrow nudges 3 px; pressing scales to 0.97. CSS only, one shared class, so no script grows. The
  label stays readable at every point of the wipe (axe passes in both states).
- Nav menu icon: its lines morph into a close mark and back (framer-motion, already in `Nav.jsx`).
- Page transition, only where the world's drive does not run (Plain view, no WebGL2): an orange scan
  line sweeps down as the old page fades and the new one rises (about 450 ms).
- Reduced motion: none of these move; states change at once.

### B. Scroll feel lab

`?feel=` on any page with the world. Not stored, so no visitor sees it unless the link carries it.
Today's behaviour is the default and stays so until Chris picks.

- `?feel=touch`: Lenis takes over touch scrolling (`syncTouch`, `syncTouchLerp`,
  `touchInertiaExponent`, all in the installed Lenis 1.3.27). `?inertia=` from 1 to 3 tunes the
  momentum on the phone without a new build.
- `?feel=ease`: the page scrolls as today, and the camera eases toward the scroll (a damped follower,
  half-life about 180 ms). Landmark screens are placed from the same eased camera, so they stay locked
  to their landmarks.
- `?feel=long`: on a touch screen each road stop gets 2.25 screens of scroll instead of 1.5.
- With `?meter=1` the frame meter also shows the mode.

### C. The peel (lab)

`?peel=1`, on the UnderFire AI stop only. When the camera has rested at the stop for about 1.2 s and
its real screen is laid over the landmark, the screen gives way to its picture in characters (which
the world already draws). Those characters then lift off row by row, top first, and land as UnderFire
AI's approved excerpt (`src/content/excerpts/product-underfire-ai.js`) in the same rectangle. They hold,
then fly back into the screen. Scrolling on reverses it at once. This reuses the transformation buffers
(start: the picture's glyphs, end: the excerpt's). Real code only: the existing approved excerpt, with
no new or edited code shown. No WebGL2 or reduced motion: no peel, and the screen stays.

Video stops (Chris, 2026-11-27: "yes option a"): a product stop ends with its real loop playing over
the landmark (`MediaLoop` in `ProductChapter.jsx`), while the world's picture in characters is built
from the poster. When the peel starts, the loop pauses and the frame on screen at that moment is read
into characters (the loops are same-origin), so the peel starts from exactly what the visitor sees.
When the characters land back, the loop fades in and plays on from where it paused. Scrolling on
mid-peel snaps straight back to the loop. If the frame read is too slow on Chris's iPhone (Task C1
times it), fall back to fading to the poster over about 300 ms before the peel.

## Guards

- Budget: no new dependency; every chunk stays within `tools/budget/check.mjs`.
- The world's guards still pass (every landmark 97–101% of its glyphs; the camera's fastest 4 px within
  0.15; the opening full).
- iPhone p95 frame time at most 25 ms with each feel mode and during the peel (`?meter=1`).
- No prices, no sound, no `eslint-disable`, `// @ts-check` on every new or changed file.

## Open questions for Chris

1. The peel's trigger: on its own after the stop rests (works on a phone; proposed), or on hover and
   tap?
2. The peel's stop: UnderFire AI (proposed: the first product, and its excerpt is approved) or another?
3. After the iPhone run, the chosen feel becomes the default in a follow-up plan, not this one. Agree?
