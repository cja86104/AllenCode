import { useCallback, useState } from 'react';
import type { Photo as PhotoData } from '../content/types';

interface PhotoProps {
  photo: PhotoData;
  className?: string;
  /** The first image on the page. Loaded eagerly with high priority; everything else is lazy. */
  priority?: boolean;
}

/**
 * A photograph that fills its box. If the image cannot be loaded, a quiet panel with its description
 * takes its place instead of a broken image or a third-party placeholder.
 *
 * A prerendered image can fail before React attaches `onError`, so the image is also checked the moment
 * React takes hold of it: a finished load with no pixels means it failed.
 */
export function Photo({ photo, className = '', priority = false }: PhotoProps) {
  const [failed, setFailed] = useState(false);
  const checkLoaded = useCallback((image: HTMLImageElement | null) => {
    if (image?.complete && image.naturalWidth === 0) setFailed(true);
  }, []);
  if (failed) {
    return (
      <div role="img" aria-label={photo.alt} className={`flex items-center justify-center bg-panel p-6 text-center ${className}`}>
        <span aria-hidden="true" className="max-w-[16rem] text-sm text-mist">
          {photo.alt}
        </span>
      </div>
    );
  }
  return (
    <img
      ref={checkLoaded}
      src={photo.src}
      alt={photo.alt}
      className={`object-cover ${className}`}
      style={photo.position ? { objectPosition: photo.position } : undefined}
      loading={priority ? 'eager' : 'lazy'}
      decoding={priority ? 'sync' : 'async'}
      onError={() => setFailed(true)}
      {...{ fetchpriority: priority ? 'high' : 'auto' }}
    />
  );
}
