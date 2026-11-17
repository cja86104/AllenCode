# Code World: the long business road, the ground, and compiler ripples

Date: 2026-11-16. Asked by Chris: "the family side is good … i don't want to change that side. the
business side road needs to be longer as longer as you can make it and it items along the way need to
be spread out … two can we add some kind of 'ground' … and 3 … Interactive 'Compiler' Ripples".

Chris chose:
- spacing: **"3x: one in view"**;
- budget: **"Build around the camera"**;
- ground: **"Grid that rolls with hills"**.

He asked for all three at once.

## Intent

- **Business road:** slower and quieter. One landmark in view at a time, each appearing out of the fog
  as the last one leaves, with long gentle stretches of road between them.
- **Ground:** the world gets ground to stand on, a faint grid that gives it structure.
- **Ripples:** exploring the dark with the cursor is rewarded with brief dim-orange ripples on that
  grid, while the screen at rest stays clean.

## Non-goals

- Any change to the family road's shape, spacing or pace.
- Any change to the inner pages' stretches.
- Ripples on touch screens: there is no cursor to follow.

## How it works

### 1. The long business road

- **Spacing:** the business road's stops stand 42 units apart (`BUSINESS_STEP`; the family road keeps
  14). Its swing and its hills follow the stop spacing, so there is one gentle swing and one long low
  crest between stops.
- **Page:** the page between two business chapters grows in step, from 80vh to 240vh, so the camera
  travels at today's pace and stays within the never-jumps limit.
- **What stays the same:** the shared road and the meeting stops.

### 2. Built around the camera

- **The rule:** the camera never sees past the fog's far edge, 46 units. So the world is cut to what
  stands within 66 units of where the camera was at the last cut, and cut again once the camera has
  moved 20 units.
- **The cut:**
  - The road's scatter and edges are cut glyph by glyph.
  - Every object (landmark, picture, stand, slab, sign, editor) is kept whole or left out whole, so
    fades and the unfinished file's cursor keep working.
- **What changes for the eye:** nothing is ever cut inside the fog's reach.
- **The budget:**
  - The whole business road is built once with a larger budget (`WORLD_SCALE`).
  - The test that matters is that no cut, anywhere along the road, holds more than the tier's budget.
  - The family road keeps today's whole-world budget, so it is unchanged.

### 3. The ground

- **The mesh:** a grid mesh under the cut, 2 units a cell, built at each cut.
- **Its height:**
  - It takes the road's height beside the road and eases down to flat 28 units away.
  - The hills roll out to either side as low ridges.
  - The stops' hollows are flat, and so are the fork and the shared road.
- **How it's drawn:** faint grey lines, every 2 units. They fade into the fog like the glyphs, and they
  are left off the roads themselves, so the road reads clean. The grid is drawn before the glyphs,
  without hiding them.

### 4. Compiler ripples

- **Where the cursor lands:** on a mouse move, the cursor's ray from the camera is traced to the ground.
- **The trail:** if it lands off the road and within the fog's reach, the point joins a trail of the
  last 8 places, kept at least 0.75 units apart.
- **The glow:** grid nodes within about 3 units of a trail point glow dim orange (`#f97316` at low
  alpha), fading out over 1.2 seconds.
- **At rest:** with the mouse still or on a phone, nothing lights.

## Constraints

- No suppression or placeholders; tests first; `npm run verify` and `npm run test:e2e` green.
- The never-jumps limit (0.15 per 4 px) on both doors.
- No cut holds more than `budgetFor(tier)`.
- The family road unchanged: its tests stay green as they are.
- The world's bundle budgets hold. The ground and the cut are passed in from the world layer, as the
  inner pages' stretch is, so the canvas chunk stays within its limit.
