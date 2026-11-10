// @ts-check
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Reveal from '../components/Reveal';
import Magnetic from '../components/Magnetic';
import { BUTTON, DISPLAY, PANEL } from '../components/PageHeader.jsx';
import { BUILDER } from '../content/builderStory.js';
import usePageMeta from '../hooks/usePageMeta.js';

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
    'Chris Allen spent fifteen years in hospitality before teaching himself to code and building Allen Code Co., a solo build-to-sell software studio.',
  );
  const { photo } = BUILDER;

  return (
    <div className="px-6 pb-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <div className="grid gap-12 pt-32 lg:grid-cols-[0.85fr_1.15fr] lg:items-center lg:pt-36">
          <Reveal>
            <figure className={`overflow-hidden ${PANEL}`}>
              <p aria-hidden="true" className="mono border-b border-white/10 px-5 py-2.5 text-[11px] tracking-widest text-white/55">
                chris-allen.jpg
              </p>
              <img src={photo.src} alt={photo.alt} width={photo.width} height={photo.height} className="aspect-[4/5] h-auto w-full object-cover" />
            </figure>
          </Reveal>
          <Reveal delay={0.1}>
            <p aria-hidden="true" className="mono text-[11px] tracking-widest text-white/45">
              <span className="text-ember">~/</span>allencode/about
              <span className="gate-cursor" />
            </p>
            <p className="mono mt-6 text-xs uppercase tracking-[0.3em] text-ember">About</p>
            <h1 className={`${DISPLAY} mt-4 text-5xl sm:text-6xl`}>I run one studio. I write every line myself.</h1>
            <p className="mt-6 text-lg text-white/70">
              I&apos;m Chris Allen — a solo developer running Allen Code Co. out of a genuine belief that most software
              doesn&apos;t need a team of twelve, a design sprint, and a launch party. It needs one person who&apos;s good
              enough to build the whole thing and disciplined enough to finish it properly.
            </p>
            <p className="mt-4 text-lg text-white/70">
              Before this, I spent fifteen years in professional kitchens. That job taught me more about shipping
              software than any course did: work under pressure, hit the pass on time, and never let something
              mediocre go out the door with your name on it.
            </p>
            <Magnetic className="mt-8 block w-fit">
              <Link to="/contact" viewTransition className={BUTTON}>
                Work with me <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </Magnetic>
          </Reveal>
        </div>

        <section className="mt-24">
          <Reveal>
            <p className="mono text-xs uppercase tracking-[0.3em] text-ember">Timeline</p>
            <h2 className={`${DISPLAY} mt-4 max-w-2xl text-4xl sm:text-5xl`}>From the line to the laptop.</h2>
          </Reveal>
          <div className={`mt-12 overflow-hidden ${PANEL}`}>
            <p aria-hidden="true" className="mono border-b border-white/10 px-5 py-2.5 text-[11px] tracking-widest text-white/55">
              git log --reverse
            </p>
            <ol className="divide-y divide-white/10">
              {TIMELINE.map((t, i) => (
                <li key={t.year}>
                  <Reveal delay={i * 0.06}>
                    <div className="grid gap-3 px-6 py-7 md:grid-cols-[180px_1fr] md:gap-10">
                      <span className="mono text-sm uppercase tracking-widest text-ember">
                        <span aria-hidden="true" className="mr-2 text-white/35">
                          ●
                        </span>
                        {t.year}
                      </span>
                      <div>
                        <h3 className={`${DISPLAY} text-2xl sm:text-3xl`}>{t.title}</h3>
                        <p className="mt-2 max-w-2xl text-white/65">{t.body}</p>
                      </div>
                    </div>
                  </Reveal>
                </li>
              ))}
            </ol>
          </div>
        </section>

        <div className="mt-24 grid gap-6 md:grid-cols-3">
          {VALUES.map((v, i) => (
            <Reveal key={v.title} delay={i * 0.08}>
              <div className={`h-full p-8 ${PANEL}`}>
                <h3 className={`${DISPLAY} text-3xl text-ember`}>{v.title}</h3>
                <p className="mt-3 text-white/65">{v.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </div>
    </div>
  );
}
