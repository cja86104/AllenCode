// @ts-check

/**
 * Source for the Studio template: the top of its concept preview page, which its loop films.
 * @type {import('./index.js').Excerpt}
 */
const templateStudio = {
  id: 'template-studio',
  file: 'studio.html',
  repo: 'cja86104/AllenCode',
  path: 'tools/previews/src/studio.html',
  lines: [42, 50],
  commit: 'ebbc6f89bc5d4812f51131e216583d83ba064197',
  code: [
    "  <header class=\"top wrap\">",
    "    <a class=\"brand\" href=\"#\">Halcyon &amp; Co.</a>",
    "    <nav><a href=\"#\">Work</a><a href=\"#\">Services</a><a href=\"#\">Studio</a><a href=\"#\">Contact</a></nav>",
    "  </header>",
    "  <section class=\"intro wrap\">",
    "    <h1>Halcyon &amp; Co.</h1>",
    "    <p class=\"role\">Brand and web studio</p>",
    "    <p class=\"lede\">We design brands people remember and websites that do the work.</p>",
    "  </section>",
  ].join('\n'),
  becomes: 'the Studio — Agency Site concept preview',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default templateStudio;
