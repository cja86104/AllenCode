import { Pause, Play } from 'lucide-react';
import type { ReactNode } from 'react';
import { useRotation } from '../lib/useRotation';

interface RotatorProps {
  label: string;
  count: number;
  intervalMs: number;
  /** Renders item `index`. */
  render: (index: number) => ReactNode;
  /** Accessible name for the button that shows item `index`. */
  itemLabel: (index: number) => string;
  minHeight: string;
}

/**
 * A slow carousel of quotes on a dark ground: one item at a time, dots to pick one, and a visible
 * Pause button. Screen readers hear changes only once rotation has stopped, so it never talks over them.
 */
export function Rotator({ label, count, intervalMs, render, itemLabel, minHeight }: RotatorProps) {
  const rotation = useRotation(count, intervalMs);
  return (
    <div role="group" aria-roledescription="carousel" aria-label={label} {...rotation.hold}>
      <div className={`flex items-center justify-center ${minHeight}`} aria-live={rotation.running ? 'off' : 'polite'}>
        <div key={rotation.index} className="hero-enter">
          {render(rotation.index)}
        </div>
      </div>
      {count > 1 ? (
        <div className="mt-8 flex items-center justify-center gap-4">
          <ul className="flex items-center">
            {Array.from({ length: count }, (_, index) => (
              <li key={index}>
                <button
                  type="button"
                  aria-label={itemLabel(index)}
                  aria-current={index === rotation.index ? 'true' : undefined}
                  onClick={() => rotation.select(index)}
                  className="group inline-flex h-11 w-8 items-center justify-center"
                >
                  <span
                    className={`block h-1.5 rounded-full transition-all duration-300 motion-reduce:transition-none ${
                      index === rotation.index ? 'w-7 bg-brass' : 'w-1.5 bg-cream/40 group-hover:bg-cream/70'
                    }`}
                  />
                </button>
              </li>
            ))}
          </ul>
          {rotation.canRotate ? (
            <button
              type="button"
              onClick={rotation.toggle}
              className="inline-flex min-h-[2.75rem] items-center gap-2 px-2 text-xs uppercase tracking-[0.2em] text-mist hover:text-brass"
            >
              {rotation.playing ? <Pause size={14} aria-hidden="true" /> : <Play size={14} aria-hidden="true" />}
              {rotation.playing ? 'Pause' : 'Play'}
            </button>
          ) : null}
        </div>
      ) : null}
    </div>
  );
}
