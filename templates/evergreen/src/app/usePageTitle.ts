import { useEffect } from 'react';
import { documentTitle } from '../lib/head';
import { useMemorial } from './MemorialContext';

/** Sets the browser tab title for a page, built from the memorial's own content. */
export function usePageTitle(page?: string) {
  const memorial = useMemorial();
  const title = documentTitle(memorial, page);
  useEffect(() => {
    document.title = title;
  }, [title]);
}
