// @ts-check
import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import CssField from './CssField.jsx';

/** Routes that show the field: the home page, where the Source to Screen experience lives. */
export const FIELD_ROUTES = Object.freeze(['/']);

const FieldScene = lazy(() => import('./FieldScene.jsx'));

/**
 * Whether the current route shows the field.
 * @returns {boolean}
 */
export function useIsFieldRoute() {
  const { pathname } = useLocation();
  return FIELD_ROUTES.includes(pathname);
}

/** Mounted once above the routes; loads and renders the field only on field routes. Draft excerpts are never shown. */
export default function FieldLayer() {
  const { pathname } = useLocation();
  if (!FIELD_ROUTES.includes(pathname)) return null;
  return (
    <Suspense fallback={<CssField />}>
      <FieldScene includeDrafts={false} />
    </Suspense>
  );
}
