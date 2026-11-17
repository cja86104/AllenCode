# Code World W5: the inner pages

Date: 2026-11-16. Status: approved by Chris (2026-11-16: "approved continue"). Parent design:
`2026-11-10-code-world-design.md`, section 4 ("Every inner page also gets a short stretch of road of
its own") and phase W5.

## Intent

With the world switched on (`?world=1`, remembered for the session), every inner page opens on a
short stretch of road, about one and a half screens. Its approved code stands at the roadside, then
lifts off and lands as the page's headline. After that the page is today's plain page. Moving between
pages travels along the road. One canvas stays mounted across navigation.

Switched off, on reduced motion, without WebGL2, or after the world fails, every page is exactly
today's. The prebuilt HTML never depends on the world (as on the home page).

## Goals, non-goals, anti-goals

- Goals: a stretch on Products, each product page, Services, Templates, About and Contact; the canvas
  kept across navigation (W5a); the drive between pages (W5b).
- Non-goals: the world as the default (W6); retiring the field (W7); new excerpts (Chris, 2026-11-16:
  "reuse").
- Anti-goals: a page whose words wait on the world; a page that reads differently with JavaScript off;
  any change to the plain site.

## What each page shows (Chris, 2026-11-16, approved)

All approved excerpts, reused. The lead is the stop whose code becomes the headline. It stands at the
end of the stretch; the page's other items stand before it in page order.

| Page | Stops (road order) | Lead |
| --- | --- | --- |
| `/products` | UnderFire AI, Founders Helm, Crew Advisors (unfinished, cursor), then MyTeachersToolbox | MyTeachersToolbox |
| `/products/<slug>` | that product (Crew Advisors unfinished) | that product |
| `/services` | Custom SaaS Builds, Custom Web Development, UI / UX Design, AI Integration, Technical Audits (its file as a slab), then MVP Sprints | MVP Sprints |
| `/templates` | Keepsake, Vow, Gather, Folio, then Evergreen (the family road's houses: 14 sculptures would not fit the phone budget) | Evergreen |
| `/about` | the `builder` excerpt as a portrait | builder |
| `/contact` | the `gate` empty file as a slab | gate |

Checkout success and the 404 page have no stretch; the field shows there as today.

## How it works

- **The stretch:** a 1.5-screen spacer at the top of `main`, `aria-hidden`, present only in world
  mode, after hydration. The page's own header follows it unchanged, so no page's markup changes.
- **The road:** straight, the home road's code and ember edges, landmarks alternating sides, the lead
  across the end of the road.
- **The camera:** drives down the road over the first screen of scroll, then comes to rest square on
  to the lead, placed where a home chapter's screen sits (`chapterLayout`'s stage).
- **The landing (the last half screen):**
  - The lead's code lifts off as a flight onto the page's `h1`, at the place the `h1` takes when the
    spacer has scrolled away, with the `h1`'s own line breaks, font and left alignment.
  - Meanwhile the lead's sculpture turns into its picture in characters: the product's poster,
    Chris's photo, the template's poster. A slab has no picture.
  - The `h1` shows as the flight lands, and the world fades out over the end of the landing, so the
    headline lands on today's page. Past the stretch the world is not drawn.
- **Passed landmarks** show their picture, as on the home road.
- **The canvas:** the shell mounts the world for the home page and for every page with a stretch, so
  navigating between them keeps the same canvas and renderer and swaps the shapes.

### My call: the landing target

The approved wording was "product page: that product's excerpt, landing on its hero loop" and
"About: builder resolving into your photo". As built:

- On those pages the sculpture resolves into the loop's poster or the photo in the world.
- The code's flight lands on the headline, as on every page.

Why: the hero screen sits below the header, and on a phone it can't be on screen together with the
stretch's resting landmark, so a flight onto it would land off screen. If Chris wants the flight onto
the hero itself, that is a follow-up.

## Phases

- **W5a:** the stretches and the persistent canvas. Navigation cuts from one stretch to the next.
- **W5b:** the drive between pages.
  - The pages stand along one site road in nav order.
  - On navigation the camera runs from where it is to the new page's stretch in about 0.6 s.
  - From far down a page, the world fades back in for the drive.
  - W5b gets its own plan after W5a is reviewed.

## Constraints

- Every rule of the redesign: no suppression, no placeholders, complete files, tests first.
- `npm run verify` and `npm run test:e2e` green.
- Budgets:
  - Glyphs: the tier's budget (12000 / 24000 / 40000) on every stretch.
  - Bundle: the world's chunks stay within their limits. The canvas chunk is 8.11 of 8.5 kB, so the
    stretch code lives outside it.
- Accessibility: the spacer is `aria-hidden`. The `h1` stays in the accessibility tree throughout;
  only its opacity changes. axe passes on a stretch page.

## Left to the builder

The exact road and camera numbers, the fade curves, and the flight's step size. They follow the home
road's where one exists.
