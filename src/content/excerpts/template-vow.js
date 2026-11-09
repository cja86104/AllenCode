// @ts-check

/**
 * Source for the Vow template: the top of its concept preview page, which its loop films.
 * @type {import('./index.js').Excerpt}
 */
const templateVow = {
  id: 'template-vow',
  file: 'vow.html',
  repo: 'cja86104/AllenCode',
  path: 'tools/previews/src/vow.html',
  lines: [43, 62],
  commit: 'ebbc6f89bc5d4812f51131e216583d83ba064197',
  code: [
    "  <section class=\"hero wrap\">",
    "    <p class=\"eyebrow\">We are getting married</p>",
    "    <h1>Sam &amp; Riley</h1>",
    "    <p class=\"when\">June 12, 2027 · Willow Creek Farm</p>",
    "    <a class=\"button\" href=\"#rsvp\">RSVP</a>",
    "  </section>",
    "  <div class=\"band\">",
    "    <svg class=\"art\" viewBox=\"0 0 400 260\" preserveAspectRatio=\"xMidYMid slice\" role=\"img\" aria-label=\"A drawn landscape for Willow Creek Farm\">",
    "      <defs>",
    "        <linearGradient id=\"sky-40\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">",
    "          <stop offset=\"0\" stop-color=\"hsl(40 70% 82%)\"/>",
    "          <stop offset=\"1\" stop-color=\"hsl(70 60% 66%)\"/>",
    "        </linearGradient>",
    "      </defs>",
    "      <rect width=\"400\" height=\"260\" fill=\"url(#sky-40)\"/>",
    "      <circle cx=\"300\" cy=\"86\" r=\"34\" fill=\"hsl(90 90% 92%)\"/>",
    "      <path d=\"M0 190 Q100 120 210 176 T400 160 V260 H0Z\" fill=\"hsl(40 35% 42%)\"/>",
    "      <path d=\"M0 220 Q140 170 260 214 T400 206 V260 H0Z\" fill=\"hsl(40 40% 30%)\"/>",
    "    </svg>",
    "  </div>",
  ].join('\n'),
  becomes: 'the Vow — Wedding concept preview',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default templateVow;
