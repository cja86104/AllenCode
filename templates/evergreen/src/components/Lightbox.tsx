import { useEffect, useId, useRef } from 'react';
import type { Photo as PhotoData } from '../content/types';
import { Photo } from './Photo';
import { PhotoDetails } from './PhotoFigure';

interface LightboxProps {
  photos: PhotoData[];
  index: number;
  onClose: () => void;
  onMove: (index: number) => void;
}

/**
 * A photograph opened over the collection. Built on the native modal `<dialog>`, which keeps focus
 * inside it and makes the page behind inert. Escape and the visible Close button close it; the arrow
 * keys and the Previous and Next buttons move through the current collection. The caller restores
 * focus to the photograph that was opened.
 */
export function Lightbox({ photos, index, onClose, onMove }: LightboxProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);
  const titleId = useId();
  const photo = photos[index];
  const hasPrevious = index > 0;
  const hasNext = index < photos.length - 1;

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (!dialog.open) dialog.showModal();
    closeRef.current?.focus();
    return () => {
      if (dialog.open) dialog.close();
    };
  }, []);

  // Moving to the last photograph removes the Next button; keep focus inside the dialog when that happens.
  useEffect(() => {
    if (!dialogRef.current?.contains(document.activeElement)) closeRef.current?.focus();
  }, [index]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    const onCancel = (event: Event) => {
      event.preventDefault();
      onClose();
    };
    const onKey = (event: KeyboardEvent) => {
      if (event.key === 'ArrowLeft' && hasPrevious) {
        event.preventDefault();
        onMove(index - 1);
      } else if (event.key === 'ArrowRight' && hasNext) {
        event.preventDefault();
        onMove(index + 1);
      }
    };
    dialog.addEventListener('cancel', onCancel);
    dialog.addEventListener('keydown', onKey);
    return () => {
      dialog.removeEventListener('cancel', onCancel);
      dialog.removeEventListener('keydown', onKey);
    };
  }, [index, hasPrevious, hasNext, onClose, onMove]);

  if (!photo) return null;

  return (
    <dialog ref={dialogRef} className="lightbox" aria-labelledby={titleId}>
      <div className="lightbox__bar">
        <p className="lightbox__position">
          {index + 1} of {photos.length}
        </p>
        <button ref={closeRef} type="button" className="lightbox__close" onClick={onClose}>
          Close
        </button>
      </div>

      <div className="lightbox__stage">
        <Photo key={photo.id} photo={photo} sizes="100vw" className="lightbox__image" />
      </div>

      <div className="lightbox__text">
        <h2 id={titleId} className="lightbox__caption">
          {photo.caption}
        </h2>
        <PhotoDetails photo={photo} />
        {photo.story && photo.story.length > 0 ? (
          <div className="prose lightbox__story">
            {photo.story.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        ) : null}
      </div>

      <div className="lightbox__nav">
        {hasPrevious ? (
          <button type="button" className="text-button" onClick={() => onMove(index - 1)}>
            Previous photograph
          </button>
        ) : (
          <span />
        )}
        {hasNext ? (
          <button type="button" className="text-button" onClick={() => onMove(index + 1)}>
            Next photograph
          </button>
        ) : (
          <span />
        )}
      </div>

      <p className="visually-hidden" aria-live="polite">
        Photograph {index + 1} of {photos.length}: {photo.caption}
      </p>
    </dialog>
  );
}
