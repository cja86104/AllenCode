import { useEffect, useRef, useState } from 'react';
import { useMemorial } from '../app/MemorialContext';

type Status = 'idle' | 'copied' | 'manual';

/**
 * Copies the memorial's address. When the browser does not allow clipboard access, the address is shown
 * selected so it can be copied by hand; the result is announced to screen readers either way.
 */
export function CopyLink({ className }: { className?: string }) {
  const memorial = useMemorial();
  const [status, setStatus] = useState<Status>('idle');
  const [address, setAddress] = useState(memorial.site.url ?? '');
  const fieldRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (status === 'manual') fieldRef.current?.select();
  }, [status]);

  const copy = async () => {
    const url = memorial.site.url ?? `${window.location.origin}/`;
    setAddress(url);
    try {
      if (!navigator.clipboard) throw new Error('Clipboard unavailable');
      await navigator.clipboard.writeText(url);
      setStatus('copied');
    } catch {
      setStatus('manual');
    }
  };

  return (
    <span className={['copy-link', className].filter(Boolean).join(' ')}>
      <button type="button" className="text-button" onClick={() => void copy()}>
        Copy memorial link
      </button>
      {status === 'manual' ? (
        <label className="copy-link__manual">
          <span className="visually-hidden">Memorial link</span>
          <input ref={fieldRef} type="text" readOnly value={address} className="copy-link__field" />
        </label>
      ) : null}
      <span role="status" className="copy-link__status">
        {status === 'copied' ? 'Link copied.' : status === 'manual' ? 'Copying is blocked here. The link is selected for you to copy.' : ''}
      </span>
    </span>
  );
}
