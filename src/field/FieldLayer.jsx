// @ts-check
import { Component, lazy, Suspense, useEffect, useState } from 'react';
import CssField from './CssField.jsx';

const FieldScene = lazy(() => import('./FieldScene.jsx'));

/**
 * If the renderer's code cannot load (a dropped connection, or a page left open across a deploy
 * whose files have since changed), the page keeps its content and shows the static field instead
 * of failing.
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
    return this.state.failed ? <CssField /> : this.props.children;
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
 * (Chris, 2026-11-09) loads once and never restarts on navigation. It starts after the first paint,
 * with the static field shown until then. Draft excerpts are never shown.
 */
export default function FieldLayer() {
  const ready = useAfterFirstPaint();
  if (!ready) return <CssField />;
  return (
    <FieldBoundary>
      <Suspense fallback={<CssField />}>
        <FieldScene includeDrafts={false} />
      </Suspense>
    </FieldBoundary>
  );
}
