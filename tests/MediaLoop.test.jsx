// @ts-check
import { act, render, screen } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import MediaLoop from '../src/components/MediaLoop.jsx';

/** @type {{ callback: IntersectionObserverCallback, target: Element | null }[]} */
let observers = [];

/** Reports whether the loop is in view, as the browser's IntersectionObserver would. */
function setInView(/** @type {boolean} */ inView) {
  act(() => {
    for (const observer of observers) {
      if (!observer.target) continue;
      const entry = /** @type {IntersectionObserverEntry} */ ({ isIntersecting: inView, target: observer.target, intersectionRatio: inView ? 1 : 0 });
      observer.callback([entry], /** @type {IntersectionObserver} */ (/** @type {unknown} */ ({})));
    }
  });
}

/** @param {boolean} matches */
function setReducedMotion(matches) {
  Object.defineProperty(window, 'matchMedia', {
    configurable: true,
    writable: true,
    /** @param {string} query */
    value: (query) => ({ matches, media: query, addEventListener() {}, removeEventListener() {} }),
  });
}

const originalMatchMedia = window.matchMedia;

beforeEach(() => {
  observers = [];
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      /** @param {IntersectionObserverCallback} callback */
      constructor(callback) {
        this.record = { callback, target: /** @type {Element | null} */ (null) };
        observers.push(this.record);
      }
      /** @param {Element} target */
      observe(target) {
        this.record.target = target;
      }
      disconnect() {
        this.record.target = null;
      }
    },
  );
  vi.spyOn(HTMLMediaElement.prototype, 'play').mockResolvedValue(undefined);
  vi.spyOn(HTMLMediaElement.prototype, 'pause').mockImplementation(() => {});
});

afterEach(() => {
  vi.unstubAllGlobals();
  vi.restoreAllMocks();
  Object.defineProperty(window, 'matchMedia', { configurable: true, writable: true, value: originalMatchMedia });
});

const props = { src: '/media/products/founders-helm.mp4', poster: '/media/products/founders-helm.jpg', alt: 'Founders Helm, scrolling through its home page' };

/** @returns {HTMLVideoElement} */
const video = () => /** @type {HTMLVideoElement} */ (document.querySelector('video'));

describe('MediaLoop', () => {
  it('renders the poster with its alt text', () => {
    render(<MediaLoop {...props} />);
    expect(screen.getByRole('img', { name: props.alt })).toHaveAttribute('src', props.poster);
    expect(video()).toHaveAttribute('poster', props.poster);
    expect(video()).toHaveAttribute('aria-hidden', 'true');
  });

  it('video is muted, looping and playsInline, and loads nothing until it plays', () => {
    render(<MediaLoop {...props} />);
    expect(video().muted).toBe(true);
    expect(video()).toHaveAttribute('muted');
    expect(video()).toHaveAttribute('loop');
    expect(video()).toHaveAttribute('playsinline');
    expect(video()).toHaveAttribute('preload', 'none');
    expect(video()).toHaveAttribute('src', props.src);
    expect(video()).not.toHaveAttribute('controls');
  });

  it('plays when intersecting and pauses when not', () => {
    render(<MediaLoop {...props} />);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    setInView(true);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
    setInView(false);
    expect(HTMLMediaElement.prototype.pause).toHaveBeenCalledTimes(1);
  });

  it('never has sound: unmuting is undone at once', () => {
    render(<MediaLoop {...props} />);
    act(() => {
      video().muted = false;
      video().dispatchEvent(new Event('volumechange'));
    });
    expect(video().muted).toBe(true);
  });

  it('does not play while inactive, and plays once it becomes active in view', () => {
    const { rerender } = render(<MediaLoop {...props} active={false} />);
    setInView(true);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    rerender(<MediaLoop {...props} active />);
    expect(HTMLMediaElement.prototype.play).toHaveBeenCalledTimes(1);
  });

  it('with reduced motion it never plays and keeps the poster', () => {
    setReducedMotion(true);
    render(<MediaLoop {...props} />);
    setInView(true);
    expect(HTMLMediaElement.prototype.play).not.toHaveBeenCalled();
    expect(screen.getByRole('img', { name: props.alt })).toBeVisible();
  });

  it('a blocked autoplay leaves the poster in place without throwing', async () => {
    vi.mocked(HTMLMediaElement.prototype.play).mockRejectedValue(new DOMException('blocked', 'NotAllowedError'));
    render(<MediaLoop {...props} />);
    setInView(true);
    await act(async () => {});
    expect(screen.getByRole('img', { name: props.alt })).toBeInTheDocument();
  });
});
