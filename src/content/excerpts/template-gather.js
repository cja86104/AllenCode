// @ts-check

/**
 * Source for the Gather template: the top of its concept preview page, which its loop films.
 * @type {import('./index.js').Excerpt}
 */
const templateGather = {
  id: 'template-gather',
  file: 'gather.html',
  repo: 'cja86104/AllenCode',
  path: 'tools/previews/src/gather.html',
  lines: [43, 62],
  commit: 'ebbc6f89bc5d4812f51131e216583d83ba064197',
  code: [
    "  <section class=\"hero wrap\">",
    "    <p class=\"eyebrow\">Three days, one big family</p>",
    "    <h1>The Delgado Family Reunion</h1>",
    "    <p class=\"when\">July 16 to 18, 2027 · Pine Lake Lodge</p>",
    "    <a class=\"button\" href=\"#rsvp\">Tell us you're coming</a>",
    "  </section>",
    "  <div class=\"band\">",
    "    <svg class=\"art\" viewBox=\"0 0 400 260\" preserveAspectRatio=\"xMidYMid slice\" role=\"img\" aria-label=\"A drawn landscape for Pine Lake Lodge\">",
    "      <defs>",
    "        <linearGradient id=\"sky-190\" x1=\"0\" y1=\"0\" x2=\"0\" y2=\"1\">",
    "          <stop offset=\"0\" stop-color=\"hsl(190 70% 82%)\"/>",
    "          <stop offset=\"1\" stop-color=\"hsl(220 60% 66%)\"/>",
    "        </linearGradient>",
    "      </defs>",
    "      <rect width=\"400\" height=\"260\" fill=\"url(#sky-190)\"/>",
    "      <circle cx=\"300\" cy=\"86\" r=\"34\" fill=\"hsl(240 90% 92%)\"/>",
    "      <path d=\"M0 190 Q100 120 210 176 T400 160 V260 H0Z\" fill=\"hsl(190 35% 42%)\"/>",
    "      <path d=\"M0 220 Q140 170 260 214 T400 206 V260 H0Z\" fill=\"hsl(190 40% 30%)\"/>",
    "    </svg>",
    "  </div>",
  ].join('\n'),
  becomes: 'the Gather — Reunion and Events concept preview',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default templateGather;
