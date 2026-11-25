# Copper Thistle — Restaurant

A restaurant website template by Allen Code Co.

Vite 5, React 18, React Router 7, TypeScript (strict) and Tailwind CSS. Every page is prerendered to static
HTML, so the site reads in full without JavaScript and needs no server to show the menu, hours or story. No
analytics and no third-party scripts. Fonts are bundled with the site.

## Run it

```bash
npm install
npm run dev          # http://localhost:5173
npm run verify       # lint, typecheck, format check, unit tests, production build
npm run build        # typecheck, client build, server build, prerender into dist/
npm run preview      # serves dist/ the way the static hosts do, including a real 404
npm run test:e2e     # browser tests: accessibility, keyboard, no-JavaScript, hosting
```

On a new machine run `npx playwright install chromium` once before `npm run test:e2e`. To use a Chrome already
installed instead, set `THISTLE_E2E_BROWSER` to its path.

## Make it yours

Everything a restaurant personalizes lives in **`src/content/restaurant.ts`**, typed by `src/content/types.ts`.
No layout code holds names, prices, hours or copy. The build checks the content (`src/lib/content.ts`) and stops
with a plain explanation if something would break a page.

- **Site**: `name`, `tagline` and `description` (used for the page titles, link previews and search engines).
  Set `url` once the site has its address.
- **Contact**: street address, phone, email and parking note. `mapUrl` is optional; without it, "Open in maps"
  searches OpenStreetMap for the address. Instagram and Facebook links appear only once you add their addresses
  under `social`.
- **Hours** are written once, in `hours.schedule`, as 24-hour times for each day (0 is Sunday). A day left out is
  closed. The footer, the contact page, the reservation times and the search-engine data all come from them.
- **Menu**: categories and items, with prices written exactly as you want them shown. Tags (`vegetarian`,
  `spicy`, `seafood`, `gluten`) add the icons and the key. Mark the dishes to feature on the home page with
  `signature: true`; each needs a `photo`. The home page reads them from the menu, so prices never disagree.
- **About, gallery, private events, reviews and newsletter**: each has its own block of copy and photographs.
  Gallery photos take a `size` (`tall`, `medium` or `short`) for the layout.
- **Colours** live in `src/theme/colors.ts`. `tests/contrast.test.ts` holds every text colour on every ground to
  WCAG AA. The bright gold is for dark grounds only; on cream and white, text uses the deeper `goldInk`.

## Pages

| Address         | What it is                                                                  |
| --------------- | --------------------------------------------------------------------------- |
| `/`             | Opening photograph, signature dishes, press quotes and private events       |
| `/menu`         | The full menu, one section at a time behind tabs (every section without JS) |
| `/about`        | The chef and the restaurant's story                                         |
| `/gallery`      | Photographs of the room, the kitchen and the food                           |
| `/reservations` | Book a table, and the private event inquiry                                 |
| `/contact`      | Address card with a map link, hours, parking, reviews and the newsletter    |

## Reservations

The form follows the real hours: closed days say so, the times offered run from opening to the last seating
(`lastSeatingMinutes` before close, every `slotMinutes`), past dates are refused, and guests may book up to
`bookingWindowDays` ahead for parties of up to `largestParty`. Larger groups are pointed to the private event
inquiry.

A restaurant that books through an outside service (OpenTable, Resy, Tock or similar) sets
`reservations.external` to `{ label, url }` (an `https` address). The form is then replaced by a link to that service.

## Forms

The reservation, private event and newsletter forms post JSON to the endpoints in `.env.example`:

| Variable                    | Receives                                                                            |
| --------------------------- | ----------------------------------------------------------------------------------- |
| `VITE_RESERVATION_ENDPOINT` | `date` (yyyy-mm-dd), `time`, `party` (number), `name`, `email`, `phone`, `requests` |
| `VITE_EVENTS_ENDPOINT`      | `eventDate`, `guests` (number), `occasion`, `name`, `email`, `message`              |
| `VITE_NEWSLETTER_ENDPOINT`  | `email`                                                                             |

Without an endpoint, a form runs as a labelled demonstration: it validates, says plainly that nothing was sent,
shows what a guest would see, and keeps what they typed.

The endpoint must answer any `2xx` once the request is stored. A `4xx` is shown as "couldn't be accepted as it
is", and a `5xx` or a network failure as a recoverable error; the visitor's details are never lost. A reservation
is shown to the guest as a **request** ("We'll confirm by email"), so the endpoint, or the person reading it,
must confirm each booking. Spam protection (rate limiting, a challenge, or moderation) belongs on the server.

## Photographs

The demonstration uses stock photographs from Unsplash, linked from `images.unsplash.com` through the `stock()`
helper at the top of `src/content/restaurant.ts`. They are there to show the layout. Replace them with the
restaurant's own photographs before launch: put the files under `public/` (for example
`public/photos/dining-room.jpg`) and set each `src` to `/photos/dining-room.jpg`. Give every photograph `alt`
text that describes what it shows; the build refuses a photograph without one.

If a photograph cannot load, a quiet panel with its description takes its place instead of a broken image.

## Search engines

Each page has its own title and description, and the head carries schema.org `Restaurant` data built from the
address and hours. The demonstration asks search engines not to index it (`site.indexable: false`). For a real
restaurant set `site.indexable` to `true` and `site.url` to its address; the build then writes the canonical
links, the link-preview image and `sitemap.xml`.

## Hosting

Publish at the root of a domain or subdomain. `npm run build` writes a static site to `dist/`: one HTML file per
page (`menu/index.html` and so on), `404.html` and `robots.txt`.

- **Vercel**: `vercel.json` is included.
- **Netlify**: set the build command to `npm run build` and the publish directory to `dist`.
- **Any static host**: serve `<path>/index.html` for `<path>`, and `404.html` with a 404 status for anything
  missing.

Form endpoint variables are read at build time, so set them in the host's build settings and rebuild after a
change.

## Accessibility

Built for WCAG 2.2 AA and checked in a browser by `npm run test:e2e` (axe on every page and form state, at
desktop and phone sizes): semantic landmarks and heading order, a skip link, visible focus, an accessible
small-screen menu, menu tabs that work with the arrow keys, a dish row that scrolls from the keyboard or with
Previous and Next buttons, quote carousels with a Pause button that stop on hover or focus and never rotate for
visitors who prefer reduced motion, labelled form fields with errors announced and focus moved to the first
one, and touch targets of at least 44 px.

## What needs a backend

| Feature                            | Works in the static template                   | Needs                                         |
| ---------------------------------- | ---------------------------------------------- | --------------------------------------------- |
| Menu, hours, story, gallery, map   | Yes                                            | —                                             |
| Table reservations                 | Demonstration, or a link to an outside service | `VITE_RESERVATION_ENDPOINT` and confirmations |
| Private event inquiries            | Demonstration                                  | `VITE_EVENTS_ENDPOINT`                        |
| Newsletter sign-up                 | Demonstration                                  | `VITE_NEWSLETTER_ENDPOINT` or an email tool   |
| Confirmation and reminder emails   | —                                              | An email provider on the server               |
| Live availability and table limits | —                                              | A booking system                              |

## Demonstration content

The Copper Thistle, its chef, address, phone number, reviews and press quotes are fictional, and the publications
quoted are invented. The photographs are stock photography. One line in the footer says so while
`site.demonstration` is `true`; set it to `false` for a real restaurant.
