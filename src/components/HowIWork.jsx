// @ts-check

/** The three principles, verbatim from the previous home page. */
export const PRINCIPLES = Object.freeze([
  {
    n: '01',
    title: 'Solo, on purpose',
    body: 'No account managers, no subcontractors, no game of telephone. Every line of code, every architecture decision, every client conversation runs through one person who ships.',
  },
  {
    n: '02',
    title: 'Precision over speed-hacking',
    body: 'Fifteen years of hospitality taught me that a rushed plate always shows. The same discipline goes into error handling, data modeling, and the parts of software users never see but always feel.',
  },
  {
    n: '03',
    title: 'Acquisition-ready from day one',
    body: 'Clean commits, real documentation, sane architecture, and metrics a buyer can actually diligence — because a product built to be sold has to survive scrutiny from the first commit, not the last.',
  },
]);

/**
 * How I work (spec section 4, step 6): the three principles as a changelog.
 */
export default function HowIWork() {
  return (
    <section data-chapter="how-i-work" className="relative z-10 mx-auto max-w-6xl px-6 py-16 lg:px-10">
      <p className="mono text-xs uppercase tracking-[0.3em] text-ember">How I Work</p>
      <h2 className="mt-4 max-w-3xl font-serif-display text-4xl italic leading-tight text-white sm:text-5xl">
        Three rules that never bend.
      </h2>
      <div className="mt-10 overflow-hidden rounded-xl border border-white/10 bg-night/80">
        <p aria-hidden="true" className="mono border-b border-white/10 px-4 py-2 text-[11px] tracking-widest text-white/45">
          CHANGELOG.md
        </p>
        <ol className="divide-y divide-white/10">
          {PRINCIPLES.map((principle) => (
            <li key={principle.n} className="grid gap-3 px-5 py-6 sm:grid-cols-[auto_1fr] sm:gap-8 sm:px-8">
              <span className="mono text-sm text-ember">
                <span aria-hidden="true">## </span>
                {principle.n}
              </span>
              <div>
                <h3 className="font-serif-display text-2xl italic leading-snug text-white sm:text-3xl">{principle.title}</h3>
                <p className="mt-2 max-w-2xl text-white/65">
                  <span aria-hidden="true" className="mono mr-2 text-ember/80">
                    +
                  </span>
                  {principle.body}
                </p>
              </div>
            </li>
          ))}
        </ol>
      </div>
    </section>
  );
}
