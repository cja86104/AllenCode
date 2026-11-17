# Code World: the long business road, the ground, and ripples Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The business road's stops stand 42 units apart, with the page and the camera's pace to
match. The world is cut around the camera, so a long road fits the budget. A rolling grid ground
lies under it, and the cursor's ripples light its nodes.

**Architecture:**
- **Layout:** `roadLayout` takes the stop spacing per door. `WorldRoadChapters` takes the page between
  stops per door.
- **The cut:** `surroundings.js` (new) cuts the built world to the 66 units around the camera and
  builds and draws the ground mesh under it.
- **Ripples:** the same module traces the cursor and keeps the ripple trail.
- **Wiring:** `homeWorld` hands its built world to the surroundings and redraws when they cut. The
  renderer gains an `underlay` hook drawn between its clear and its glyphs, and exposes its context.
  The surroundings factory is passed in from `WorldLayer`, as the stretch's is.

**Tech Stack:** WebGL2 (`src/world`), React, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-16-code-world-long-road-ground-design.md`

## Global Constraints

- No suppression or placeholders; tests first; `npm run verify` after every task.
- The family road unchanged: spacing 14, page 80vh between stops, today's budget.
- Never-jumps: no 4 px of scroll moves the eye more than 0.15, on both doors.
- No cut along either road holds more than `budgetFor(tier)` glyphs.
- Canvas chunk ≤ 8.5 kB gzip.

## Review Focus

1. A recut mid-rest losing the resting landmark's range: its fade breaks or it flashes back.
2. The unfinished file's cursor index after a recut.
3. The cut at the fork, where the trunk, both branches, the editor and the signs are all in reach.
4. The ripple tracing through a crest and landing behind it.
5. The ground mesh on a resize or a door change: stale, or the wrong road's.

---

### Task 1: The long business road

**Files:** `src/world/roadLayout.js`, `src/scenes/WorldRoadChapters.jsx`, and the tests that pin the
business road's spacing.

**Interfaces:**
- `roadStepFor(door): number`, with `BUSINESS_STEP = 42` for door a and `ROAD_STEP = 14` for door b.
- `ROAD_BEFORE_BY_DOOR = { a: '240vh', b: '80vh' }`.

- [ ] Test:
  - door a's road stops stand `7 + 42k` along the road; door b's `7 + 14k`;
  - the swing and the hills keep their per-stop shape (one crest midway, stops in hollows);
  - the business page holds 240vh between stops and the family page 80vh;
  - the never-jumps limit holds on both doors.
- [ ] Implement, watch the tests pass, verify, commit.

### Task 2: The world cut around the camera

**Files:**
- Create `src/world/surroundings.js` (`cutWorld`, `WINDOW_RADIUS = 66`, `RECUT_AFTER = 20`,
  `WORLD_SCALE`).
- Modify `src/world/shapes.js`: `buildRoadWorld` takes an optional `budget` in its road argument.
- Modify `src/world/homeWorld.js`.
- Tests: `tests/worldSurroundings.test.js`.

**Interfaces:**
- `cutWorld(parts, center, radius): parts`. Same order and names; road parts (`*-road`, `*-edges`) cut
  by glyph; the rest whole or empty.
- `worldBudgetFor(door, tier): number`.

- [ ] Test:
  - a road part keeps exactly its glyphs within the radius, along with their colours, sizes, runs and
    flows;
  - a landmark part is kept whole if any of it is within reach, empty otherwise;
  - on both doors and every tier, the glyphs within 66 of any point along the road (every 2 units, the
    trunk and both branches included) number at most `budgetFor(tier)`;
  - door b's world budget is `budgetFor(tier)`.
- [ ] Implement, watch the tests pass, verify, commit.

### Task 3: The ground and the ripples

**Files:**
- `src/world/surroundings.js` (`groundMesh`, `groundHeight`, `createSurroundings`).
- `src/world/worldRenderer.js` (`underlay`, `context`).
- `src/world/WorldCanvas.jsx` and `src/world/WorldLayer.jsx` (passing the factory in).
- Tests: `tests/worldSurroundings.test.js`, `e2e/worldground.spec.js`.

- [ ] Test:
  - the ground's height equals the road's beside the road, is 0 at 28 or more units from it, and is 0
    at every stop's hollow and at the fork;
  - the mesh covers the cut, 2 units a cell;
  - a cursor ray traced at a crest lands on the near slope, not behind it;
  - a hit on the road makes no ripple; a hit 6 units off it does;
  - trail points are at least 0.75 apart, with at most 8 kept.
- [ ] e2e test:
  - a mouse moved across the dark beside the road marks the canvas `data-ripples` above 0, and it falls
    back to 0 after 1.5 s;
  - with no mouse it stays 0;
  - the canvas reports `data-cut` (the glyphs drawn) at or below the tier's budget.
- [ ] Implement, watch the tests pass, verify, commit.

### Task 4: The look and the record

- [ ] Screenshots, desktop and phone:
  - the business road between stops;
  - a landmark coming out of the fog;
  - the ground at the fork and at a crest;
  - a ripple.
- [ ] `npm run verify`; `npm run test:e2e`; blueprint row; sync with md5 checks.
