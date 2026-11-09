// @ts-check
import { lazy, Suspense } from 'react';
import { useLocation } from 'react-router-dom';
import CssField from './CssField.jsx';

/** The unlinked, noindex development route; the only place draft excerpts are shown. */
export const PREVIEW_ROUTE = '/preview';

/** Routes that show the field. BLUEPRINT Task 6.4 makes this '/'. */
export const FIELD_ROUTES = Object.freeze([PREVIEW_ROUTE]);

const FieldScene = lazy(() => import('./FieldScene.jsx'));

/**
 * Whether the current route shows the field.
 * @returns {boolean}
 */
export function useIsFieldRoute() {
  const { pathname } = useLocation();
  return FIELD_ROUTES.includes(pathname);
}

/** Mounted once above the routes; loads and renders the field only on field routes. */
export default function FieldLayer() {
  const { pathname } = useLocation();
  if (!FIELD_ROUTES.includes(pathname)) return null;
  return (
    <Suspense fallback={<CssField />}>
      <FieldScene includeDrafts={pathname === PREVIEW_ROUTE} />
    </Suspense>
  );
}
