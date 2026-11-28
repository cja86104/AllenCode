// @ts-check
import { useEffect } from 'react';
import { homeTree } from './tree.js';
import { setCurrentFile } from './pathBarStore.js';

/** @typedef {import('./tree.js').PathBranch} PathBranch */
/** A file's stretch of the page, in document px: where the screen's middle line is while it is on screen. @typedef {{ id: string, top: number, bottom: number }} Probe */

/**
 * The file whose stretch holds line `y`; past a gap, the last one started; before them all, none.
 * @param {ReadonlyArray<Probe>} probes In page order.
 * @param {number} y
 * @returns {string | null}
 */
export function pickCurrent(probes, y) {
  let last = null;
  for (const probe of probes) {
    if (probe.top > y) break;
    if (y < probe.bottom) return probe.id;
    last = probe.id;
  }
  return last;
}

/**
 * The stretches of a pinned chapter's segments (door B's templates), as the screen's middle line meets them:
 * segment `i` is on screen while the section's scroll is between `i` and `i + 1` shares of its span, so its
 * stretch starts half a screen below that point; the first starts at the section's top, the last runs to its
 * bottom.
 * @param {number} sectionTop @param {number} sectionHeight @param {number} viewportH @param {ReadonlyArray<string>} ids
 * @returns {Probe[]}
 */
export function segmentProbes(sectionTop, sectionHeight, viewportH, ids) {
  const span = (sectionHeight - viewportH) / ids.length;
  const start = (/** @type {number} */ i) => (i === 0 ? sectionTop : sectionTop + viewportH / 2 + i * span);
  return ids.map((id, i) => ({ id, top: start(i), bottom: i === ids.length - 1 ? sectionTop + sectionHeight : start(i + 1) }));
}

/** @param {Element} el @returns {{ top: number, bottom: number }} */
function stretch(el) {
  const rect = el.getBoundingClientRect();
  return { top: rect.top + window.scrollY, bottom: rect.bottom + window.scrollY };
}

/**
 * Every file and one-file branch whose chapter is in the page, in page order, with the origin from the
 * page's top to the first of them. Door B's pinned template chapter draws one segment at a time, so its
 * templates come from the order it names.
 * @param {ReadonlyArray<PathBranch>} tree
 * @param {Document} [doc]
 * @returns {Probe[]}
 */
export function measureProbes(tree, doc = document) {
  /** @type {Probe[]} */
  const probes = [];
  const pinned = doc.querySelector('[data-template-order]');
  for (const branch of tree) {
    if (branch.id === '00_origin') continue;
    if (branch.target?.kind === 'home') {
      const el = doc.querySelector(branch.target.selector);
      if (el) probes.push({ id: branch.id, ...stretch(el) });
    }
    for (const file of branch.files) {
      if (file.target.kind !== 'home') continue;
      if (file.target.template && pinned) continue;
      const el = doc.querySelector(file.target.selector);
      if (el) probes.push({ id: file.id, ...stretch(el) });
    }
    if (branch.id === '03_templates' && pinned) {
      const { top, bottom } = stretch(pinned);
      const order = (pinned.getAttribute('data-template-order') ?? '').split(' ').filter(Boolean);
      probes.push(...segmentProbes(top, bottom - top, window.innerHeight, order.map((id) => `03_templates/${id}`)));
    }
  }
  probes.sort((a, b) => a.top - b.top);
  probes.unshift({ id: '00_origin', top: 0, bottom: probes[0]?.top ?? Number.POSITIVE_INFINITY });
  return probes;
}

/**
 * The home page tells the path bar which file the visitor is at (Living Source Phase 3): measured once a
 * frame on scroll and resize, at the screen's middle line, and handed over only when it changes. Lives in
 * the home page's chunk; the bar reads it through `pathBarStore.js`.
 * @param {boolean} enabled Off with the world on (the bar is not shown).
 * @param {unknown} layout Anything whose change re-lays the page out (the door), to measure again.
 */
export function useTrackCurrentFile(enabled, layout) {
  useEffect(() => {
    if (!enabled) return undefined;
    const tree = homeTree();
    let frame = 0;
    const measure = () => {
      frame = 0;
      setCurrentFile(pickCurrent(measureProbes(tree), window.scrollY + window.innerHeight / 2));
    };
    const schedule = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener('scroll', schedule, { passive: true });
    window.addEventListener('resize', schedule);
    return () => {
      cancelAnimationFrame(frame);
      window.removeEventListener('scroll', schedule);
      window.removeEventListener('resize', schedule);
      setCurrentFile(null);
    };
  }, [enabled, layout]);
}
