// @ts-check
import { Component, lazy, Suspense } from 'react';
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

/**
 * Mounted once above the routes and kept across page changes, so the code field behind every page
 * (Chris, 2026-11-09) loads once and never restarts on navigation. Draft excerpts are never shown.
 */
export default function FieldLayer() {
  return (
    <FieldBoundary>
      <Suspense fallback={<CssField />}>
        <FieldScene includeDrafts={false} />
      </Suspense>
    </FieldBoundary>
  );
}
