# Code World: the road's shape (turns and hills)

Date: 2026-11-16. Asked by Chris: "can we add in some turns to this? it just runs strait untill they
meet at the end … how do we change this to make it more unique and not just a strait line?" Options
shown: A winding, B turns per section, C hills. Chris chose: **"A with C on business, B with C on
family"**. Status: approved by Chris (2026-11-16: "approved"); built. It comes before W5b.

## Intent

Each door's road gets a shape of its own, so the journey reads as a place rather than a corridor, and
the two roads stop being mirror images of each other.

- **Business road:** winds gently left and right between stops (A), over rolling hills (C).
- **Family road:** runs straight through each section and turns a corner where the section changes
  (B), over rolling hills (C).

## Goals, non-goals, anti-goals

- Goals: the two shapes above; the camera following the road through every turn and over every rise,
  still resting square on to each landmark; both doors keeping today's density and budgets.
- Non-goals:
  - the fork, the two short branches, the bend where the roads meet, the shared road and the other
    road all stay as they are, flat and unchanged;
  - the inner pages' stretches stay straight and flat (a gentle curve there can follow later);
  - no change to the stops, their order, or the chapters' words.
- Anti-goals: a jerky camera on a phone; a landmark standing in the road or floating off the ground; a
  road that crosses itself.

## How it works

- **The shape lives in one place, the road's layout.** The onward road from the end of the branch to
  the start of the bend is no longer one straight line. It is laid in short pieces from a heading and a
  ground height that vary with distance along it:
  - **Business:** the heading swings either side of its starting heading in a smooth wave, one swing
    per stop (about 20°; built at 18°, the most that keeps the camera within the never-jumps limit on a phone), so each landmark comes round a curve.
  - **Family:** the heading stays put through a section and turns a corner (about 35°, over about 12
    units of road) between Hearth and the templates, then turns back before Done for you.
  - **Both:** the ground rises and falls in a smooth wave, about 2.5 units high, crests between stops
    and the stops in the hollows.
  - **Both:** the swing and the hills ease in from zero at the branch's end and out to zero at the
    bend, so the fork and the meeting are untouched. The road ends on its starting heading, so the
    bend works as now.
- **Everything already placed by distance along the road follows the shape.** That covers the
  landmarks and their stands, the side paths, the signs, How I work's commits, and the camera's keys.
  A landmark's height and the camera's eye height are measured from the ground where they stand.
- **The road's characters follow the ground.** The scatter, the three-line edges and the side paths
  take the height of the ground beneath them. The moving code runs along each short piece, as now.
- **What the eye gets:**
  - Rounding a curve brings the next landmark into view from the side.
  - Climbing, the camera looks up the rise; over the crest, down to the next stop.
  - The world has no solid ground, only characters, so a crest does not hide what is beyond it. That
    stays visible, lower, fading into the fog.

## Constraints

- No suppression, no placeholders, tests first, `npm run verify` and `npm run test:e2e` green.
- The camera's position moves smoothly everywhere: a step of 0.001 of the journey moves the eye less
  than today's limit, on both doors.
- The camera stays on the road's centre line (Chris, 2026-11-16 alignment fix), now in three
  dimensions.
- Glyph budgets unchanged. The opening keeps its full density and the landmarks at least nine tenths
  of their glyphs (`tests/worldRoadMotion.test.js`).
- Phone: Chris's meter (`/?world=1&meter=1`) on both doors after the change.

## Left to the builder

The exact swing, corner and hill numbers within the ranges above, tuned on screenshots at desktop and
phone sizes.
