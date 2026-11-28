// @ts-check
import { Fragment, Suspense, lazy, useEffect } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { useWorldPage } from '../world/worldSwitch.js';
import { useDoor } from '../door/DoorProvider.jsx';
import { usePrefersReducedMotion } from '../field/environment.js';
import { homeSegments, pageSegments } from './tree.js';
import { setPathBarShown, useCurrentFile } from './pathBarStore.js';
import { useDisclosure } from './useDisclosure.js';

/** @typedef {import('./tree.js').PathSegment} PathSegment */
/** @typedef {(id: string) => void} OnGo */

// The menus and the phone's sheet load on the first press (their own chunk), so the bar adds little to
// every page's script (the entry's budget, `tools/budget/check.mjs`).
const PathMenu = lazy(() => import('./PathMenu.jsx'));
const PathSheet = lazy(() => import('./PathMenu.jsx').then((module) => ({ default: module.PathSheet })));

/**
 * Going to a home file chosen from a menu: `go.js`, loaded on the first choice (the entry's budget), with
 * what it needs from the page now.
 * @returns {OnGo}
 */
function useGo() {
  const navigate = useNavigate();
  const { pathname } = useLocation();
  const { door, setDoor } = useDoor();
  const reducedMotion = usePrefersReducedMotion();
  return (id) => {
    void import('./go.js').then(({ goTo }) => goTo(id, { pathname, navigate, door, setDoor, reducedMotion }));
  };
}

/**
 * Where the visitor is: the id of the path's last segment, and the home branch it is in.
 * @param {PathSegment[]} segments
 */
function hereOf(segments) {
  const last = segments[segments.length - 1];
  if (last.kind === 'files') return { here: last.file.id, branch: last.branch.id };
  if (last.kind === 'branches') return { here: last.branch.id, branch: last.branch.id };
  if (last.kind === 'page') return { here: last.file.id, branch: null };
  return { here: null, branch: null };
}

/**
 * A segment: a 44 px target around a small label; the current one's label is the orange chip (the spec's
 * rule 3 of C).
 */
const SEGMENT = 'mono group inline-flex h-11 items-center px-0.5 text-[12px] tracking-wide focus-visible:outline-none';
const LABEL = 'rounded-full border px-2.5 py-1 transition-colors group-focus-visible:outline group-focus-visible:outline-2 group-focus-visible:outline-offset-2 group-focus-visible:outline-ember';
const QUIET = 'border-transparent text-white/60 group-hover:text-white';
const CURRENT = 'border-ember/60 text-ember';

/**
 * The path for this page, or null with the world on (the world keeps its own rail; the two never show
 * together). The home page's path follows the current file, as the home page tells it (`current.js`) unless
 * one is given; an inner page's is the page.
 * @param {string | null | undefined} currentId
 * @returns {PathSegment[] | null}
 */
function usePathSegments(currentId) {
  const world = useWorldPage();
  const { pathname } = useLocation();
  const tracked = useCurrentFile();
  if (world !== null) return null;
  return pathname === '/' ? homeSegments(currentId ?? tracked) : pageSegments(pathname);
}

/**
 * A segment: `allencode` and a product page's `products` are links; every other segment is a disclosure
 * opening its siblings (the branches, the branch's files, or the pages). The last is where the visitor is.
 * @param {{ segment: PathSegment, last: boolean, here: string | null, hereBranch: string | null, onGo: OnGo }} props
 */
function Segment({ segment, last, here, hereBranch, onGo }) {
  const { open, toggle, close, id, buttonRef, panelRef } = useDisclosure();
  if (segment.kind === 'root' || segment.kind === 'link') {
    return (
      <Link to={segment.kind === 'root' ? '/' : segment.to} viewTransition className={SEGMENT}>
        <span className={`${LABEL} ${QUIET}`}>{segment.kind === 'root' ? 'allencode' : segment.label}</span>
      </Link>
    );
  }
  const current = last ? { 'aria-current': /** @type {const} */ ('location') } : {};
  const label =
    segment.kind === 'branches' ? segment.branch.id : segment.kind === 'files' || segment.kind === 'page' ? segment.file.label : 'pages';
  /** A page is a link and goes itself; a home file goes through `onGo`. @param {string} chosen @param {boolean} page */
  const choose = (chosen, page) => {
    close();
    if (!page) onGo(chosen);
  };
  return (
    <>
      <button ref={buttonRef} type="button" aria-expanded={open} aria-controls={id} {...current} onClick={toggle} className={SEGMENT}>
        <span className={`${LABEL} ${last ? CURRENT : QUIET}`}>{label}</span>
      </button>
      {open && (
        <Suspense fallback={null}>
          <PathMenu id={id} segment={segment} here={here} hereBranch={hereBranch} onChoose={choose} close={close} buttonRef={buttonRef} panelRef={panelRef} />
        </Suspense>
      )}
    </>
  );
}

/**
 * The path bar (Living Source Phase 3, the Project Explorer in C): a second row under the nav, from 768 px,
 * on every page while the world is off. `allencode / 02_our-work / underfire-ai`: where the visitor is, the
 * current file in an orange chip. It is in the prebuilt HTML; where the world is likely to run, the page
 * is marked before it paints (`html[data-likely-world]`) and the bar stays hidden until the world arrives
 * and it unmounts. Heard once: the path has no live region.
 * @param {{ currentId?: string | null, onGo?: OnGo }} props `currentId` is the home page's current file; `onGo`
 *   goes to a home file chosen from a menu.
 */
export default function PathBar({ currentId, onGo }) {
  const segments = usePathSegments(currentId);
  const go = useGo();
  const shown = segments !== null;
  useEffect(() => {
    setPathBarShown(shown);
    return () => setPathBarShown(false);
  }, [shown]);
  if (!segments) return null;
  const { here, branch } = hereOf(segments);
  return (
    <div data-path-bar className="hidden border-t border-white/10 md:block">
      <nav aria-label="Where you are" className="mx-auto max-w-7xl px-4 lg:px-8">
        <ol className="flex h-11 items-center">
          {segments.map((segment, i) => (
            <Fragment key={`${segment.kind}-${i}`}>
              {i > 0 && (
                <li aria-hidden="true" className="mono px-0.5 text-[12px] text-white/30">
                  /
                </li>
              )}
              <li className="relative">
                <Segment segment={segment} last={i === segments.length - 1} here={here} hereBranch={branch} onGo={onGo ?? go} />
              </li>
            </Fragment>
          ))}
        </ol>
      </nav>
    </div>
  );
}

/**
 * The chip's words, its parent and its file: the branch number and the file (`02 / underfire-ai`), a
 * one-file branch by its name (`05 / who-builds-it`), an inner page under its parent (`pages / about`).
 * @param {PathSegment[]} segments
 * @returns {{ parent: string, file: string }}
 */
export function chipParts(segments) {
  const last = segments[segments.length - 1];
  const before = segments[segments.length - 2];
  if (last.kind === 'files') return { parent: last.branch.id.slice(0, 2), file: last.file.label };
  if (last.kind === 'branches') return { parent: last.branch.id.slice(0, 2), file: last.branch.id.slice(3) };
  if (last.kind === 'page') return { parent: before?.kind === 'link' ? before.label : 'pages', file: last.file.label };
  return { parent: '', file: 'allencode' };
}

/**
 * The path on a phone (below 768 px): one chip in the header row, opening the whole tree as a sheet.
 * @param {{ currentId?: string | null, onGo?: OnGo }} props
 */
export function PathChip({ currentId, onGo }) {
  const segments = usePathSegments(currentId);
  const go = useGo();
  const { open, toggle, close, id, buttonRef, panelRef } = useDisclosure();
  if (!segments) return null;
  const { parent, file } = chipParts(segments);
  const { here } = hereOf(segments);
  /** @param {string} chosen @param {boolean} page */
  const choose = (chosen, page) => {
    close();
    if (!page) (onGo ?? go)(chosen);
  };
  return (
    <nav aria-label="Where you are" className="min-w-0 md:hidden">
      <button
        ref={buttonRef}
        type="button"
        data-path-chip
        aria-expanded={open}
        aria-controls={id}
        aria-current="location"
        onClick={toggle}
        className="mono relative flex max-w-full items-center gap-0.5 rounded-full border border-ember/60 px-2.5 py-2 text-[11px] text-ember after:absolute after:inset-x-0 after:-inset-y-1 after:content-[''] focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember"
      >
        {/* Short of room the parent gives way first, and below 400 px only screen readers hear it; the file's name stays whole. */}
        {parent && (
          <span data-chip-parent className="sr-only min-w-0 shrink-[100] truncate text-ember/70 min-[400px]:not-sr-only">
            {parent} /
          </span>
        )}{' '}
        <span data-chip-file className="min-w-0 truncate">
          {file}
        </span>
        <span aria-hidden="true">▾</span>
      </button>
      {open && (
        <Suspense fallback={null}>
          <PathSheet id={id} here={here} onChoose={choose} close={close} buttonRef={buttonRef} panelRef={panelRef} />
        </Suspense>
      )}
    </nav>
  );
}
