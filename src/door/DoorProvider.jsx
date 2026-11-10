// @ts-check
import { createContext, startTransition, useCallback, useContext, useMemo, useState } from 'react';
import { readDoor, writeDoor } from './doorStorage.js';
import { fieldBus } from '../field/fieldBus.js';
import { useIsomorphicLayoutEffect } from '../ssr/useHydrated.js';

/** @typedef {import('./doorStorage.js').Door} Door */
/** @typedef {{ door: Door | null, setDoor: (door: Door) => void }} DoorContextValue */

const DoorContext = createContext(/** @type {DoorContextValue | null} */ (null));

/**
 * Holds the visitor's door for the whole app: remembered for the session, mirrored to fieldBus.
 * Starts with no door and applies the remembered one once mounted, so a prebuilt page hydrates as it
 * was built.
 * @param {{ children: import('react').ReactNode }} props
 */
export default function DoorProvider({ children }) {
  // Every page first renders as a first visit sees it (no door), as the prebuilt HTML does (Phase 9);
  // the door remembered for this session applies once the page has hydrated.
  const [door, setDoorState] = useState(/** @type {Door | null} */ (null));

  useIsomorphicLayoutEffect(() => {
    const stored = readDoor();
    if (!stored) return;
    fieldBus.set({ door: stored });
    // A transition, so the lazily loaded home page finishes hydrating first; an ordinary update would
    // make React throw away its server HTML and draw it again.
    startTransition(() => setDoorState((current) => current ?? stored));
  }, []);

  const setDoor = useCallback((/** @type {Door} */ next) => {
    writeDoor(next);
    fieldBus.set({ door: next });
    setDoorState(next);
  }, []);

  const value = useMemo(() => ({ door, setDoor }), [door, setDoor]);
  return <DoorContext.Provider value={value}>{children}</DoorContext.Provider>;
}

/**
 * The current door and a setter. Must be used inside DoorProvider.
 * @returns {DoorContextValue}
 */
export function useDoor() {
  const value = useContext(DoorContext);
  if (!value) throw new Error('useDoor must be used inside DoorProvider.');
  return value;
}
