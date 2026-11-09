// @ts-check
import { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { readDoor, writeDoor } from './doorStorage.js';
import { fieldBus } from '../field/fieldBus.js';

/** @typedef {import('./doorStorage.js').Door} Door */
/** @typedef {{ door: Door | null, setDoor: (door: Door) => void }} DoorContextValue */

const DoorContext = createContext(/** @type {DoorContextValue | null} */ (null));

/**
 * Holds the visitor's door for the whole app: remembered for the session, mirrored to fieldBus.
 * @param {{ children: import('react').ReactNode }} props
 */
export default function DoorProvider({ children }) {
  const [door, setDoorState] = useState(() => {
    const stored = readDoor();
    if (stored) fieldBus.set({ door: stored });
    return stored;
  });

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
