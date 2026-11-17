# W6: the world as the default — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** The world on by default for capable visitors, with no layout shift, and a "Plain view" toggle in the footer and phone menu.

**Architecture:** `worldSwitch.js` gains the default and a small preference store; `index.html` gains a pre-paint script and `index.css` a reservation rule; `App.jsx` keeps the pre-paint mark in step; a `PlainViewToggle` component sits in the footer and the phone menu.

**Tech Stack:** Vite/React, Vitest, Playwright, Lighthouse 12.

**Spec:** `docs/superpowers/specs/2026-11-17-code-world-w6-default-design.md`

## Global Constraints

- The prebuilt HTML holds no world markup (`data-world` never appears in it).
- CLS under 0.1 on every page, world on and off.
- `?world=0` / `?world=1` keep working; the session key stays `allencode:world` ('0' off, '1' on).
- No `@ts-ignore`, `as any`, `eslint-disable`; `npm run verify` after every change.

## Review Focus

1. A reduced-motion visitor: no reservation, no toggle, the plain site.
2. Toggling to plain on a stretch page mid-scroll: the spacer and world go, the page reads from where it is.
3. Navigating from a stretch page to checkout success: the mark is dropped, nothing reserved.
4. Storage blocked: the world is on, the toggle still works for the page's life.
5. A 404 under `/products/`: reserved then dropped (accepted, recorded).

---

### Task 1: On by default, and the preference store

**Files:** `src/world/worldSwitch.js`; Test: `tests/worldSwitch.test.jsx`.

**Interfaces — Produces:** `worldModeFrom({ hydrated, flag, stored })` (on unless not hydrated, `flag === '0'`, or `flag !== '1' && stored === '0'`); `setPlainView(plain: boolean)`; `usePlainView(): boolean`; `useWorldCapable(): boolean` (WebGL2, no reduced motion, not failed).

- [ ] Step 1: Tests: on with no flag and nothing stored; off with `?world=0`; off when stored '0'; `?world=1` on over a stored '0'; `?world=0` stores '0', `?world=1` stores '1'; `setPlainView(true)` turns `useWorldMode` off in a rendered hook and stores '0'; `setPlainView(false)` back on.
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: Run the unit suite. Expected: pass.
- [ ] Step 5: Commit.

### Task 2: No jump

**Files:** `index.html`, `src/index.css`, `src/App.jsx`; Test: `e2e/worldcls.spec.js`.

- [ ] Step 1: e2e: on `/`, `/products`, `/products/underfire-ai`, `/services`, `/templates`, `/about`, `/contact`, with the world on by default, the sum of layout shifts (no recent input) over the first 3 s is under 0.1; with `?world=0`, the same; with reduced motion, `html` has no `data-stretch-ahead` on `/about`.
- [ ] Step 2: Run. Expected: FAIL on the stretch pages (1.0).
- [ ] Step 3: Implement the head script, the CSS rule, and the App effect (after hydration only).
- [ ] Step 4: Run. Expected: pass.
- [ ] Step 5: Commit.

### Task 3: The toggle

**Files:** `src/components/PlainViewToggle.jsx` (new), `src/components/Footer.jsx`, `src/components/Nav.jsx`; Test: `e2e/worldtoggle.spec.js`.

- [ ] Step 1: e2e: on `/about` with the world on, the footer's "Plain view" button is `aria-pressed="false"`; pressing it removes the world canvas and the spacer, sets it pressed, and keeps it off on the next page; pressing again brings the world back; in the phone menu the same button is there; with reduced motion there is no such button.
- [ ] Step 2: Run. Expected: FAIL.
- [ ] Step 3: Implement.
- [ ] Step 4: Run. Expected: pass; axe passes on the footer.
- [ ] Step 5: Commit.

### Task 4: The plain site's tests, the gates, the record

**Files:** `e2e/plain.js` (new), the plain-site specs' imports, `e2e/worldhome.spec.js` (the default changed), `BLUEPRINT-SKY-REDESIGN.md`.

- [ ] Step 1: The fixture; switch the plain-site specs to it; update the home test for the new default.
- [ ] Step 2: `npm run verify`; `npm run test:e2e`. Expected: all pass.
- [ ] Step 3: Lighthouse on every page (phone and desktop) with the world on by default and with `?world=0`: CLS under 0.1 everywhere, accessibility and SEO 100; record the numbers.
- [ ] Step 4: Blueprint row; commit.
