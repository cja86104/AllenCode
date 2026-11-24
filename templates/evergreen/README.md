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

## Pages

| Address             | What it is                                                                            |
| ------------------- | ------------------------------------------------------------------------------------- |
| `/`                 | The memorial: a complete single page on its own                                       |
| `/story`            | The full life story, set for reading and printing                                     |
| `/photographs`      | Every photograph in date order, filterable (`?show=family`), opening in a lightbox    |
| `/photographs/<id>` | One photograph and its story: what a shared link opens                                |
| `/share`            | Share a memory                                                                        |
| `/privacy`          | Who can see the memorial, and what happens to a shared memory                         |
| `/family`           | Family access                                                                         |
| `/family/preview`   | A labelled demonstration of the family area, only when `site.demonstration` is `true` |

## Receiving memories

Without configuration the Share a memory form is a demonstration: it validates, keeps the visitor's
writing in their own browser, and then says plainly that nothing was sent.

To receive memories, set `VITE_MEMORY_ENDPOINT` (see `.env.example`) to an endpoint you control. The form
posts `multipart/form-data` with `name`, `relationship`, `memory`, `email`, `displayPermission`
(`yes`/`no`) and an optional `photo` (JPEG, PNG or WebP, up to 10 MB), and shows upload progress.

The endpoint must:

- answer any `2xx` once the memory is stored, `413` for a photograph that is too large, and `415` for one of
  the wrong type (other `4xx` and `5xx` responses are shown as recoverable errors; the visitor's writing is
  never lost);
- store every memory as **unpublished** until the family approves it, and never return unpublished
  memories or email addresses to visitors;
- handle spam (rate limiting, a challenge, or moderation) on the server.

Approved memories are added to `memories.items` in `src/content/memorial.ts`.

## Family area

The family area (editing, arranging photographs, reviewing memories, updating the gathering, choosing
sections and privacy, exporting content) needs authentication and a server that checks it on every
request. The static template does not include one and never shows a login form that would protect
nothing. `/family/preview` demonstrates the experience with the template's own sample data, saves
nothing, and is only available on the demonstration memorial.

## Privacy modes

- **Public**: listed and indexable.
- **Unlisted**: asks search engines not to index it, but anyone with the link can open it. It is not private.
- **Private**: requires real, server-enforced access control. The static template does not provide it, so the
  build refuses `private` until authentication is connected.

## Demonstration content

The shipped content remembers a fictional person, Eleanor “Nell” Whitaker. Her family, the venue and the
gathering are invented, and every photograph is a labelled placeholder.
