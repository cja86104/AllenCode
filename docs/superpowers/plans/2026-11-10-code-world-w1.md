# Code World W1 Implementation Plan: the engine on the home page

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans (native). Steps use checkbox (`- [ ]`) syntax. Chris makes every commit; "Stop" steps replace commit steps; never create a branch. Session mechanics as in `BLUEPRINT-SKY-REDESIGN.md`: build and test in a cloud copy, sync source back with CRLF, verify by hash; the cloud copy pulls only when Chris's repo has new commits, and checks a stash against HEAD before dropping it.

**Goal:** The world from `/lab/world` runs on the real home page behind a switch (`/?world=1`): the empty file, into the code, the road, and the split road at the fork, where the visitor takes a branch; the home page without the switch is unchanged.

**Architecture:** The lab's frame loop becomes one reusable piece (`WorldCanvas`) used by the lab and the home. The camera path is built from a journey description (`buildJourney`) instead of fixed keys. In world mode the shell mounts `WorldLayer` (lazy, after first paint, like `FieldLayer`) in place of the field, and the home page renders `WorldHome`: one tall section per stop with that stop's real words, the fork as a split road with real buttons, then today's door chapters in their static (code beside result) form below the branch. GSAP and Lenis go to one named vendor chunk shared by the field and the world, with its own budget line.

**Spec:** `docs/superpowers/specs/2026-11-10-code-world-design.md` (sections 3, 4, 6, 7; W1 in section 8).

## Global Constraints

As the spec's section 2, plus: the home page without `?world=1` renders byte-identical prebuilt HTML and passes every existing e2e test unchanged; the switch is read only after hydration (`useHydrated`), so the prebuilt HTML never depends on it; the iPhone and desktop frame-time bar of the spec's section 7 holds at every stop of `/?world=1`.

## Review Focus

1. Switching on `/?world=1` with a door already stored: the journey starts at the empty file and runs down the stored road, with no mismatch on hydration.
2. A visitor who never takes a branch: the page ends at the split; nothing below it scrolls into view.
3. Gestures that are not choices: a vertical swipe, a pinch, a slow sideways drift under the threshold, a tap on the words: none takes a branch.
4. Reduced motion or no WebGL2 with the switch on: today's home page exactly, no canvas.
5. Navigating from the world home to an inner page and back: one canvas at a time, the field back on inner pages, no stray Lenis, ScrollTriggers or GPU buffers.

## File Structure

- `src/world/journey.js` (new): `buildJourney`, `branchForGesture`.
- `src/world/WorldCanvas.jsx` (new): the frame loop, renderer, landmark hand-over and meter, from `WorldLab.jsx`.
- `src/world/WorldLayer.jsx` (new): the shell's world, lazy, in place of `FieldLayer` in world mode.
- `src/world/worldSwitch.js` (new): `useWorldMode()`.
- `src/scenes/WorldHome.jsx` (new): the home page in world mode.
- Modify: `src/pages/WorldLab.jsx` (uses `WorldCanvas`), `src/App.jsx` (`AppShell` picks the layer), `src/pages/Home.jsx` (renders `WorldHome` in world mode), `src/world/camera.js` (keys from a journey), `vite.config.js` (`manualChunks` for `gsap` and `lenis`), `tools/budget/check.mjs` (world and vendor lines).
- Tests: `tests/worldJourney.test.js`, `tests/worldSwitch.test.jsx`, `e2e/worldhome.spec.js`; the lab's tests keep passing.

### Task W1.1: The journey and the split

**Interfaces:**
- Produces `buildJourney(door: 'a' | 'b' | null): { keys: CameraKey[], stops: Array<{ id: string, name: string, from: number, to: number }>, screens: number, splitAt: number }`. With `door` null the journey ends at the split (`splitAt` = 1). With a door it continues onto that branch (`a` the left, business; `b` the right, family) for a stretch of road, and `splitAt` is where the split sits in 0..1.
- Produces `branchForGesture({ dx: number, dy: number }): 'a' | 'b' | null`: a branch for a sideways movement of at least 48 px that is at least twice its vertical movement, `a` to the left and `b` to the right; anything else null.
- `cameraAt(progress, keys = CAMERA_KEYS)` keeps its behaviour for the lab.

- [ ] **Step 1:** Tests: `buildJourney(null)` ends at the split and its last key looks down both branches; `buildJourney('a')` and `('b')` share every key before the split, then turn left or right; continuity (no jump over 0.5 units per 0.001 progress) for all three; `screens` grows with the branch; `branchForGesture` for (-60, 5) `a`, (60, 5) `b`, (30, 0) null, (60, 50) null, (0, -200) null. Run: FAIL.
- [ ] **Step 2:** Implement. Run: PASS. `npm run verify`.

### Task W1.2: One world canvas, two hosts

**Interfaces:** Produces `<WorldCanvas journey={...} meter={boolean} onStop={(id) => void} />` (renderer, atlas, Lenis stepping only when no `ScrollEngine` is present, landmark hand-over, `data-ready`, `data-progress`, `data-landmark-fade`, `data-atlas-font`); `WorldLab` becomes a host of it with no change in behaviour.

- [ ] **Step 1:** Run the lab's unit and e2e tests (they are the contract). Move the loop into `WorldCanvas`. Run them again: PASS, unchanged. `npm run verify`.

### Task W1.3: The switch and the world home

**Interfaces:** Produces `useWorldMode(): boolean` (false on the server and while hydrating; true after hydration when the address has `world=1`, and kept for the session in `sessionStorage` key `allencode:world` so inner pages and the way back keep it; `world=0` turns it off); `<WorldLayer />`; `<WorldHome />`.

- [ ] **Step 1:** Tests: unit, `useWorldMode` false during hydration and true after with `?world=1`, false with `?world=0` after it was on, false when storage is blocked and the address has no switch. e2e (`e2e/worldhome.spec.js`): `/` has no world canvas and its prebuilt HTML is unchanged; `/?world=1` draws one world canvas, the empty file's code, the approved line and headline as real text, and stop names as it scrolls; reduced motion with the switch is today's home with no canvas. Run: FAIL.
- [ ] **Step 2:** Implement: `AppShell` renders `WorldLayer` on `/` when `useWorldMode()` is true, `FieldLayer` otherwise; `Home` renders `WorldHome` in world mode. `vite.config.js` `manualChunks`: `gsap` and `lenis` into `vendor-scroll`; budget lines for `vendor-scroll` and `WorldLayer`, set from the build (measured plus 5 percent, as Phase 8 did). Run: PASS. `npm run verify`, `npm run test:e2e`.

### Task W1.4: Taking a branch at the split

- [ ] **Step 1:** Tests (e2e, `/?world=1`): at the split the page does not scroll further and the rail names "The fork"; swiping left (touch, 120 px) takes `business/`, the door is `a` and the stop after the split is named; `→` takes `family/`; clicking the `business/` signpost button takes it; a vertical swipe and a 30 px sideways drift take nothing; after a branch, scrolling continues down it and then into today's door chapters in their static form; scrolling back up to the split and taking the other branch works; a stored door with the switch starts at the empty file and the split shows the stored branch taken. Run: FAIL.
- [ ] **Step 2:** Implement in `WorldHome` and `WorldCanvas`: the hold (page length ends at the split until a branch is taken), gestures through `branchForGesture` (wheel `deltaX`, touch, pointer drag), `←`/`→` while the split is on screen, the two signposts as `<button>`s with the fork's promises, `setDoor` from `DoorProvider`, the camera's turn and the glide (`glideTo`) down the branch. Run: PASS. `npm run verify`, `npm run test:e2e`. Screenshots at each stop and through the split, desktop and phone.

### Task W1.5: Measure and stop

- [ ] **Step 1:** Lighthouse 12 on `/` (switch off), mobile and desktop, against the Phase 9 numbers: no regression. Chris pushes; on his iPhone and desktop he opens `/?world=1&meter=1`, scrolls to the split, takes a branch, scrolls to the end, twice, and reports the meter line.
- [ ] **Step 2:** Record the numbers and Chris's verdict in this plan's ledger and the blueprint. Stop: Chris reviews; then the W2 plan (the business road: products first).

## Execution ledger
