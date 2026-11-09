// @ts-check
// Self-hosted faces the field draws with (OFL-1.1). They load with this lazy chunk only, so pages
// without the field are unaffected, and the field never depends on a third-party font CDN.
import '@fontsource/jetbrains-mono/500.css';
import '@fontsource/instrument-serif/400-italic.css';
import { useCallback, useEffect, useMemo, useState } from 'react';
import CssField from './CssField.jsx';
import FieldStage from './FieldStage.jsx';
import ScrollEngine from '../scroll/ScrollEngine.jsx';
import { detectCapabilities } from './capabilities.js';
import { readCapabilityEnv, usePrefersReducedMotion } from './environment.js';
import { fieldBus } from './fieldBus.js';
import { getExcerpt } from '../content/excerpts/index.js';

/**
 * Restarts allowed after lost GPU contexts in one visit. A device that keeps losing its context
 * settles on the CSS field instead of flickering between the two.
 */
export const MAX_FIELD_RESTARTS = 3;

/**
 * The field and its scroll engine for one field route. Loaded lazily by FieldLayer so GSAP, Lenis
 * and the WebGL code never reach pages without the field.
 *
 * @param {{ includeDrafts: boolean }} props Drafts are shown only on the `/preview` route.
 */
export default function FieldScene({ includeDrafts }) {
  const reducedMotion = usePrefersReducedMotion();
  const capabilities = useMemo(() => detectCapabilities(readCapabilityEnv()), []);
  const [webglFailed, setWebglFailed] = useState(false);
  const onFailure = useCallback(() => setWebglFailed(true), []);
  const [restarts, setRestarts] = useState(0);
  const onRestart = useCallback(() => setRestarts((count) => count + 1), []);
  // Reduced motion gets the static field and code-beside-result chapters (spec section 8).
  const useWebGL = capabilities.webgl2 && !webglFailed && !reducedMotion && restarts <= MAX_FIELD_RESTARTS;
  const ambient = useMemo(() => getExcerpt('ambient', { includeDrafts }), [includeDrafts]);

  useEffect(() => {
    if (!useWebGL) fieldBus.set({ mode: 'static' });
    return () => fieldBus.set({ mode: 'pending' });
  }, [useWebGL]);

  return (
    <>
      <ScrollEngine enabled={!reducedMotion} />
      {useWebGL ? (
        // A new key mounts a new canvas, so a restart always gets a fresh GPU context.
        <FieldStage
          key={restarts}
          capabilities={capabilities}
          includeDrafts={includeDrafts}
          onFailure={onFailure}
          onRestart={onRestart}
        />
      ) : (
        <CssField code={ambient ? ambient.code : null} />
      )}
    </>
  );
}
