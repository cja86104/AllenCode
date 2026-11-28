// @ts-check
import { useEffect } from 'react';
import { Link } from 'react-router-dom';
import { homeTree, pageFiles } from './tree.js';

/** @typedef {import('./tree.js').PathSegment} PathSegment */
/** @typedef {import('./tree.js').PathBranch} PathBranch */
/** @typedef {import('./tree.js').PathFile} PathFile */
/** @typedef {(id: string, page: boolean) => void} OnChoose */

/**
 * A row of a path menu: a home file or branch to go to (a button), or a page (a link), with the label the
 * bar shows over the name it stands for.
 * @typedef {{ id: string, label: string, title: string, to?: string, current: boolean }} PathRow
 */

/** What a panel's rows are: its links and buttons, in order. */
const ROWS = '[data-path-row]';

/**
 * While a panel is open: Escape closes it (focus back on its button), a press outside the button and the
 * panel closes it, and so does focus leaving both; ArrowDown and ArrowUp move between its rows (from the
 * button into the first or the last), Home and End to the ends.
 * @param {{ close: (returnFocus?: boolean) => void, buttonRef: import('react').MutableRefObject<HTMLButtonElement | null>,
 *   panelRef: import('react').MutableRefObject<HTMLDivElement | null> }} disclosure
 */
function usePanelKeys({ close, buttonRef, panelRef }) {
  useEffect(() => {
    /** @param {EventTarget | null} target */
    const inside = (target) => target instanceof Node && Boolean(buttonRef.current?.contains(target) || panelRef.current?.contains(target));
    /** @param {PointerEvent} event */
    const onPointerDown = (event) => {
      if (!inside(event.target)) close();
    };
    /** @param {FocusEvent} event */
    const onFocusIn = (event) => {
      if (!inside(event.target)) close();
    };
    /** @param {KeyboardEvent} event */
    const onKeyDown = (event) => {
      if (event.key === 'Escape') {
        close(true);
        return;
      }
      if (!['ArrowDown', 'ArrowUp', 'Home', 'End'].includes(event.key)) return;
      const rows = /** @type {HTMLElement[]} */ ([...(panelRef.current?.querySelectorAll(ROWS) ?? [])]);
      if (rows.length === 0 || !inside(document.activeElement)) return;
      event.preventDefault();
      const at = rows.indexOf(/** @type {HTMLElement} */ (document.activeElement));
      const last = rows.length - 1;
      const next =
        event.key === 'Home' ? 0 : event.key === 'End' ? last : event.key === 'ArrowDown' ? (at < 0 ? 0 : Math.min(last, at + 1)) : at < 0 ? last : Math.max(0, at - 1);
      rows[next].focus();
    };
    document.addEventListener('pointerdown', onPointerDown);
    document.addEventListener('focusin', onFocusIn);
    document.addEventListener('keydown', onKeyDown);
    return () => {
      document.removeEventListener('pointerdown', onPointerDown);
      document.removeEventListener('focusin', onFocusIn);
      document.removeEventListener('keydown', onKeyDown);
    };
  }, [close, buttonRef, panelRef]);

}

/**
 * The home branches as rows: a branch with files goes to its first file, a one-file branch to itself.
 * @param {string | null} hereBranch
 * @returns {PathRow[]}
 */
function branchRows(hereBranch) {
  return homeTree().map((b) => ({ id: b.target ? b.id : b.files[0].id, label: b.id, title: b.title, current: b.id === hereBranch }));
}

/** @param {PathBranch} branch @param {string | null} here @returns {PathRow[]} */
const fileRows = (branch, here) => branch.files.map((f) => ({ id: f.id, label: f.label, title: f.title, current: f.id === here }));

/** @param {ReadonlyArray<PathFile>} files @param {string | null} here @returns {PathRow[]} */
const pageRows = (files, here) =>
  files.map((f) => ({ id: f.id, label: f.label, title: f.title, to: f.target.kind === 'page' ? f.target.path : '/', current: f.id === here }));

/**
 * A segment's siblings: the branches (for a branch, and for `pages`, which goes home), the branch's files,
 * or the pages beside this one.
 * @param {PathSegment} segment @param {string | null} here @param {string | null} hereBranch
 * @returns {PathRow[]}
 */
function rowsFor(segment, here, hereBranch) {
  if (segment.kind === 'files') return fileRows(segment.branch, here);
  if (segment.kind === 'page') return pageRows(segment.siblings, here);
  return branchRows(segment.kind === 'branches' ? hereBranch : null);
}

/** A row: a 44 px target, the label over its name, the current one in orange. */
const ROW =
  'flex min-h-11 w-full flex-col justify-center rounded-md px-3 py-1.5 text-left transition-colors hover:bg-white/5 focus-visible:bg-white/5 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-[-2px] focus-visible:outline-ember';

/**
 * One row's contents and its control.
 * @param {{ row: PathRow, onChoose: OnChoose }} props
 */
function Row({ row, onChoose }) {
  const current = row.current ? { 'aria-current': /** @type {const} */ ('location') } : {};
  const body = (
    <>
      <span className={`mono text-[12px] ${row.current ? 'text-ember' : 'text-white'}`}>{row.label}</span>
      <span className="text-[12px] text-white/55">{row.title}</span>
    </>
  );
  if (row.to) {
    return (
      <Link to={row.to} viewTransition data-path-row {...current} onClick={() => onChoose(row.id, true)} className={ROW}>
        {body}
      </Link>
    );
  }
  return (
    <button type="button" data-path-row {...current} onClick={() => onChoose(row.id, false)} className={ROW}>
      {body}
    </button>
  );
}

/** The panels' rise in: opacity and 4 px over 500 ms on the one ease; none with reduced motion. */
const RISE = 'motion-safe:animate-[path-in_500ms_cubic-bezier(.16,1,.3,1)]';

/**
 * A segment's menu (Living Source Phase 3): its siblings, under the segment. Loaded on the first press,
 * so the bar adds little to every page's script.
 * @param {{ id: string, segment: PathSegment, here: string | null, hereBranch: string | null, onChoose: OnChoose,
 *   close: (returnFocus?: boolean) => void, buttonRef: import('react').MutableRefObject<HTMLButtonElement | null>,
 *   panelRef: import('react').MutableRefObject<HTMLDivElement | null> }} props
 */
export default function PathMenu({ id, segment, here, hereBranch, onChoose, close, buttonRef, panelRef }) {
  usePanelKeys({ close, buttonRef, panelRef });
  const rows = rowsFor(segment, here, hereBranch);
  return (
    <div
      ref={panelRef}
      id={id}
      // The smooth scroll (Lenis) leaves a wheel over the panel to the panel itself.
      data-lenis-prevent
      className={`absolute left-0 top-full z-50 mt-1 max-h-[60vh] w-72 overflow-y-auto rounded-xl border border-white/10 bg-[#0a0a0a] p-1.5 shadow-2xl ${RISE}`}
    >
      <ul>
        {rows.map((row) => (
          <li key={row.id}>
            <Row row={row} onChoose={onChoose} />
          </li>
        ))}
      </ul>
    </div>
  );
}

/**
 * The phone's sheet (Living Source Phase 3): the whole tree under the header, every branch with its files,
 * then the pages.
 * A one-file branch is a row itself; a branch with files names itself over its files' rows.
 * @param {{ id: string, here: string | null, onChoose: OnChoose, close: (returnFocus?: boolean) => void,
 *   buttonRef: import('react').MutableRefObject<HTMLButtonElement | null>, panelRef: import('react').MutableRefObject<HTMLDivElement | null> }} props
 */
export function PathSheet({ id, here, onChoose, close, buttonRef, panelRef }) {
  usePanelKeys({ close, buttonRef, panelRef });
  const pages = pageRows(pageFiles(), here);
  const branches = homeTree().map((b) => ({
    row: b.target ? { id: b.id, label: b.id, title: b.title, current: b.id === here } : null,
    label: b.id,
    title: b.title,
    rows: fileRows(b, here),
  }));
  return (
    <div
      ref={panelRef}
      id={id}
      data-path-sheet
      data-lenis-prevent
      className={`absolute inset-x-0 top-full z-50 max-h-[70vh] overflow-y-auto border-y border-white/10 bg-[#0a0a0a] px-4 py-3 ${RISE}`}
    >
      <ol>
        {branches.map((branch) => (
          <li key={branch.label} data-path-sheet-branch className="border-b border-white/5 py-1 last:border-b-0">
            {branch.row ? (
              <Row row={branch.row} onChoose={onChoose} />
            ) : (
              <>
                <p className="mono px-3 pt-2 text-[11px] text-white/60">
                  {branch.label} <span className="text-white/55">· {branch.title}</span>
                </p>
                <ul className="pl-3">
                  {branch.rows.map((row) => (
                    <li key={row.id}>
                      <Row row={row} onChoose={onChoose} />
                    </li>
                  ))}
                </ul>
              </>
            )}
          </li>
        ))}
      </ol>
      <p className="mono mt-3 px-3 text-[11px] text-white/60">pages</p>
      <ul className="pl-3">
        {pages.map((row) => (
          <li key={row.id}>
            <Row row={row} onChoose={onChoose} />
          </li>
        ))}
      </ul>
    </div>
  );
}
