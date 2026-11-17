# W5b: the drive between pages — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Navigating to a stretch page from the home page or another stretch page drives on ahead for 0.6 s; the rail's current stop is written vertically.

**Architecture:** A pure `src/world/drive.js` (timing, poses, fades), used by `stretchWorld.js` (outside the canvas chunk); the renderer remembers its last camera; `JourneyRail.jsx` sets the stop's label vertical.

**Tech Stack:** Vite/React, hand-written WebGL2, Vitest, Playwright.

**Spec:** `docs/superpowers/specs/2026-11-17-code-world-w5b-drive-design.md`

## Global Constraints

- The code world canvas chunk stays within 9 kB (8.78 now): only the renderer's last camera goes in it.
- A page loaded directly plays no drive; the drive ends exactly on the stretch's camera at the scroll.
- The new page stays held back until its landing, as in W5a.
- No `@ts-ignore`, `as any`, `eslint-disable`; `npm run verify` after every change.

## Review Focus

1. Navigating again mid-drive: the new drive starts from the camera last drawn.
2. Scrolling during the drive: the second half follows the stretch's camera at the current scroll.
3. Leaving a stretch for the home page mid-drive: the home world draws as today.
4. A resize mid-drive: the stretch rebuilds; the drive carries on.
5. The rail label at the top and bottom stops: never past "empty file" or "shipped".

---

### Task 1: The drive

**Files:** Create `src/world/drive.js`; modify `src/world/worldRenderer.js`, `src/world/stretchWorld.js`; Test: `tests/worldDrive.test.js`, `e2e/worlddrive.spec.js`.

**Interfaces:**
- Produces: `DRIVE_MS = 600`, `DRIVE_DISTANCE = 12`; `driveAt(elapsed) → { half: 'out' | 'in', u, travel, alpha } | null` (null once 600 ms have passed); `driveCamera(camera, distance) → camera` (eye and target moved together along the level look direction); renderer `lastCamera` (the camera of the last `render`, or null).

- [ ] Step 1: Unit tests: `driveAt(0)` is `out` with travel 0 and alpha 1; `driveAt(299)` is `out` near travel 12 and alpha near 0; `driveAt(300)` is `in` with travel −12 and alpha 0; `driveAt(599)` is `in` with travel near 0 and alpha near 1; `driveAt(600)` is null; the speed either side of 300 ms matches within 2%; `driveCamera` moves eye and target the same level distance, keeping height and fov.
- [ ] Step 2: Run them. Expected: FAIL (no module).
- [ ] Step 3: Implement `drive.js`; add `lastCamera` to the renderer; in `stretchWorld.frame`, when it would build a new stretch and `renderer.lastCamera` is set, start a drive (`from` = that camera, `fromShown` = the canvas's opacity); during `out` render the old shapes from `driveCamera(from, travel)` at `fromShown · alpha` and skip the rest of the frame; at `in` build, then draw the frame as usual from `driveCamera(camera, travel)` with its opacity times alpha; mark `data-drive`.
- [ ] Step 4: Unit suite, then the e2e test: from `/products` with the world on, a nav click to Services shows `data-drive="out"`, then `"in"`, then none, ending on `stretch:services`; loading `/services` directly never shows `data-drive`. Expected: pass.
- [ ] Step 5: Commit.

### Task 2: The rail's label, and the record

**Files:** Modify `src/world/JourneyRail.jsx`, `BLUEPRINT-SKY-REDESIGN.md`; Test: an e2e check in `e2e/worldhome.spec.js`.

- [ ] Step 1: e2e: on the home road at a stop with a long name, the current stop's label is taller than it is wide, sits left of the line within 24 px of it, and stays between the rail's end labels.
- [ ] Step 2: Run it. Expected: FAIL.
- [ ] Step 3: Set the label vertical, anchored down from the stop in the upper half and up to it in the lower half.
- [ ] Step 4: `npm run verify`; `npm run test:e2e`; screenshots of the drive's two halves and the rail. Expected: pass.
- [ ] Step 5: Update the blueprint row; commit.
