import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import Hero from '../components/Hero';
import Marquee from '../components/Marquee';
import HowIWork from '../components/HowIWork';
import HomeCTA from '../components/HomeCTA';
import ProductCard from '../components/ProductCard';
import Reveal from '../components/Reveal';
import { products } from '../data/products';
import usePageMeta from '../hooks/usePageMeta';

const STACK_ITEMS = [
  'Next.js',
  'React',
  'Vite',
  'HTML / CSS',
  'PostgreSQL',
  'Stripe',
  'OpenRouter',
  'Tailwind CSS',
  'Vercel',
  'Supabase',
  'TypeScript',
  'WebSockets',
];

const WHO_WE_BUILD_FOR = [
  {
    label: 'Business owners',
    heading: 'You run a real business.',
    body: 'A clinic, a restaurant, a trade, a service. You need a website or software that works, brings in customers, and doesn\'t break when you need it most. We build it so it does the job, looks the part, and holds up in the real world.',
    tags: [
      'Local & service businesses',
      'Restaurants & retail',
      'Healthcare & professional services',
      'Trades & contractors',
    ],
  },
  {
    label: 'Founders & builders',
    heading: 'You have an idea. We ship it.',
    body: 'You need a partner who can take a clear brief, build it production-ready, and hand back something you can sell from day one. No prototypes. No half-finished features. Finished work, built to the same standard we hold our own products to.',
    tags: [
      'SaaS & web applications',
      'AI-powered tools',
      'MVPs built to ship, not shelve',
      'Acquisition-ready from day one',
    ],
  },
  {
    label: 'Just you',
    heading: 'You don\'t need a company behind you.',
    body: 'A family site, a portfolio, a memorial page, a blog, a place to sell your art — whatever it is, it deserves the same care we\'d put into any other project. You bring the idea. We build it right.',
    tags: [
      'Personal portfolios & blogs',
      'Family sites & memory pages',
      'Artists, coaches & freelancers',
      'Any idea that needs a home online',
    ],
  },
];

export default function Home() {
  usePageMeta(
    'Allen Code Co. — Custom Software, Web Design & AI for Real Businesses',
    'Custom development, web design, UI/UX, and AI integration — built around your business. Tailored work for small business owners and founders.'
  );

  return (
    <>
      <Hero />
      <Marquee items={STACK_ITEMS} />

      {/* ── Who We Build For ──────────────────────────────────────────────── */}
      <section className="border-b border-white/10 px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">Who We Build For</p>
            <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[0.95] tracking-tight sm:text-6xl">
              Not just for businesses.<br />For anyone who needs something built.
            </h2>
            <p className="mt-5 max-w-xl text-white/50">
              It doesn't matter if you're running a company, launching a product, or just want a corner of the
              internet that's yours. You get the same craft, the same quality, and the same attention to detail.
            </p>
          </Reveal>

          <div className="mt-14 grid gap-6 lg:grid-cols-3">
            {WHO_WE_BUILD_FOR.map((card, i) => (
              <Reveal key={card.label} delay={i * 0.08}>
                <div className="flex h-full flex-col rounded-2xl border border-white/10 bg-white/[0.02] p-8 transition-colors hover:border-orange-500/30">
                  <p className="mono text-[10px] uppercase tracking-[0.25em] text-orange-500">{card.label}</p>
                  <h3 className="mt-4 font-display text-2xl tracking-tight">{card.heading}</h3>
                  <p className="mt-3 flex-1 text-sm leading-relaxed text-white/55">{card.body}</p>
                  <ul className="mt-6 space-y-2 border-t border-white/10 pt-6">
                    {card.tags.map((tag) => (
                      <li key={tag} className="flex items-center gap-2 text-sm text-white/40">
                        <span className="h-px w-4 shrink-0 bg-orange-500/60" />
                        {tag}
                      </li>
                    ))}
                  </ul>
                </div>
              </Reveal>
            ))}
          </div>
        </div>
      </section>

      {/* ── Selected Work ─────────────────────────────────────────────────── */}
      <section className="border-b border-white/10 px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto max-w-7xl">
          <Reveal>
            <div className="flex flex-col justify-between gap-6 sm:flex-row sm:items-end">
              <div>
                <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">Selected Work</p>
                <h2 className="mt-4 max-w-2xl font-display text-4xl leading-[0.95] tracking-tight sm:text-6xl">
                  Four products. Three live, one launching soon.
                </h2>
              </div>
              <Link
                to="/products"
                className="mono inline-flex items-center gap-2 whitespace-nowrap text-xs uppercase tracking-widest text-white/60 hover:text-orange-500"
              >
                View all products <ArrowUpRight size={14} />
              </Link>
            </div>
          </Reveal>
          <div className="mt-14 grid gap-6 sm:grid-cols-2">
            {products.map((p, i) => (
              <ProductCard key={p.slug} product={p} index={i} slot={i + 1} />
            ))}
          </div>
        </div>
      </section>

      {/* ── The Builder ───────────────────────────────────────────────────── */}
      <section className="border-b border-white/10 px-6 py-24 lg:px-10 lg:py-32">
        <div className="mx-auto grid max-w-7xl gap-12 lg:grid-cols-[0.9fr_1.1fr] lg:items-center">
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
            <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">The Builder</p>
            <h2 className="mt-4 font-display text-4xl leading-[0.95] tracking-tight sm:text-5xl">
              Fifteen years in hospitality. Now I run a one-person software studio.
            </h2>
            <p className="mt-6 max-w-xl text-white/60">
              I traded kitchens for codebases but kept the same standard: nothing leaves the pass unless it's right.
              Allen Code Co. is what happens when that discipline meets a decade of self-taught engineering — a
              growing product portfolio, a client roster, and zero patience for sloppy work.
            </p>
            <Link
              to="/about"
              className="mono mt-6 inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white hover:text-orange-500"
            >
              Read the full story <ArrowUpRight size={14} />
            </Link>
          </Reveal>
        </div>
      </section>

      <HowIWork />
      <HomeCTA />
    </>
  );
}
