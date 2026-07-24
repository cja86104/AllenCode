import Reveal from './Reveal';

const PRINCIPLES = [
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
];

export default function HowIWork() {
  return (
    <section className="border-b border-white/10 px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">How I Work</p>
          <h2 className="mt-4 max-w-3xl font-display text-4xl leading-[0.95] tracking-tight sm:text-6xl">
            Three rules that never bend.
          </h2>
        </Reveal>
        <div className="mt-16 divide-y divide-white/10 border-t border-white/10">
          {PRINCIPLES.map((p, i) => (
            <Reveal key={p.n} delay={i * 0.1}>
              <div className="grid gap-6 py-10 md:grid-cols-[auto_1fr] md:items-start md:gap-12">
                <span className="font-display text-5xl text-orange-500/80 sm:text-6xl">{p.n}</span>
                <div>
                  <h3 className="font-display text-2xl tracking-tight sm:text-3xl">{p.title}</h3>
                  <p className="mt-3 max-w-2xl text-white/60">{p.body}</p>
                </div>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </section>
  );
}