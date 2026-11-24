# Evergreen — Memorial and Tribute

A memorial website template by Allen Code Co. Vite, React 18, React Router 6 and TypeScript (strict).
No analytics, no third-party embeds, no backend required for the public memorial.

## Run it

```bash
npm install
npm run dev       # http://localhost:5173
npm run verify    # lint, typecheck, format check, tests, production build
npm run build     # typecheck + production build into dist/
```

## Make it yours

Everything a family personalizes lives in **`src/content/memorial.ts`**, typed by `src/content/types.ts`.
No layout code holds names, dates or stories.

- **Dates** can be partial: `{ year: 1982, season: 'summer', approximate: true }` reads “Summer, around 1982”.
  Leave out anything unknown; the page leaves it out too.
- **Pronouns and labels**: `person.pronouns` sets “her / his / their”, and `lifeLabel` the navigation label.
- **Photographs**: add files under `public/`, then list them in `photos.items` with their real `width`,
  `height`, `alt`, `caption`, and an optional `focalPoint` (percent from top-left) that keeps faces in frame
  when cropped. Remove `placeholder: true` once a real photograph is in place.
- **Gathering**: `gathering.visibility` is `public` or `private`. A public gathering shows as upcoming until it
  ends, then switches to “Took place” by itself. RSVP, livestream, map and calendar links appear only when
  configured.
- **Optional modules** (`modules`): recipe, reading list, family letter, audio memory (transcript required),
  remembrance date, donation link (family-supplied https only), service program, observances. A disabled
  module leaves nothing behind.
- **Appearance**: `site.appearance` is `paper-and-pine`, `linen-and-ink` or `dusk-and-clay`
  (`src/theme/presets.ts`). Every text colour in every preset is held to WCAG AA by `tests/contrast.test.ts`.

The build checks the content (`src/lib/content.ts`) and stops with a plain explanation if something would
break the page, such as a missing photograph or a private memorial without server-side access control.

## Privacy modes

- **Public**: listed and indexable.
- **Unlisted**: asks search engines not to index it, but anyone with the link can open it. It is not private.
- **Private**: requires real, server-enforced access control. The static template does not provide it, so the
  build refuses `private` until authentication is connected.

## Demonstration content

The shipped content remembers a fictional person, Eleanor “Nell” Whitaker. Her family, the venue and the
gathering are invented, and every photograph is a labelled placeholder.
