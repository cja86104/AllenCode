# Code World W3: the family road

Date: 2026-11-16. Implements phase W3 of `docs/superpowers/specs/2026-11-10-code-world-design.md`
(section 3, "Family road (door b)") the way W2 revised
(`docs/superpowers/specs/2026-11-12-code-world-chapters-design.md`) built the business road: today's
door B chapters play, unchanged in words and motion, each at its own landmark along the road.

## Intent

Taking `family/` at the fork should feel exactly like taking `business/` does since R6: the camera
turns down the road, travels to a landmark, rests while today's chapter plays there (its editor box
typing, its code flying into its picture, the real loop taking over), then travels on. Hearth first,
then Evergreen, Keepsake, Vow, Gather and Folio, then Done for you as a stop of words, then the
builder, your idea and the brief as today. Door B stays as W1 left it only until this lands.

## Goals

1. Door B in world mode is today's door B: Door B's opening (Hearth), the five templates, Done for
   you, the builder, the idea and the brief, in that order, with every animation they have today.
2. Each of Hearth and the five templates is a landmark on the family road (a screen, 16:10 like its
   loop) with its side path and stand, resolving into its loop as the chapter's flight lands.
3. The camera rests square on each landmark, framed on the chapter's screen box; for Done for you,
   which has no landmark, it rests looking down the road, as it does for How I work.
4. Everything R4 to R6 give the business road: passed landmarks show their pictures, the road runs
   on into the fog, side paths and stands, the gate first.

## Non-goals

- Any change to door B's copy, template order, or the chapters' timing within their own section.
- The workshop, your idea in 3D, the ending (W4); inner pages (W5).
- The site without the switch, reduced motion, no WebGL2: today's page, unchanged (as R4).

## Anti-goals

- A template that arrives as a finished picture without its code flying into it.
- The camera moving while a flight is in the air.
- Two WebGL renderers at once.

## Approaches

- **A. Split the template chapter: one pinned section per template (chosen by Chris, 2026-11-16:
  "split").** Today's single pinned template chapter plays its five templates one after another in
  one frame. In world mode each template gets its own pinned section, made from the existing
  `TemplateSegment` (its words, numbering, editor, flight and loop, unchanged), with a stretch of
  road before it, exactly as door A's chapters are laid out. The camera's track, the flights, the
  fades and the passed pictures are R4's code with no change. Without the switch the single chapter
  stays as it is.
- **B. Keep one chapter; move the camera between the five houses while it plays.** Less DOM, but
  the camera would travel while a flight is mid-air, which R1 removed on purpose. Not chosen.

## Design

### The road's stops (`src/world/roads.js`)

`familyRoadStops({ includeDrafts })` beside `businessRoadStops`: Hearth (`kind: 'template'`, the
`hearth` template, its `template-hearth` excerpt), then `DOOR_B_TEMPLATES` in their order (each
`kind: 'template'`, its template's excerpt), then `{ id: 'done-for-you', kind: 'words', excerptId:
null }`. A template without an approved excerpt or without a loop and poster is left out, as a
product is. `RoadStop['kind']` gains `'template'` and `'words'`.

`roadSizes`: a `template` stop is a screen `SCREEN_WIDTH` wide, 1280 × 800 like a product
(`LOOP_ASPECT`). `layoutRoad` already mirrors the business layout for door `b`; a `words` stop, like
`commits`, places no landmark (and no commits). `routeFor('b')` builds the road as `routeFor('a')`
does; `roadSources` covers both roads' excerpts for the atlas.

**Call (mine): screens, not houses.** The original spec sketched the templates as "small houses of
their preview code". The flight lands the chapter's code as the loop's picture, which is a
rectangle; a house-shaped sculpture would have to become a rectangle at the end, which is the
"finished image arriving on its own" the revision forbids. So a template landmark is a screen, like
a product's. Chris can overrule this.

### The page (`src/scenes/WorldRoadChapters.jsx`)

`WorldRoadChapters({ door, includeDrafts })`. For door `b`, from `familyRoadStops`: Hearth renders
`DoorBIntro`'s flight chapter (today's `FlightIntro`, exported as `DoorBIntroFor`); a template stop
renders `TemplateChapterFor({ template, excerpt })`: a pinned section of `SEGMENT_VH + 100` vh
holding one `TemplateSegment` with `active` true and `local` = the section's progress, numbered
`n / 5` as today; `done-for-you` renders `DoneForYou` unchanged. Each after `ROAD_BEFORE` of road
and inside `[data-world-segment="rest"][data-world-stop]`, as door A's. `data-world-target` goes on
the intro's and the segment's loop box. `Home` passes `door` and, for door `b` in world mode,
renders `WorldRoadChapters` in place of `DoorBIntro`, `TemplateChapter` and `DoneForYou`, then the
builder, idea and brief as today.

### The camera (`src/world/worldTrack.js`)

`restFor` rests a `words` stop as it rests `commits`: on the road at the stop's `along`, looking
down the road. Nothing else changes: the track reads the page's `rest` sections and boxes as in R4.

### The world (`src/world/homeWorld.js`, `src/world/shapes.js`)

`screenOf` returns a template stop's poster. `buildRoadWorld` treats `template` as a screen stop (a
sculpture and its picture, a share of the budget each) and `words` as `commits` (no landmark).
Side paths and stands come from the layout as they do now.

### Tests

Unit: `familyRoadStops` (order, the left-outs, `words` last); `roadSizes` for templates;
`layoutRoad('b')` mirrored with a landmark per template and none for `done-for-you`; `buildTrack`
for door `b` (a rest per stop, the `words` rest on the road); `buildRoadWorld` for door `b` within
every tier's budget with a stand and spur per landmark; `TemplateChapterFor` renders one segment
with its flight hooks. E2E: `e2e/worldfamily.spec.js` after `worldbusiness.spec.js`: the fork taken
to `family/`, the stops in order, Hearth's and a template's flight landing on `data-rest-rect`, the
loop taking over, Done for you's words, the builder after, a returning visitor, reduced motion, axe.
`worldhome.spec.js`'s door B expectations updated (door B now has `data-world-stop`s).

### Verification and stop

`npm run verify`, `npm run test:e2e`, Lighthouse on `/` with the switch off (no regression),
screenshots of the family road at every stage, desktop and phone. Then Chris measures
`/?world=1&meter=1` taking `family/` (iPhone p95 ≤ 25 ms; desktop every frame at its refresh).

## Left to the builder

Section heights for the split template chapters (start from `SEGMENT_VH + 100`), the exact budget
split when a road has six screen landmarks, and the e2e scroll helpers (reuse `worldbusiness`'s).
