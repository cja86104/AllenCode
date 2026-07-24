import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Reveal from './Reveal';
import Magnetic from './Magnetic';

function CTAPanel({ to, eyebrow, title, body, cta, dark }) {
  return (
    <div
      className={`group relative flex h-full flex-col justify-between overflow-hidden rounded-2xl border p-10 transition-colors ${
        dark ? 'border-white/10 bg-white/[0.02] hover:border-orange-500/40' : 'border-orange-500/30 bg-orange-500/[0.04] hover:border-orange-500'
      }`}
    >
      <div>
        <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">{eyebrow}</p>
        <h3 className="mt-4 font-display text-3xl tracking-tight sm:text-4xl">{title}</h3>
        <p className="mt-4 max-w-md text-white/60">{body}</p>
      </div>
      <Magnetic className="mt-10 block">
        <Link to={to} className="inline-flex items-center gap-2 font-display text-lg text-white group-hover:text-orange-500">
          {cta}{' '}
          <ArrowUpRight size={18} className="transition-transform group-hover:translate-x-1 group-hover:-translate-y-1" />
        </Link>
      </Magnetic>
    </div>
  );
}

export default function HomeCTA() {
  return (
    <section className="px-6 py-24 lg:px-10 lg:py-32">
      <div className="mx-auto grid max-w-7xl gap-6 lg:grid-cols-2">
        <Reveal>
          <CTAPanel
            to="/templates"
            eyebrow="The Store"
            title="Launch on a template built to convert."
            body="Premium Next.js + Tailwind templates — SaaS landing pages, dev portfolios, dashboards, agency sites. Buy once, deploy today."
            cta="Browse Templates"
          />
        </Reveal>
        <Reveal delay={0.1}>
          <CTAPanel
            to="/services"
            eyebrow="Custom Work"
            title="Or have it built exactly right."
            body="Custom SaaS builds, MVP sprints, and AI integration work — scoped, priced, and delivered by the person who'll actually write the code."
            cta="See Services"
            dark
          />
        </Reveal>
      </div>
    </section>
  );
}