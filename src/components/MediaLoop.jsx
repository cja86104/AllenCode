// @ts-check
import { useEffect, useRef, useState } from 'react';
import { usePrefersReducedMotion } from '../field/environment.js';

/** Share of the loop that must be on screen before it plays. */
const IN_VIEW_THRESHOLD = 0.25;
/** The loop starts loading a little before it scrolls into view, so it is already moving when it arrives. */
const LOOK_AHEAD = '25% 0px';

/**
 * A short muted product loop (spec section 7.5). The poster is a real image carrying the alt text;
 * the video sits over it, loads nothing until it first plays, and plays only while it is in view,
 * `active`, and the visitor has not asked for reduced motion. It never has sound.
 *
 * @param {{ src: string, poster: string, alt: string, active?: boolean, className?: string }} props
 */
export default function MediaLoop({ src, poster, alt, active = true, className = '' }) {
  const frameRef = useRef(/** @type {HTMLDivElement | null} */ (null));
  const videoRef = useRef(/** @type {HTMLVideoElement | null} */ (null));
  const [inView, setInView] = useState(false);
  const reducedMotion = usePrefersReducedMotion();

  // React sets `muted` as a property only; iOS autoplays inline video only with the attribute.
  // Anything that unmutes the loop is undone at once.
  useEffect(() => {
    const video = videoRef.current;
    if (!video) return undefined;
    video.muted = true;
    video.defaultMuted = true;
    video.setAttribute('muted', '');
    const keepMuted = () => {
      if (!video.muted) video.muted = true;
    };
    video.addEventListener('volumechange', keepMuted);
    return () => video.removeEventListener('volumechange', keepMuted);
  }, []);

  useEffect(() => {
    const frame = frameRef.current;
    if (!frame || typeof IntersectionObserver === 'undefined') return undefined;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) setInView(entry.isIntersecting);
      },
      { threshold: IN_VIEW_THRESHOLD, rootMargin: LOOK_AHEAD },
    );
    observer.observe(frame);
    return () => observer.disconnect();
  }, []);

  const shouldPlay = inView && active && !reducedMotion;
  const startedRef = useRef(false);

  useEffect(() => {
    const video = videoRef.current;
    if (!video) return;
    if (shouldPlay) {
      startedRef.current = true;
      // A blocked autoplay keeps the poster, which is the same picture as the first frame.
      video.play().catch(() => {});
    } else if (startedRef.current) {
      startedRef.current = false;
      video.pause();
    }
  }, [shouldPlay]);

  return (
    <div ref={frameRef} className={`relative overflow-hidden ${className}`}>
      <img src={poster} alt={alt} className="block h-full w-full object-cover" />
      <video
        ref={videoRef}
        className="absolute inset-0 h-full w-full object-cover"
        src={src}
        poster={poster}
        muted
        loop
        playsInline
        preload="none"
        aria-hidden="true"
        tabIndex={-1}
        disablePictureInPicture
      />
    </div>
  );
}
