# Allen Code Co. Website Redesign — "The Sky" (Design Spec)

Date: 2026-11-08
Status: Draft for Chris's review. No implementation has started.
Repo: AllenCode (Vite + React SPA, deployed on Vercel)

## 1. Purpose and success criteria

Rebuild the public site as a scroll-driven, cinematic experience at the craft level of fiabamia.com,
for a software studio. The site sells Chris's services. It is not a vehicle for selling the company.

Two audiences, equal priority:

- **Door A: businesses and founders** who want a custom build, an MVP sprint, AI integration, or an audit.
- **Door B: everyday people** who want a website for themselves or their family (family sites,
  portfolios, memorial pages, blogs) and the template store that serves them.

Success means:

1. A first-time visitor understands in the first scroll what Allen Code Co. does and which door is theirs.
2. Each door has an always-reachable path to act: "Start a project" (A) or "Browse templates" (B).
3. The site feels like one authored world (depth, motion, restraint), not a stack of template sections.
4. It stays fast, accessible and readable by search engines.

Non-goals: sound of any kind; displaying service prices; changing checkout or API behavior;
migrating off Vite; selling the company.

## 2. Hard constraints

- Service prices stay out of every rendered surface. `startingPrice` fields in `src/data/services.js`
  stay in the data untouched. Template prices remain visible because the store checkout requires
  them (assumption, see section 12).
- Signature color is `#f97316` (orange-500) on near-black `#0a0a0a`. Locked.
- No `@ts-ignore`, `as any`, `eslint-disable` or `ignoreBuildErrors`. No placeholder or mock content.
  Complete files only. Work in named phases with a stop between each.
- Chris makes all git commits and pushes. No branches are created.
- No audio, no autoplaying media with sound.

## 3. Narrative

### Shared opening (both doors)

1. **Gate.** Black screen, blinking cursor, one italic serif line, "Scroll to enter."
   Candidate line: "It all starts with an empty file…" (copy is Chris's to approve.)
2. **The source awakens.** Code glyphs drift out of a source file as WebGL particles and assemble into
   the headline. The starfield comes alive. Candidate headline: "We build software that ships."
3. **The fork.** One calm choice: "I'm building a product or business" or "I want a site for me or my family."
   The choice is remembered (session storage, wrapped in try/catch) and can be changed from the nav.

### Door A chapters

4. **What I build.** Each service forms as a constellation diagram. No prices; timelines are allowed.
   - MVP sprint: a short path from idea to live.
   - Custom build: a full system graph (frontend, API, database, auth, billing).
   - AI integration: a routing graph fanning out across models.
   - Audit: a scan sweeping across the diagram.
5. **The flight into live products.** Each product is a star with a pulsing "live" dot. Scrolling toward
   it streaks the sky past and resolves into that product's real interface (captured loop, see 5.4), with
   real numbers from `products.js` counting up and an "Open live site" link.
6. **How I work.** The three principles (solo, precision, acquisition-ready) as a changelog.
7. **The builder.** Chris's story with his photo. Hospitality appears here and only here.
8. **Start a project.** The contact form as the final chapter, framed as a project brief.

### Door B chapters

4B. **What I can make you.** Plain language, no jargon. Stars read as moments and people instead of nodes.
5B. **The template flight.** Each template is a star. Flying into one opens its preview, so the page is the demo.
6B. **Done-for-you.** A simple custom-site option routed to the same contact brief.
7B. **The builder** (shared with 7).
8B. **Browse templates / Start a project.**

### Always present

A sticky nav with a door-aware primary action. A skip-to-content link. Every chapter is reachable by
keyboard and by normal navigation links.

## 4. Visual system

- Background `#0a0a0a`; stars mostly cool white with sparse warm points; orange is the single accent
  (CTAs, live dots, constellation highlights, one emphasized word per chapter).
- Type: an italic serif for display moments, paired with the existing Space Grotesk (UI) and
  JetBrains Mono (labels). The serif is chosen in the plan phase from Google Fonts families that ship a real italic.
- Retire the generic dev-agency effects: scramble text, wireframe cube, code-terminal hero, custom cursor
  (and review the cursor glow and noise overlay for fit during the plan phase).
- Motion principles: layered depth (parallax), slow easing, one hero motion per chapter, nothing decorative
  without a job, and every motion has a reduced-motion equivalent.

## 5. Technical architecture

### 5.1 Stack

Unchanged: Vite 5, React 18, React Router 6, Tailwind 3, Vercel, existing `api/` routes and checkout.
New runtime dependencies (to be confirmed and version-pinned in the plan): Lenis, GSAP with ScrollTrigger,
and a lean WebGL layer (OGL or hand-written WebGL2). Three.js is not used: the sky needs one custom
shader, not a 3D engine. GSAP licensing is confirmed in the plan before install.

### 5.2 Units

- **SkyStage**: one fixed full-viewport WebGL canvas mounted at app level above `<Routes>`, so it persists
  across routes. Renders the starfield and glyph particles. Exposes a small imperative interface
  (progress, door, focus-star, intensity). It knows nothing about page content.
- **ScrollEngine**: owns Lenis and the GSAP ticker, and publishes scroll progress. Disabled under reduced motion.
- **Scenes**: one component per chapter. Each registers its own ScrollTrigger timeline and drives SkyStage
  through its interface. Scenes do not import each other.
- **ProductPortal**: the star-to-product transition and the product media block.
- **TemplatePortal**: the same pattern for templates.
- **DoorProvider**: holds the chosen door and exposes it to the nav and scenes.
- Data stays the single source of truth: `products.js`, `services.js`, `templates.js`.

### 5.3 Routing and transitions

Inner pages (Products, Product detail, Services, Templates, About, Contact) keep their routes and are
restyled in the same system with conventional, conversion-focused layouts. Page-to-page moves use the View
Transitions API. React Router's support for this on `<Link>` may require moving from `BrowserRouter` to a
data router; the plan verifies the exact requirement for the installed version before any change.

### 5.4 Product and template media

Previews are captured loops (muted, looping, lazy-loaded, played only while in view, with a poster frame),
plus a link to the real site. Live iframes are out of scope: they depend on each product's framing headers,
login walls and cost.

## 6. Fallbacks and resilience

- No WebGL2: a CSS starfield (layered gradients with a twinkle animation) replaces SkyStage.
- Reduced motion: a static sky, no smooth scroll, no pinned scenes; content reads as a normal page.
- Phones and low-power devices: tiered star and particle counts; an adaptive governor lowers density if
  frame rate drops.
- Media load failure: poster frame and link remain; chapter content never depends on the media.
- Door choice missing or storage blocked: the neutral fork is shown again; nothing breaks.

## 7. Performance

Targets are Google's "good" Core Web Vitals thresholds: LCP under 2.5 s, CLS under 0.1, INP under 200 ms,
measured on the production build. A JavaScript size budget is set in the plan after measuring the current
`npm run build` output as the baseline. Heavy code (WebGL, GSAP scenes) loads after first paint.

## 8. Accessibility

All real text lives in the DOM, never only in the canvas. Visible focus states; full keyboard path with a
skip link; sufficient contrast for text over the sky; focus managed during portal transitions; pinned scenes
never trap scroll or focus; media is decorative and has text alternatives.

## 9. SEO

Existing static meta, Open Graph and JSON-LD in `index.html` and `usePageMeta` remain. Chapters use real
headings and copy so crawlers and AI readers get the full story. Whether to add prerendering for the home
route is decided in the plan after measuring what crawlers see.

## 10. Verification

The repo has one validation command: `npm run build`. It has no test runner, linter or type checker.
Each phase is verified by: `npm run build` passing; manual checks in the browser at phone, tablet and
desktop widths; a reduced-motion check; a WebGL-disabled check; and a Lighthouse run on the production build.
No test framework is added unless Chris asks for one.

## 11. Phases (a stop and review after each)

0. Foundation: design tokens, fonts, SkyStage, ScrollEngine, CSS fallback sky.
1. Gate, awakening and fork (hero).
2. Door A: services constellations.
3. Product flights (ProductPortal).
4. Door B and the template chapter (TemplatePortal).
5. Builder, how-I-work and the contact brief; nav and door-aware CTAs.
6. Inner pages restyled and View Transitions.
7. Performance, accessibility and SEO pass.

## 12. Decisions needed from Chris before or during planning

1. TypeScript: the repo is JavaScript (`.jsx`, no tsconfig); the studio standard is strict TypeScript.
   Convert as part of this work, or keep JS for this repo?
2. Lint and typecheck: none are configured, so "lints and typechecks cleanly" cannot currently be verified.
   Add ESLint (and TypeScript if chosen)?
3. `data-aiwp-slot` attributes on images (AWP builder hooks): keep, or retire?
4. Template content: the current `templates.js` holds developer templates ($59–$149). The family-site
   templates and their preview media need to be supplied.
5. Template prices stay visible because checkout needs them. Confirm.
6. Product capture loops: which products have a public demo to record, and who records them.
7. Final product list and live status, read from `products.js`.
8. Approval of the opening line and headline copy.
9. The `blueprint-guardian` requirement in `CLAUDE.md`: that agent and a blueprint file are not
   available in this session. Provide them, or confirm proceeding without.
10. Stray repo-root files (`vite.config.js.timestamp-*.mjs`, `test_write.txt`): remove before launch?
