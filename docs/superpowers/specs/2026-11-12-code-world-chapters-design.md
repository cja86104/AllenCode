# Code World: today's chapters, inside the world (revision of W2)

Date: 2026-11-12. Amends `docs/superpowers/specs/2026-11-10-code-world-design.md` (sections 3, 4 and phase W2). Replaces the stop panels and plain fade built in W2.5.

## Why

Chris, after seeing W2 (2026-11-12): "we lost the whole code turning into the images. we lost all the animation that the site now has in place of the walkway with just screens"; "crew does not have a box screen like the rest"; "even the first loading box is gone". Then: "it should work like it does now but with the world not one or the other"; "keep all the cool animations the site has now but start with that blank file like it does now and then as you scroll it enters the world. you can keep the set up just make sure it changes from code to the images not just finished image as you get there. also check your border lines it is messed up at the end." He picked approach A: each chapter's animation staged at its stop, inside the world.

The site's signature is code becoming the thing it builds. W2 kept the road and dropped that moment; this revision puts it back, with the world as the place it happens.

## Goals

1. **It starts as it does now.** The gate exactly as today: the empty file's editor box, the code typing, the characters flying into "Welcome to Allen Code Co. What would you like to build today?", "Scroll to enter". Then, scrolling on, the camera pulls back through the file into the world (W1's "Into the code"), down the road to the fork.
2. **Every chapter plays as it does now, at its landmark.** On the business road, in the order Chris set (products first): My Teachers Toolbox, UnderFire AI, Founders Helm, Crew Advisors, MVP Sprints, Custom SaaS Builds, AI Integration, Technical Audits, How I work. Each is today's chapter component, unchanged: its words and layout, its editor box, the typing, the counting stats, the hand-off to the real loop or screen; Crew Advisors' box typing unfinished with its cursor; the audit checking its lines one by one; How I work's changelog.
3. **Code becomes the picture, in the world.** As a chapter's flight plays, the characters lift off the editor, arc out toward the camera through the scene, and land on the landmark in the screen's colours until the code is the picture; then the real loop or screen takes over exactly there, as today. Never a finished image arriving on its own.
4. **The camera rests while a chapter plays.** It arrives at the chapter's landmark and holds square on, framed so the landmark sits exactly where today's layout puts the chapter's screen (text left and screen right on a desktop; text above and screen below on a phone). Between chapters it travels the road to the next landmark.
5. **The road looks finished.** Its edges and scatter run on past the last stop and fade into the dark instead of ending in a flat cut; How I work's three commits are clean marks on the edge line, not clusters that break it; edges join cleanly where the branch meets the road's straight run.

## Non-goals

- The family road (W3), the workshop and ending (W4), inner pages (W5). Door B in world mode stays as W1 left it.
- Any change to a chapter's copy, timing, order within its own section, or layout.
- The world without the switch: `/` without `?world=1`, reduced motion, no WebGL2 and a lost context all give today's page unchanged.

## Anti-goals (a failure even if it works)

- Any of today's animations missing in world mode.
- A landmark that appears as a finished image without its code flying into it.
- Two WebGL renderers running at once (the field and the world).
- The camera jumping or jerking anywhere, as it did at the fork in W2.
- A real screen covering a chapter's words, or the nav.

## Approaches

- **A. Stage each chapter at its stop, inside the world (chosen by Chris).** Today's chapter components run unchanged over the world; the world's renderer takes over the field's job of drawing the flights and draws them in 3D, landing on the landmark. One renderer; the chapters keep every behaviour because they are the same code.
- **B. Run today's 2D field flight over the world.** Least new code, but two renderers at once on a phone, the flight flat on top of the scene rather than in it, and seams where they hand over. Not chosen.
- **C. Rebuild each chapter's animation inside the world's own stop panels (what W2.5 started).** Rewrites working, tested animations and drifts from them; this is how W2 lost them. Rejected.

## Design

### The page in world mode

`Home` with the switch on and door A: today's `Gate`; the world opening (W1's journey from "Into the code" to the fork, its signposts and gestures, without W1's own "Empty file" stop, which the gate now is); then today's door A chapters, in products-first order, each preceded by a stretch of road (scroll with no chapter, while the camera travels); then today's Builder, idea and brief chapters as now. Door B and no door: as W1.

The chapters are the existing components (`ProductChapters`' chapters, `ServiceChapters`' chapters including the audit, `HowIWork`), rendered over the world: transparent backgrounds where today they rely on the page's dark (a gradient behind their words keeps text readable over the scene).

### The camera follows the page

The camera is driven by where the page is, not by one tall section: a track built from the DOM (each chapter section's top and pinned span; each stretch of road between them), measured on layout and resize. While a chapter's frame is pinned the camera rests at that chapter's landmark; while a stretch of road scrolls past it travels from one landmark's rest to the next along the road (the still keys and the road layout from W2.2 are kept).

A rest pose is computed, not tuned: given the landmark (centre, facing, size) and the box today's layout gives the chapter's screen for this viewport (`flightGeometry(...).targetBox`), the camera sits on the landmark's facing axis at the distance that makes its width fill that box, slid sideways and up so its projection lands exactly on the box, looking square on. Phones and desktops differ only through the box. This replaces W2.5's `aside` framing.

The camera never jumps. Chris saw it at the fork in W2 (2026-11-12): taking business/ on a desktop, the camera jumped right for a moment, then came back. Cause, measured: W2.5's sideways framing was a Catmull-Rom-curved value that overshot below zero on the turn, and the framing applied the whole slide whenever that value was not zero (its size divided out). So the rest framing blends in by a weight that runs 0 to 1 without overshoot (the camera's eased position between the travel key and the rest key, never a curved value of its own), and a test walks the whole journey, desktop and phone, and fails on any step that moves the eye more than the road's speed limit or reverses its sideways direction mid-turn.

### The flight, in the world

In world mode the world's canvas serves the field's transformation contract (`fieldBus.claimTransform` / `setTransformProgress` / `releaseTransform`, mode `'webgl'`), so every chapter and the gate drive it exactly as they drive the field today. It resolves a claimed transformation with the field's own `resolveTransform` (same code layout, same image sampling and colour lift, same pairing of characters to landing places), giving start and end places in CSS pixels; it places both on the landmark's plane by unprojecting through the resting camera (exact, because the camera rests square on while the chapter is pinned). Its flight program is the field's motion in 3D: the same delays, easing, copies emerging, size and colour change, with the arc lifting the characters out of the landmark's plane toward the camera before they land. The gate's flight lands on the plane of the world's editor, where the camera starts.

While a chapter is pinned its landmark's code sculpture fades out under the chapter's editor box as the camera settles (the box is the code now), so the code is never shown twice; the flight then rebuilds the landmark as the picture. Chapters without a flight (Crew Advisors, the audit) keep their box over the landmark while pinned, and their slab returns when the camera moves on. How I work has no landmark; it plays over the road at its commits.

At the start the world's editor (the empty file as the world's first landmark) stays hidden while the gate types and flies, so the file is not shown twice; once the headline has landed and the visitor scrolls on, the headline gives way, the world's editor appears around the camera, and it pulls back through the file into the world.

After a chapter, its landmark keeps the picture in characters (the landed flight) as the camera moves on, so the road behind is lined with what was built; ahead, landmarks still stand as code (W2's sculptures). Chris's earlier rule stands: every character comes from an approved excerpt.

### The road's edges

The road's path runs on well past the last stop, and its edges and scatter fade with distance (fog) to nothing instead of stopping. How I work's commits: three short brightened stretches of the edge line itself (the edge's own characters, larger and full ember), not clusters beside it. The branch's edges and the straight run's edges meet without a gap or overlap.

Side paths (Chris, 2026-11-12: "make the walkway have side sections that run to the screens… just making it look like paths to each"): from the road, a short spur runs left or right to the foot of each landmark, as the camera already swings that way; it is road like the rest (scatter of the road's characters, ember edges), joins the road's edge without a gap, and is scenery only. How I work has no landmark and no spur.

A stand for every landmark (Chris, 2026-11-12: "some kind of post on each… so it does not look like a movie screen. how about a double post under it with the code running in between. set up nice not all over the place"): two straight ember posts side by side under the landmark's centre, from the ground at its side path's end up to its bottom edge, and between them code rising in a few neat monospace columns, a live feed, fading in at the bottom and out at the top. Ordered on a grid, never scattered. It is separate from the code that changes into the picture (Chris: "not changing the code… something separate"): the road's own code, running all the time, never part of a flight. It stands under every landmark (Crew Advisors' and the audit's boxes too) and stays under the real screen after the hand-off.

### What W2 keeps and drops

Kept: `roads.js` (the business road's stops from the site's data), `roadLayout.js` (landmark placement), `journey.js` and `camera.js` maths (still keys; road keys), `shapes.js` (sculptures, slabs), the renderer's cursor and hidden ranges (Crew Advisors' slab from a distance), `worldFrame`, the W2.4 hydration fix. Dropped: `RoadStop.jsx`, `WorldScreen.jsx`, the road stop panels in `WorldJourney`, the plain hand-over fade, the `aside` framing and `wide` screen, `commitMarks` clusters.

### Measures

The W1/W2 bars hold: iPhone p95 ≤ 25 ms through the whole business road; desktop no regression; Lighthouse on `/` (switch off) no regression; budgets as recorded. A flight's characters count against the tier's glyph budget (the field's transformation budget, by tier).

## Calls I made (Chris to check)

- After a chapter the landmark stays as its picture in characters while you travel on (rather than turning back into code).
- A stretch of road between chapters is about 80vh of scroll, so travel between landmarks reads as travel, not a jump.
- Text over the world gets a soft dark gradient behind it, as the W1 stops have.
- The world's editor stays hidden while the gate plays, and appears as the visitor scrolls on past the headline.
- A landmark's code fades under its chapter's editor box as the camera settles, so the code is never shown twice.

## Left to the builder

The exact arc depth toward the camera, the fog distance for the road's end, the flight's glyph budget per tier, and how the track measures sections (within the bars above).
