# Living UI, scroll feel and the peel — plan

Spec: `docs/superpowers/specs/2026-11-27-living-ui-scroll-feel-peel-design.md`. Three phases in Chris's
order (A, B, C), with a stop for his review and commit after each. Session rules as the blueprint's.
Build and test in the cloud copy; copy files back with CRLF; Chris runs no `npm install` (no new
dependencies in this plan).

## Phase A: Living UI

### Task A1: Inventory
- [ ] Step 1: List every button and button-styled link (grep `src/` for their classes) and record the
  list here, with which get the wipe. Stop for Chris only if one is unclear.

### Task A2: The button wipe
**Files:** `src/index.css`, the components from A1; Tests: `tests/policy.test.js` unchanged, `e2e/a11y.spec.js`.
- [ ] Step 1: Tests: hover and focus-visible states pass axe contrast; reduced motion has no transition.
- [ ] Step 2: Run. Expected: FAIL (no state yet).
- [ ] Step 3: Implement one shared class; apply it.
- [ ] Step 4: Run. Expected: pass. `npm run budget`: entry CSS under 9 kB.

### Task A3: The nav icon
**Files:** `src/components/Nav.jsx`; Tests: `tests/Nav.test.jsx` (create if missing).
- [ ] Steps: test the open and closed states and `aria-expanded`; FAIL; implement; pass.

### Task A4: The page transition (Plain view and no WebGL2)
**Files:** `src/App.jsx` (`AppShell`); Tests: `tests/hydration.test.jsx`, `e2e/`.
- [ ] Step 1: Tests: no transition on first load or hydration (no mismatch); none while the world's
  drive runs; none under reduced motion; `ScrollToTop` still lands at the top.
- [ ] Steps 2–4: FAIL; implement; pass.

### Task A5: Gates and record
- [ ] `npm run verify`; `npm run test:e2e`; blueprint row with the real output. Stop for Chris.

## Phase B: Scroll feel lab

### Task B1: `src/scroll/feel.js`
- [ ] Parse `?feel=` (`native` default, `touch`, `ease`, `long`) and `?inertia=` (1–3, clamped). Unit
  tests first (red), then green.

### Task B2: `touch`
**Files:** `src/scroll/ScrollEngine.jsx`.
- [ ] Lenis options from `feel.js`; the default stays `new Lenis()` exactly. Test that native makes
  the same instance options as today.

### Task B3: `ease`
**Files:** `src/world/WorldLayer.jsx` (or `WorldCanvas.jsx`, whichever reads `journeyProgress()`), a
pure `src/world/follow.js`.
- [ ] Step 1: Read how screens are laid over landmarks; confirm they take the drawn camera. Record it.
- [ ] Step 2: Tests: the follower converges, never overshoots, and does nothing at native; jumps and
  drives still land exactly (`jump.js`, `drive.js`).
- [ ] Steps 3–4: FAIL; implement; pass.

### Task B4: `long`
**Files:** `src/world/journey.js` (the 1.5-screen stop constant).
- [ ] Tests: touch plus `long` gives 2.25 screens per stop; the world's guards pass on every tier.

### Task B5: Gates, then Chris's iPhone run
- [ ] `npm run verify`; `npm run test:e2e`.
- [ ] Chris, on his iPhone (Safari) with `?meter=1`, two full scrolls of the business road in each of
  `native`, `touch` (try `inertia` 1.5, 2, 2.5), `ease` and `long`; his verdict and p95 recorded
  here. Stop for Chris.

## Phase C: The peel (lab)

### Task C1: Spike
- [ ] Confirm the UnderFire stop's picture glyphs and the excerpt can feed one `Transformation`
  (`src/field/transformation.js`) within the stop's glyph budget. Record the counts. Stop if not.

### Task C2: `src/world/peel.js`
- [ ] Pure timeline (rest, peel, hold, return, reverse on scroll); unit tests first.

### Task C3: Wire it behind `?peel=1`
- [ ] Tests: no peel without the flag, without WebGL2 or under reduced motion; only the approved
  excerpt renders; no stray GPU resources after leaving the stop or the page.

### Task C4: Gates and record
- [ ] `npm run verify`; `npm run test:e2e`; Chris's iPhone and desktop with `?peel=1&meter=1`: p95 at
  most 25 ms; his verdict. Blueprint row. Stop for Chris.
