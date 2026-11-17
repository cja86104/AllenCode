# Code World: the road's shape Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The business road winds over hills and the family road turns its corners over hills, with the
camera following both, the stops in the hollows, and the fork, the bend where the roads meet and the
shared road unchanged.

**Architecture:**
- **Shape:** `layoutRoad` lays the onward road (branch end to bend start) in 1-unit pieces from a
  heading and a ground height that vary with distance. Path points carry the ground's height as a third
  number.
- **Path helpers:** `roadAt` and `roadBetween` return it.
- **Shapes and shader:** the road's scatter and edges take it, and the road's moving code runs along
  the slope (its run becomes x, y, z and loop).
- **Camera and sign:** the camera's road keys stand on it, and so does the "our work/" sign.
- **Hollows:** every stop is in a hollow at height 0, so landmarks, stands, side paths and commits are
  unchanged.

**Tech Stack:** hand-written WebGL2 (`src/world`), Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-16-code-world-road-shape-design.md`

## Global Constraints

- No suppression of any kind; no placeholders; tests first; `npm run verify` after every task.
- Fork, branches, bend, shared road, other road, inner-page stretches: unchanged.
- The camera's eye on the road's centre line (≤ 0.15) through the opening and between stops, now at
  the ground's height plus `EYE_HEIGHT`.
- Budgets unchanged; `tests/worldRoadMotion.test.js` stays green (opening full, landmarks ≥ 90%).

## Review Focus

1. A winding stretch passing under a landmark on the other side (road through a sculpture).
2. The road crossing itself on the family road's corners.
3. The camera dipping below the ground or the target under the road at a crest.
4. The bend where the roads meet starting at a height or heading other than the flat road's.
5. The moving code on a slope floating off or sinking into the road.

---

### Task 1: The ground's height along the road

**Files:**
- Modify `src/world/roadPath.js`. Its `Point2` becomes `[number, number, number?]`: x, z, and the
  ground's height, 0 when absent.
- Test: `tests/worldRoadPath.test.js` (create).

**Interfaces:**
- Produces `roadAt(layout, distance): { point, heading, height }`.
- Produces `roadBetween` points carrying `[x, z, height]`.

- [ ] Test:
  - a path `[[0,0,0],[0,-10,2],[0,-20,0]]` gives height 1 at 5 and 2 at 10;
  - `roadBetween(…, 2, 18)` ends at heights 0.4 and 0.4, with its middle point `[0,-10,2]`;
  - a path of plain `[x, z]` gives height 0 everywhere.
- [ ] Run the test, watch it fail, implement, watch it pass, verify, commit.

### Task 2: Each road's shape

**Files:**
- Modify `src/world/roadLayout.js`.
- Test: `tests/worldRoadShape.test.js` (create); update the existing layout tests where they pin a
  straight road.

**Interfaces:**
- Produces `ROAD_SHAPE = { swing, hill, corner, cornerLength }`.
- The path's onward points carry heights.

- [ ] Test, on both roads:
  - height 0 at every stop's distance;
  - a crest of `ROAD_SHAPE.hill` (within 5%) midway between consecutive road stops;
  - height 0 and the starting heading at the bend's start;
  - the branch's points unchanged.
- [ ] Test, business road:
  - the heading swings either side of its start by up to `swing`;
  - at each landmark the road turns away from it (the landmark on the outside of the curve).
- [ ] Test, family road:
  - the heading is constant through each section;
  - it turns by `corner` between Hearth and the templates, and back before Done for you.
- [ ] Test, both roads: no part of the road comes within `LATERAL - 1` of a landmark's foot except its
  own stretch, and the road never crosses itself.
- [ ] Run the tests, watch them fail, implement, watch them pass, verify, commit.

### Task 3: The road's characters on the ground

**Files:**
- Modify `src/world/shapes.js` (`codeRoad`, `roadEdges`, `roadGateway`, the gateway in
  `buildRoadWorld`), `src/world/worldRenderer.js` and `src/world/worldShaders.js`.
- Tests: `tests/worldRoadMotion.test.js`, `tests/worldShapes.test.js`, `tests/worldLandmark.test.js`.

**Interfaces:**
- `stream` becomes four floats a glyph: dx, dy, dz, loop.
- `STRIDE` becomes 15.
- `aStream` becomes a `vec4`.
- `roadGateway(label, { at, heading, halfWidth, ground? }, seed)`.

- [ ] Test:
  - on a sloped path, every scatter and edge glyph sits within 0.11 (scatter) or 0.03 (edges) of the
    ground beneath it;
  - each scatter glyph's run is the 3D unit direction of its piece;
  - the "our work/" sign's posts start at the ground there and its label stands 3.3 above it;
  - the packed stride is 15;
  - the shader moves `position.xyz` along `aStream.xyz`.
- [ ] Run the tests, watch them fail, implement, watch them pass, verify, commit.

### Task 4: The camera on the ground

**Files:**
- Modify `src/world/worldTrack.js` and `src/world/journey.js` (`onRoad` adds the ground's height).
- Test: `tests/worldTrack.test.js`.

- [ ] Test: between stops the eye is `EYE_HEIGHT` (within 0.05) above the ground at its distance
  along, on both doors and both viewports. The existing centre-line and smoothness tests stay green.
- [ ] Run the test, watch it fail, implement, watch it pass, verify, commit.

### Task 5: The look and the record

- [ ] Screenshots, desktop and phone, both doors: a curve, a crest, a corner.
- [ ] `npm run verify`; `npm run test:e2e`.
- [ ] Blueprint row; sync to Chris's machine with md5 checks.
