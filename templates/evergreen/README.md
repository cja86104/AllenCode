# Evergreen — Memorial and Tribute

A memorial website template by Allen Code Co.: a family archive, thoughtfully kept.

Vite 5, React 18, React Router 6 and TypeScript (strict). Every page is prerendered to static HTML, so the
memorial reads in full without JavaScript. No analytics, no third-party embeds, no backend required for the
public memorial.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run verify       # lint, typecheck, format check, unit tests, production build
npm run build        # typecheck, client build, server build, prerender into dist/
npm run preview      # serves dist/ the way the static hosts do
npm run test:e2e     # browser tests: accessibility, keyboard, no-JavaScript, hosting
```

On a new machine run `npx playwright install chromium` once before `npm run test:e2e`.

## Make it yours

Everything a family personalizes lives in **`src/content/memorial.ts`**, typed by `src/content/types.ts`.
No layout code holds names, dates or stories. The build checks the content (`src/lib/content.ts`) and stops
with a plain explanation if something would break the page.

- **Names**: `fullName`, a shorter `shortName` for the header, and optional `nameLines` to control how a long
  name breaks in the opening (it never breaks inside a word).
- **Dates** can be partial: `{ year: 1982, season: 'summer', approximate: true }` reads “Summer, around 1982”.
  Leave out anything unknown and the page leaves it out too. `showDates: false` hides the life dates.
- **Pronouns and labels**: `person.pronouns` sets “her / his / their” throughout, and `lifeLabel` the navigation
  label (“Her life”, “Their life”, or your own).
- **The things we remember**: small objects and their stories, each with a line drawing (`recipe-tin`, `book`,
  `chair`, `tomato`) or a photograph.
- **Life story**: chapters with a short `excerpt` for the main page and a full `body` for `/story`, optional
  year ranges, photographs and a remembered saying.
- **Optional modules** (`modules`): recipe (scanned or typeset card beside a typed transcription), reading
  list, family letter, audio memory (transcript required, captions optional), remembrance date, donation link
  (family-supplied https only; the template never takes payments), service program, observances. A disabled
  module leaves nothing behind.
- **Appearance**: `site.appearance` is `paper-and-pine`, `linen-and-ink` or `dusk-and-clay`
  (`src/theme/presets.ts`). Only colour changes between presets, and `tests/contrast.test.ts` holds every text
  colour in every preset to WCAG AA.

### Adding photographs

Put files under `public/` (for example `public/photos/porch.jpg`), then list each in `photos.items` with:

- its real `width` and `height` in pixels (reserves space, so nothing jumps while loading);
- `alt` describing what it shows, and a `caption`;
- optional `date`, `location`, `contributor` and a longer `story`;
- `collections`: any of `early-years`, `family`, `everyday` (these drive the filters);
- optional `focalPoint` (`{ x, y }` in percent from the top-left) to keep faces in frame when cropped;
- optional `sources` for extra resolutions: `[{ src: '/photos/porch-800.jpg', width: 800 }, ...]`.

Remove `placeholder: true` once a real photograph is in place. `photos.featured` picks the six shown on the
main page. A social preview image is offered only for a real photograph and only once `site.url` is set.

### The gathering

`gathering.visibility` is `public` or `private`. A public gathering shows as upcoming until it ends
(`durationMinutes`, default 180), then switches to “Took place” by itself, in the event's own time zone. RSVP,
livestream, map and calendar links appear only when configured; a map link needs an `address`.

The prerendered HTML records the gathering as it stood at build time, and the page corrects itself as soon as
JavaScript runs. For visitors without JavaScript, rebuild once after the gathering has taken place.

## Pages

| Address             | What it is                                                                                     |
| ------------------- | ---------------------------------------------------------------------------------------------- |
| `/`                 | The memorial: a complete single page on its own                                                |
| `/story`            | The full life story, with chapter list and reading progress, set for reading and printing      |
| `/photographs`      | Every photograph in date order, filterable (`?show=family`), opening in an accessible lightbox |
| `/photographs/<id>` | One photograph and its story: what a shared link opens                                         |
| `/share`            | Share a memory                                                                                 |
| `/privacy`          | Who can see the memorial, and what happens to a shared memory                                  |
| `/family`           | Family access                                                                                  |
| `/family/preview`   | A labelled demonstration of the family area, only when `site.demonstration` is `true`          |

## Privacy modes

- **Public**: listed and indexable. `robots.txt` allows crawling and, with `site.url` set, a sitemap is written.
- **Unlisted**: every page carries `noindex, nofollow, noarchive`, so search engines leave it out, but anyone
  with the link can open it. It is not private, and the privacy page says so.
- **Private**: requires real, server-enforced access control. The static template does not provide it, so the
  build refuses `private` until authentication is connected.

## Receiving memories

Without configuration the Share a memory form is a demonstration: it validates, keeps the visitor's writing in
their own browser, and then says plainly that nothing was sent.

To receive memories, set `VITE_MEMORY_ENDPOINT` (see `.env.example`) to an endpoint you control. The form posts
`multipart/form-data` with `name`, `relationship`, `memory`, `email`, `displayPermission` (`yes`/`no`) and an
optional `photo` (JPEG, PNG or WebP, up to 10 MB), and shows upload progress.

The endpoint must:

- answer any `2xx` once the memory is stored, `413` for a photograph that is too large, and `415` for one of the
  wrong type (other `4xx` and `5xx` responses are shown as recoverable errors; the visitor's writing is never
  lost);
- store every memory as **unpublished** until the family approves it, and never return unpublished memories or
  email addresses to visitors;
- handle spam (rate limiting, a challenge, or moderation) on the server.

Approved memories are added to `memories.items` in `src/content/memorial.ts`. Contributor text is always rendered
as text, never as HTML.

## Family area

The family area (editing, arranging photographs, reviewing memories, updating the gathering, choosing sections
and privacy, exporting content) needs authentication and a server that checks it on every request. The static
template does not include one and never shows a login form that would protect nothing. `/family/preview`
demonstrates the experience with the template's own sample data, saves nothing, loads separately from the public
pages, and is only available on the demonstration memorial.

## Hosting

Publish the memorial at the root of a domain or subdomain (for example `nell.example.org`), and set `site.url` to
that address. `npm run build` writes a static site to `dist/`: one HTML file per page, `404.html`, `spa.html` (the shell for
the family-area demonstration) and `robots.txt`.

- **Vercel**: `vercel.json` is included.
- **Netlify**: `public/_redirects` is included; set the publish directory to `dist`.
- **Any static host**: serve `<path>/index.html` for `<path>`, `404.html` for anything missing, and rewrite
  `/family/preview` to `/spa.html`.

## Accessibility

Built for WCAG 2.2 AA and checked in a browser by `npm run test:e2e` (axe on every page and state, at desktop and
phone sizes): semantic landmarks and heading order, a skip link, visible focus, an accessible small-screen menu,
native disclosures that work without JavaScript, a native modal dialog for the lightbox with focus returned on
close, form errors linked from a summary that takes focus, touch targets of at least 44 px, transcripts for
audio, and reduced motion respected. Nothing is available only on hover.

## What needs a backend

| Feature                                | Works in the static template                     | Needs                                         |
| -------------------------------------- | ------------------------------------------------ | --------------------------------------------- |
| Memorial, story, photographs, lightbox | Yes                                              | —                                             |
| Gathering states, calendar download    | Yes                                              | —                                             |
| Share a memory                         | Demonstration (sends nothing, keeps the writing) | An endpoint (`VITE_MEMORY_ENDPOINT`), storage |
| Photo uploads with memories            | Validation and progress                          | The same endpoint, file storage               |
| Replies to contributors                | —                                                | An email provider on the server               |
| Family area, moderation, editing       | Demonstration at `/family/preview`               | Authentication and a server                   |
| Private mode                           | Refused at build time                            | Server-enforced access control                |

## Demonstration content

The shipped content remembers a fictional person, Eleanor “Nell” Whitaker. Her family, the venue and the
gathering are invented, and every photograph is a labelled placeholder. Only the footer's template-preview note
says so; set `site.demonstration` to `false` for a real memorial.
