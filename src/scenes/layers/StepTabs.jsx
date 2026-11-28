// @ts-check
import { STEPS } from './layerTimeline.js';

/** @typedef {import('./layerTimeline.js').StepId} StepId */

/**
 * C's three numbered steps (Living Source Phase 4, rule 2): each moves the chapter to that step; the current
 * one is marked. A row of three under the stack; on a phone three full-width buttons, the middle one "Flight".
 * @param {{ current: StepId, onPick: (step: StepId) => void, phone: boolean }} props
 */
export default function StepTabs({ current, onPick, phone }) {
  return (
    <div role="group" aria-label="Steps" className="grid grid-cols-3 gap-2">
      {STEPS.map((step) => {
        const here = step.id === current;
        return (
          <button
            key={step.id}
            type="button"
            aria-current={here ? 'step' : undefined}
            onClick={() => onPick(step.id)}
            className={`mono flex items-center justify-center gap-2 rounded-lg border px-2 text-[11px] uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
              phone ? 'min-h-12' : 'min-h-11'
            } ${here ? 'border-ember bg-ember text-night' : 'border-white/15 text-white/75 hover:border-white/40 hover:text-white'}`}
          >
            <span className={here ? 'text-night' : 'text-ember'}>{step.n}</span> <span>{phone ? step.short : step.label}</span>
          </button>
        );
      })}
    </div>
  );
}
