# The Living Source (2D) — design

Date: 2026-11-27. Chris: "this is the plan we are going with for the 2d version. make it its own plan
so we don't mix 3d info in it. this is what we will be working on now." Source: a review Chris pasted
(2026-11-27), checked against the repo below. This file covers the 2D experience only (the world off:
Plain view, no WebGL2, reduced motion). The 3D world's work stays in its own specs and plans.

## Why

The site goes in for awards, and its hook is two complete experiences in one. The 2D side must win on
its own, not read as the fallback. Chris (2026-11-27): "both have to be to those standards."

The line the submission rests on: **the 3D experience shows imagination; the 2D experience shows the
craft behind it.** World on, the source becomes a world you travel through. World off, the source
becomes an experience you inspect, explore and understand.

## What exists today (checked in the repo, 2026-11-27)

- The gate (`src/scenes/Gate.jsx`): an approved real excerpt whose characters become the headline.
- The fork (`src/door/Fork.jsx`): business/ and family/ as files; choosing one opens that path.
- Code-to-screen chapters: services, products, templates and the builder, each from an approved
  excerpt flying to its real screen, loop or photo (`ServiceChapters`, `ProductChapter`,
  `TemplateChapter`, `Builder`).
- The idea sketch (`IdeaSketch.jsx`): the visitor's own words become a wireframe, then the brief.
- The code field: real code only; excerpts carry repo, path, lines and commit, and drafts never show.
- Loops load lazily and pause off screen; reduced motion and no WebGL2 still get code beside result.
- The inner pages (Services, Products, Templates, About, Contact) are bordered card stacks whose only
  motion is `Reveal.jsx` (fade and rise 40 px once). This is the part Chris called plain.

## Creative direction: The Living Source

Six elements:
1. **The Gate:** the empty file becomes the studio's identity (exists; refined).
2. **The Project Explorer:** a real, accessible navigator of the experience as a project.
3. **The Source Field:** real code makes the environment (exists).
4. **The Transformations:** real excerpts become their screens, now explorable (Source, Transformation,
   Result) with a provenance panel.
5. **The Workshop:** how the studio works, and the visitor's own idea.
6. **The Brief:** their idea becomes the start of a real project conversation.

### A. Source, Transformation, Result
When a chapter's code becomes its screen, the visitor can switch between: **Source** (the excerpt),
**Transformation** (replay the flight) and **Result** (the product, template or service screen, then the
real thing). Honesty kept: the excerpt is real and the result is the real product's screen; the
browser does not compile the excerpt, and no copy says it does.

### B. The Project Explorer
A compact tree of the experience's real structure. Clicking jumps there, the current section is
marked, and keyboard and screen readers work it. It is navigation, not decoration. The browser's
scrollbar is left alone.

### C. Product demonstrations as evidence
One sequence for every product: excerpt, transformation, real interface, an interactive preview where
it fits (a good loop is fine where embedding would add needless weight), then a clear route to the
live product. A product should not end as a pretty picture.

### D. The code tells more of the story
A source-inspection panel for chosen excerpts: repository, file path, commit, line range, what it
produces, and a public link only where the repository is public. The lines that matter highlight as
their output appears.

### E. Transitions with their own identity
One continuous transformation: a product card expands into its demonstration; a service excerpt
resolves into its interface; the About code resolves into the builder's portrait; the visitor's idea
carries into the brief. CSS scroll-driven animations and view transitions (React Router 6.30.4,
installed, supports them) where they suit; the glyph renderer and its transformations stay.

### F. One business story in both modes
Services first, then products under "our work/", then How I Work: the world's business road runs in
that order (`src/world/roads.js`, Chris 2026-11-16; Chris verified it again 2026-11-27, correcting the
review, which said products first). The 2D home already renders them in that order (`Home.jsx`), so
nothing moves; any new 2D piece keeps it.

## What we will not do
- No literal VS Code clone; no custom scrollbar or minimap.
- No typing effect on every heading; the transformation system already carries meaning.
- No motion with no link to the source; no pile of competing effects that buries the business story.
- No desktop spectacle at the cost of the phone; mobile is designed, not a shrunk desktop editor.
- No copy of the 3D road's visual language.
- No new or edited code on the site: real, approved excerpts only.

## Constraints (unchanged from the blueprint)
Orange `#f97316` on `#0a0a0a`; JetBrains Mono, Instrument Serif italic, Space Grotesk; no prices or buy
buttons; no sound; `// @ts-check`, no `eslint-disable`; Vite 5, React 18, React Router 6, Tailwind 3,
JavaScript; the budget in `tools/budget/check.mjs`; LCP under 2.5 s, CLS under 0.1, INP under 200 ms;
`npm run verify`, `npm run test:e2e`, `npm run excerpts:verify`, Lighthouse and real-device frame times
at every review point. Chris commits; no branches.

## Phases (each its own plan, with a stop for Chris's review)
1. Audit: record today's 2D experience (desktop and phone recordings, Lighthouse, budget, frame times)
   as the baseline.
2. Creative direction: the Living Source's visual identity, shown as mockups for Chris to pick.
3. The Project Explorer.
4. Source, Transformation, Result and the provenance panel.
5. Product demonstrations.
6. Transitions and the narrative (the inner pages brought to this standard).
7. Mobile, accessibility and performance.
8. The 2D awards kit: its own recording, stills and write-up of the interaction design.

## Phase 2: the visual direction (in progress, 2026-11-27)

Three directions, each shown on the same moment (the UnderFire AI chapter, desktop and phone, with
working Source / Transformation / Result tabs), on a design canvas:
https://claude.ai/artifact/A3EoY2jcTNLWintjkNoUxj

- **A · Instrument:** the page as a precise instrument: explorer rail, line-numbered panel, hairline
  provenance strip. Calm; the motion is precision.
- **B · Annotated:** the page as an annotated listing: huge serif headline, the code read like a
  manuscript with numbered margin notes, provenance as a footnote, a numbered index for navigation.
- **C · Layers:** the page as the build, layer by layer: source, glyphs in flight and the real screen as
  a CSS 3D stack (no WebGL) that pulls apart and settles; a path bar for navigation.

**Chosen: C · Layers** (Chris, 2026-11-27: "wife said version C").

### The rules of C (every later phase follows them)

1. **The layer stack is the signature.** A transformation is shown as stacked planes in CSS 3D
   (`perspective`, `transform-style: preserve-3d`), never WebGL: the real source, its characters in flight
   (the glyph renderer's own flight), and the real result. Scroll pulls the stack apart; it settles flat
   and face-on when the result lands, so the finished screen is read straight, never at an angle.
2. **Three numbered steps.** `01 Source`, `02 Transformation` (`Flight` on a phone), `03 Result`: the
   tabs a visitor can use to jump a chapter to a step (Phase 4 builds them).
3. **Navigation is a path.** `allencode / <branch> / <file>` along the top, the current file in an
   orange chip; every segment opens its siblings (Phase 3).
4. **One ease.** `cubic-bezier(.16, 1, .3, 1)` (already `Reveal.jsx`'s), 500–700 ms for layer moves.
5. **Locked as before:** orange `#f97316` on `#0a0a0a`; JetBrains Mono for code, labels and the path;
   Instrument Serif italic for display; Space Grotesk for text. No glow, no gradient washes.
6. **Reduced motion and no WebGL2:** the stack is shown flat and face-on (the result, with its code
   beside it), no tilt and no movement; every control still works.
7. **Phone:** a smaller stack (about 320 px wide), the three steps as three full-width buttons, the path
   as one chip in the header.

## Phase 3 design: the path bar (the Project Explorer in C)

**What it is.** A second bar under the nav, on every page while the world is off (Plain view, no
WebGL2, reduced motion): `allencode / 02_our-work / underfire-ai`. It says where the visitor is and,
from any segment, lets them go anywhere else. The world keeps its own rail; the two never show
together.

**The tree** (services first, as on the road; Chris's answers 1–3):
- `00_origin` — the gate.
- `01_services` — every service in `src/data/services.js`, read from the data so a new service appears
  without touching the bar: those with a home chapter (`SERVICE_CHAPTERS`) in their home order, then any
  without one (today Acquisition-Readiness Consulting), which open their panel on `/services`. Two
  services are being added first (Chris, 2026-11-27: "before you start building this the new services
  have not been added. the 3d websites and the ai personall assistant"): 3D world websites and AI
  personal assistants. They land in the data and get their home chapters before Phase 3 is built.
- `02_our-work` — the four products.
- `03_templates` — Hearth (door B's intro), then each template in door B's order (`DOOR_B_TEMPLATES`),
  then Done for you.
- `04_how-i-work`, `05_who-builds-it` (the builder), `06_your-idea`, then the brief as `07_start`.
- On an inner page the path is that page as a file (`allencode / pages / services`); its segments open
  the same tree.

**Following the fork.** Services, our work and how I work are door A's; templates are door B's. Choosing
a file on the other door's branch switches the door (`setDoor`, as the nav's switch does), then goes
there. Before a door is chosen the home has only the gate and the fork: the path reads
`allencode / 00_origin`, and the branches still open (choosing one chooses its door).

**Where you are.** The current file follows the scroll (the chapter whose pinned frame fills the
screen; within the templates chapter, the active template). Going to a file glides to the start of its
chapter (a template: the start of its segment), instantly under reduced motion, and moves focus to the
chapter's heading, as the world's rail does. From another page it routes home, then goes there.

**Accessible.** `<nav aria-label="Where you are">` holding an ordered list; the current file is
`aria-current="location"`. Each segment is a disclosure button (`aria-expanded`) opening a list of
links; Escape closes it and returns focus; a click outside closes it. 44 px targets. Screen readers
hear the path once, not on every scroll change (the label updates quietly).

**Phone.** One chip in the header (`02 / underfire-ai ▾`) opening the whole tree as a full-width sheet.

**Out of scope for Phase 3:** the layer stack and the step tabs (Phase 4), product demos (Phase 5),
transitions (Phase 6).

**Measured against the baseline:** budget (no new dependency; the bar must not push the entry script
past 152 kB), Lighthouse (accessibility and SEO stay 100, CLS no worse: the bar reserves its height
in the prebuilt HTML), and the capture tool re-run for before/after.

## Chris's answers (2026-11-27)
1. Templates: agreed. The explorer follows the fork, with a TEMPLATES branch beside SERVICES and
   PRODUCTS.
2. Services: agreed. All seven are listed.
3. Label: agreed. "Who builds it".
4. Public repositories: GitHub is down today; Chris will say later which are public. Until then the
   provenance panel shows repository, path, lines and commit for every excerpt and no outbound link.
   No stand-in or guessed links: a link is added per repository once Chris names it public.
5. Inner pages: agreed. Services, Products, Templates, About and Contact come up to the same standard
   in Phase 6.
