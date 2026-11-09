// @ts-check

/**
 * Source for the Launchpad template: the top of its concept preview page, which its loop films.
 * @type {import('./index.js').Excerpt}
 */
const templateLaunchpad = {
  id: 'template-launchpad',
  file: 'launchpad.html',
  repo: 'cja86104/AllenCode',
  path: 'tools/previews/src/launchpad.html',
  lines: [49, 64],
  commit: 'ebbc6f89bc5d4812f51131e216583d83ba064197',
  code: [
    "  <header class=\"top wrap\">",
    "    <a class=\"brand\" href=\"#\">Quillstack</a>",
    "    <nav><a href=\"#\">Features</a><a href=\"#\">Teams</a><a href=\"#\">Sign in</a></nav>",
    "  </header>",
    "  <section class=\"hero wrap\">",
    "    <div>",
    "      <p class=\"eyebrow\">Writing tools for teams</p>",
    "      <h1>Draft, review and publish without the email chain.</h1>",
    "      <p class=\"lede\">One place for every draft, every comment and every final version.</p>",
    "      <a class=\"button\" href=\"#start\">Try Quillstack</a>",
    "    </div>",
    "    <div class=\"window card\" aria-hidden=\"true\">",
    "      <div class=\"dots\"><i></i><i></i><i></i></div>",
    "      <div class=\"rows\"><b></b><b></b><b></b><b></b><b></b><b></b></div>",
    "    </div>",
    "  </section>",
  ].join('\n'),
  becomes: 'the Launchpad — SaaS Landing concept preview',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default templateLaunchpad;
