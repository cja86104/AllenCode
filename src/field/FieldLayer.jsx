// @ts-check
import { Component, lazy, Suspense, useEffect, useState } from 'react';
import CssField from './CssField.jsx';
import { useField } from './fieldBus.js';
import ambient from '../content/excerpts/ambient.js';

const FieldScene = lazy(() => import('./FieldScene.jsx'));

/**
 * The texture's code: the ambient excerpt, imported on its own so the excerpt registry stays out of
 * the main bundle, and only once Chris has approved it (the rule `getExcerpt` applies; spec section 5).
 */
const TEXTURE_CODE = ambient.approved ? ambient.code : null;

/**
 * If the renderer's code cannot load (a dropped connection, or a page left open across a deploy
 * whose files have since changed), the page keeps its content and the static texture, which is
 * already on the page, instead of failing.
 * @extends {Component<{ children: import('react').ReactNode }, { failed: boolean }>}
 */
class FieldBoundary extends Component {
  /** @param {{ children: import('react').ReactNode }} props */
  constructor(props) {
    super(props);
    this.state = { failed: false };
  }

  static getDerivedStateFromError() {
    return { failed: true };
  }

  render() {
    return this.state.failed ? null : this.props.children;
  }
}

/** Longest the renderer waits for the browser to go idle once the page has loaded. */
const IDLE_TIMEOUT_MS = 1500;

/**
 * True once the page has loaded and the browser is idle, so the renderer's start (its code, the
 * glyph atlas, the shaders) never competes with the page's first paint (spec section 9). Measured
 * before this: on a throttled phone the renderer's start-up ran during the first paint.
 * @returns {boolean}
 */
export function useAfterFirstPaint() {
  const [ready, setReady] = useState(false);
  useEffect(() => {
    let idle = 0;
    let timer = 0;
    const start = () => {
      if (typeof window.requestIdleCallback === 'function') {
        idle = window.requestIdleCallback(() => setReady(true), { timeout: IDLE_TIMEOUT_MS });
      } else {
        timer = window.setTimeout(() => setReady(true), 200);
      }
    };
    if (document.readyState === 'complete') start();
    else window.addEventListener('load', start, { once: true });
    return () => {
      window.removeEventListener('load', start);
      if (idle && typeof window.cancelIdleCallback === 'function') window.cancelIdleCallback(idle);
      window.clearTimeout(timer);
    };
  }, []);
  return ready;
}

/**
 * Mounted once above the routes and kept across page changes, so the code field behind every page
 * (Chris, 2026-11-09) loads once and never restarts on navigation. The static texture is painted with
 * the page, prebuilt HTML included, and stays the same element for the whole visit (Task 9.3b): a
 * new texture element after the renderer loaded was a new, late largest paint, and Lighthouse charged
 * the whole script to it. The renderer starts after the first paint and hides the texture while it
 * draws. Draft excerpts are never shown.
 */
export default function FieldLayer() {
  const ready = useAfterFirstPaint();
  const { mode } = useField();
  return (
    <>
      <CssField code={TEXTURE_CODE} hidden={mode === 'webgl'} />
      {ready && (
        <FieldBoundary>
          <Suspense fallback={null}>
            <FieldScene includeDrafts={false} />
          </Suspense>
        </FieldBoundary>
      )}
    </>
  );
}
