// @ts-check

/**
 * Source for the Gridview template: the top of its concept preview page, which its loop films.
 * @type {import('./index.js').Excerpt}
 */
const templateGridview = {
  id: 'template-gridview',
  file: 'gridview.html',
  repo: 'cja86104/AllenCode',
  path: 'tools/previews/src/gridview.html',
  lines: [52, 72],
  commit: 'ebbc6f89bc5d4812f51131e216583d83ba064197',
  code: [
    "  <div class=\"shell\">",
    "    <aside class=\"side\">",
    "      <a class=\"brand\" href=\"#\">Gridview</a>",
    "      <a class=\"on\" href=\"#\">Overview</a>",
    "      <a href=\"#\">Reports</a>",
    "      <a href=\"#\">Customers</a>",
    "      <a href=\"#\">Settings</a>",
    "    </aside>",
    "    <main class=\"main\">",
    "      <h1>Good morning, Morgan</h1>",
    "      <div class=\"kpis\">",
    "        <div class=\"card\">",
    "          <p class=\"muted\">Active users</p>",
    "          <p class=\"value\">4,218</p>",
    "          <p class=\"change\">+6.2%</p>",
    "        </div>",
    "        <div class=\"card\">",
    "          <p class=\"muted\">New sign-ups</p>",
    "          <p class=\"value\">312</p>",
    "          <p class=\"change\">+12.4%</p>",
    "        </div>",
  ].join('\n'),
  becomes: 'the Gridview — Dashboard Starter concept preview',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default templateGridview;
