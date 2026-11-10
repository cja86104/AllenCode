// @ts-check
import { Link, Navigate, useParams } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, ExternalLink, Lock } from 'lucide-react';
import { catalog } from '../data/catalog.js';
import Reveal from '../components/Reveal';
import Magnetic from '../components/Magnetic';
import { BUTTON, DISPLAY, PANEL } from '../components/PageHeader.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

/**
 * A section of the showcase: a label, a heading and what follows, under a hairline.
 * @param {{ label?: string, title: string, intro?: string, children: import('react').ReactNode }} props
 */
function Section({ label, title, intro, children }) {
  return (
    <Reveal>
      <section className="mt-20 border-t border-white/10 pt-16">
        {label && <p className="mono mb-3 text-xs uppercase tracking-[0.3em] text-ember">{label}</p>}
        <h2 className={`${DISPLAY} text-4xl sm:text-5xl`}>{title}</h2>
        {intro && <p className="mt-4 max-w-2xl text-white/65">{intro}</p>}
        {children}
      </section>
    </Reveal>
  );
}

/**
 * A product's showcase. Each product's own pricing stays on its page (Chris, 2026-11-09: "Keep
 * product pricing"); the site's no-prices rule covers its services and templates.
 */
export default function ProductDetail() {
  const { slug } = useParams();
  const product = catalog.find((p) => p.slug === slug);

  usePageMeta(
    product ? `${product.name} — Allen Code Co.` : 'Product not found — Allen Code Co.',
    product ? product.summary : 'This product could not be found.',
  );

  if (!product) return <Navigate to="/products" replace />;

  const isPrivate = product.status === 'private';
  const isComingSoon = product.status === 'coming-soon';
  const { pricing } = product;

  return (
    <div className="px-6 pb-24 lg:px-10">
      <div className="mx-auto max-w-6xl">
        <header className="pb-6 pt-32 lg:pt-36">
          <Link
            to="/products"
            viewTransition
            className="mono inline-flex items-center gap-2 text-[11px] tracking-widest text-white/55 hover:text-ember"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            <span>
              <span className="text-ember">~/</span>allencode/products/{product.slug}
            </span>
          </Link>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="mono rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-widest text-white/65">
              {product.category}
            </span>
            {isPrivate ? (
              <span className="mono inline-flex items-center gap-1 rounded-full border border-ember/60 px-3 py-1 text-[10px] uppercase tracking-widest text-ember">
                <Lock size={11} aria-hidden="true" /> Private, by application
              </span>
            ) : isComingSoon ? (
              <span className="mono inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-widest text-white/55">
                Launching soon
              </span>
            ) : (
              <span className="mono inline-flex items-center gap-2 rounded-full border border-ember/60 px-3 py-1 text-[10px] uppercase tracking-widest text-ember">
                <span aria-hidden="true" className="h-1.5 w-1.5 animate-pulse rounded-full bg-ember" /> Live product
              </span>
            )}
          </div>
          <h1 className={`${DISPLAY} mt-6 text-5xl sm:text-7xl`}>{product.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/70">{product.tagline}</p>
        </header>

        <Reveal delay={0.05}>
          <div className={`overflow-hidden ${PANEL}`}>
            <p aria-hidden="true" className="mono border-b border-white/10 px-5 py-2.5 text-[11px] tracking-widest text-white/55">
              {product.slug}/screen
            </p>
            <img
              src={product.showcaseImage || product.image}
              alt={`${product.name} product preview`}
              className={`block w-full object-cover ${product.heroAspect === '4/3' ? 'aspect-[4/3]' : 'aspect-[16/10]'}`}
            />
          </div>
        </Reveal>

        {product.stats && (
          <Reveal delay={0.05}>
            <div className="mt-12 grid grid-cols-2 gap-px overflow-hidden rounded-xl border border-white/10 bg-white/10 sm:grid-cols-3 lg:grid-cols-6">
              {product.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center justify-center gap-1 bg-night px-4 py-6 text-center">
                  <span className={`${DISPLAY} text-3xl text-ember`}>{stat.number}</span>
                  <span className="mono text-[10px] uppercase tracking-[0.2em] text-white/50">{stat.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        <div className="mt-16 grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-12">
            <Reveal>
              <h2 className={`${DISPLAY} text-3xl text-ember`}>The Problem</h2>
              <p className="mt-4 text-lg leading-relaxed text-white/75">{product.problem}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className={`${DISPLAY} text-3xl text-ember`}>The Build</h2>
              <p className="mt-4 text-lg leading-relaxed text-white/75">{product.solution}</p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className={`space-y-8 p-8 ${PANEL}`}>
              <div>
                <p className="mono text-xs uppercase tracking-widest text-white/50">Stack</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.stack.map((s) => (
                    <span key={s} className="mono rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/65">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-4 border-t border-white/10 pt-6">
                {product.results.map((r) => (
                  <div key={r.label} className="flex items-baseline justify-between gap-4">
                    <span className="text-sm text-white/60">{r.label}</span>
                    <span className={`${DISPLAY} whitespace-nowrap text-2xl text-ember`}>{r.value}</span>
                  </div>
                ))}
              </div>
              {product.url ? (
                <Magnetic className="block">
                  <a href={product.url} target="_blank" rel="noopener noreferrer" className={`${BUTTON} w-full`}>
                    Visit live site <ExternalLink size={14} aria-hidden="true" />
                    <span className="sr-only">(opens in a new tab)</span>
                  </a>
                </Magnetic>
              ) : (
                <p className="mono rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-center text-xs uppercase tracking-widest text-white/50">
                  {isComingSoon ? 'Launching soon' : 'Access by application only'}
                </p>
              )}
            </div>
          </Reveal>
        </div>

        {product.overview && (
          <Section title="Overview">
            <div className="mt-8 space-y-6">
              {product.overview.map((para, i) => (
                <p key={i} className="text-lg leading-relaxed text-white/75">
                  {para}
                </p>
              ))}
            </div>
          </Section>
        )}

        {product.archetypes && (
          <Section
            label="Interviewer Archetypes"
            title="8 hidden personalities. One goal: expose your weak spots."
            intro="Every interview session assigns one of eight archetypes. You discover which one you're talking to by how they respond — just like a real interview."
          >
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {product.archetypes.map((a) => (
                <div key={a.name} className={`p-6 ${PANEL}`}>
                  <h3 className={`${DISPLAY} text-2xl`}>{a.name}</h3>
                  <p className="mt-3 text-sm italic text-ember/90">{a.quote}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{a.desc}</p>
                  <p className="mono mt-4 text-[10px] text-white/40">{a.traits}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {product.features && (
          <Section label="Features" title="What's inside">
            <div className="mt-10 space-y-3">
              {product.features.map((f) => (
                <details key={f.name} className={`group ${PANEL} open:border-ember/40`}>
                  <summary className="flex cursor-pointer list-none items-center justify-between gap-4 p-6">
                    <span className="flex items-center gap-4">
                      <span aria-hidden="true" className="text-2xl">
                        {f.icon}
                      </span>
                      <span className={`${DISPLAY} text-2xl group-open:text-ember`}>{f.name}</span>
                    </span>
                    <span aria-hidden="true" className="mono shrink-0 text-lg text-white/40 transition-transform group-open:rotate-45">
                      +
                    </span>
                  </summary>
                  <div className="border-t border-white/10 px-6 pb-6 pt-4">
                    <p className="leading-relaxed text-white/75">{f.desc}</p>
                    {f.tags && <p className="mono mt-4 text-[11px] text-ember/80">{f.tags}</p>}
                  </div>
                </details>
              ))}
            </div>
          </Section>
        )}

        {product.modules && (
          <Section
            label="The Platform"
            title="10 integrated tools. One workspace."
            intro="Every module is production-grade. No half-built features, no placeholder screens — this is a real operating system for running a company solo."
          >
            <div className="mt-10 grid gap-4 sm:grid-cols-2">
              {product.modules.map((m) => (
                <div key={m.name} className={`p-6 ${PANEL}`}>
                  <div className="flex items-center gap-3">
                    <span aria-hidden="true" className="text-2xl">
                      {m.icon}
                    </span>
                    <h3 className={`${DISPLAY} text-2xl`}>{m.name}</h3>
                  </div>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{m.desc}</p>
                  <p className="mono mt-4 text-[10px] text-ember/80">{m.featureList}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {product.architecture && (
          <Section label="Under the Hood" title="Architecture">
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.architecture.map((cell) => (
                <div key={cell.label} className={`p-6 ${PANEL}`}>
                  <p className="mono text-xs uppercase tracking-widest text-ember">{cell.label}</p>
                  <p className="mt-3 text-sm leading-relaxed text-white/65">{cell.content}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {product.stack.length > 6 && (
          <Reveal>
            <div className="mt-10">
              <p className="mono mb-4 text-xs uppercase tracking-widest text-white/45">Full tech stack</p>
              <div className="flex flex-wrap gap-2">
                {product.stack.map((s) => (
                  <span key={s} className="mono rounded-full border border-white/10 bg-night/80 px-3 py-1 text-[11px] text-white/60">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {product.security && (
          <Section label="Security" title="Built for production">
            <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {product.security.map((s) => (
                <div key={s.title} className={`p-6 ${PANEL}`}>
                  <p aria-hidden="true" className="mono mb-3 text-sm text-ember">
                    ✓
                  </p>
                  <h3 className={`${DISPLAY} text-xl`}>{s.title}</h3>
                  <p className="mt-2 text-sm leading-relaxed text-white/60">{s.desc}</p>
                </div>
              ))}
            </div>
          </Section>
        )}

        {pricing && (
          <Section label="Pricing" title="Simple, honest pricing" intro={pricing.note}>
            <div className={`mt-10 grid gap-6 ${pricing.tiers.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
              {pricing.tiers.map((tier) => (
                <div
                  key={tier.tier}
                  className={`rounded-xl border p-8 ${tier.featured ? 'border-ember/60 bg-night/95' : 'border-white/10 bg-night/90'}`}
                >
                  {tier.featured && <p className="mono mb-4 text-[10px] uppercase tracking-widest text-ember">Most popular</p>}
                  <h3 className={`${DISPLAY} text-2xl`}>{tier.tier}</h3>
                  <div className="mt-4 flex items-baseline gap-1">
                    <span className={`${DISPLAY} text-5xl`}>{tier.price}</span>
                    <span className="text-sm text-white/50">{tier.period}</span>
                  </div>
                  {tier.perUnit && <p className="mono mt-1 text-[11px] text-white/50">{tier.perUnit}</p>}
                  <ul className="mt-6 space-y-3">
                    {tier.features.map((feat) => (
                      <li key={feat} className="flex items-start gap-2 text-sm text-white/75">
                        <span aria-hidden="true" className="mt-0.5 shrink-0 text-ember">
                          ✓
                        </span>
                        {feat}
                      </li>
                    ))}
                  </ul>
                  {product.url && (
                    <a
                      href={product.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`mt-8 inline-flex w-full items-center justify-center gap-2 rounded-full px-6 py-3 mono text-xs uppercase tracking-widest transition-colors ${
                        tier.featured ? 'bg-ember text-night hover:bg-orange-400' : 'border border-white/20 text-white/75 hover:border-ember hover:text-ember'
                      }`}
                    >
                      Get started <ExternalLink size={12} aria-hidden="true" />
                      <span className="sr-only">(opens in a new tab)</span>
                    </a>
                  )}
                </div>
              ))}
            </div>
          </Section>
        )}

        <Reveal>
          <div className={`mt-20 flex flex-col items-start gap-6 border-ember/40 p-10 sm:flex-row sm:items-center sm:justify-between ${PANEL}`}>
            <div>
              <h2 className={`${DISPLAY} text-3xl sm:text-4xl`}>Want something like this built?</h2>
              <p className="mt-2 max-w-lg text-white/65">
                This is exactly the kind of product I build for clients — scoped, shipped, and built to last.
              </p>
            </div>
            <Magnetic>
              <Link to="/contact" viewTransition className={`${BUTTON} whitespace-nowrap`}>
                Start a project <ArrowUpRight size={14} aria-hidden="true" />
              </Link>
            </Magnetic>
          </div>
        </Reveal>
      </div>
    </div>
  );
}
