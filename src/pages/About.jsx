import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal';
import Magnetic from '../components/Magnetic';
import usePageMeta from '../hooks/usePageMeta';

const TIMELINE = [
  {
    year: '2009–2023',
    title: 'Fifteen years in professional kitchens',
    body: "Line cook to kitchen leadership — where the standard is simple: it either goes out right, or it doesn't go out.",
  },
  {
    year: '2020',
    title: 'Started teaching myself to code',
    body: 'Nights and mornings before shifts, working through fundamentals with no bootcamp and no shortcuts.',
  },
  {
    year: '2022',
    title: 'First paid client build shipped',
    body: 'A small business tool that replaced three spreadsheets — the first proof this could be a real business.',
  },
  {
    year: '2023',
    title: 'Left hospitality full-time',
    body: 'Went all-in on Allen Code Co. as a solo, build-to-sell software studio.',
  },
  {
    year: '2024–Now',
    title: 'Four live products, growing client roster',
    body: 'My Teachers Toolbox, UnderFire AI, Founders Helm, and a private beta — plus a template store and client work running in parallel.',
  },
];

const VALUES = [
  {
    title: 'Ship it clean',
    body: 'Every commit is written like a stranger will read it, because eventually one will — a client, an acquirer, or future me.',
  },
  {
    title: 'No delegation theater',
    body: "I don't sell work I subcontract. If my name is on it, my hands built it.",
  },
  {
    title: 'Built to be sold',
    body: 'Documentation, sane architecture, and real metrics from day one — not bolted on before a raise.',
  },
];

export default function About() {
  usePageMeta(
    'About — Allen Code Co.',
    'Chris Allen spent fifteen years in hospitality before teaching himself to code and building Allen Code Co., a solo build-to-sell software studio.'
  );

  return (
    <div className="px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 lg:grid-cols-[0.85fr_1.15fr] lg:items-center">
          <Reveal>
            <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02]">
              <img
                data-aiwp-slot="5"
                src="/chris-allen.png"
                alt="Chris Allen, founder of Allen Code Co."
                className="aspect-[4/5] w-full object-cover"
              />
            </div>
          </Reveal>
          <Reveal delay={0.1}>
            <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">About</p>
            <h1 className="mt-4 font-display text-5xl leading-[0.95] tracking-tight sm:text-6xl">
              I run one studio. I write every line myself.
            </h1>
            <p className="mt-6 text-lg text-white/60">
              I'm Chris Allen — a solo developer running Allen Code Co. out of a genuine belief that most software
              doesn't need a team of twelve, a design sprint, and a launch party. It needs one person who's good
              enough to build the whole thing and disciplined enough to finish it properly.
            </p>
            <p className="mt-4 text-lg text-white/60">
              Before this, I spent fifteen years in professional kitchens. That job taught me more about shipping
              software than any course did: work under pressure, hit the pass on time, and never let something
              mediocre go out the door with your name on it.
            </p>
            <Magnetic className="mt-8 block w-fit">
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-6 py-3 mono text-xs uppercase tracking-widest text-black hover:bg-orange-400"
              >
                Work with me <ArrowUpRight size={14} />
              </Link>
            </Magnetic>
          </Reveal>
        </div>

        <div className="mt-24">
          <Reveal>
            <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">Timeline</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl tracking-tight sm:text-5xl">
              From the line to the laptop.
            </h2>
          </Reveal>
          <div className="mt-14 border-t border-white/10">
            {TIMELINE.map((t, i) => (
              <Reveal key={t.year} delay={i * 0.06}>
                <div className="grid gap-4 border-b border-white/10 py-8 md:grid-cols-[180px_1fr] md:gap-10">
                  <span className="mono text-sm uppercase tracking-widest text-orange-500">{t.year}</span>
                  <div>
                    <h3 className="font-display text-2xl tracking-tight">{t.title}</h3>
                    <p className="mt-2 max-w-2xl text-white/60">{t.body}</p>
                  </div>
                </div>
              </Reveal>
            ))}
          </div>
        </div>

        <div className="mt-24 grid gap-6 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className="h-full rounded-2xl border border-white/10 bg-white/[0.02] p-8">
                <h3 className="font-display text-2xl tracking-tight text-orange-500">{v.title}</h3>
                <p className="mt-3 text-white/60">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}