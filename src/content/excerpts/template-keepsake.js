// @ts-check

/**
 * Source for the Keepsake template: the top of its concept preview page, which its loop films.
 * @type {import('./index.js').Excerpt}
 */
const templateKeepsake = {
  id: 'template-keepsake',
  file: 'keepsake.html',
  repo: 'cja86104/AllenCode',
  path: 'tools/previews/src/keepsake.html',
  lines: [45, 64],
  commit: 'ebbc6f89bc5d4812f51131e216583d83ba064197',
  code: [
    "  <header class=\"top wrap\">",
    "    <a class=\"brand\" href=\"#\">Baby June</a>",
    "    <nav><a href=\"#\">Milestones</a><a href=\"#\">Photo journal</a><a href=\"#\">Next up</a></nav>",
    "  </header>",
    "  <section class=\"hero wrap\">",
    "    <h1>Baby June</h1>",
    "    <p class=\"lede\">Born April 3, 2026. Every little first, in one place.</p>",
    "    <svg class=\"art\" viewBox=\"0 0 400 260\" role=\"img\" aria-label=\"A drawn landscape for Baby June\">",
    "      <defs>",
    "        <linearGradient id=\"sky-330\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">",
    "          <stop offset=\"0\" stop-color=\"hsl(330 70% 82%)\"/>",
    "          <stop offset=\"1\" stop-color=\"hsl(0 60% 66%)\"/>",
    "        </linearGradient>",
    "      </defs>",
    "      <rect width=\"400\" height=\"260\" fill=\"url(#sky-330)\"/>",
    "      <circle cx=\"300\" cy=\"86\" r=\"34\" fill=\"hsl(20 90% 92%)\"/>",
    "      <path d=\"M0 190 Q100 120 210 176 T400 160 V260 H0Z\" fill=\"hsl(330 35% 42%)\"/>",
    "      <path d=\"M0 220 Q140 170 260 214 T400 206 V260 H0Z\" fill=\"hsl(330 40% 30%)\"/>",
    "    </svg>",
    "  </section>",
  ].join('\n'),
  becomes: 'the Keepsake — Baby and Milestones concept preview',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default templateKeepsake;
