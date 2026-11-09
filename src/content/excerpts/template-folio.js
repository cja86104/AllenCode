// @ts-check

/**
 * Source for the Folio template: the top of its concept preview page, which its loop films.
 * @type {import('./index.js').Excerpt}
 */
const templateFolio = {
  id: 'template-folio',
  file: 'folio.html',
  repo: 'cja86104/AllenCode',
  path: 'tools/previews/src/folio.html',
  lines: [42, 50],
  commit: 'ebbc6f89bc5d4812f51131e216583d83ba064197',
  code: [
    "  <header class=\"top wrap\">",
    "    <a class=\"brand\" href=\"#\">Nora Kim</a>",
    "    <nav><a href=\"#\">Work</a><a href=\"#\">Studio</a><a href=\"#\">Classes</a><a href=\"#\">Contact</a></nav>",
    "  </header>",
    "  <section class=\"intro wrap\">",
    "    <h1>Nora Kim</h1>",
    "    <p class=\"role\">Ceramic artist</p>",
    "    <p class=\"lede\">Hand-thrown stoneware for everyday tables, made in a small studio by the river.</p>",
    "  </section>",
  ].join('\n'),
  becomes: 'the Folio — Portfolio concept preview',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default templateFolio;
