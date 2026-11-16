# Code World W4: where the roads meet, and the ending

Date: 2026-11-16. Implements phase W4 of `docs/superpowers/specs/2026-11-10-code-world-design.md`
(section 3, "Both roads meet"; phase list "W4: The workshop, your idea in 3D, the plain ending, the
rail to 'shipped'"), the way W2 revised and W3 built the roads: today's chapters play, unchanged in
words and motion, each at its own landmark.

## Intent

Whichever door the visitor took, the journey ends in the same place. After their road's last stop
the road bends back and meets the other road coming in out of the fog; one shared road carries on
to the workshop (Chris's story becoming his photo), then to the visitor's own idea (their line
building its sketch), then fades out as the brief arrives. A rail at the screen's edge shows where
they are, from the empty file to shipped.

## Decisions (Chris, 2026-11-16)

- Option A: the two roads physically meet ("option a").
- The lab's rail comes to the home page ("yes lab rail").

## Goals

1. Both doors: after the last road stop (How I work, done for you) the road bends inward and joins a
   shared road; the other road comes in from the opposite side, unlit (edges and a little code, no
   landmarks), and the two merge.
2. The workshop: a portrait landmark (4:5, the photo's shape) on the shared road. Today's builder
   chapter rests there; its code flies onto the landmark and the photo takes over exactly there.
3. Your idea: the last landmark, an empty 4:3 frame of code. Today's idea chapter rests there; the
   visitor's line (and the example the chapter types itself) flies onto the frame and the sketch takes
   over there. The whole form stays reachable on a phone.
4. Past your idea the shared road runs on into the fog; the world fades out over one screen before
   the brief, which with the footer is the plain page.
5. The lab's rail on the home page in world mode: "empty file" at the top, "shipped" at the bottom,
   the current stop named, the marker following the scroll, reaching "shipped" at the brief.
6. Fix: in world mode today the builder's and the idea's flights are never placed (the world only
   places flights it can match to a road landmark), so their code vanishes. W4 places both.

## Non-goals

- Inner pages (W5). Retiring the pinned chapters (W6).
- Any change to the builder's, the idea's or the brief's words, behaviour, or the site without the
  switch, with reduced motion or without WebGL2.

## Anti-goals

- The camera leaving the road on the bend or the shared road (the R/W3 alignment fix holds: on the
  centre line through the middle of every stretch, looking down the road).
- The idea's form cut off or unreachable on any screen.
- Phone frame time over 25 ms p95 (Chris measured 24 in flight, 17–18 otherwise on the family road).

## Approaches

- **A. The roads physically meet (chosen).** Each road bends back to a shared road; the other road
  joins from the other side. One ending for everyone, and the world shows it.
- B. The workshop and your idea are just the next stops on whichever road was taken. Cheaper; nothing
  shows the roads meeting. Not chosen.

## Design

### Geometry (`roadLayout.js`)

After the last road stop, `BEND_AFTER` (14) on, the road bends over `BEND_LENGTH` (20) from its
heading to straight down −z (the trunk's heading); that bend's end is the junction. The shared road
runs −z from the junction: the workshop `FIRST_AT` (7) past it, your idea `ROAD_STEP` (14) after
the workshop, then `RUN_ON` (60). The other road is the mirror of the bend about the shared road's
centre line, run back `OTHER_ROAD` (40) from the junction into the fog. `layoutRoad` returns the
whole path (road, bend, shared road), `other` (the other road's path), and the two meeting
landmarks after the road's own. Run-on past the last road stop is replaced by the bend.

### Stops (`roads.js`, `route.js`)

`MEETING_STOPS`, appended to both doors' stops in `routeFor`: `{ id: 'workshop', name: 'The
workshop', kind: 'portrait', excerptId: 'builder' }`, `{ id: 'your-idea', name: 'Your idea', kind:
'sketch', excerptId: null }`. `roadSizes`: portrait 6 × 7.5 (4:5), sketch 6 × 4.5 (4:3).
`stopForFlight`: `builder` → `workshop`, `idea` (key `idea:<n>`) → `your-idea`.

### World (`shapes.js`, `homeWorld.js`)

The portrait is a screen landmark (a sculpture of the builder excerpt, its picture Chris's photo
once passed). The sketch landmark is `sketchFrame(roadCode, landmark, seed)`: an outline of ember
characters round the 4:3 frame and a faint grid of pale ones inside (exact, no flight touches it).
The other road: edges at full spacing and scatter at `ROAD_DENSITY / 8`, no landmarks. Budget as W3:
the screens share what is left.

### Camera (`worldTrack.js`)

The bend and shared road are road: centre-line travel keys as W3's fix. The workshop rests like a
product. Your idea's rest is measured from its section, not a pinned frame: the camera holds while
most of the section is on screen (from its top less a quarter screen to its bottom less three
quarters), and moves with the page through that hold so the frame stays under the sketch (the rest
pose at the hold's start and end, each framed on the sketch's box at that scroll, linear between).

### Page (`Home.jsx`, `WorldRoadChapters.jsx`)

In world mode, after the road's chapters: `ROAD_BEFORE` of road, the builder inside
`[data-world-segment="rest"][data-world-stop="workshop"]`, `ROAD_BEFORE`, the idea inside
`[data-world-segment="rest"][data-world-stop="your-idea"][data-world-hold="visible"]`, then the brief
inside `[data-world-segment="end"]`. `data-world-target` on the builder's portrait box and the idea's
sketch. The world's canvas fades out over the screen before the end section.

### Rail (`JourneyRail`)

The lab's rail moved to `src/world/JourneyRail.jsx` (the same markup, classes and marker), used by the
lab and by the home page in world mode with the home's stops: the opening's stops, the road's name,
each road stop, the workshop, your idea, shipped (the brief). The marker follows the scroll; the
current stop is named, `aria-current="step"`, the rest screen-reader only.

### Tests and verification

Unit: the bend and shared road (both doors, mirrored, the other road mirrored about the shared
road), the meeting stops and sizes, `stopForFlight`, `sketchFrame`, the budget on every tier for both
doors, the track on the centre line through the bend and the shared road, the idea's moving hold.
E2E (`worldmeeting.spec.js`): both doors reach the workshop (flight onto the landmark, photo takes
over there) and your idea (the example's flight lands, the form reachable on a phone), the world
fades before the brief, the rail names each stop and reaches shipped at the brief, axe clean.
`npm run verify`, the whole e2e suite, Lighthouse with the switch off, screenshots of both doors from
the last road stop to the brief on desktop and phone, the phone tier measured. Then Chris measures
`/?world=1&meter=1` on both doors to the brief.

## Left to the builder

Exact bend curve (a circular arc sampled into the path is fine), the sketch frame's grid spacing,
the rail's stop list helper, and the e2e scroll helpers (reuse `e2e/world.js`).
