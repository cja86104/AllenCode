// @ts-check

/**
 * Source for the builder chapter: Chris's story as data, the timeline on the About page. It lands
 * as his portrait.
 * @type {import('./index.js').Excerpt}
 */
const builder = {
  id: 'builder',
  file: 'About.jsx',
  repo: 'cja86104/AllenCode',
  path: 'src/pages/About.jsx',
  lines: [7, 33],
  commit: '516bcb7b640850ec1038ef06cd51c7dac0ea67c2',
  code: [
    "const TIMELINE = [",
    "  {",
    "    year: '2009–2023',",
    "    title: 'Fifteen years in professional kitchens',",
    "    body: \"Line cook to kitchen leadership — where the standard is simple: it either goes out right, or it doesn't go out.\",",
    "  },",
    "  {",
    "    year: '2020',",
    "    title: 'Started teaching myself to code',",
    "    body: 'Nights and mornings before shifts, working through fundamentals with no bootcamp and no shortcuts.',",
    "  },",
    "  {",
    "    year: '2022',",
    "    title: 'First paid client build shipped',",
    "    body: 'A small business tool that replaced three spreadsheets — the first proof this could be a real business.',",
    "  },",
    "  {",
    "    year: '2023',",
    "    title: 'Left hospitality full-time',",
    "    body: 'Went all-in on Allen Code Co. as a solo, build-to-sell software studio.',",
    "  },",
    "  {",
    "    year: '2024–Now',",
    "    title: 'Four live products, growing client roster',",
    "    body: 'My Teachers Toolbox, UnderFire AI, Founders Helm, and a private beta — plus a template store and client work running in parallel.',",
    "  },",
    "];",
  ].join('\n'),
  becomes: "Chris Allen's portrait",
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default builder;
