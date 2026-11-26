# Founding Fathoms — brewery website template

A brewery and taproom website by Allen Code Co. Vite, React 18 and strict TypeScript, styled with Tailwind
(built locally) and fonts bundled with the site. Every page is prerendered to static HTML, so it reads in
full without JavaScript.

## Editing the content

Everything the pages say lives in one file: `src/content/brewery.ts`. Its shape is described in
`src/content/types.ts`. The build checks the content and stops with a plain sentence for each problem
(hours that close before they open, a photo without a description, a beer in a group that doesn't exist).

The demonstration is a fictional brewery. Its people, beers, prices, shops and quotes are invented; the
photographs are stock photography from Unsplash. The footer says so while `site.demonstration` is true.

## Forms, the shop and the Can Club

The contact form, the Can Club sign-up and the pickup checkout each post JSON to an address set at build
time (see `.env.example`):

| Setting                  | Form                                                                            |
| ------------------------ | ------------------------------------------------------------------------------- |
| `VITE_CONTACT_ENDPOINT`  | Contact page, “Write us”                                                        |
| `VITE_CAN_CLUB_ENDPOINT` | Contact page, Can Club sign-up (name, email, plan, age confirmation)            |
| `VITE_ORDER_ENDPOINT`    | Shop checkout (who's collecting, pickup option, items, total, age confirmation) |

Until one is set, that form checks what was typed and then says plainly that nothing was sent. No payment
is taken online: orders are paid at pickup, and anyone collecting beer confirms they're 21 or older and
brings photo ID. There are no accounts or passwords. The cart is kept in the visitor's own browser.

## Analytics

`src/components/Layout.tsx` includes Vercel Web Analytics (`@vercel/analytics/react`). It counts page views
without cookies, and its script loads from the site's own `/_vercel/insights` address, so it works only once
the site is deployed on Vercel with Web Analytics turned on for the project.

## Commands

| Command            | What it does                                                    |
| ------------------ | --------------------------------------------------------------- |
| `npm run dev`      | Development server                                              |
| `npm run verify`   | Lint, typecheck, formatting, unit tests and production build    |
| `npm run test:e2e` | Browser tests (accessibility, no-JS, hosting) against the build |
| `npm run preview`  | Serves the build the way a static host does                     |

Run `npx playwright install chromium` once before the browser tests, or set `FATHOMS_E2E_BROWSER` to an
installed Chrome.
