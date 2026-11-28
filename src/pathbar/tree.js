// @ts-check
import { services } from '../data/services.js';
import { products } from '../data/products.js';
import { DOOR_B_TEMPLATES, SERVICE_CHAPTERS } from '../data/homeOrder.js';

/** @typedef {import('../door/doorStorage.js').Door} Door */

/**
 * Where a file goes: a section of the home page (found by its selector; a template also names its segment),
 * or a page, optionally a section of it.
 * @typedef {{ kind: 'home', selector: string, template?: string } | { kind: 'page', path: string, selector?: string }} PathTarget
 */

/**
 * A file on the path: its id (`<branch>/<label>`), the label the bar shows (a slug), the name the menus show
 * under it, where it goes, and where it goes instead when its home chapter did not render.
 * @typedef {{ id: string, label: string, title: string, target: PathTarget, fallback: PathTarget | null }} PathFile
 */

/**
 * A branch of the home page: its id (`01_services`), the door it belongs to (null where both doors share it),
 * its files, and, for a branch that is one file (the gate, how I work, the builder, your idea, the brief),
 * where it goes itself.
 * @typedef {{ id: string, door: Door | null, title: string, files: PathFile[], target: PathTarget | null }} PathBranch
 */

/**
 * One segment of the path, left to right: `allencode`, then on the home page the branch and (when it has
 * files) the file; on an inner page `pages`, a link (product detail's `products`) and the page.
 * @typedef {{ kind: 'root' }
 *   | { kind: 'branches', branch: PathBranch }
 *   | { kind: 'files', branch: PathBranch, file: PathFile }
 *   | { kind: 'pages' }
 *   | { kind: 'link', label: string, to: string }
 *   | { kind: 'page', file: PathFile, siblings: PathFile[] }} PathSegment
 */

/** @param {string} selector @returns {PathTarget} */
const home = (selector) => ({ kind: 'home', selector });
/** @param {string} path @param {string} [selector] @returns {PathTarget} */
const page = (path, selector) => (selector ? { kind: 'page', path, selector } : { kind: 'page', path });
/** @param {string} branch @param {string} label @param {string} title @param {PathTarget} target @param {PathTarget | null} fallback @returns {PathFile} */
const file = (branch, label, title, target, fallback) => Object.freeze({ id: `${branch}/${label}`, label, title, target, fallback });

/**
 * The services: those with a home chapter in their home order, then the rest in the data's order, which
 * open their panel on /services. A home chapter that did not render (an excerpt not yet approved) falls
 * back to the same panel.
 * @returns {PathFile[]}
 */
function serviceFiles() {
  const chaptered = SERVICE_CHAPTERS.map(({ slug }) => services.find((s) => s.slug === slug)).filter((s) => s !== undefined);
  const rest = services.filter((s) => !SERVICE_CHAPTERS.some((c) => c.slug === s.slug));
  return [
    ...chaptered.map((s) => file('01_services', s.slug, s.name, home(`[data-chapter="${s.slug}"]`), page('/services', `[data-service="${s.slug}"]`))),
    ...rest.map((s) => file('01_services', s.slug, s.name, page('/services', `[data-service="${s.slug}"]`), null)),
  ];
}

/** Door B's files: Hearth (its intro), each template in door B's order, then Done for you. @returns {PathFile[]} */
function templateFiles() {
  const fallback = page('/templates');
  return [
    file('03_templates', 'hearth', 'Hearth', home('[data-door-b-intro]'), fallback),
    ...DOOR_B_TEMPLATES.map((t) =>
      file('03_templates', t.id, t.name, { kind: 'home', selector: `[data-door-b-template="${t.id}"]`, template: t.id }, fallback),
    ),
    file('03_templates', 'done-for-you', 'Done for you', home('[data-chapter="done-for-you"]'), fallback),
  ];
}

/** @param {string} id @param {Door | null} door @param {string} title @param {PathFile[]} files @param {PathTarget | null} target @returns {PathBranch} */
const branch = (id, door, title, files, target) => Object.freeze({ id, door, title, files, target });

/** The home page's branches, in the order the business road and the home share (spec section F). */
const HOME_TREE = Object.freeze([
  branch('00_origin', null, 'The gate', [], home('[data-chapter="gate"]')),
  branch('01_services', 'a', 'Services', serviceFiles(), null),
  branch(
    '02_our-work',
    'a',
    'Our work',
    products.map((p) => file('02_our-work', p.slug, p.name, home(`[data-product="${p.slug}"]`), page(`/products/${p.slug}`))),
    null,
  ),
  branch('03_templates', 'b', 'Templates', templateFiles(), null),
  branch('04_how-i-work', 'a', 'How I work', [], home('[data-chapter="how-i-work"]')),
  branch('05_who-builds-it', null, 'Who builds it', [], home('[data-chapter="builder"]')),
  branch('06_your-idea', null, 'Your idea', [], home('[data-chapter="idea"]')),
  branch('07_start', null, 'Start a project', [], home('[data-chapter="brief"]')),
]);

/** The inner pages the nav links to, as files under `pages`. */
const PAGE_FILES = Object.freeze(
  /** @type {const} */ ([
    ['services', 'Services'],
    ['products', 'Products'],
    ['templates', 'Templates'],
    ['about', 'About'],
    ['contact', 'Contact'],
  ]).map(([label, title]) => file('pages', label, title, page(`/${label}`), null)),
);

/** Each product's own page, as files under `products`. */
const PRODUCT_FILES = Object.freeze(products.map((p) => file('products', p.slug, p.name, page(`/products/${p.slug}`), null)));

/** @returns {PathBranch[]} */
export function homeTree() {
  return /** @type {PathBranch[]} */ (HOME_TREE);
}

/** @returns {PathFile[]} */
export function pageFiles() {
  return /** @type {PathFile[]} */ (PAGE_FILES);
}

/** @returns {PathFile[]} */
export function productFiles() {
  return /** @type {PathFile[]} */ (PRODUCT_FILES);
}

/**
 * A file or one-file branch by its id: a home file with its branch, a one-file branch with no file, a page
 * or product page with no branch.
 * @param {string} id
 * @returns {{ branch: PathBranch | null, file: PathFile | null } | null}
 */
export function findFile(id) {
  for (const b of HOME_TREE) {
    if (b.id === id) return { branch: b, file: null };
    const f = b.files.find((candidate) => candidate.id === id);
    if (f) return { branch: b, file: f };
  }
  const f = [...PAGE_FILES, ...PRODUCT_FILES].find((candidate) => candidate.id === id);
  return f ? { branch: null, file: f } : null;
}

/**
 * The home page's path for the current file: the origin when there is none (before a door, at the top).
 * @param {string | null} currentId
 * @returns {PathSegment[]}
 */
export function homeSegments(currentId) {
  const found = currentId ? findFile(currentId) : null;
  const b = found?.branch ?? HOME_TREE[0];
  if (found?.branch && found.file) return [{ kind: 'root' }, { kind: 'branches', branch: b }, { kind: 'files', branch: b, file: found.file }];
  return [{ kind: 'root' }, { kind: 'branches', branch: b }];
}

/** Pages that are not in the nav but have an address of their own. */
const OTHER_PAGES = Object.freeze({
  '/checkout-success': file('pages', 'checkout-success', 'Checkout', page('/checkout-success'), null),
});

/**
 * An inner page's path: the page as a file under `pages`; a product's own page under `pages / products`;
 * any address the site does not have, `not-found`.
 * @param {string} pathname
 * @returns {PathSegment[]}
 */
export function pageSegments(pathname) {
  const path = pathname.replace(/\/+$/, '') || '/';
  if (path === '/') return homeSegments(null);
  const pages = pageFiles();
  const known = pages.find((f) => f.target.kind === 'page' && f.target.path === path);
  if (known) return [{ kind: 'root' }, { kind: 'pages' }, { kind: 'page', file: known, siblings: pages }];
  const product = PRODUCT_FILES.find((f) => f.target.kind === 'page' && f.target.path === path);
  if (product) {
    return [{ kind: 'root' }, { kind: 'pages' }, { kind: 'link', label: 'products', to: '/products' }, { kind: 'page', file: product, siblings: productFiles() }];
  }
  const other = Object.hasOwn(OTHER_PAGES, path) ? OTHER_PAGES[/** @type {keyof typeof OTHER_PAGES} */ (path)] : null;
  const shown = other ?? file('pages', 'not-found', 'Not found', page(path), null);
  return [{ kind: 'root' }, { kind: 'pages' }, { kind: 'page', file: shown, siblings: pages }];
}
