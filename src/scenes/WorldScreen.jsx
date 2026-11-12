// @ts-check
import { useEffect, useLayoutEffect, useRef, useState } from 'react';
import { Link } from 'react-router-dom';
import MediaLoop from '../components/MediaLoop.jsx';
import { products } from '../data/products.js';
import { serviceScreens } from '../data/serviceScreens.js';
import { getExcerpt } from '../content/excerpts/index.js';
import { worldFrame } from '../world/worldFrame.js';
import { loopOf } from './ProductChapter.jsx';
import { AuditPanel } from './ServiceChapters.jsx';

/** @typedef {import('../world/roads.js').RoadStop} RoadStop */
/** @typedef {import('../world/worldFrame.js').WorldFrame} WorldFrame */

/** The audit panel's room around its code, in CSS pixels: its padding, check column and gap. */
const AUDIT_CHROME = 2 * 16 + 12 + 12;
/** A monospace character's width, as a share of the font size. */
const MONO_ADVANCE = 0.6;

/**
 * Places the screen over the landmark: its box from the canvas, at the hand-over's opacity, and for
 * the audit a font size that fits its file to that width.
 * @param {HTMLElement} el
 * @param {NonNullable<WorldFrame['handover']>} handover
 * @param {number} longest The audit file's longest line, in characters.
 */
function place(el, handover, longest) {
  const { left, top, width, height } = handover.rect;
  el.style.left = `${left}px`;
  el.style.top = `${top}px`;
  el.style.width = `${width}px`;
  el.style.height = `${height}px`;
  el.style.opacity = String(handover.amount);
  el.style.setProperty('--audit-font', `${Math.max(4, (width - AUDIT_CHROME) / (longest * MONO_ADVANCE))}px`);
}

/**
 * The real thing a landmark resolves into (Code World W2.5), laid exactly over its sculpture as the
 * camera rests there: a product's loop (playing once it has fully resolved, and linking to the
 * product's page), a service's screen, or the audit's file with every line checked. One at a time;
 * nothing while no landmark hands over, so nothing hidden can take focus. Placed each frame from
 * the canvas's `worldFrame` by writing its style, without a React render per frame.
 * @param {{ stops: ReadonlyArray<RoadStop> }} props The road's stops.
 */
export default function WorldScreen({ stops }) {
  const ref = useRef(/** @type {HTMLDivElement | null} */ (null));
  const [current, setCurrent] = useState(/** @type {string | null} */ (null));
  const [arrived, setArrived] = useState(false);
  const audit = getExcerpt('service-audit');
  const longest = audit ? Math.max(1, ...audit.code.split('\n').map((line) => line.length)) : 1;

  useEffect(() => {
    const follow = (/** @type {WorldFrame | null} */ frame) => {
      const handover = frame?.handover ?? null;
      const shown = handover && handover.rect.visible ? handover : null;
      setCurrent(shown ? shown.stopId : null);
      setArrived(Boolean(shown && shown.amount >= 1));
      if (shown && ref.current) place(ref.current, shown, longest);
    };
    follow(worldFrame.latest());
    return worldFrame.subscribe(follow);
  }, [longest]);

  // A screen that has just appeared takes its place before it is painted.
  useLayoutEffect(() => {
    const handover = worldFrame.latest()?.handover;
    if (current && ref.current && handover && handover.stopId === current) place(ref.current, handover, longest);
  }, [current, longest]);

  const stop = current ? stops.find((s) => s.id === current) : undefined;
  if (!stop) return null;

  /** @type {import('react').ReactNode} */
  let content = null;
  if (stop.kind === 'product') {
    const product = products.find((p) => p.slug === stop.id);
    const loop = product ? loopOf(product) : null;
    if (product && loop) {
      content = (
        <Link
          to={`/products/${product.slug}`}
          aria-label={`${product.name}: see the product`}
          className="block h-full w-full rounded-lg outline-none ring-ember transition-shadow hover:ring-2 focus-visible:ring-2"
        >
          <MediaLoop {...loop} active={arrived} className="h-full w-full rounded-lg shadow-2xl" />
        </Link>
      );
    }
  } else if (stop.kind === 'service') {
    const screen = serviceScreens[/** @type {keyof typeof serviceScreens} */ (stop.id)];
    if (screen) content = <img src={screen.src} alt={screen.alt} className="h-full w-full rounded-lg object-cover shadow-2xl" />;
  } else if (stop.kind === 'audit' && audit) {
    content = <AuditPanel excerpt={audit} checked={audit.code.split('\n').length} fontSize="var(--audit-font)" />;
  }
  if (!content) return null;

  return (
    // Keyed by stop: each landmark's real thing is its own element, so a new loop starts fresh
    // (reused, a loop kept the last one's state and never played its new source).
    <div key={stop.id} ref={ref} data-world-screen={stop.id} style={{ opacity: 0 }} className="fixed z-10">
      {content}
    </div>
  );
}
