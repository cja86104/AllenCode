// @ts-check
import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { fieldBus } from '../field/fieldBus.js';

gsap.registerPlugin(ScrollTrigger);

/** GSAP's default lag smoothing, restored when the engine stops. */
const DEFAULT_LAG_THRESHOLD = 500;
const DEFAULT_LAG_ADJUSTED = 33;

/**
 * Smooth scrolling (Lenis) driven by the GSAP ticker, with ScrollTrigger kept in sync and scroll
 * progress published to the field store. Marks `<html data-scroll-engine="on|off">`.
 *
 * @param {{ enabled: boolean }} props
 */
export default function ScrollEngine({ enabled }) {
  useEffect(() => {
    const root = document.documentElement;

    if (!enabled) {
      root.dataset.scrollEngine = 'off';
      return () => {
        delete root.dataset.scrollEngine;
      };
    }

    const lenis = new Lenis();
    const onScroll = () => {
      ScrollTrigger.update();
      fieldBus.set({ progress: lenis.progress });
    };
    /** @param {number} time GSAP ticker time in seconds. */
    const tick = (time) => {
      lenis.raf(time * 1000);
    };

    lenis.on('scroll', onScroll);
    gsap.ticker.add(tick);
    gsap.ticker.lagSmoothing(0);
    root.dataset.scrollEngine = 'on';

    return () => {
      gsap.ticker.remove(tick);
      gsap.ticker.lagSmoothing(DEFAULT_LAG_THRESHOLD, DEFAULT_LAG_ADJUSTED);
      lenis.destroy();
      fieldBus.set({ progress: 0 });
      delete root.dataset.scrollEngine;
    };
  }, [enabled]);

  return null;
}
