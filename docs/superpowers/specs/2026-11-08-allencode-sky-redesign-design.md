# Allen Code Co. Website Redesign — "Source to Screen" (Design Spec)

Date: 2026-11-08 (concept revised the same evening from the earlier "Sky" starfield concept)
Status: Draft for Chris's review. Phase 0 (foundation and tooling) is built; no Source to Screen code exists yet.
Repo: AllenCode (Vite + React SPA, deployed on Vercel)

## 1. Purpose and success criteria

Rebuild the public site as a scroll-driven, cinematic experience at the craft level of fiabamia.com, for a
software studio. The site sells Chris's services. It is not a vehicle for selling the company.

Two audiences, equal priority:

- **Door A: businesses and founders** who want a custom build, an MVP sprint, AI integration, or an audit.
- **Door B: everyday people** who want a website for themselves or their family (family sites,
  portfolios, memorial pages, blogs) and the template store that serves them.

Success means:

1. A first-time visitor understands in the first scroll what Allen Code Co. does and which door is theirs.
2. Each door has an always-reachable path to act: "Start a project" (A) or "Browse templates" (B).
3. Every effect on the page tells the same story (section 3). Nothing is decoration.
4. It stays fast, accessible and readable by search engines.

Non-goals: sound of any kind; displaying service prices; changing checkout or API behavior;
migrating off Vite; selling the company; an AI generator on the page.

## 2. Hard constraints

- No prices and no buy buttons on any rendered surface for now (14.B). Service prices stay in
  `src/data/services.js` and the existing template prices stay in `src/data/templates.js`, untouched, so
  they can be shown again later; new template entries carry no price.
- **Real code only.** Every piece of code shown on the site is a verbatim excerpt of real source: from
  Chris's products, from this site's own source, or from the template preview sources. No invented or
  illustrative code. Rules in section 5.
- Signature color is `#f97316` (orange-500) on near-black `#0a0a0a`. Locked.
- No `@ts-ignore`, `as any`, `eslint-disable` or `ignoreBuildErrors`. No placeholder or mock content.
  Complete files only. Work in named phases with a stop between each.
- Chris makes all git commits and pushes. No branches are created.
- No audio, no autoplaying media with sound.

## 3. The concept: Source to Screen

The site's single motion: **characters lift off a source file, drift, and land as something real.**
It is the studio's work made visible, in the same way fiabamia.com's letters lift off a storybook and
become a story.

The motion was proven with a prototype on 2026-11-08 (an excerpt flying off `teachers-toolbox.tsx`
and landing as the My Teachers Toolbox dashboard), reviewed and approved by Chris. What the prototype
established:

- Code peels off top line first, in its syntax colors.
- The code multiplies as it lifts: every particle on screen is a real character from the file.
- Characters land as characters, tinted by the picture beneath them, so the screen forms out of code
  (a typographic mosaic). Particles never become plain dots or squares.
- The real screen then resolves through the code and the particles fade.

Behind every chapter sits a quiet ambient field: faint characters from the site's own source drifting
at different depths, with parallax as the page scrolls.

## 4. Narrative

### Shared opening (both doors)

1. **Gate.** A dark editor with an empty file and a blinking orange cursor. Approved line:
   "It all starts with an empty file…" and "Scroll to enter." No sound control.
2. **Awakening.** As the visitor scrolls, the file fills with a short excerpt of this site's own source,
   then the characters lift and assemble into the approved headline, "We build software that ships."
3. **The fork.** One calm choice: "I'm building a product or business" or "I want a site for me or my family."
   The choice is remembered (session storage, safe when storage is blocked) and can be changed from the nav.

### Door A chapters

4. **What I build.** One file per service. Its code lifts and lands as what that kind of code produces.
   No prices; timelines are allowed.
   - MVP sprint: the code lands as a sign-in screen.
   - Custom build: the code lands as a dashboard.
   - AI integration: the code lands as a chat reply streaming in.
   - Audit: the code stays put and lights up line by line as it is checked.
5. **The live products.** One file per product, named for it (for example `teachers-toolbox.tsx`).
   Scrolling compiles it: the code becomes that product's real interface (captured loop), with the
   product's real numbers from `products.js` counting in and an "Open live site" link. Crew Advisors is
   `coming-soon`: its file is still being written, cursor blinking, with no live dot and no link.
6. **How I work.** The three principles (solo, precision, acquisition-ready) as a changelog.
7. **The builder.** Chris's story with his photo. Hospitality appears here and only here.

### Door B chapters

4B. **What I can make you.** Plain language, no jargon. The same motion, warmer: the code lands as a
   family site with a name, a photo and a date. The message: you don't need to read code; Chris turns
   it into something that's yours.
5B. **Templates.** Each template is a file that compiles into its preview video.
6B. **Done-for-you.** A simple custom-site option routed to the same project brief.
7B. **The builder** (shared with 7).

### The visitor's turn (both doors)

8. **Type your idea.** The visitor types one line ("a booking site for my bakery"). Its characters lift and
   assemble into a rough wireframe of that idea. This is a deterministic layout toy, not an AI generator:
   recognized words choose blocks (for example booking: a calendar; shop: a product grid; photos: a
   gallery; menu: a list; blog: posts), and every sketch has a header, a hero and a call to action. The
   line then becomes the first line of the project brief.
9. **Close.** The cursor returns to an empty file, now theirs: "Start your project" (A) or
   "Browse templates" (B), with the contact form as the project brief.

### Always present

A sticky nav with a door-aware primary action. A skip-to-content link. Every chapter is reachable by
keyboard and by normal navigation links.

## 5. Code excerpts

- **Sources.** (a) Each live product's own repository, (b) this site's source for the gate, the ambient
  field and services where no product excerpt fits, (c) the template preview sources built in this project.
- **Provenance.** Each excerpt is stored in `src/content/excerpts/` with its repository, file path, line
  range and commit, copied verbatim. Trimming is limited to whole lines; nothing is edited inside a line.
- **Chris approves every excerpt before it ships.** Nothing proprietary he wants private (for example the
  full planner prompt), and no secrets.
- **Automated guard.** A test rejects any excerpt containing secret-like content (API key, token and
  private-key patterns, and `.env` style assignments).
- **Size.** About 15 to 30 lines per excerpt, readable on a laptop screen.
- **Access.** Reading product source needs access to each product's repository (GitHub or a local folder);
  it is requested in the phase that first needs it.

## 6. Visual system

- Background `#0a0a0a`. Orange is the single accent: the cursor, keywords, live dots, calls to action and
  one emphasized word per chapter.
- Type: JetBrains Mono for every code character and label, Instrument Serif (italic) for display lines,
  Space Grotesk for interface text. Fonts load before the glyph atlas is drawn.
- Code syntax colors: keywords orange, types and components a cool blue, strings a soft green, the rest
  warm grey.
- Retire the generic dev-agency effects: scramble text, wireframe cube, code-terminal hero and custom
  cursor; review the cursor glow and noise overlay during the inner-page phase.
- Motion principles: one transformation per chapter, slow easing, nothing decorative without a job, and
  every motion has a reduced-motion equivalent.

## 7. Technical architecture

### 7.1 Stack

Unchanged: Vite 5, React 18, React Router 6, Tailwind 3, Vercel, existing `api/` routes and checkout.
Runtime additions already installed in Phase 0: GSAP 3 with ScrollTrigger (free for commercial use under
the standard license) and Lenis. The renderer is hand-written WebGL2 with no 3D library.

### 7.2 What Phase 0 already provides

Phase 0 built and verified a scroll-driven WebGL2 point field, a device-capability check and frame-rate
governor, a store shared by scenes and renderer, Lenis smooth scrolling driven by the GSAP ticker, a CSS
fallback, route-scoped lazy loading (none of it reaches pages without the experience), and a noindex
preview route. All of it carries over. The starfield-specific parts are renamed and replaced (7.3).

### 7.3 Units

- **FieldLayer**: mounted once above the routes; on experience routes it lazy-loads FieldScene, otherwise
  renders nothing. (Renamed from SkyLayer.)
- **FieldScene**: owns the capability check, ScrollEngine and the renderer, and swaps to the CSS
  fallback on failure. (Renamed from SkyScene.)
- **Glyph atlas**: draws every needed character, in JetBrains Mono, into one texture.
- **Glyph renderer**: one WebGL2 canvas. Draws the ambient field and, at most, one transformation at a
  time. Each particle has a glyph, a start and end position, start and end colors, a seed and a stagger.
  Replaces the starfield.
- **Layouts** (pure functions): `codeLayout` (an excerpt laid out as an editor, with syntax colors),
  `textLayout` (a line of display text sampled into positions), `imageLayout` (an image or video frame
  sampled into positions and colors) and `sketchLayout` (a wireframe from the visitor's line).
- **Transformation**: pairs a source layout with a target layout, assigns particles (code in reading
  order to the target top-down; copies of real characters fill the rest) and exposes a progress from 0
  to 1 that a scene drives from ScrollTrigger.
- **Scenes**: one component per chapter. Each registers its own ScrollTrigger timeline, owns real DOM
  text for its chapter, and hands the renderer its transformation. Scenes do not import each other.
- **fieldBus**: the shared store (renamed from skyBus): progress, door, active transformation, intensity.
- **ScrollEngine**, **DoorProvider**, **MediaLoop** and the data files as before. Excerpts live in
  `src/content/excerpts/`.

### 7.4 Routing and transitions

Inner pages (Products, Product detail, Services, Templates, About, Contact) keep their routes and are
restyled in the same system with conventional, conversion-focused layouts. Page-to-page moves use the View
Transitions API, which in the installed React Router (6.30) requires moving from `BrowserRouter` to
`createBrowserRouter` with `RouterProvider`. The development route is renamed from `/sky-preview` to
`/preview` and stays unlinked, noindex and disallowed until the new home replaces `/`.

### 7.5 Product and template media

Product captures and template previews are short muted loops (lazy-loaded, played only while in view,
with a poster frame), plus a link to the real site where one exists. They are also the landing targets:
the transformation samples the loop's poster frame, then crossfades to the playing loop. Product loops
are composed from real captures of each product's public surfaces (for My Teachers Toolbox, its public
demo); login-gated screens are not captured. Template loops are recorded from preview pages built for
that purpose, using the Chrome DevTools screencast and the system ffmpeg. Chris can replace any loop later.

### 7.6 Template catalog changes

- Data model (`src/data/templates.js`): `price` stays in the data but becomes optional and is not
  rendered; add `status` (`available` or `concept`), `previewVideo`, `poster` and `excerpt`; the unused
  `slot` field is removed.
- No template shows a price or a buy button for now. Every template card links to the project brief
  ("Ask about this template"); concept templates also say "Concept preview, coming soon".
- New categories: Family and Memories, Events, Personal and Creative.
- Family-site concepts: **Hearth** (family home page), **Evergreen** (memorial and tribute), **Keepsake**
  (baby and milestones), **Vow** (wedding), **Gather** (reunion or event), **Folio** (portfolio for artists,
  coaches and freelancers).

## 8. Fallbacks and resilience

- No WebGL2, a lost GPU context, or reduced motion: every transformation becomes its end states shown
  side by side, the code excerpt beside its result, with no flight. The ambient field becomes a faint static
  code texture. All content stays readable.
- Phones and low-power devices: the governor's tiers set the particle budget per transformation, and the
  frame-rate governor lowers it further if frames run slow.
- Media load failure: poster frame and link remain; chapter content never depends on the media.
- Door choice missing or storage blocked: the neutral fork is shown again; nothing breaks.
- Fonts not yet loaded: the atlas waits for them; until then the chapter shows its static state.

## 9. Performance

Targets are Google's "good" Core Web Vitals thresholds: LCP under 2.5 s, CLS under 0.1, INP under 200 ms,
on the production build. The experience code loads only on experience routes and after first paint (after
Phase 0 the shared bundle is 130.11 kB gzip against a 129.10 kB baseline; the lazy chunk is 54 kB gzip). A JavaScript budget is
set in the final phase from measured numbers. Only one transformation is active at a time.

## 10. Accessibility

All real text lives in the DOM, never only in the canvas. Each code excerpt has a short text alternative
naming what it is and what it becomes. Visible focus states; full keyboard path with a skip link;
sufficient contrast over the field; focus managed during transitions; pinned scenes never trap scroll or
focus; the "type your idea" input is a labeled form field that works without the animation.

## 11. SEO

Existing static meta, Open Graph and JSON-LD in `index.html` and `usePageMeta` remain. Chapters use real
headings and copy so crawlers and AI readers get the full story. Whether to prerender the home route is
decided in the final phase after measuring what crawlers see.

## 12. Verification tooling

Built in Phase 0 and required for every phase:

- **Lint:** ESLint 9 (flat config) with React, React Hooks and jsx-a11y rules; inline lint directives are
  disabled and fail the run.
- **Typecheck:** TypeScript with `strict`, opted into per file with `// @ts-check` until the final phase
  turns `checkJs` on for everything. A policy test fails any new or changed file without it, and bans
  `@ts-ignore`, `@ts-expect-error`, `@ts-nocheck`, lint-disable comments and `as any`.
- **Unit and component tests:** Vitest with Testing Library.
- **End-to-end tests:** Playwright against `vite preview`.
- **Scripts:** `lint`, `typecheck`, `test`, `test:e2e` and `verify` (lint, typecheck, test, build).
- **Per phase:** manual checks at phone, tablet and desktop widths, a reduced-motion check, a no-WebGL check,
  and the live home page compared pixel for pixel until the new home replaces it.

## 13. Phases (a stop and review after each)

0. Foundation and tooling. **Complete.**
1. Field rename and glyph engine: rename sky to field, glyph atlas, renderer, layouts, transformations,
   ambient field and the static fallback.
2. Gate, awakening and fork.
3. Door A: service chapters (needs product source access for excerpts).
4. Product chapters, product captures and their excerpts.
5. Door B, templates, template data, family concepts, preview pages and videos.
6. "Type your idea", builder, how-I-work, the project brief, door-aware nav, and the swap onto `/`.
7. Inner pages restyled, router migration and View Transitions, retirements.
8. Full-repo lint and typecheck with zero exclusions, performance, accessibility and SEO pass.

## 14. Decisions

### Resolved by Chris on 2026-11-08

1. Keep the repo in JavaScript; type safety comes from the JS typecheck in section 12.
2. Add lint, typecheck and the tests described in section 12.
3. Retire `data-aiwp-slot`.
4. Template entries are stand-ins for ideas: give each a real short video, and add family-site template
   concepts that would sell (section 7.6); Chris replaces them when the real templates exist.
5. Do not add prices.
6. No videos exist; the build produces them (section 7.5).
7. Product list is correct. Live: My Teachers Toolbox, UnderFire AI, Founders Helm. Coming soon: Crew Advisors.
8. The opening line and headline are approved.
9. Create a blueprint for this work at the repo root. The `blueprint-guardian` agent is not available in this
   environment, so its checks are written into the blueprint as a manual gate.
10. The stray root files were removed by Chris.
11. The starfield concept is replaced by Source to Screen (section 3), approved after the prototype.
12. Code on the site is real code only (section 5).
13. The spec and blueprint keep their current file names.

### Resolved by Chris later on 2026-11-08

- **14.B** No template shows a price or a buy button for now; templates are shown without prices. Prices
  stay in the data so they can return.
- **14.C** Excerpt sources: public GitHub repositories under `cja86104` (`underfireai`, `crewadvisors`,
  `AllenCode`) and the local My Teachers Toolbox folder (private repository).

- **14.D** Founders Helm's source is the `cja86104/Solo-Founder-OS` repository (confirmed by Chris).

### Open

None.
