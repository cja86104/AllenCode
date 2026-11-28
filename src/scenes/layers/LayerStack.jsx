// @ts-check
import { useMemo } from 'react';
import CodeLines from '../../field/CodeLines.jsx';
import MediaLoop from '../../components/MediaLoop.jsx';
import { CODE_FONT_SIZE, CODE_LINE_HEIGHT } from '../../field/editorMetrics.js';
import { layerTimeline } from './layerTimeline.js';
import { glyphPlan } from './glyphPlan.js';

/** @typedef {import('../../content/excerpts/index.js').Excerpt} Excerpt */
/** @typedef {import('./layerTimeline.js').StepId} StepId */
/** @typedef {{ src: string, alt: string, width: number, height: number, video?: string }} Screen */

/** A line's height for its font size, as the editor sets code. */
const LINE_RATIO = CODE_LINE_HEIGHT / CODE_FONT_SIZE;
/** The width below which the stack takes its phone form (rule 7 of C: about 320 px). */
const PHONE_BELOW = 500;
/** How far apart the planes sit, in px: while pulled apart, and the source alone on the Source step (rule 1). */
const DEPTH = Object.freeze({ desktop: { source: 260, flight: 130, lifted: 140 }, phone: { source: 150, flight: 75, lifted: 80 } });
/** The one ease, for the flat form's switches (rule 4); scroll drives the motion form itself. */
const EASE = 'cubic-bezier(.16, 1, .3, 1)';

/**
 * Where everything sits: from the scroll (the motion form) or, flat, from the chosen step.
 * @param {number} progress @param {boolean} flat @param {StepId} view
 */
function pose(progress, flat, view) {
  if (!flat) {
    const t = layerTimeline(progress);
    return { ...t, glyphT: t.travel };
  }
  return {
    step: view,
    tilt: 0,
    apart: 0,
    codeOpacity: view === 'source' ? 1 : 0,
    glyphOpacity: view === 'transformation' ? 1 : 0,
    screenOpacity: view === 'result' ? 1 : 0.35,
    landed: view === 'result',
    glyphT: 1,
  };
}

/** @param {number} n */
const px = (n) => `${Number(n.toFixed(2))}px`;

/**
 * C's signature (Living Source Phase 4, rule 1): a chapter's transformation as stacked planes in CSS 3D, never
 * WebGL. On top the real source, verbatim; in the middle its own characters in flight (Chris, 2026-11-28:
 * "Characters travel in the stack"); at the bottom the real result. Scroll pulls the stack apart and it settles
 * flat and face-on when the result lands, so the finished screen is read straight. `flat` (reduced motion, no
 * renderer) shows it flat and face-on, the plane of the chosen step, with no movement but the switch.
 * The code and the characters are hidden from assistive technology; the chapter's words describe them, and the
 * screen keeps its text alternative.
 * @param {{ excerpt: Excerpt, screen: Screen, progress: number, flat: boolean, view: StepId, width: number }} props
 */
export default function LayerStack({ excerpt, screen, progress, flat, view, width }) {
  const phone = width < PHONE_BELOW;
  const depth = phone ? DEPTH.phone : DEPTH.desktop;
  const height = width / (screen.width / screen.height);
  const pad = phone ? 12 : 24;
  const lines = excerpt.code.split('\n');
  const widest = Math.max(1, ...lines.map((line) => line.length));
  const fontSize = Math.min(phone ? 9 : CODE_FONT_SIZE, (width - 2 * pad) / (widest * 0.6), (height - 2 * pad) / (lines.length * LINE_RATIO));
  const p = pose(progress, flat, view);

  // Built once per excerpt and size: a scroll frame changes only the plane's --t, never these.
  const glyphs = useMemo(() => {
    const plan = glyphPlan(excerpt.code, { max: phone ? 80 : 220, aspect: screen.width / screen.height });
    return plan.map((g, k) => (
      <span
        key={k}
        style={/** @type {import('react').CSSProperties} */ ({
          '--x0': ((pad + g.x0 * widest * 0.6 * fontSize) / width).toFixed(4),
          '--y0': ((pad + g.y0 * lines.length * fontSize * LINE_RATIO) / height).toFixed(4),
          '--x1': g.x1.toFixed(4),
          '--y1': g.y1.toFixed(4),
          '--d': g.d.toFixed(3),
          fontSize: px(fontSize),
        })}
        className={k % 3 === 0 ? 'text-ember' : 'text-white/70'}
      >
        {g.ch}
      </span>
    ));
  }, [excerpt.code, phone, screen.width, screen.height, pad, widest, fontSize, width, height, lines.length]);

  const sourceZ = (depth.lifted + (depth.source - depth.lifted) * p.apart) * p.tilt;
  const flightZ = depth.flight * p.apart * p.tilt;
  const motion = flat ? `transform 700ms ${EASE}, opacity 500ms ${EASE}` : 'none';
  const plane = 'absolute inset-0 rounded-lg';

  return (
    <div data-layer-stack data-step={p.step} style={{ width, height, perspective: phone ? 1200 : 2200 }} className="relative">
      <div
        data-layer-box
        style={{
          width,
          height,
          transformStyle: 'preserve-3d',
          transform: `rotateX(${Number((52 * p.tilt).toFixed(2))}deg) rotateZ(${Number((-28 * p.tilt).toFixed(2)) || 0}deg)`,
          transition: motion,
        }}
        className="relative"
      >
        <div
          data-plane="result"
          data-landed={String(p.landed)}
          style={{ opacity: p.screenOpacity, transform: 'translateZ(0px)', transition: motion }}
          className={`${plane} overflow-hidden border ${p.step === 'result' ? 'border-ember' : 'border-white/15'}`}
        >
          {screen.video ? (
            <MediaLoop src={screen.video} poster={screen.src} alt={screen.alt} active={p.landed} className="h-full w-full" />
          ) : (
            <img src={screen.src} alt={screen.alt} className="h-full w-full object-cover" />
          )}
        </div>
        <div
          data-plane="flight"
          aria-hidden="true"
          style={/** @type {import('react').CSSProperties} */ ({ '--t': p.glyphT.toFixed(4), opacity: p.glyphOpacity, transform: `translateZ(${px(flightZ)})`, transition: motion })}
          className={`${plane} mono border border-dashed border-white/15`}
        >
          {glyphs}
        </div>
        <div
          data-plane="source"
          aria-hidden="true"
          style={{
            opacity: p.codeOpacity,
            transform: `translateZ(${px(sourceZ)})`,
            transition: motion,
            padding: pad,
            fontSize: px(fontSize),
            lineHeight: px(fontSize * LINE_RATIO),
          }}
          className={`${plane} overflow-hidden border bg-[#0f0f0f]/95 ${p.step === 'source' ? 'border-ember' : 'border-white/15'}`}
        >
          <pre className="mono m-0 whitespace-pre text-white/85 [font-variant-ligatures:none]">
            <CodeLines code={excerpt.code} />
          </pre>
        </div>
      </div>
    </div>
  );
}
