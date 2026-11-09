// @ts-check
import { DONE_FOR_YOU } from '../content/doorB.js';

/** Done for you (spec section 4, step 6B): the custom-site option, pointing at the project brief. */
export default function DoneForYou() {
  return (
    <section data-chapter="done-for-you" className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:px-10">
      <p className="mono text-xs uppercase tracking-[0.3em] text-ember">{DONE_FOR_YOU.eyebrow}</p>
      <h2 className="mt-4 max-w-3xl font-serif-display text-4xl italic leading-tight text-white sm:text-5xl">
        {DONE_FOR_YOU.title}
      </h2>
      <p className="mt-5 max-w-2xl text-white/70">{DONE_FOR_YOU.body}</p>
      <a
        href="#brief"
        className="mono mt-6 inline-flex rounded-full border border-ember px-6 py-3 text-xs uppercase tracking-widest text-ember transition-colors hover:bg-ember hover:text-night focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
      >
        {DONE_FOR_YOU.link}
      </a>
    </section>
  );
}
