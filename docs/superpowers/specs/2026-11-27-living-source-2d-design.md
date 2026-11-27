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
