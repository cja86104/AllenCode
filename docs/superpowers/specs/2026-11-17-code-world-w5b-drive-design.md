# Code World W5b: the drive between pages — design

Date: 2026-11-17. Parent: `2026-11-16-code-world-inner-pages-design.md` (phase W5b). Asked for by Chris:
"now we can continue on"; the drive: "Drive on ahead". Also folded in (Chris, 2026-11-17): "the info bar
that runs on the right side … can you turn the text vertical running next to the line … see in the image
how it sticks out in the way". Ripples under reduced motion: "ripples with motion off is fine".

## Intent

With the world on, moving to a page with a stretch feels like driving there, not a cut. Whatever the
visitor was looking at drives on ahead into the fog, and the new page's road comes up out of the fog,
with the camera arriving at its start.

## Goals

- Navigating to a page with a stretch (Products, a product page, Services, Templates, About, Contact) from
  the home page or from another stretch page plays a drive of 0.6 s:
  - the first half: the camera speeds forward from where it was, along the way it was looking, while
    the old world fades out;
  - the second half: the new page's road, the camera coming in from behind the stretch's start and
    slowing to it, as the new world fades in.
  The speed carries across the swap, so it reads as one drive.
- A page scrolled past its world (the world already faded out) has nothing to drive away from: the
  drive is just the new road coming in.
- The journey rail's current stop is written vertically beside the line, as "empty file" and "shipped"
  are, so a long name no longer sticks out over the page.

## Non-goals

- No drive to the home page, checkout success or the 404 page (home opens on its gate, the others on
  the field): navigating there is as today.
- No site road, no map of pages (Chris chose "Drive on ahead" over "One site road").
- No change to a stretch itself, the home road or the plain site.

## Anti-goals

- A first visit that plays a drive: a page loaded directly opens on its stretch as today.
- A headline that shows before its landing: the new page stays held back as in W5a.
- A drive that leaves the camera somewhere the scroll does not put it: it always ends on the stretch's
  camera at the current scroll.

## Approaches

1. **Drive on ahead (chosen by Chris).** The same in every direction and from anywhere, the home road
   included; one world in the renderer at a time.
2. One site road in nav order: true to a map, but backward drives and getting on from the home road are
   awkward, and every stretch would be in the world at once.
3. Lift and drop: quick, but less of a drive.

## The how (my calls, each open to correction)

- The renderer remembers the last camera it drew with. A stretch page reached with that camera set (from
  the home page or another stretch) starts a drive; a page loaded directly has none, so no drive.
- First half (0–0.3 s): the old world's shapes, still in the renderer, drawn from the last camera moved
  forward along its level look direction by 12 · u² units (u the half's share), at its last opacity
  times 1 − smoothstep(u). Its fades, flight and ground are not drawn (it is leaving).
- Second half (0.3–0.6 s): the new stretch built, drawn from its camera at the current scroll moved back
  along its level look direction by 12 · (1 − u)² units, at its opacity times smoothstep(u). The two
  halves' speeds match at the swap (24 units per half at u = 1 and u = 0).
- The canvas is marked `data-drive` ("out", then "in") while it plays, for tests.
- The rail's current stop: `writing-mode: vertical-rl`, left of the line, running down from the stop in
  the rail's upper half and up to it in the lower half, so it never runs past either end's label.

## Left to the builder

The exact easing, if 12 units or 0.6 s read wrong on screen.
