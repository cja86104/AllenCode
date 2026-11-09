// @ts-check
// Builds one static concept-preview page per template (spec section 7.6) from previews.config.js and
// five shared layouts, into tools/previews/src/<id>.html. The pages are sources: each template's
// excerpt is copied from its page, and record.mjs films each page for the template's loop.
// Usage: node tools/previews/build.mjs
import { mkdirSync, writeFileSync } from 'node:fs';
import { PREVIEWS } from './previews.config.js';

/** @typedef {import('./previews.config.js').PreviewPage} PreviewPage */
/** @typedef {import('./previews.config.js').Theme} Theme */

const FONTS = '../../../node_modules/@fontsource';

/** @param {string} text */
function esc(text) {
  return text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
}

/**
 * Indents every line of a block by `depth` levels of two spaces.
 * @param {number} depth
 * @param {string[]} lines
 */
function indent(depth, lines) {
  const pad = '  '.repeat(depth);
  return lines.map((line) => (line ? pad + line : line));
}

/**
 * A drawn landscape standing in for a photo: sky, sun and two hills in one hue.
 * @param {number} hue
 * @param {string} label
 * @param {boolean} [fill] Cover a box of any shape (cropping the drawing) instead of keeping its shape.
 * @returns {string[]}
 */
function art(hue, label, fill = false) {
  const id = `sky-${hue}`;
  const aspect = fill ? ' preserveAspectRatio="xMidYMid slice"' : '';
  return [
    `<svg class="art" viewBox="0 0 400 260"${aspect} role="img" aria-label="${esc(label)}">`,
    '  <defs>',
    `    <linearGradient id="${id}" x1="0" y1="0" x2="0" y2="1">`,
    `      <stop offset="0" stop-color="hsl(${hue} 70% 82%)"/>`,
    `      <stop offset="1" stop-color="hsl(${(hue + 30) % 360} 60% 66%)"/>`,
    '    </linearGradient>',
    '  </defs>',
    `  <rect width="400" height="260" fill="url(#${id})"/>`,
    `  <circle cx="300" cy="86" r="34" fill="hsl(${(hue + 50) % 360} 90% 92%)"/>`,
    `  <path d="M0 190 Q100 120 210 176 T400 160 V260 H0Z" fill="hsl(${hue} 35% 42%)"/>`,
    `  <path d="M0 220 Q140 170 260 214 T400 206 V260 H0Z" fill="hsl(${hue} 40% 30%)"/>`,
    '</svg>',
  ];
}

/** @param {Theme} theme */
function fonts(theme) {
  const serif = "'Instrument Serif', Georgia, serif";
  const sans = "Inter, 'Segoe UI', system-ui, sans-serif";
  const mono = "'JetBrains Mono', ui-monospace, monospace";
  const display = theme.display === 'serif' ? serif : theme.display === 'mono' ? mono : sans;
  return { display, body: theme.display === 'mono' ? mono : sans, mono };
}

/**
 * @param {string} title
 * @param {Theme} theme
 * @param {string} layoutCss
 * @param {string[]} body
 */
function page(title, theme, layoutCss, body) {
  const f = fonts(theme);
  return [
    '<!doctype html>',
    '<html lang="en">',
    '<head>',
    '  <meta charset="utf-8">',
    '  <meta name="viewport" content="width=device-width, initial-scale=1">',
    `  <title>${esc(title)} (concept preview)</title>`,
    '  <style>',
    `    @font-face { font-family: 'Instrument Serif'; src: url('${FONTS}/instrument-serif/files/instrument-serif-latin-400-normal.woff2') format('woff2'); }`,
    `    @font-face { font-family: 'Instrument Serif'; font-style: italic; src: url('${FONTS}/instrument-serif/files/instrument-serif-latin-400-italic.woff2') format('woff2'); }`,
    `    @font-face { font-family: 'JetBrains Mono'; src: url('${FONTS}/jetbrains-mono/files/jetbrains-mono-latin-400-normal.woff2') format('woff2'); }`,
    `    @font-face { font-family: 'JetBrains Mono'; font-weight: 500; src: url('${FONTS}/jetbrains-mono/files/jetbrains-mono-latin-500-normal.woff2') format('woff2'); }`,
    `    :root { --bg: ${theme.bg}; --fg: ${theme.fg}; --muted: ${theme.muted}; --accent: ${theme.accent}; --card: ${theme.card}; --line: ${theme.line}; --display: ${f.display}; --body: ${f.body}; --mono: ${f.mono}; }`,
    '    * { box-sizing: border-box; margin: 0; padding: 0; }',
    '    body { background: var(--bg); color: var(--fg); font-family: var(--body); font-size: 17px; line-height: 1.55; -webkit-font-smoothing: antialiased; }',
    '    a { color: inherit; text-decoration: none; }',
    '    .wrap { max-width: 1120px; margin: 0 auto; padding-left: 48px; padding-right: 48px; }',
    '    .top { display: flex; align-items: center; justify-content: space-between; padding-top: 28px; padding-bottom: 28px; }',
    '    .brand { font-family: var(--display); font-size: 24px; letter-spacing: -0.01em; }',
    '    .top nav a { margin-left: 28px; font-size: 14px; color: var(--muted); }',
    '    .eyebrow { font-family: var(--mono); font-size: 12px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); }',
    '    .button { display: inline-block; padding: 14px 26px; border-radius: 999px; background: var(--accent); color: var(--bg); font-weight: 600; font-size: 15px; }',
    '    .card { background: var(--card); border: 1px solid var(--line); border-radius: 18px; }',
    '    .muted { color: var(--muted); }',
    '    .art { display: block; width: 100%; height: auto; border-radius: 16px; }',
    '    h1, h2, h3 { font-family: var(--display); font-weight: 400; letter-spacing: -0.02em; }',
    '    section { padding-top: 56px; padding-bottom: 56px; }',
    '    .concept { position: fixed; right: 20px; bottom: 20px; z-index: 10; padding: 10px 14px; border-radius: 999px; background: rgba(0, 0, 0, 0.78); color: #fff; font: 500 11px/1 var(--mono); letter-spacing: 0.2em; text-transform: uppercase; }',
    ...indent(2, layoutCss.trim().split('\n').map((line) => line.trim())),
    '  </style>',
    '</head>',
    '<body>',
    ...indent(1, body),
    '  <p class="concept">Concept preview</p>',
    '</body>',
    '</html>',
    '',
  ].join('\n');
}

/** @param {import('./previews.config.js').LandingPage} p */
function landing(p) {
  const css = `
    .hero { display: grid; grid-template-columns: 1.05fr 0.95fr; gap: 56px; align-items: center; padding-top: 48px; }
    .hero h1 { font-size: 64px; line-height: 1.02; margin: 18px 0 20px; }
    .hero .lede { font-size: 19px; color: var(--muted); max-width: 30em; margin-bottom: 32px; }
    .window { padding: 18px; }
    .window .dots { display: flex; gap: 6px; margin-bottom: 16px; }
    .window .dots i { width: 10px; height: 10px; border-radius: 50%; background: var(--line); }
    .window .rows { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
    .window .rows b { height: 64px; border-radius: 10px; background: var(--line); }
    .window .rows b:nth-child(1) { grid-column: span 2; background: var(--accent); opacity: 0.85; }
    .window .rows b:nth-child(5) { grid-column: span 2; height: 110px; }
    .features { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .features .card { padding: 28px; }
    .features h3 { font-size: 26px; margin-bottom: 8px; }
    .steps ol { list-style: none; display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; counter-reset: step; }
    .steps li { counter-increment: step; padding-top: 18px; border-top: 2px solid var(--accent); font-size: 18px; }
    .steps li::before { content: '0' counter(step); display: block; font-family: var(--mono); font-size: 13px; color: var(--accent); margin-bottom: 8px; }
    .closing { text-align: center; padding-top: 96px; padding-bottom: 120px; }
    .closing h2 { font-size: 52px; margin-bottom: 28px; }
  `;
  return page(p.brand, p.theme, css, [
    '<header class="top wrap">',
    `  <a class="brand" href="#">${esc(p.brand)}</a>`,
    `  <nav>${p.nav.map((item) => `<a href="#">${esc(item)}</a>`).join('')}</nav>`,
    '</header>',
    '<section class="hero wrap">',
    '  <div>',
    `    <p class="eyebrow">${esc(p.eyebrow)}</p>`,
    `    <h1>${esc(p.headline)}</h1>`,
    `    <p class="lede">${esc(p.sub)}</p>`,
    `    <a class="button" href="#start">${esc(p.cta)}</a>`,
    '  </div>',
    '  <div class="window card" aria-hidden="true">',
    '    <div class="dots"><i></i><i></i><i></i></div>',
    '    <div class="rows"><b></b><b></b><b></b><b></b><b></b><b></b></div>',
    '  </div>',
    '</section>',
    '<section class="features wrap">',
    ...p.features.flatMap((item) => [
      '  <div class="card">',
      `    <h3>${esc(item.title)}</h3>`,
      `    <p class="muted">${esc(item.text)}</p>`,
      '  </div>',
    ]),
    '</section>',
    '<section class="steps wrap">',
    '  <ol>',
    ...p.steps.map((step) => `    <li>${esc(step)}</li>`),
    '  </ol>',
    '</section>',
    '<section class="closing wrap">',
    `  <h2>${esc(p.closing)}</h2>`,
    `  <a class="button" href="#start">${esc(p.cta)}</a>`,
    '</section>',
  ]);
}

/** @param {import('./previews.config.js').PortfolioPage} p */
function portfolio(p) {
  const css = `
    .intro { padding-top: 72px; padding-bottom: 40px; }
    .intro h1 { font-size: 92px; line-height: 0.95; }
    .intro .role { font-family: var(--mono); font-size: 13px; letter-spacing: 0.22em; text-transform: uppercase; color: var(--accent); margin: 22px 0 14px; }
    .intro .lede { font-size: 22px; color: var(--muted); max-width: 28em; }
    .work { display: grid; grid-template-columns: repeat(2, 1fr); gap: 28px; }
    .work .title { font-family: var(--display); font-size: 28px; margin-top: 14px; }
    .about { display: grid; grid-template-columns: 0.4fr 0.6fr; gap: 40px; }
    .about h2 { font-size: 40px; }
    .about p { font-size: 20px; color: var(--muted); }
    .contact { text-align: center; padding-top: 88px; padding-bottom: 120px; }
    .contact h2 { font-size: 48px; margin-bottom: 26px; }
  `;
  return page(p.name, p.theme, css, [
    '<header class="top wrap">',
    `  <a class="brand" href="#">${esc(p.name)}</a>`,
    `  <nav>${p.nav.map((item) => `<a href="#">${esc(item)}</a>`).join('')}</nav>`,
    '</header>',
    '<section class="intro wrap">',
    `  <h1>${esc(p.name)}</h1>`,
    `  <p class="role">${esc(p.role)}</p>`,
    `  <p class="lede">${esc(p.intro)}</p>`,
    '</section>',
    '<section class="work wrap">',
    ...p.projects.flatMap((project) => [
      '  <a href="#">',
      ...indent(2, art(project.hue, project.title)),
      `    <p class="title">${esc(project.title)}</p>`,
      `    <p class="muted">${esc(project.kind)}</p>`,
      '  </a>',
    ]),
    '</section>',
    '<section class="about wrap">',
    '  <h2>About</h2>',
    `  <p>${esc(p.about)}</p>`,
    '</section>',
    '<section class="contact wrap">',
    `  <h2>${esc(p.contact)}</h2>`,
    '  <a class="button" href="#contact">Get in touch</a>',
    '</section>',
  ]);
}

/** @param {import('./previews.config.js').DashboardPage} p */
function dashboard(p) {
  const max = Math.max(...p.series);
  const points = p.series.map((v, i) => `${Math.round((i / (p.series.length - 1)) * 640)},${Math.round(200 - (v / max) * 170)}`).join(' ');
  const css = `
    body { font-size: 15px; }
    .shell { display: grid; grid-template-columns: 232px 1fr; min-height: 100vh; }
    .side { border-right: 1px solid var(--line); padding: 28px 20px; background: var(--card); }
    .side .brand { display: block; margin-bottom: 32px; }
    .side a { display: block; padding: 10px 12px; border-radius: 10px; color: var(--muted); margin-bottom: 4px; }
    .side a.on { background: var(--bg); color: var(--fg); font-weight: 600; }
    .main { padding: 32px 40px 80px; }
    .main h1 { font-size: 34px; margin-bottom: 26px; }
    .kpis { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin-bottom: 18px; }
    .kpis .card { padding: 20px; }
    .kpis .value { font-size: 30px; font-weight: 600; margin: 6px 0 4px; }
    .kpis .change { font-family: var(--mono); font-size: 12px; color: var(--accent); }
    .chart { padding: 24px; margin-bottom: 18px; }
    .chart svg { width: 100%; height: 230px; }
    table { width: 100%; border-collapse: collapse; }
    .table { padding: 8px 24px 16px; }
    th, td { text-align: left; padding: 14px 0; border-bottom: 1px solid var(--line); }
    th { font-size: 12px; text-transform: uppercase; letter-spacing: 0.12em; color: var(--muted); font-weight: 500; }
    .activity { padding: 24px; margin-top: 18px; }
    .activity li { list-style: none; display: flex; gap: 24px; padding: 14px 0; border-bottom: 1px solid var(--line); }
    .activity .when { width: 110px; font-family: var(--mono); font-size: 12px; color: var(--muted); padding-top: 2px; }
  `;
  return page(p.app, p.theme, css, [
    '<div class="shell">',
    '  <aside class="side">',
    `    <a class="brand" href="#">${esc(p.app)}</a>`,
    ...p.nav.map((item, i) => `    <a${i === 0 ? ' class="on"' : ''} href="#">${esc(item)}</a>`),
    '  </aside>',
    '  <main class="main">',
    `    <h1>Good morning, ${esc(p.user)}</h1>`,
    '    <div class="kpis">',
    ...p.kpis.flatMap((kpi) => [
      '      <div class="card">',
      `        <p class="muted">${esc(kpi.label)}</p>`,
      `        <p class="value">${esc(kpi.value)}</p>`,
      `        <p class="change">${esc(kpi.change)}</p>`,
      '      </div>',
    ]),
    '    </div>',
    '    <div class="chart card">',
    '      <p class="muted">Last 12 weeks</p>',
    '      <svg viewBox="0 0 640 210" preserveAspectRatio="none" role="img" aria-label="A rising line chart">',
    `        <polyline points="0,210 ${points} 640,210" fill="var(--accent)" fill-opacity="0.12" stroke="none"/>`,
    `        <polyline points="${points}" fill="none" stroke="var(--accent)" stroke-width="3" stroke-linejoin="round"/>`,
    '      </svg>',
    '    </div>',
    '    <div class="table card">',
    '      <table>',
    '        <tr><th>Name</th><th>Plan</th><th>Status</th><th>Last active</th></tr>',
    ...p.rows.map((row) => `        <tr>${row.map((cell) => `<td>${esc(cell)}</td>`).join('')}</tr>`),
    '      </table>',
    '    </div>',
    '    <div class="activity card">',
    '      <p class="muted">Recent activity</p>',
    '      <ul>',
    ...p.activity.map((item) => `        <li><span class="when">${esc(item.when)}</span><span>${esc(item.what)}</span></li>`),
    '      </ul>',
    '    </div>',
    '  </main>',
    '</div>',
  ]);
}

/** @param {import('./previews.config.js').FamilyPage} p */
function family(p) {
  const css = `
    .hero { text-align: center; padding-top: 40px; padding-bottom: 24px; }
    .hero h1 { font-size: 96px; line-height: 0.95; }
    .hero .lede { font-size: 22px; color: var(--muted); margin: 18px auto 36px; max-width: 26em; }
    .hero .art { max-width: 880px; margin: 0 auto; }
    .story h2, .gallery h2 { font-size: 44px; margin-bottom: 26px; }
    .entries { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .entries .card { padding: 26px; }
    .entries .date { font-family: var(--mono); font-size: 12px; letter-spacing: 0.18em; text-transform: uppercase; color: var(--accent); }
    .entries h3 { font-size: 28px; margin: 10px 0 8px; }
    .tiles { display: grid; grid-template-columns: repeat(3, 1fr); gap: 18px; }
    .tiles p { font-size: 14px; color: var(--muted); margin-top: 8px; }
    .note { text-align: center; padding: 40px; margin: 24px 0 96px; }
    .note h2 { font-size: 40px; margin-bottom: 10px; }
    .note p { font-size: 20px; color: var(--muted); }
  `;
  return page(p.title, p.theme, css, [
    '<header class="top wrap">',
    `  <a class="brand" href="#">${esc(p.title)}</a>`,
    `  <nav><a href="#">${esc(p.storyTitle)}</a><a href="#">${esc(p.galleryTitle)}</a><a href="#">${esc(p.noteTitle)}</a></nav>`,
    '</header>',
    '<section class="hero wrap">',
    `  <h1>${esc(p.title)}</h1>`,
    `  <p class="lede">${esc(p.tagline)}</p>`,
    ...indent(1, art(p.hue, `A drawn landscape for ${p.title}`)),
    '</section>',
    '<section class="story wrap">',
    `  <h2>${esc(p.storyTitle)}</h2>`,
    '  <div class="entries">',
    ...p.entries.flatMap((entry) => [
      '    <article class="card">',
      `      <p class="date">${esc(entry.date)}</p>`,
      `      <h3>${esc(entry.title)}</h3>`,
      `      <p class="muted">${esc(entry.text)}</p>`,
      '    </article>',
    ]),
    '  </div>',
    '</section>',
    '<section class="gallery wrap">',
    `  <h2>${esc(p.galleryTitle)}</h2>`,
    '  <div class="tiles">',
    ...p.gallery.flatMap((tile) => ['    <figure>', ...indent(3, art(tile.hue, tile.caption)), `      <p>${esc(tile.caption)}</p>`, '    </figure>']),
    '  </div>',
    '</section>',
    '<section class="wrap">',
    '  <div class="note card">',
    `    <h2>${esc(p.noteTitle)}</h2>`,
    `    <p>${esc(p.note)}</p>`,
    '  </div>',
    '</section>',
  ]);
}

/** @param {import('./previews.config.js').EventPage} p */
function event(p) {
  const css = `
    .hero { text-align: center; padding-top: 56px; padding-bottom: 32px; }
    .hero h1 { font-size: 104px; line-height: 0.95; margin: 20px 0; }
    .hero .when { font-size: 22px; color: var(--muted); margin-bottom: 30px; }
    .band .art { border-radius: 0; width: 100%; height: 300px; }
    .schedule h2, .details h2 { font-size: 44px; text-align: center; margin-bottom: 28px; }
    .schedule ul { list-style: none; max-width: 720px; margin: 0 auto; }
    .schedule li { display: flex; gap: 28px; padding: 18px 0; border-bottom: 1px solid var(--line); font-size: 20px; }
    .schedule .time { width: 150px; font-family: var(--mono); font-size: 14px; letter-spacing: 0.1em; text-transform: uppercase; color: var(--accent); padding-top: 4px; }
    .details .grid { display: grid; grid-template-columns: repeat(3, 1fr); gap: 20px; }
    .details .card { padding: 28px; }
    .details h3 { font-size: 28px; margin-bottom: 8px; }
    .rsvp { text-align: center; padding-top: 64px; padding-bottom: 120px; }
  `;
  return page(p.names, p.theme, css, [
    '<section class="hero wrap">',
    `  <p class="eyebrow">${esc(p.kicker)}</p>`,
    `  <h1>${esc(p.names)}</h1>`,
    `  <p class="when">${esc(p.date)} · ${esc(p.place)}</p>`,
    `  <a class="button" href="#rsvp">${esc(p.cta)}</a>`,
    '</section>',
    '<div class="band">',
    ...indent(1, art(p.hue, `A drawn landscape for ${p.place}`, true)),
    '</div>',
    '<section class="schedule wrap">',
    '  <h2>The plan</h2>',
    '  <ul>',
    ...p.schedule.map((item) => `    <li><span class="time">${esc(item.time)}</span><span>${esc(item.what)}</span></li>`),
    '  </ul>',
    '</section>',
    '<section class="details wrap">',
    '  <h2>Good to know</h2>',
    '  <div class="grid">',
    ...p.details.flatMap((item) => [
      '    <div class="card">',
      `      <h3>${esc(item.title)}</h3>`,
      `      <p class="muted">${esc(item.text)}</p>`,
      '    </div>',
    ]),
    '  </div>',
    '</section>',
    '<section class="rsvp wrap">',
    `  <a class="button" href="#rsvp">${esc(p.cta)}</a>`,
    '</section>',
  ]);
}

/** @param {PreviewPage} p */
export function render(p) {
  switch (p.layout) {
    case 'landing':
      return landing(p);
    case 'portfolio':
      return portfolio(p);
    case 'dashboard':
      return dashboard(p);
    case 'family':
      return family(p);
    case 'event':
      return event(p);
    default:
      throw new Error('Unknown layout');
  }
}

export function buildPreviews(outDir = 'tools/previews/src') {
  mkdirSync(outDir, { recursive: true });
  for (const [id, preview] of Object.entries(PREVIEWS)) {
    writeFileSync(`${outDir}/${id}.html`, render(preview));
    console.log(`${outDir}/${id}.html`);
  }
}

if (import.meta.url === new URL(process.argv[1], 'file:').href) buildPreviews();
