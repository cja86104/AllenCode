# Truth pass, rail jumps, and the immersive 3D service — design

Date: 2026-11-26. Parents: `2026-11-10-code-world-design.md` (section 6, Craft) and
`2026-11-08-allencode-sky-redesign-design.md`. Asked for by Chris: "with todays tech how would you
improve allencodeco.com … both the world and the "plain site" … planning only". After the review below
(the repo at `d959438`, the live site at 1024×768 and 375×812, and research), Chris decided (2026-11-26):

- Road length: "keep the length but add the jumps."
- Plain view: "keep the animations do not make it plaine."
- Road names: "its templates/custom now on the road the family card stays the same."
- A 3D / immersive service: "yes add with this site as case study".
- Client case studies: "not that im adding today."
- Founding Fathoms: "skip the founding fathoms skip for now."

His answers to the open questions, and one change (2026-11-26, later the same evening):

1. Wording: "agree and just keep code excerpt." The two proposed lines; the `builder` excerpt is kept.
2. The new service: "agree prices will very with work so no actual listed priced." The proposed name,
   summary and scope; no starting price in the data.
3. Its excerpt: "any is fine." Chosen: `src/world/drive.js` `driveAt`, the drive a jump also plays.
4. Its screen: "it will need a new video loop (note the first videos went too fast down the road, so
   much so the changing signs looks like a fast flicker because they move. so it will need the new info
   and be slower". A new loop, recorded slower than the 2026-11-16 loops (Phase 3).
5. Placement: "placement is fine." After UI / UX Design, `/work/allen-code-co`, THIS SITE.

**The change:** "WE ARE GOING TO SHORTEN THE BUSINESS ROAD BY ONE QUARTER. I HAD EXTENDED IT TO ITS
LENTH IT IS NOW BECAUSE THEY WERE REALLY CLOSE TO EACH OTHER BEFORE AND NEEDED MORE ROAD. SO SHORTEN A
LITTLE." The business road's stops move from 42 units and 240vh apart to 32 units and 182.86vh (24%
shorter: exactly a quarter, 31.5, put every other stop halfway along a 1-unit road piece, 0.8° off the
road's heading and out of its hollow), the camera at the same pace. The family road is unchanged. This replaces "the length stays" below for the
business road only; the jumps are still wanted.

## What the review found

### Code World

- **Long by design, with no way to jump.** The home page with business/ taken measured 52,455 px, about
  68 screens at 768 px; MVP Sprints arrived after about 70 wheel steps. The length stays (Chris). The
  journey rail (`src/world/JourneyRail.jsx`) shows where the visitor is but has no buttons or links.
- **The rail calls road B "family/".** `src/world/rail.js` keeps its own
  `ROAD_NAMES = { a: 'business/', b: 'family/' }` and missed the 2026-11-25 rename, although
  `src/world/roadNames.js` says it names the rail too.
- **EMPTY FILE twice on the gate.** The rail's end label and the current stop's label (Empty file, at 0)
  both sit at the top of the line.
- **Code over words.** At MVP Sprints (1024×768) the excerpt's flight from the editor to the screen
  crossed the stop's bullet list.
- **The primary action is hidden below 1280 px.** The bar there is the logo and the menu
  (`Nav.jsx`, `xl:flex`).

### Both modes

- **Services headline:** "Custom work, scoped and priced upfront." Services show no prices.
- **About timeline:** "Four live products, growing client roster". `products.js` has three live and
  Crew Advisors coming soon. The approved `builder` excerpt shows the same line as code, at its commit.
- **`public/llms.txt`** describes the templates as SaaS landings, dev portfolios, dashboards and agency
  sites in Next.js and Tailwind. The catalog leads with family, memorial and restaurant sites in Vite
  and React.
- **Structured data:** one site-wide Organization block in `index.html`. No page has its own.
- **No immersive / 3D website service** in `services.js`, though the site itself is one.

## Research notes (2026-11-26)

- Awwwards scores Design 40%, Usability 30%, Creativity 20%, Content 10%. People who judge and win there
  say most entries lose on usability, Core Web Vitals included. Jumps and readable stops are usability;
  the case study is content.
- Awwwards Site of the Year 2025 (Lando Norris, OFF+BRAND.) is GSAP and WebGL: the lane this site is in.
- Case studies convert best told outcome first with results a reader can check, and placed beside the
  matching service's call to action.
- AI search: studies through 2026 found AI crawlers rarely request `llms.txt`, and Google said it is not
  needed; they read the page. So `llms.txt` is corrected (cheap), and the work goes into each page's own
  structured data, which the prerender already makes possible.
- Noted for later rounds, not this one: WebGPU now ships in Chrome, Edge, Firefox and Safari 26; CSS
  scroll-driven animations became Baseline with Firefox 159 (October 2026); MSDF glyphs stay sharp at any
  size, where the 2D-canvas atlas (`glyphAtlas.js`) softens up close; Vite 8 (Rolldown) stable since
  March 2026; React 19.2 and React Compiler 1.0.

Sources: https://www.awwwards.com/about-evaluation ·
https://www.managed-code.com/blog-post/can-ai-design-award-winning-website-site-of-the-day-2026 ·
https://www.digidop.com/blog/5-web-design-trends-2025 ·
https://www.lowcode.agency/blog/b2b-website-social-proof-how-to-use-it-strategically ·
https://www.optimizely.com/field-notes/articles/does-llms-txt-work/ ·
https://web.dev/blog/webgpu-supported-major-browsers · https://web.dev/blog/web-platform-10-2026 ·
https://www.redblobgames.com/articles/sdf-fonts/ · https://vite.dev/blog/announcing-vite8 ·
https://react.dev/blog/2025/10/01/react-19-2

## Goals

### 1. Truth pass

- The rail names the roads from `roadNames.js` (templates/custom/ for road B). The fork's cards keep
  `business/` and `family/`, unchanged.
- On the gate the rail reads EMPTY FILE once.
- The Services headline and the About line say what is true (wording: open question 1).
- `llms.txt` matches the catalog and the services (the new service is added in Goal 3).
- Every prebuilt page carries its own structured data beside the site-wide Organization, written into
  its HTML at build and kept in step in the browser, as titles are:
  - Services: an ItemList of Service (name, description, provider). No price.
  - Each product page: SoftwareApplication (name, url, description, `operatingSystem: "Web"`,
    creator). No offers, no ratings.
  - About: Person (name, founder of Allen Code Co., the LinkedIn `sameAs` already in `index.html`).
  - Every inner page: BreadcrumbList.
  - The case study (Goal 3): CreativeWork.
- The primary action shows in the bar from 640 px. Below that it stays in the menu and is the last
  entry of the chapter list (Goal 2).
- **The business road about a quarter shorter** (Chris, 2026-11-26): `roadStepFor('a')` 32 (was 42) and
  the page's road before each business stop 80 × 32 / 14 = 182.86vh (was 240vh), so the camera's pace, the swing a stop
  and the hills a stop are as they were, each over a shorter stretch. Every landmark keeps its glyphs on
  every tier, the opening stays full, and the camera's fastest 4 px stays within 0.15. Family road, the
  bend where the roads meet, and the inner pages' stretches unchanged.

### 2. Jumps on the road (the business road shortened by a quarter in Goal 1; the family road's length stays)

- **Every stop can be jumped to.**
  - On a fine pointer, each stop's mark on the rail is a button; hovering or focusing it names it.
  - On every device, a Chapters button at the rail's foot opens the list of stops in order, the
    current one marked, ending with Start a project (the brief).
- **A jump is the page-to-page drive** (W5b, `drive.js`, the same 0.6 s): the camera drives on ahead
  as the world fades, the page moves to the stop at once, and the camera comes in from behind the stop
  as it fades in. Nothing between the two stops is drawn.
- **Arrival is the same as scrolling there:** the stop's rest, its words shown, `data-active-stop` is
  the stop, and focus moves to the stop's heading.
- **Scrolling is otherwise unchanged:** the camera's pace and speed limit.
- **Readable stops:** while a flight passes behind a stop's words, its characters are dimmed inside the
  words' box; outside it they are as today.

### 3. Immersive 3D websites, with this site as the case study

- **A new service** in `services.js` (copy and terms: open question 2), wherever services are: the
  Services page, the home page's service chapters (Plain view, with its flight), the business road (a
  new stop), the footer (built from the data), the brief's project types, `llms.txt`, structured data.
- **Its stop on the business road:** an approved excerpt from this site's world code (open question 3)
  landing on a loop of this site (open question 4).
- **The case study page** (address: open question 5): this site told as a case study.
  - The brief: a studio site that wins work and awards, with real code only.
  - What a visitor gets: two roads, Plain view, the no-WebGL and reduced-motion journeys.
  - How it is built: the hand-written WebGL2 renderer, the scroll engine, every excerpt real and
    checked, every page prerendered.
  - What it is held to: numbers measured for the page and dated (Lighthouse accessibility and SEO,
    CLS, frame times on Chris's iPhone and desktop, the script budget, test counts).
  - Start a project, which opens the brief with the new service chosen.
- **Its own stretch of road** (W5a) spelling its word (open question 5), landing on the new service's
  excerpt. In the sitemap, prerendered, with its own head and CreativeWork.
- **Every word on it approved by Chris** before it ships. Every number measured during the task, never
  copied from the ledger.

## Non-goals

- The family road's length and spacing. Plain view stays animated as it is (Chris).
- The fork's cards; Founding Fathoms (Chris: "skip for now"); client case studies (Chris: not today).
- Prices or buy buttons anywhere.
- WebGPU, MSDF glyphs, moving Plain view's animations to CSS, Vite 8, React 19: later rounds.
- The W8 award kit: after this round, which feeds it.
- Links to a stop from outside the page (`/#stop`).

## Anti-goals

- A jump that strobes the road or shows landmarks half built.
- A rail that steals scroll, traps focus, or covers a stop's words on a phone.
- A new page that shifts as it loads, reads as nothing without JavaScript, or lands on the LOST road.
- A number on the case study that was not measured for it.

## My calls

- **Jump by drive, not by glide.** Gliding through up to about 40 screens of road would stream the
  whole road (its cuts and landmarks) in a second or two. The drive exists, matches moving between
  pages, and draws nothing between.
- **Two ways in, one list.** Rail marks are buttons only on fine pointers: on a phone the rail is a
  hairline at the edge and the opening's stops sit a few pixels apart. The Chapters list works
  everywhere and is the keyboard and screen-reader path. Where stops crowd, the marks ease apart to keep
  24 px between them (WCAG 2.2 target size); the moving marker still shows true progress.
- **Semantics.** The rail stays a `nav` named Journey; each stop becomes a button named "Go to …";
  the current one carries `aria-current="step"`. The Chapters list is a disclosure (a button with
  `aria-expanded` and a list), closed by Escape, a choice or a click outside, with focus returned.
- **One EMPTY FILE.** The ends name their own stops: the end label turns ember while it is the current
  stop, and the moving label shows only for the stops between.
- **Dim, don't move.** Flights keep their paths. A screen rect (the words' box) dims flight characters
  inside it to a quarter. The scrim behind the words stays as it is.
- **A `/work/` section** so later client case studies have a home. Not in the top bar (it is full at
  1280 px). Reached from the service (Services page, its chapter and its road stop), About and the footer.
- **Budget.** The case study page is loaded on demand, as the home page is, if it would take the entry
  script past its 152 kB limit (147.15 kB today).

## Open questions (Chris) — answered 2026-11-26, see the top

1. **Wording.**
   - Services headline. Proposed: "Custom work, scoped upfront."
   - About line. Proposed: "Three live products, a fourth in the works, and a growing client roster".
   - The workshop's `builder` excerpt shows the old About line as code at its commit. Leave it (it is
     that file's history), or cut a new excerpt after the change?
2. **The new service.**
   - Name. Proposed: "Immersive 3D Websites".
   - Summary. Proposed: "A site people remember: a scroll-driven 3D world, hand-built in WebGL, fast
     on phones and fully readable without it."
   - Scope. Proposed, each one this site shows: "Concept and storyboard of the scroll journey";
     "Hand-built WebGL scene with the real words in the page, not the canvas"; "Phone frame budget,
     plus reduced-motion and no-WebGL versions"; "Prerendered pages for search, link previews and AI
     readers".
   - Timeline, deposit terms and a starting price for the data (never shown): Chris only.
3. **Its excerpt**, one of these from this site at `d959438`, each under 30 lines:
   - `src/world/drive.js` L28–39, `driveAt`: the drive between pages;
   - `src/world/roadPath.js` from L33, `roadAt`: where the road runs;
   - `src/world/wordRoad.js` from L46, `wordLayout`: the inner pages' word roads.
4. **Its screen.** Custom Web Development already lands on a loop of the Code World. Either:
   - (a) record a new loop for this service (a drive between pages and a word road), so the two
     differ; or
   - (b) move the current loop to this service, and give Custom Web Development a client-style loop
     already in `public/media/templates/` (Copper Thistle or Evergreen).
5. **Placement.**
   - Its place on the business road. Proposed: after UI / UX Design.
   - The case study's address. Proposed: `/work/allen-code-co`.
   - The word its road spells. Proposed: THIS SITE.
