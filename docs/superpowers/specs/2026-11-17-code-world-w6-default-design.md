# Code World W6: the world as the default — design

Date: 2026-11-17. Parent: `2026-11-10-code-world-design.md`, phase W6 ("Gates and the swap … then the
world becomes the default"). Decided by Chris (2026-11-17):
- Default for: "Everyone now" (not waiting on the iPhone measurement).
- Off switch: "Small toggle in footer" (and the phone menu), kept for the visit.

## Intent

Every capable visitor gets the Code World without a switch in the address. Anyone can turn it off, and
a visitor who prefers reduced motion, or whose browser has no WebGL2, still gets the plain site. No page
jumps as the world arrives.

## The gates, measured before the swap (Lighthouse 12 on `npm run preview`, my machine)

| Page | Phone, world off | Phone, world on | Desktop, world off | Desktop, world on |
| --- | --- | --- | --- | --- |
| `/` | 67, CLS 0 | 58, CLS 0 | 100, CLS 0 | 99, CLS 0 |
| `/products` | 53, CLS 0.001 | 29, **CLS 1.001** | — | — |
| `/about` | 63, CLS 0.001 | 36, **CLS 1.001** | — | — |

Accessibility and SEO are 100 everywhere.

- **The jump.** On every inner page with a stretch, CLS is 1.0. The stretch's 1.5-screen spacer is
  added after hydration and pushes the page's content (which fills the first screen) out of view
  0.3 s after load. The layout-shift entry names `main`'s content block, moving out of view. This is
  real on every device, and W6 fixes it.
- **Blocking time.** My machine draws WebGL on the CPU (SwiftShader), and Lighthouse's phone run slows
  that CPU 4×. Every world frame then counts as a long task (`/about` 9.9 s, `/products` 7.9 s, `/`
  3.8 s of long tasks per 10 s at 4×). On a phone's GPU that work is not main-thread time, so this
  machine cannot measure phone performance. The iPhone measurement (`?meter=1`, median at the
  display's refresh, p95 at most 25 ms) is Chris's, after the swap (Chris: "Everyone now").

## Goals

1. **On by default.** With the page hydrated, the world is on unless `?world=0`, or the visit has turned
   it off. `?world=1` still turns it back on. Reduced motion, no WebGL2 and a failed world still give the
   plain site.
2. **No jump.** A page with a stretch reserves the stretch's 1.5 screens before its first paint when the
   world is likely to run. The real spacer replaces the reservation in the same frame. CLS on every
   page stays under 0.1, world on or off.
3. **The toggle.**
   - In the footer, and in the phone menu: a "Plain view" switch (`aria-pressed`), on when the world is
     off.
   - Shown only where the world can run (WebGL2, no reduced motion, not failed).
   - Kept for the visit (session storage, the key the address switch already uses).
   - Turning it on or off changes the page at once, without a reload.
4. **The prebuilt HTML stays the plain page**, the same with JavaScript off. It holds no world markup,
   only a small script that runs before the first paint.

## Non-goals

- Retiring the plain site's pinned flight chapters and the field (W7).
- The award kit (W8).
- Any change to the world itself.

## Anti-goals

- A first paint that later moves.
- A plain-site visitor (reduced motion, no WebGL2, toggled off) who sees space reserved for a world
  that never comes. The reservation is only made when the world is likely to run, and it is dropped
  the moment the app knows the world is off.

## Approaches to the jump

1. **Reserve before paint (chosen).**
   - A script in `index.html`'s head marks `<html data-stretch-ahead>` when the path has a stretch and
     the world is likely to run: no `?world=0`, not turned off this visit, no reduced motion, WebGL2 in
     the browser.
   - CSS gives `main` a 150vh `::before` while that mark is set and the real spacer is not there yet
     (`:has`).
   - After hydration the app keeps the mark in step with whether a stretch is drawn.
2. Render the spacer in the prebuilt HTML, hidden unless marked. Rejected: the prebuilt HTML would
   carry world markup (the W1 rule: "its prebuilt HTML knows nothing of it").
3. Scroll past the spacer as it is added. Rejected: the visitor would miss the stretch.

## My calls

- **The head script matches stretch pages by shape:** `/products`, `/products/<anything>`, `/services`,
  `/templates`, `/about`, `/contact`. An unknown product slug (a 404) would reserve and then drop the
  space. That is a shift only on a mistyped address.
- **"Likely to run" only checks that `WebGL2RenderingContext` exists**, without creating a context
  (creating one costs time before paint). A browser that has the type but then fails to create a
  context drops the reservation: one shift, on a failure path only.
- **The plain site's browser tests turn the world off for their visit** (a shared fixture that sets the
  same session key the toggle sets). The world's own tests keep `?world=1`, which still works.
