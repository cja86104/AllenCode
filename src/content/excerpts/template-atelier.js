// @ts-check

/**
 * Source for the Atelier template: the top of its concept preview page, which its loop films.
 * @type {import('./index.js').Excerpt}
 */
const templateAtelier = {
  id: 'template-atelier',
  file: 'atelier.html',
  repo: 'cja86104/AllenCode',
  path: 'tools/previews/src/atelier.html',
  lines: [42, 50],
  commit: 'ebbc6f89bc5d4812f51131e216583d83ba064197',
  code: [
    "  <header class=\"top wrap\">",
    "    <a class=\"brand\" href=\"#\">Atelier Morrow</a>",
    "    <nav><a href=\"#\">Projects</a><a href=\"#\">Approach</a><a href=\"#\">Journal</a><a href=\"#\">Contact</a></nav>",
    "  </header>",
    "  <section class=\"intro wrap\">",
    "    <h1>Atelier Morrow</h1>",
    "    <p class=\"role\">Interior design studio</p>",
    "    <p class=\"lede\">Calm, lived-in rooms, designed around the people who use them.</p>",
    "  </section>",
  ].join('\n'),
  becomes: 'the Atelier — Agency Site concept preview',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default templateAtelier;
