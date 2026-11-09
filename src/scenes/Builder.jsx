// @ts-check
import { Link } from 'react-router-dom';

/** The builder's story, verbatim from the previous home page. */
export const BUILDER = Object.freeze({
  eyebrow: 'The Builder',
  title: 'Fifteen years in hospitality. Now I run a one-person software studio.',
  body: "I traded kitchens for codebases but kept the same standard: nothing leaves the pass unless it's right. Allen Code Co. is what happens when that discipline meets a decade of self-taught engineering — a growing product portfolio, a client roster, and zero patience for sloppy work.",
  link: 'Read the full story',
  photo: Object.freeze({
    src: '/chris-allen.png',
    alt: 'Chris Allen, founder of Allen Code Co.',
    width: 2592,
    height: 3456,
  }),
});

/**
 * The builder (spec section 4, step 7, shared by both doors): Chris's story with his photo.
 */
export default function Builder() {
  const { photo } = BUILDER;
  return (
    <section
      data-chapter="builder"
      className="relative z-10 mx-auto grid max-w-6xl gap-10 px-6 py-16 lg:grid-cols-[0.8fr_1.2fr] lg:items-center lg:px-10"
    >
      <div className="overflow-hidden rounded-xl border border-white/10 bg-night/80">
        <img
          src={photo.src}
          alt={photo.alt}
          width={photo.width}
          height={photo.height}
          loading="lazy"
          decoding="async"
          className="aspect-[4/5] h-auto w-full object-cover"
        />
      </div>
      <div>
        <p className="mono text-xs uppercase tracking-[0.3em] text-ember">{BUILDER.eyebrow}</p>
        <h2 className="mt-4 font-serif-display text-4xl italic leading-tight text-white sm:text-5xl">{BUILDER.title}</h2>
        <p className="mt-6 max-w-xl text-white/70">{BUILDER.body}</p>
        <Link
          to="/about"
          className="mono mt-6 inline-flex text-xs uppercase tracking-widest text-white hover:text-ember focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-ember"
        >
          {BUILDER.link} <span aria-hidden="true">&nbsp;→</span>
        </Link>
      </div>
    </section>
  );
}
