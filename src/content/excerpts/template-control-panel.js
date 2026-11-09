// @ts-check

/**
 * Source for the Control Panel template: the top of its concept preview page, which its loop films.
 * @type {import('./index.js').Excerpt}
 */
const templateControlPanel = {
  id: 'template-control-panel',
  file: 'control-panel.html',
  repo: 'cja86104/AllenCode',
  path: 'tools/previews/src/control-panel.html',
  lines: [52, 72],
  commit: 'ebbc6f89bc5d4812f51131e216583d83ba064197',
  code: [
    "  <div class=\"shell\">",
    "    <aside class=\"side\">",
    "      <a class=\"brand\" href=\"#\">Control Panel</a>",
    "      <a class=\"on\" href=\"#\">Overview</a>",
    "      <a href=\"#\">Deployments</a>",
    "      <a href=\"#\">Team</a>",
    "      <a href=\"#\">Billing</a>",
    "      <a href=\"#\">Settings</a>",
    "    </aside>",
    "    <main class=\"main\">",
    "      <h1>Good morning, Riley</h1>",
    "      <div class=\"kpis\">",
    "        <div class=\"card\">",
    "          <p class=\"muted\">Requests today</p>",
    "          <p class=\"value\">1.28M</p>",
    "          <p class=\"change\">+4.8%</p>",
    "        </div>",
    "        <div class=\"card\">",
    "          <p class=\"muted\">Error rate</p>",
    "          <p class=\"value\">0.04%</p>",
    "          <p class=\"change\">-0.02%</p>",
  ].join('\n'),
  becomes: 'the Control Panel — Dashboard Starter concept preview',
  approved: { by: 'Chris', on: '2026-11-09' },
};

export default templateControlPanel;
