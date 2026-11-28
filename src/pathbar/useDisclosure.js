// @ts-check
import { useCallback, useId, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

/**
 * One of the path bar's disclosures (Living Source Phase 3): a segment or the phone's chip, and the panel
 * it opens. It is open only for the address it was opened at, so any change of route closes it. The open
 * panel handles its own keys and presses outside (`usePanelKeys` in PathMenu.jsx, loaded with it).
 * @returns {{ open: boolean, toggle: () => void, close: (returnFocus?: boolean) => void, id: string,
 *   buttonRef: import('react').MutableRefObject<HTMLButtonElement | null>, panelRef: import('react').MutableRefObject<HTMLDivElement | null> }}
 */
export function useDisclosure() {
  const { key } = useLocation();
  const [openAt, setOpenAt] = useState(/** @type {string | null} */ (null));
  const open = openAt === key;
  const id = `path-panel${useId().replace(/:/g, '')}`;
  const buttonRef = useRef(/** @type {HTMLButtonElement | null} */ (null));
  const panelRef = useRef(/** @type {HTMLDivElement | null} */ (null));

  const close = useCallback((returnFocus = false) => {
    setOpenAt(null);
    if (returnFocus) buttonRef.current?.focus();
  }, []);
  const toggle = useCallback(() => setOpenAt((at) => (at === key ? null : key)), [key]);

  return { open, toggle, close, id, buttonRef, panelRef };
}
