import type { CSSProperties } from 'react';
import type { Photo as PhotoData } from '../content/types';

interface PhotoProps {
  photo: PhotoData;
  /** The `sizes` attribute: how wide the image is drawn at each breakpoint. */
  sizes: string;
  /** The above-the-fold image. Loaded eagerly with high priority; everything else is lazy. */
  priority?: boolean;
  /** Crops to this aspect ratio (width / height) around the focal point. Defaults to the photo's own. */
  aspect?: number;
  className?: string;
}

/**
 * Text read to screen-reader users. A placeholder says so, so nobody is told they are seeing a
 * photograph that is not there.
 */
export function photoAlt(photo: PhotoData): string {
  return photo.placeholder ? `Photo placeholder. The family’s photograph will show: ${photo.alt}` : photo.alt;
}

/**
 * A photograph with a reserved size (no layout shift), a focal point that keeps faces in frame when the
 * image is cropped, responsive sources when supplied, and lazy loading below the fold.
 */
export function Photo({ photo, sizes, priority = false, aspect, className }: PhotoProps) {
  // A placeholder is always centred, so its label stays in view however it is cropped.
  const focal = photo.placeholder ? { x: 50, y: 50 } : (photo.focalPoint ?? { x: 50, y: 50 });
  const ratio = aspect ?? photo.width / photo.height;
  const style: CSSProperties = {
    aspectRatio: String(ratio),
    objectPosition: `${focal.x}% ${focal.y}%`,
  };
  const srcSet =
    photo.sources && photo.sources.length > 0 ? photo.sources.map((source) => `${source.src} ${source.width}w`).join(', ') : undefined;

  return (
    <span className={photo.placeholder ? 'photo-wrap photo-wrap--placeholder' : 'photo-wrap'}>
      <img
        className={['photo', className].filter(Boolean).join(' ')}
        src={photo.src}
        srcSet={srcSet}
        sizes={srcSet ? sizes : undefined}
        width={photo.width}
        height={Math.round(photo.width / ratio)}
        alt={photoAlt(photo)}
        loading={priority ? 'eager' : 'lazy'}
        decoding={priority ? 'sync' : 'async'}
        style={style}
        // React 18 passes attributes it does not know through only in lowercase.
        {...{ fetchpriority: priority ? 'high' : 'auto' }}
      />
    </span>
  );
}
