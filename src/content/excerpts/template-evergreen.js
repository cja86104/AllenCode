// @ts-check

/**
 * Source for the Evergreen template: the top of its concept preview page, which its loop films.
 * @type {import('./index.js').Excerpt}
 */
const templateEvergreen = {
  id: 'template-evergreen',
  file: 'evergreen.html',
  repo: 'cja86104/AllenCode',
  path: 'tools/previews/src/evergreen.html',
  lines: [45, 64],
  commit: 'ebbc6f89bc5d4812f51131e216583d83ba064197',
  code: [
    "  <header class=\"top wrap\">",
    "    <a class=\"brand\" href=\"#\">Margaret Ellis</a>",
    "    <nav><a href=\"#\">Her story</a><a href=\"#\">Moments</a><a href=\"#\">Celebration of life</a></nav>",
    "  </header>",
    "  <section class=\"hero wrap\">",
    "    <h1>Margaret Ellis</h1>",
    "    <p class=\"lede\">1941 to 2024. A life of gardens, music and open doors.</p>",
    "    <svg class=\"art\" viewBox=\"0 0 400 260\" role=\"img\" aria-label=\"A drawn landscape for Margaret Ellis\">",
    "      <defs>",
    "        <linearGradient id=\"sky-140\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">",
    "          <stop offset=\"0\" stop-color=\"hsl(140 70% 82%)\"/>",
    "          <stop offset=\"1\" stop-color=\"hsl(170 60% 66%)\"/>",
    "        </linearGradient>",
    "      </defs>",
    "      <rect width=\"400\" height=\"260\" fill=\"url(#sky-140)\"/>",
    "      <circle cx=\"300\" cy=\"86\" r=\"34\" fill=\"hsl(190 90% 92%)\"/>",
    "      <path d=\"M0 190 Q100 120 210 176 T400 160 V260 H0Z\" fill=\"hsl(140 35% 42%)\"/>",
    "      <path d=\"M0 220 Q140 170 260 214 T400 206 V260 H0Z\" fill=\"hsl(140 40% 30%)\"/>",
    "    </svg>",
    "  </section>",
  ].join('\n'),
  becomes: 'the Evergreen — Memorial and Tribute concept preview',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default templateEvergreen;
