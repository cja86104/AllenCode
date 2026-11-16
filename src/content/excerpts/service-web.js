// @ts-check

/**
 * Source for the custom web development chapter: this site's own page code, the part of the home
 * page that lays out where the Code World's roads meet. It lands as a loop of the site it builds
 * (Chris, 2026-11-16).
 * @type {import('./index.js').Excerpt}
 */
const serviceWeb = {
  id: 'service-web',
  file: 'WorldRoadChapters.jsx',
  repo: 'cja86104/AllenCode',
  path: 'src/scenes/WorldRoadChapters.jsx',
  lines: [72, 81],
  commit: 'c27c37b19b006e6bdaa594cdb33305ad1492cea9',
  code: [
    "      {/* Where the roads meet (W4): the workshop, then your idea, held while it is on screen. */}",
    "      <div aria-hidden=\"true\" style={{ height: ROAD_TO_MEETING }} />",
    "      <div data-world-segment=\"rest\" data-world-stop=\"workshop\">",
    "        <Builder />",
    "      </div>",
    "      <div aria-hidden=\"true\" style={{ height: ROAD_BEFORE }} />",
    "      <div data-world-segment=\"rest\" data-world-stop=\"your-idea\" data-world-hold=\"visible\">",
    "        <IdeaSketch />",
    "      </div>",
    "    </>",
  ].join('\n'),
  becomes: 'a loop of this site, the Code World, being built',
  approved: { by: 'Chris', on: '2026-11-16' },
};

export default serviceWeb;
