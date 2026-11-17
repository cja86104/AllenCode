// @ts-check
import { useSearchParams } from 'react-router-dom';
import { setPlainView, usePlainView, useWorldCapable, useWorldMode } from '../world/worldSwitch.js';

/**
 * "Plain view" (Code World W6, Chris 2026-11-17: "Small toggle in footer"): turns the Code World off,
 * and back on, at once, for the visit. Offered only where the world can run, so a reduced-motion or
 * no-WebGL visitor, who has the plain site anyway, sees nothing. A `?world=` in the address gives way
 * to it.
 * @param {{ className?: string }} props
 */
export default function PlainViewToggle({ className = '' }) {
  const capable = useWorldCapable();
  const on = useWorldMode();
  const plain = usePlainView();
  const [searchParams, setSearchParams] = useSearchParams();
  if (!capable) return null;
  const pressed = plain || !on;
  return (
    <button
      type="button"
      aria-pressed={pressed}
      onClick={() => {
        if (searchParams.has('world')) {
          setSearchParams(
            (params) => {
              params.delete('world');
              return params;
            },
            { replace: true },
          );
        }
        setPlainView(!pressed);
      }}
      className={`mono inline-flex w-fit items-center gap-2 text-xs uppercase tracking-widest text-white/60 transition-colors hover:text-ember ${className}`}
    >
      <span aria-hidden="true" className={`relative h-3 w-6 rounded-full border ${pressed ? 'border-ember bg-ember/30' : 'border-white/30'}`}>
        <span className={`absolute top-1/2 h-1.5 w-1.5 -translate-y-1/2 rounded-full transition-all ${pressed ? 'left-3.5 bg-ember' : 'left-0.5 bg-white/60'}`} />
      </span>
      Plain view
    </button>
  );
}
