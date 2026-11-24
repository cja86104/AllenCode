import { createContext, useContext, useEffect, useState, type ReactNode } from 'react';
import type { Memorial } from '../content/types';
import type { ServiceState } from '../lib/service';

interface MemorialContextValue {
  memorial: Memorial;
  /**
   * Forces the gathering section into one state. Only the family's management preview sets this, to
   * show the other states; the public memorial always follows the event time and the family setting.
   */
  servicePreview?: ServiceState;
  /** The time the page was first rendered, so a prerendered page and the browser agree on first paint. */
  renderedAt: number;
}

const MemorialContext = createContext<MemorialContextValue | null>(null);

interface ProviderProps {
  memorial: Memorial;
  servicePreview?: ServiceState;
  renderedAt?: number;
  children: ReactNode;
}

export function MemorialProvider({ memorial, servicePreview, renderedAt, children }: ProviderProps) {
  const [initial] = useState(() => renderedAt ?? Date.now());
  const value: MemorialContextValue = { memorial, renderedAt: initial };
  if (servicePreview !== undefined) value.servicePreview = servicePreview;
  return <MemorialContext.Provider value={value}>{children}</MemorialContext.Provider>;
}

function useMemorialContext(): MemorialContextValue {
  const value = useContext(MemorialContext);
  if (!value) throw new Error('useMemorial must be used inside <MemorialProvider>.');
  return value;
}

export function useMemorial(): Memorial {
  return useMemorialContext().memorial;
}

export function useServicePreview(): ServiceState | undefined {
  return useMemorialContext().servicePreview;
}

/**
 * The current time, refreshed once a minute, so an open page moves from "upcoming" to "has taken place"
 * without a reload. Starts at the render time so the first paint matches a prerendered page.
 */
export function useNow(): number {
  const { renderedAt } = useMemorialContext();
  const [now, setNow] = useState(renderedAt);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    tick();
    const timer = window.setInterval(tick, 60_000);
    return () => window.clearInterval(timer);
  }, []);
  return now;
}
