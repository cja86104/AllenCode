// @ts-check
import { Suspense, lazy, useCallback, useRef, useState } from 'react';
import { glideTo } from '../scroll/glide.js';
import { usePrefersReducedMotion } from '../field/environment.js';
import { useWordsFloor } from '../pathbar/pathBarStore.js';
import { stepAt } from './layers/layerTimeline.js';
import { useSectionProgress } from './useSectionProgress.js';
import { DESKTOP_MIN_WIDTH, EditorPanel, chapterLayout } from './flight.jsx';
import { CHAPTER_GRID } from './chapterType.js';

/** @typedef {import('./layers/layerTimeline.js').StepId} StepId */
/** @typedef {{ x: number, y: number, w: number, h: number }} Box */

// C's stack, steps and provenance load as their own chunk, the first time a world-off chapter needs them
// (the home chunk's budget; Living Source Phase 4). The home page asks for it early once it is world-off.
const LayerStage = lazy(() => import('./layers/index.js').then((module) => ({ default: module.LayerStage })));

/** The room the steps and the provenance take under the stack, in px. */
export const CONTROLS_PX = 150;
/** The stack's width on a phone at most (rule 7 of C: about 320 px). */
export const PHONE_STACK_PX = 320;
/** The share of a desktop stage the stack takes, leaving room for its planes to reach past it when tilted. */
export const TILT_ROOM = 0.85;

/**
 * Where a pinned chapter's stage sits in its stage box: the stack as wide as fits with the controls under it,
 * centred across the box, from its top. On a desktop (no cap) it takes TILT_ROOM of the box, so its tilted
 * planes stay on screen; a phone's cap is the stack's width.
 * @param {Box} stage @param {number} aspect The screen's width over its height. @param {number} cap Widest it may be.
 * @returns {{ x: number, y: number, width: number }}
 */
export function stageFit(stage, aspect, cap) {
  const share = Number.isFinite(cap) ? 1 : TILT_ROOM;
  const width = Math.max(0, Math.min(stage.w * share, cap, (stage.h - CONTROLS_PX) * aspect));
  return { x: stage.x + (stage.w - width) / 2, y: stage.y, width };
}

/**
 * A chapter's step buttons in the pinned form: a glide to the step's point in the section's scroll (at once
 * under reduced motion); focus stays on the button.
 * @param {import('react').RefObject<HTMLElement | null>} sectionRef
 * @returns {(step: StepId) => void}
 */
export function useStepJump(sectionRef) {
  const reducedMotion = usePrefersReducedMotion();
  return useCallback(
    (step) => {
      const section = sectionRef.current;
      if (!section) return;
      const rect = section.getBoundingClientRect();
      const span = Math.max(0, rect.height - window.innerHeight);
      glideTo(Math.ceil(rect.top + window.scrollY + stepAt(step) * span), { instant: reducedMotion });
    },
    [sectionRef, reducedMotion],
  );
}

/**
 * The stage's place in a chapter: C's stage once its chunk has loaded, until then its room held empty so
 * nothing moves when it arrives.
 * @param {import('react').ComponentProps<typeof LayerStage>} props
 */
export function LayerSlot(props) {
  const { width, screen } = props;
  const height = width / (screen.width / screen.height) + CONTROLS_PX;
  return (
    <Suspense fallback={<div aria-hidden="true" style={{ width, height }} />}>
      <LayerStage {...props} />
    </Suspense>
  );
}

/**
 * A static chapter's stage width in C: a column on a desktop, the phone's stack (rule 7) below 768 px.
 * @param {number} w The window's width.
 */
export function flatStageWidth(w) {
  if (w >= DESKTOP_MIN_WIDTH) return 520;
  return w >= 768 ? Math.min(w - 48, 600) : Math.min(w - 48, PHONE_STACK_PX);
}

/**
 * What a chapter's words are given: the scroll's progress through it, the window, and whether they are pinned
 * (and should take their compact form below a desktop).
 * @typedef {{ progress: number, viewport: { w: number, h: number }, pinned: boolean, compact: boolean }} WordsArgs
 */

/**
 * A code-to-screen chapter in C (Living Source Phase 4), the world off: the chapter's own words and, where its
 * code flew, the layer stack with its steps and provenance. Pinned while the renderer runs (scroll pulls the stack
 * apart and settles it flat as the result lands; the steps glide to their points); without it, or with reduced
 * motion, flat, its code beside the stack and the steps switching the view at once (rule 6). It claims no WebGL
 * flight.
 * @param {{ attrs: Record<string, string | boolean>, excerpt: import('../content/excerpts/index.js').Excerpt,
 *   screen: import('./layers/LayerStack.jsx').Screen, motion: boolean, words: (args: WordsArgs) => import('react').ReactNode }} props
 */
export function LayerChapter({ attrs, excerpt, screen, motion, words }) {
  const sectionRef = useRef(/** @type {HTMLElement | null} */ (null));
  const { progress, viewport } = useSectionProgress(sectionRef, motion);
  const jump = useStepJump(sectionRef);
  const [view, setView] = useState(/** @type {StepId} */ ('result'));
  const floor = useWordsFloor(viewport.w);
  const phone = viewport.w < 768;

  if (!motion) {
    return (
      <section {...attrs} data-layer-chapter className={`relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-16 ${CHAPTER_GRID} lg:items-center lg:px-10`}>
        {words({ progress: 1, viewport, pinned: false, compact: false })}
        <div className="min-w-0 space-y-6">
          <EditorPanel excerpt={excerpt} />
          <LayerSlot excerpt={excerpt} screen={screen} progress={1} flat view={view} width={flatStageWidth(viewport.w)} phone={phone} onPick={setView} />
        </div>
      </section>
    );
  }

  const { text, stage } = chapterLayout(viewport.w, viewport.h);
  const fit = stageFit(stage, screen.width / screen.height, phone ? PHONE_STACK_PX : Number.POSITIVE_INFINITY);
  return (
    <section ref={sectionRef} {...attrs} data-layer-chapter className="relative h-[220vh]">
      <div className="pin-frame sticky top-0 overflow-hidden">
        <div data-world-words style={{ left: text.x, top: Math.max(text.y, floor), width: text.w }} className="absolute">
          {words({ progress, viewport, pinned: true, compact: viewport.w < DESKTOP_MIN_WIDTH })}
        </div>
        <div data-world-target style={{ left: fit.x, top: Math.max(fit.y, floor) }} className="absolute">
          <LayerSlot excerpt={excerpt} screen={screen} progress={progress} flat={false} view="result" width={fit.width} phone={phone} onPick={jump} />
        </div>
      </div>
    </section>
  );
}
