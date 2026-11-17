# The long family road — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The family road gets the business road's 42-unit spacing, alternating tall and rolling hills, gentle bends between its two corners, and a budget fit by the cut around the camera.

**Architecture:** `roadStepFor('b')` becomes `BUSINESS_STEP`; `shapedRoad`'s `ground` and `turn` gain the family's hill pattern, bends and stretched corners; the page, the lab's journey and `WORLD_SCALE.b` follow, as they did for business.

**Tech Stack:** Vite/React, hand-written WebGL2, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-17-code-world-long-family-road-design.md`

## Global Constraints

- The business road, the opening, the fork, the bend, the shared road and the inner pages' stretches are unchanged.
- Every stop sits in a hollow at height 0, with the heading at each stop the road's own.
- No 4 px of scroll moves the eye more than 0.15.
- No `@ts-ignore`, `as any`, `eslint-disable`; `npm run verify` after every change.

## Review Focus

1. A tall hill's crest between the camera and a resting landmark: it must not hide the landmark at its rest.
2. A bend and a corner in the same stretch: a stretch with a corner gets no bend.
3. The meeting stops (portrait, sketch) keep `ROAD_STEP` and their timings.
4. The ground grid on the tall hills: it must follow the road's height out to 28 units, as on business.
5. The phone tier's budget on the longer family road.

---

### Task 1: The family road's length, hills and curves

**Files:** Modify `src/world/roadLayout.js`, `src/scenes/WorldRoadChapters.jsx`; Test: `tests/worldRoadLayout.test.js` and the tests that model the page (`worldTrack`, `worldJourney`, `worldRoute`, `WorldMeeting`).

**Interfaces:**
- Produces: `roadStepFor('b') === BUSINESS_STEP`; `ROAD_SHAPE` gains `tallHill: 7`, `rolling: 3`, `bend: 12° in radians`; `ROAD_BEFORE.b === '240vh'`.

- [ ] Step 1: Write the failing tests in `tests/worldRoadLayout.test.js`:
  - `roadStepFor('b')` is `BUSINESS_STEP`.
  - On the family road the stretch after its first stop peaks at 7 (±0.05) at its middle; the next stretch's three peaks are 2.5 (±0.05); each stop's height is 0.
  - The family road's heading at the middle of a stretch with no corner is ±12° from the heading at the stop before it, the sign alternating from one bending stretch to the next; in the stretches with corners there is no bend (heading at the corner's middle is half the corner).
- [ ] Step 2: Run `npx vitest run tests/worldRoadLayout.test.js`. Expected: those tests FAIL.
- [ ] Step 3: Implement in `shapedRoad`: per stretch `k = floor(wave(s))`, `f = wave(s) - k`; family ground `tallHill·(1−cos 2πf)/2` for even k, `hill·(1−cos 6πf)/2` for odd k (both × ease); family turn adds `bend·ease·sin(πf)·(−1)^k` in stretches without a corner; `cornerLength` is scaled by `spacing / ROAD_STEP`. Set `roadStepFor` and `ROAD_BEFORE.b`.
- [ ] Step 4: Run the whole unit suite; update the page-model and journey tests that encoded the family's 14-unit step to the new step (as was done for business), and keep the never-jumps test at 0.15. Expected: all pass.
- [ ] Step 5: Commit.

### Task 2: The budget and the record

**Files:** Modify `src/world/surroundings.js` (`WORLD_SCALE.b`), `tests/worldSurroundings.test.js`, `BLUEPRINT-SKY-REDESIGN.md`.

- [ ] Step 1: Change the family budget test: each family landmark keeps within 10% of its glyphs from before this change; no cut holds more than the tier's budget.
- [ ] Step 2: Run it. Expected: FAIL at `WORLD_SCALE.b` = 1.
- [ ] Step 3: Measure and set `WORLD_SCALE.b` per tier.
- [ ] Step 4: `npm run verify`; `npm run test:e2e`. Expected: exit 0 / all pass. Check the family road with screenshots: a tall crest, a rolling stretch, a bend, a corner, and a resting landmark.
- [ ] Step 5: Update the blueprint row and commit.
