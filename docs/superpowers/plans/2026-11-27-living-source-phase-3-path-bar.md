# Living Source Phase 3: the path bar — Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan
> task-by-task (Chris, 2026-11-27: native, no subagents). Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A second bar under the nav on every world-off page, `allencode / 02_our-work / underfire-ai`,
that says where the visitor is and goes anywhere else from any segment.

**Architecture:** The tree is pure data built from `services.js`, `products.js`, `templates.js` and the
home's two order lists, which move out of their scene files into `src/data/homeOrder.js` so the bar
(in the entry script, inside `Nav`) never pulls a scene or the excerpt registry into the entry. Which
chapters actually rendered is read from the DOM by their existing attributes, never from the excerpt
registry. The bar is in the prebuilt HTML; the pre-paint script marks `html[data-world-ahead]` where the
world is likely to run, CSS hides the bar there, and it unmounts once the world is on.

**Tech Stack:** React 18, React Router 6.30, Tailwind 3, Vitest + Testing Library, Playwright + axe.
JavaScript with `// @ts-check`.

**Spec:** `docs/superpowers/specs/2026-11-27-living-source-2d-design.md` (sections "The rules of C" and
"Phase 3 design: the path bar").

## Global Constraints

- World off only: Plain view, no WebGL2, reduced motion. The bar and the world's rail never show together.
- Services first, then our work, then how I work (section F); templates are door B's.
- `<nav aria-label="Where you are">` holding an `<ol>`; current file `aria-current="location"`; segments are
  disclosure buttons (`aria-expanded`); Escape closes and returns focus; click outside closes; 44 px targets;
  no live region (the path is heard once).
- Phone (below 768 px): one chip in the header row, `02 / underfire-ai ▾`, opening the whole tree as a
  full-width sheet.
- One ease: `cubic-bezier(.16, 1, .3, 1)`, 500–700 ms. Orange `#f97316` on `#0a0a0a`; JetBrains Mono for the
  path. No glow, no gradient.
- No new dependency. Entry script stays at or under 152 kB gzip (147.85 kB on 2026-11-27).
- Lighthouse accessibility and SEO stay 100; CLS no worse than `docs/living-source/baseline.md`.
- `// @ts-check` on every new file; no `eslint-disable`, `@ts-ignore`, `as any`.
- Chris commits; no branches. Each task ends at a stop for his review.

## Decisions this plan makes (flag at review if any is wrong)

1. **What each segment opens.** Home: `allencode` is a link to the top; the branch segment lists the
   branches; the file chip lists that branch's files. A one-file branch (`00_origin`, `04_how-i-work`
   to `07_start`) has no file chip: the branch segment is the orange chip. Inner page:
   `allencode / pages / <page>`: `pages` lists the home branches (each goes home there), the chip lists the
   pages (services, products, templates, about, contact). Product detail:
   `allencode / pages / products / <slug>`, `products` a link to `/products`, the chip lists the products.
   Checkout success and the 404 read `pages / checkout-success` and `pages / not-found`.
2. **A shared branch before a door** (`05`–`07`): choosing it chooses door A, as the nav's primary action
   treats no door as business.
3. **A service chapter that is in `SERVICE_CHAPTERS` but did not render** (today Intelligent AI Systems,
   waiting on its excerpt) keeps its place in the order and lands on its panel on `/services`. Same rule
   for a product (its `/products/<slug>` page) and a template (`/templates`).
4. **File labels** are the slugs; each menu row also shows the name (`underfire-ai` over `UnderFire AI`),
   so the accessible name contains the visible text.
5. **Where a jump lands:** a pinned section (direct child `.pin-frame`) at its top; any other section at its
   top less the header's height, so its heading is never under the bar.
6. **Fixed before this plan (Chris, 2026-11-27: "yes fix the bug"):** `Fork.jsx`'s door A `firstChapter`
   named MVP Sprints, so business/ glided past the two flagships. It is now every `SERVICE_CHAPTERS` slug as
   one selector list (the first shown in the page wins); `tests/Fork.test.jsx` has two new cases, and
   `e2e/swap.spec.js` checks the chapter is at the top, not merely above it (it had passed with the bug).
   Task 1 points that import at `src/data/homeOrder.js`.

## Review Focus

1. A service whose chapter did not render (Intelligent AI Systems today) lands on its `/services` panel with
   its heading focused, never a dead jump or a glide to the top. → Task 4, `hidden chapter falls back`.
2. A 360 px phone: logo, chip and menu button fit one row, the chip truncates its file, the page never
   scrolls sideways. → Task 2, `phone header fits at 360`.
3. A world-capable visitor never sees the bar flash before hydration and never sees it beside the rail. →
   Task 2, `hidden where the world will run`.
4. Going to a home file from an inner page, or across doors, waits for the lazy home and its chapters, and
   falls back after 4 s instead of hanging. → Task 4, `from an inner page` and `across doors`.
5. A route change or the browser's back button with a menu or the sheet open closes it. → Task 3,
   `route change closes`.

---

### Task 1: The tree

**Files:**
- Create: `src/data/homeOrder.js`, `src/pathbar/tree.js`
- Modify: `src/scenes/ServiceChapters.jsx:24-33` (definition moves; re-export it),
  `src/scenes/TemplateChapter.jsx:18-27` (same for `DOOR_B_TEMPLATES` and `DOOR_B_CATEGORIES`)
- Modify: `src/door/Fork.jsx` (its import, as the fix above says)
- Test: `tests/pathTree.test.js`

**Interfaces:**
- Produces, `src/data/homeOrder.js` (imports only `src/data/templates.js`):
  `SERVICE_CHAPTERS: ReadonlyArray<{ slug: string, excerptId: string }>`,
  `DOOR_B_TEMPLATES: ReadonlyArray<Template>`. The scene files `export { … } from '../data/homeOrder.js'`
  so every existing import still works.
- Produces, `src/pathbar/tree.js`:
  - `PathTarget = { kind: 'home', selector: string, template?: string } | { kind: 'page', path: string, selector?: string }`
  - `PathFile = { id: string, label: string, title: string, target: PathTarget, fallback: PathTarget | null }`
  - `PathBranch = { id: string, door: Door | null, title: string, files: PathFile[], target: PathTarget | null }`
    (`target` set only on a one-file branch)
  - `homeTree(): PathBranch[]`, `pageFiles(): PathFile[]`, `productFiles(): PathFile[]`
  - `findFile(id: string): { branch: PathBranch | null, file: PathFile | null } | null` (a one-file branch
    is found by its branch id with `file: null`)
  - `PathSegment = { kind: 'root' } | { kind: 'branches', branch: PathBranch } | { kind: 'files', branch: PathBranch, file: PathFile }
    | { kind: 'pages' } | { kind: 'link', label: string, to: string } | { kind: 'page', file: PathFile, siblings: PathFile[] }`
  - `homeSegments(currentId: string | null): PathSegment[]`, `pageSegments(pathname: string): PathSegment[]`

- [x] **Step 1: Write the failing tests** in `tests/pathTree.test.js`:
  - `branches in story order`: ids are exactly `00_origin, 01_services, 02_our-work, 03_templates,
    04_how-i-work, 05_who-builds-it, 06_your-idea, 07_start`; doors `null, a, a, b, a, null, null, null`.
  - `services follow the home, then the rest`: `01_services` labels equal
    `[...SERVICE_CHAPTERS.map(c => c.slug), 'acquisition-readiness']`, length 9; every service in
    `services.js` appears once (a service added to the data appears without touching the tree).
  - `service targets and fallbacks`: `immersive-web-experiences` targets
    `{ kind: 'home', selector: '[data-chapter="immersive-web-experiences"]' }` with fallback
    `{ kind: 'page', path: '/services', selector: '[data-service="immersive-web-experiences"]' }`;
    `acquisition-readiness` targets that page panel directly, fallback `null`.
  - `products in data order`: four labels equal `products.map(p => p.slug)`; selector `[data-product="<slug>"]`,
    fallback path `/products/<slug>`.
  - `templates`: first `hearth` (`[data-door-b-intro]`), then `DOOR_B_TEMPLATES` ids (selector
    `[data-door-b-template="<id>"]`, `template: <id>`), last `done-for-you` (`[data-chapter="done-for-you"]`);
    fallback `/templates`.
  - `one-file branches` target `[data-chapter="gate"]`, `"how-i-work"`, `"builder"`, `"idea"`, `"brief"`.
  - `segments`: `homeSegments(null)` kinds `['root', 'branches']` on `00_origin`;
    `homeSegments('02_our-work/underfire-ai')` kinds `['root', 'branches', 'files']`;
    `pageSegments('/services')` kinds `['root', 'pages', 'page']`, page label `services`;
    `pageSegments('/products/underfire-ai')` kinds `['root', 'pages', 'link', 'page']`, siblings = `productFiles()`;
    `pageSegments('/nope')` page label `not-found`; trailing slash ignored.
- [x] **Step 2: Run** `npx vitest run tests/pathTree.test.js` — expect FAIL, module not found.
- [x] **Step 3: Move the two order lists** into `src/data/homeOrder.js` with their doc comments; re-export
  from the scene files.
- [x] **Step 4: Implement `src/pathbar/tree.js`.** File ids are `<branchId>/<label>`; titles come from the
  data (`service.name`, `product.name`, `template.name`; fixed titles `Hearth`, `Done for you`, `The gate`,
  `How I work`, `Who builds it`, `Your idea`, `Start a project`). Build once at module load and freeze.
- [x] **Step 5: Run** `npx vitest run tests/pathTree.test.js tests/ServiceChapters.test.jsx tests/TemplateChapter.test.jsx`
  — expect PASS.
- [x] **Step 6: Run** `npm run lint && npm run typecheck` — expect clean.
- [x] **Step 7: Stop for Chris** (he reviews and commits).

**Done 2026-11-27.** `tests/pathTree.test.js` 10/10 (red first: module missing); `npm run verify` exit 0, 628/628,
entry script 148.45 kB (unchanged), Home 13.20 kB; e2e doorb, services, swap, chaptertext, worldbusiness, worldfamily,
worldjump 85/85. Ruling: the move re-cut the chunks (roads.js imported the two scenes for these lists): Home
10.30 → 13.20 kB, roads 7.95 → 4.92 kB, the plain home's total 18.25 → 18.12 kB.

### Task 2: The bar in the header

**Files:**
- Create: `src/pathbar/PathBar.jsx`
- Modify: `src/components/Nav.jsx` (mount it), `index.html:9-22` (pre-paint mark), `src/App.jsx:43-46`
  (keep the mark in step), `src/index.css` (hide rule), `src/scenes/ServiceChapters.jsx:64-75` (floor),
  `src/scenes/Gate.jsx:154` (static top padding)
- Test: `tests/PathBar.test.jsx`, `e2e/pathbar.spec.js` (new, uses `e2e/plain.js`), `e2e/chaptertext.spec.js`

**Interfaces:**
- Consumes: `homeSegments`, `pageSegments` (Task 1); `useWorldPage` (`src/world/worldSwitch.js`).
- Produces: `PathBar({ currentId?: string | null }): JSX.Element | null` — renders
  `<div data-path-bar>` holding `<nav aria-label="Where you are"><ol>…</ol></nav>` from 768 px, and the
  phone chip `<button data-path-chip>` below it; returns `null` when `useWorldPage()` is not null.
  Segments render as buttons with `aria-expanded="false"` (menus arrive in Task 3); the current file or
  one-file branch carries `aria-current="location"` and the orange chip style.
- Produces: `PATH_BAR_FLOOR_PX = 112` and `wordsRise(text, h, floor = NAV_FLOOR_PX)` in `ServiceChapters.jsx`;
  the chapter passes `PATH_BAR_FLOOR_PX` when the bar shows and the viewport is at least 768 px wide.

- [x] **Step 1: Write the failing unit tests** in `tests/PathBar.test.jsx` (MemoryRouter + DoorProvider):
  `names the place` (nav named "Where you are", an `ol`, `allencode` and `00_origin` at `/`);
  `inner page` (`/services` shows `pages` and `services`, `services` has `aria-current="location"`);
  `current file` (`currentId="02_our-work/underfire-ai"` shows `02_our-work` and the chip `underfire-ai`);
  `phone chip text` (`02 / underfire-ai`); `segments are disclosures` (each non-root segment is a button with
  `aria-expanded="false"`). Extend `tests/ServiceChapters.test.jsx`: `wordsRise` with floor 112 never rises
  above 112 px.
- [x] **Step 2: Write the failing e2e tests** in `e2e/pathbar.spec.js`:
  - `on every page`: for `/`, `/services`, `/products`, `/products/underfire-ai`, `/templates`, `/about`,
    `/contact`, `[data-path-bar] nav[aria-label="Where you are"]` is visible at 1280 × 720.
  - `prebuilt`: against `npm run preview`, the raw HTML of `/` and `/services` contains `data-path-bar` and
    `00_origin` / `services` (request with JavaScript disabled).
  - `hidden where the world will run` (default fixture, not `plain.js`, WebGL2 available): before the app
    runs (`page.route` holding the entry script) the bar is not visible and `html` has `data-world-ahead`;
    after load the bar is not in the DOM and the journey rail is.
  - `phone header fits at 360`: at 360 × 740 the chip is visible, the bar row is hidden, the header is one
    row (height under 72 px), `document.documentElement.scrollWidth <= 360`.
- [x] **Step 3: Extend `e2e/chaptertext.spec.js`:** the existing `words stay below the fixed navigation`
  check already measures `header`'s bottom; add the plain fixture at 1280 × 720 and 768 × 1024 so it runs
  with the bar, for every service chapter, and add the gate (static, reduced motion) and the door B intro.
- [x] **Step 4: Run** `npx vitest run tests/PathBar.test.jsx` and
  `npx playwright test e2e/pathbar.spec.js e2e/chaptertext.spec.js` — expect FAIL.
- [x] **Step 5: Implement.**
  - `PathBar.jsx` as above: bar row `hidden md:flex h-10 border-t border-white/10`, segments `mono text-[11px]
    uppercase tracking-widest`, separators `/` `aria-hidden`; buttons at least 44 px tall by padding, not by
    the row (the row is 40 px; the hit area extends with `py-3 -my-1`).
  - `Nav.jsx`: `<PathBar />` as the header's last child; the phone chip sits in the `xl:hidden` row before
    the menu button, `md:hidden`, `max-w-[9.5rem] truncate`.
  - `index.html`: where it sets `data-stretch-ahead`, also set `data-world-ahead`, same condition.
  - `App.jsx`: beside the stretch toggle, `toggleAttribute('data-world-ahead', Boolean(world))` once hydrated.
  - `index.css`: `html[data-world-ahead] [data-path-bar], html[data-world-ahead] [data-path-chip] { display: none; }`.
  - Floor in `ServiceChapters.jsx`; Gate static section `pt-24` → `pt-32`. Any other chapter that fails
    Step 3 takes the same floor parameter in its words placement.
- [x] **Step 6: Run** the Step 4 commands — expect PASS; then `npm run verify` — expect clean, and note the
  entry script size it reports.
- [x] **Step 7: Stop for Chris.**

**Done 2026-11-28.** Unit 640/640 (`tests/PathBar.test.jsx` 8, `tests/pathBarStore.test.js` 1, three new in
`tests/ServiceChapters.test.jsx`, each red first); `npm run verify` exit 0, entry script 150.50 kB (was 148.45), CSS 8.24,
Home 13.38; e2e 288/288. Rulings (each with its cost in the ledger):
- The pre-paint mark is `data-likely-world`: `e2e/worldhome.spec.js` holds that the prebuilt HTML has no `data-world`.
- `src/pathbar/pathBarStore.js` tells a pinned chapter the bar is shown (`ServiceChapters` renders outside the router
  in its tests); `useWordsFloor(width)` gives every pinned chapter's words the header's bottom as their highest place
  (services, products, door B's opening, templates, the builder; the pinned audit pads its frame). The plan named
  services only; at 768 px the phone layout put words at 102 px, under the bar.
- With the bar, seven scope items need 40 px more frame: Immersive takes the compact form at 1024 x 768 and
  1280 x 720; the full list is checked at 1024 x 808 and 1280 x 740.
- The bar row is 44 px; the header is 112 px from 768 to 1279 px. Gate static padding `pt-24 md:pt-32`.
- The phone chip: below 400 px it shows the file alone (its parent stays for screen readers), so `underfire-ai`
  reads whole at 360 px; the header row's gap before the menu button is 12 px (was 16).
- `e2e/nav.spec.js` measures the logo's row as `header > div:not([data-path-bar])`.
- Budget: 1.50 kB left for Tasks 3–5. Task 3 loads the menus and the sheet on first press.

### Task 3: The menus and the phone sheet

**Files:**
- Create: `src/pathbar/PathMenu.jsx`, `src/pathbar/useDisclosure.js`
- Modify: `src/pathbar/PathBar.jsx`
- Test: `tests/PathBar.test.jsx`, `e2e/pathbar.spec.js`, `e2e/a11y.spec.js`

**Interfaces:**
- Produces: `useDisclosure(): { open: boolean, toggle(): void, close(returnFocus?: boolean): void,
  buttonRef: RefObject<HTMLButtonElement>, panelRef: RefObject<HTMLElement> }` — closes on Escape (focus
  back to the button), on a pointerdown outside button and panel, and on `location.key` change.
- Produces: `PathMenu({ items: ReadonlyArray<PathFile | PathBranch>, currentId: string | null, onChoose: (id: string) => void, id: string })`
  — a `<ul id>` of rows, each a `<button>` (home files) or `<Link>` (pages) showing label over title, the
  current row `aria-current="location"`, rows at least 44 px tall.
- Produces: `PathBar` gains `onGo?: (id: string) => void` (Task 4 supplies the real one; default a no-op),
  and the phone sheet: `<div data-path-sheet>` under the header, full width, `max-h-[70vh] overflow-y-auto`,
  every home branch with its files nested, then the pages.

- [x] **Step 1: Write the failing unit tests:** `branch menu lists branches` (clicking `02_our-work` sets
  `aria-expanded="true"`, `aria-controls` names a list of 8 rows); `file menu lists the branch's files`
  (chip `underfire-ai` opens 4 rows, `underfire-ai` row current); `Escape closes and returns focus`;
  `outside click closes`; `route change closes` (navigate in the MemoryRouter while open); `choosing calls
  onGo with the id and closes`; `phone sheet lists everything` (chip opens a sheet with 8 branches, 9 + 4 +
  8 files across them (counts read from the data, not written in), 5 pages).
- [x] **Step 2: Extend e2e:** in `e2e/pathbar.spec.js`, `keyboard`: Tab to `02_our-work`, Enter opens, the
  first row takes focus on ArrowDown, Escape returns focus; `browser back closes the sheet` at 390 × 844.
  In `e2e/a11y.spec.js`, run axe with a branch menu open (1280 × 720) and with the sheet open (390 × 844),
  plain fixture; no violations.
- [x] **Step 3: Run** both suites — expect FAIL.
- [x] **Step 4: Implement.** Menus open below their segment, `bg-[#0a0a0a] border border-white/10`, opacity and
  4 px rise over 500 ms on the one ease, none under reduced motion. Arrow keys move between rows; Home/End
  to the ends; Tab leaves and closes.
- [x] **Step 5: Run** both suites and `npm run verify` — expect PASS and clean.
- [x] **Step 6: Stop for Chris.**

**Done 2026-11-28.** Unit 649/649 (nine new in `tests/PathBar.test.jsx`, each red first); `npm run verify` exit 0,
entry script 151.01 kB, the menus' own chunk 1.58 kB (loaded on the first press), CSS 8.42 kB; e2e 292/292 (keyboard,
a page reached from its menu, the sheet closed by Back, axe with a menu and the sheet open). Rulings:
- The menus, the sheet, their rows and their key and outside-press handling (`usePanelKeys`) live in `PathMenu.jsx`,
  loaded on first press; the entry keeps only `useDisclosure` (open for the address it opened at, so a route change
  closes it). With rows built in the entry it reached 151.52 kB, leaving too little for Tasks 4 and 5.
- `PathMenu` takes the segment and where the visitor is and builds its own rows (the plan passed `items`).
- The keyboard check runs on `/services` (`pages`): the home's path stays at `00_origin` until Task 5.
- The sheet's group labels are white at 60 % (axe: 45 % and 35 % failed contrast at 11 px).
- Budget for Tasks 4 and 5: 0.99 kB. Task 4 loads `go.js` on the first choice; Task 5 measures in the home chunk
  and tells the bar through `pathBarStore.js`.

### Task 4: Going to a file

**Files:**
- Create: `src/pathbar/go.js`
- Modify: `src/pathbar/PathBar.jsx` (default `onGo`)
- Test: `tests/pathGo.test.js`, `e2e/pathbar.spec.js`

**Interfaces:**
- Consumes: `findFile` (Task 1); `glideTo` (`src/scroll/glide.js`); `useDoor`; `useNavigate`;
  `usePrefersReducedMotion` (`src/field/environment.js`).
- Produces:
  - `landingY(el: Element, headerBottom: number): number` — document top, less `headerBottom` unless the
    element has a direct `.pin-frame` child; never below 0; rounded up.
  - `templateSegmentY(sectionTop: number, sectionHeight: number, viewportH: number, index: number, count: number): number`
    — `ceil(sectionTop + index * (sectionHeight - viewportH) / count) + 1` (lands inside segment `index` as
    `useSectionProgress` counts it).
  - `waitForElement(selector: string, timeoutMs = 4000): Promise<Element | null>` — checks each frame.
  - `focusHeading(el: Element): void` — first `h1, h2, h3` in it (else it), `tabindex="-1"` if needed,
    `focus({ preventScroll: true })`.
  - `goTo(id: string, ctx: { pathname: string, navigate: (to: string) => void, door: Door | null, setDoor: (d: Door) => void, reducedMotion: boolean }): Promise<void>`
    — order: switch door if the branch's door differs (a shared branch with no door: `'a'`); route to the
    target's path if not already there; wait for the selector; on a flight template chapter (its section has
    more than one `[data-door-b-template]`) use `templateSegmentY`, else `landingY`; `glideTo(y, { instant:
    reducedMotion })`; when `scrollY` is within 2 px of `y` or after 1500 ms, `focusHeading`. No element
    after the wait: go to `fallback` the same way; no fallback: stay and do nothing.

- [ ] **Step 1: Write the failing unit tests:** `landingY` (pinned at its top; static at top − header; never
  negative); `templateSegmentY` (index 0 → top + 1; index 2 of 5 with span 4500 → top + 1801);
  `waitForElement` (resolves when added later; `null` after the timeout, fake timers);
  `goTo` with stubs: `switches door for a template from door A`, `routes home from /services`,
  `falls back to the services panel when the chapter never appears`, `a shared branch with no door chooses A`,
  `instant under reduced motion`.
- [ ] **Step 2: Write the failing e2e tests** (plain fixture, 1280 × 720 unless named):
  - `goes to a chapter`: door A, choose `02_our-work` → `underfire-ai`; `[data-product="underfire-ai"] h2` is
    focused and its section's top is within 2 px of the top.
  - `hidden chapter falls back`: for every `01_services` file, after choosing it, either
    `[data-chapter="<slug>"] h2` is focused on `/`, or the page is `/services` and `[data-service="<slug>"] h2`
    is focused and below the header.
  - `across doors`: door A, choose `03_templates` → the third template; the door is B (`aria-pressed` on the
    nav's switch) and that template's heading is focused.
  - `from an inner page`: on `/about`, `pages` → `04_how-i-work`; on `/`, `[data-chapter="how-i-work"] h2`
    focused.
  - `before a door`: fresh visit, `05_who-builds-it`; door A chosen, the builder's heading focused.
  - `reduced motion`: same as the first with `reducedMotion: 'reduce'`; static sections' headings below the header.
- [ ] **Step 3: Run** both — expect FAIL.
- [ ] **Step 4: Implement `go.js`** and wire `PathBar`'s default `onGo` with the hooks above.
- [ ] **Step 5: Run** both and `npm run verify` — expect PASS and clean.
- [ ] **Step 6: Stop for Chris.**

### Task 5: Following the scroll

**Files:**
- Create: `src/pathbar/current.js`
- Modify: `src/pathbar/PathBar.jsx` (use it on `/`)
- Test: `tests/pathCurrent.test.js`, `e2e/pathbar.spec.js`

**Interfaces:**
- Produces:
  - `Probe = { id: string, top: number, bottom: number }` (document pixels)
  - `pickCurrent(probes: ReadonlyArray<Probe>, y: number): string | null` — the probe containing `y`; else
    the last whose `top <= y`; else `null`.
  - `segmentProbes(sectionTop: number, sectionHeight: number, viewportH: number, ids: ReadonlyArray<string>): Probe[]`
    — segment `i` from `sectionTop + i * span / n` to the next; the last runs to the section's bottom.
  - `measureProbes(tree: PathBranch[], doc?: Document): Probe[]` — one per file or one-file branch whose
    element is in the DOM; `00_origin` from 0 to the first other probe's top; flight template chapters
    split with `segmentProbes`.
  - `useCurrentFile(enabled: boolean): string | null` — on scroll and resize, once per frame, measures and
    picks at `scrollY + innerHeight / 2`; re-renders only on a change.

- [ ] **Step 1: Write the failing unit tests:** `pickCurrent` (inside, between probes, before all, empty);
  `segmentProbes` (5 segments, span 4500, contiguous, last ends at the section's bottom);
  `measureProbes` on a jsdom document with stubbed `getBoundingClientRect` (origin first, a missing chapter
  skipped).
- [ ] **Step 2: Write the failing e2e tests:** `follows the scroll` (door A, scroll to each product chapter's
  middle; the chip reads its slug); `follows the templates` (door B, flight mode, scroll into the second
  segment; the chip reads that template's id; same in reduced motion); `reads 00_origin at the top`;
  `no announcement` (the bar contains no `aria-live` and no `role="status"`).
- [ ] **Step 3: Run** both — expect FAIL.
- [ ] **Step 4: Implement `current.js`** and pass `useCurrentFile(pathname === '/')` into `homeSegments`.
- [ ] **Step 5: Run** both, `npm run verify`, `npm run test:e2e` (the full suite: the bar sits in every page's
  header) — expect PASS and clean.
- [ ] **Step 6: Stop for Chris.**

### Task 6: Measured against the baseline, and written down

**Files:**
- Modify: `docs/living-source/baseline.md` (a Phase 3 after-section), `CLAUDE.md` (the 2D section),
  the spec's Phase 3 heading (`built, 2026-…`)

- [ ] **Step 1: Run** `npm run verify` — note the entry script size; it must be at or under 152 kB. If it is
  over, `PathMenu` moves to a lazy chunk loaded on a segment's first press (the bar's row itself stays in the
  entry), and Step 1 runs again.
- [ ] **Step 2: Run** `npm run test:e2e` and `npm run excerpts:verify` — expect PASS.
- [ ] **Step 3: Run** Lighthouse on all 10 pages as the baseline doc records (mobile and desktop, `?world=0`) —
  accessibility and SEO 100, CLS no worse than the baseline; record the table.
- [ ] **Step 4: Run** `npm run preview -- --port 4173` and `npm run baseline:capture`; note the capture folder
  in the after-section and compare the home's opening and one inner page by eye.
- [ ] **Step 5: Update `CLAUDE.md`:** the path bar's files (`src/pathbar/`), that the home's order lists live
  in `src/data/homeOrder.js`, and the `data-world-ahead` mark.
- [ ] **Step 6: Stop for Chris:** the iPhone and desktop frame-meter runs with the bar (`?world=0&meter=1`)
  are his, as in Phase 1.
