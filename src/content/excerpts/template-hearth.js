// @ts-check

/**
 * Source for the Hearth template: the top of its concept preview page, which its loop films.
 * @type {import('./index.js').Excerpt}
 */
const templateHearth = {
  id: 'template-hearth',
  file: 'hearth.html',
  repo: 'cja86104/AllenCode',
  path: 'tools/previews/src/hearth.html',
  lines: [45, 64],
  commit: 'ebbc6f89bc5d4812f51131e216583d83ba064197',
  code: [
    "  <header class=\"top wrap\">",
    "    <a class=\"brand\" href=\"#\">The Harper Family</a>",
    "    <nav><a href=\"#\">Latest news</a><a href=\"#\">Photos</a><a href=\"#\">Coming up</a></nav>",
    "  </header>",
    "  <section class=\"hero wrap\">",
    "    <h1>The Harper Family</h1>",
    "    <p class=\"lede\">News, photos and dates for everyone who loves us.</p>",
    "    <svg class=\"art\" viewBox=\"0 0 400 260\" role=\"img\" aria-label=\"A drawn landscape for The Harper Family\">",
    "      <defs>",
    "        <linearGradient id=\"sky-30\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">",
    "          <stop offset=\"0\" stop-color=\"hsl(30 70% 82%)\"/>",
    "          <stop offset=\"1\" stop-color=\"hsl(60 60% 66%)\"/>",
    "        </linearGradient>",
    "      </defs>",
    "      <rect width=\"400\" height=\"260\" fill=\"url(#sky-30)\"/>",
    "      <circle cx=\"300\" cy=\"86\" r=\"34\" fill=\"hsl(80 90% 92%)\"/>",
    "      <path d=\"M0 190 Q100 120 210 176 T400 160 V260 H0Z\" fill=\"hsl(30 35% 42%)\"/>",
    "      <path d=\"M0 220 Q140 170 260 214 T400 206 V260 H0Z\" fill=\"hsl(30 40% 30%)\"/>",
    "    </svg>",
    "  </section>",
  ].join('\n'),
  becomes: 'the Hearth — Family Home Page concept preview',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default templateHearth;
