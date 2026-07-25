import { useParams, Link, Navigate } from 'react-router-dom';
import { ArrowLeft, ArrowUpRight, Lock, ExternalLink } from 'lucide-react';
import { products } from '../data/products';
import Reveal from '../components/Reveal';
import Magnetic from '../components/Magnetic';
import usePageMeta from '../hooks/usePageMeta';

export default function ProductDetail() {
  const { slug } = useParams();
  const productIndex = products.findIndex((p) => p.slug === slug);
  const product = products[productIndex];

  usePageMeta(
    product ? `${product.name} — Allen Code Co.` : 'Product not found — Allen Code Co.',
    product ? product.summary : 'This product could not be found.'
  );

  if (!product) return <Navigate to="/products" replace />;

  const isPrivate = product.status === 'private';
  const isComingSoon = product.status === 'coming-soon';

  return (
    <div className="px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-6xl">

        {/* ── Back nav ──────────────────────────────────────────────────────── */}
        <Reveal>
          <Link
            to="/products"
            className="mono inline-flex items-center gap-2 text-xs uppercase tracking-widest text-white/50 hover:text-orange-500"
          >
            <ArrowLeft size={14} /> All products
          </Link>
        </Reveal>

        {/* ── Header ────────────────────────────────────────────────────────── */}
        <Reveal delay={0.05}>
          <div className="mt-8 flex flex-wrap items-center gap-3">
            <span className="mono rounded-full border border-white/15 px-3 py-1 text-[10px] uppercase tracking-widest text-white/60">
              {product.category}
            </span>
            {isPrivate ? (
              <span className="mono inline-flex items-center gap-1 rounded-full border border-orange-500/60 px-3 py-1 text-[10px] uppercase tracking-widest text-orange-500">
                <Lock size={11} /> Private, by application
              </span>
            ) : isComingSoon ? (
              <span className="mono inline-flex items-center gap-1 rounded-full border border-white/20 px-3 py-1 text-[10px] uppercase tracking-widest text-white/50">
                Launching soon
              </span>
            ) : (
              <span className="mono inline-flex items-center gap-1 rounded-full border border-orange-500/60 px-3 py-1 text-[10px] uppercase tracking-widest text-orange-500">
                Live product
              </span>
            )}
          </div>
          <h1 className="mt-6 font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">{product.name}</h1>
          <p className="mt-4 max-w-2xl text-lg text-white/60">{product.tagline}</p>
        </Reveal>

        {/* ── Hero image ────────────────────────────────────────────────────── */}
        <Reveal delay={0.1}>
          <div className="mt-10 overflow-hidden rounded-2xl border border-white/10 bg-black">
            <img
              data-aiwp-slot={18 + productIndex}
              src={product.showcaseImage || product.image}
              alt={`${product.name} product preview`}
              className="block w-full aspect-[16/10] object-cover"
            />
          </div>
        </Reveal>

        {/* ── Stats bar ─────────────────────────────────────────────────────── */}
        {product.stats && (
          <Reveal delay={0.05}>
            <div className="mt-12 grid grid-cols-2 gap-px rounded-2xl border border-white/10 bg-white/10 overflow-hidden sm:grid-cols-3 lg:grid-cols-6">
              {product.stats.map((stat) => (
                <div key={stat.label} className="flex flex-col items-center justify-center gap-1 bg-[#0a0a0a] px-4 py-6 text-center">
                  <span className="font-display text-3xl tracking-tight text-orange-500">{stat.number}</span>
                  <span className="mono text-[10px] uppercase tracking-[0.2em] text-white/40">{stat.label}</span>
                </div>
              ))}
            </div>
          </Reveal>
        )}

        {/* ── Problem / Solution + sidebar ──────────────────────────────────── */}
        <div className="mt-16 grid gap-12 lg:grid-cols-[1.3fr_0.7fr]">
          <div className="space-y-12">
            <Reveal>
              <h2 className="font-display text-2xl tracking-tight text-orange-500">The Problem</h2>
              <p className="mt-4 text-lg leading-relaxed text-white/70">{product.problem}</p>
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="font-display text-2xl tracking-tight text-orange-500">The Build</h2>
              <p className="mt-4 text-lg leading-relaxed text-white/70">{product.solution}</p>
            </Reveal>
          </div>

          <Reveal delay={0.1}>
            <div className="space-y-8 rounded-2xl border border-white/10 bg-white/[0.02] p-8">
              <div>
                <p className="mono text-xs uppercase tracking-widest text-white/40">Stack</p>
                <div className="mt-3 flex flex-wrap gap-2">
                  {product.stack.map((s) => (
                    <span key={s} className="mono rounded-full border border-white/10 px-3 py-1 text-[11px] text-white/60">
                      {s}
                    </span>
                  ))}
                </div>
              </div>
              <div className="space-y-4 border-t border-white/10 pt-6">
                {product.results.map((r) => (
                  <div key={r.label} className="flex items-baseline justify-between gap-4">
                    <span className="text-sm text-white/50">{r.label}</span>
                    <span className="whitespace-nowrap font-display text-xl text-orange-500">{r.value}</span>
                  </div>
                ))}
              </div>
              {product.url ? (
                <Magnetic className="block">
                  <a
                    href={product.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex w-full items-center justify-center gap-2 rounded-full bg-orange-500 px-6 py-3 mono text-xs uppercase tracking-widest text-black hover:bg-orange-400"
                  >
                    Visit live site <ExternalLink size={14} />
                  </a>
                </Magnetic>
              ) : isComingSoon ? (
                <p className="mono rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-center text-xs uppercase tracking-widest text-white/40">
                  Launching soon
                </p>
              ) : (
                <p className="mono rounded-lg border border-white/10 bg-black/40 px-4 py-3 text-center text-xs uppercase tracking-widest text-white/40">
                  Access by application only
                </p>
              )}
            </div>
          </Reveal>
        </div>

        {/* ── Overview paragraphs ───────────────────────────────────────────── */}
        {product.overview && (
          <Reveal>
            <div className="mt-20 space-y-6 border-t border-white/10 pt-16">
              <h2 className="font-display text-3xl tracking-tight sm:text-4xl">Overview</h2>
              {product.overview.map((para, i) => (
                <p key={i} className="text-lg leading-relaxed text-white/70">{para}</p>
              ))}
            </div>
          </Reveal>
        )}

        {/* ── Archetypes (UnderFire AI) ──────────────────────────────────────── */}
        {product.archetypes && (
          <Reveal>
            <div className="mt-20 border-t border-white/10 pt-16">
              <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">Interviewer Archetypes</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">8 hidden personalities. One goal: expose your weak spots.</h2>
              <p className="mt-4 max-w-2xl text-white/60">
                Every interview session assigns one of eight archetypes. You discover which one you're talking to by how they respond — just like a real interview.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {product.archetypes.map((a) => (
                  <div key={a.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                    <h3 className="font-display text-xl tracking-tight">{a.name}</h3>
                    <p className="mt-3 text-sm italic text-orange-400/80">{a.quote}</p>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{a.desc}</p>
                    <p className="mono mt-4 text-[10px] text-white/30">{a.traits}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ── Features grid ─────────────────────────────────────────────────── */}
        {product.features && (
          <Reveal>
            <div className="mt-20 border-t border-white/10 pt-16">
              <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">Features</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">What's inside</h2>
              <div className="mt-10 space-y-4">
                {product.features.map((f) => (
                  <details
                    key={f.name}
                    className="group rounded-2xl border border-white/10 bg-white/[0.02] open:border-orange-500/30 open:bg-orange-500/[0.03]"
                  >
                    <summary className="flex cursor-pointer list-none items-center justify-between p-6">
                      <div className="flex items-center gap-4">
                        <span className="text-2xl">{f.icon}</span>
                        <span className="font-display text-xl tracking-tight group-open:text-orange-500">{f.name}</span>
                      </div>
                      <span className="mono shrink-0 text-[10px] uppercase tracking-widest text-white/30 transition-transform group-open:rotate-45">+</span>
                    </summary>
                    <div className="border-t border-white/10 px-6 pb-6 pt-4">
                      <p className="text-white/70 leading-relaxed">{f.desc}</p>
                      {f.tags && (
                        <p className="mono mt-4 text-[11px] text-orange-500/70">{f.tags}</p>
                      )}
                    </div>
                  </details>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ── Modules grid (Founders Helm) ───────────────────────────────────── */}
        {product.modules && (
          <Reveal>
            <div className="mt-20 border-t border-white/10 pt-16">
              <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">The Platform</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">10 integrated tools. One workspace.</h2>
              <p className="mt-4 max-w-2xl text-white/60">
                Every module is production-grade. No half-built features, no placeholder screens — this is a real operating system for running a company solo.
              </p>
              <div className="mt-10 grid gap-4 sm:grid-cols-2">
                {product.modules.map((m) => (
                  <div key={m.name} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                    <div className="flex items-center gap-3">
                      <span className="font-display text-2xl">{m.icon}</span>
                      <h3 className="font-display text-xl tracking-tight">{m.name}</h3>
                    </div>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{m.desc}</p>
                    <p className="mono mt-4 text-[10px] text-orange-500/70">{m.featureList}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ── Architecture ──────────────────────────────────────────────────── */}
        {product.architecture && (
          <Reveal>
            <div className="mt-20 border-t border-white/10 pt-16">
              <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">Under the Hood</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">Architecture</h2>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {product.architecture.map((cell) => (
                  <div key={cell.label} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                    <p className="mono text-xs uppercase tracking-widest text-orange-500">{cell.label}</p>
                    <p className="mt-3 text-sm leading-relaxed text-white/60">{cell.content}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ── Full tech stack ribbon ────────────────────────────────────────── */}
        {product.stack && product.stack.length > 6 && (
          <Reveal>
            <div className="mt-10">
              <p className="mono mb-4 text-xs uppercase tracking-widest text-white/30">Full tech stack</p>
              <div className="flex flex-wrap gap-2">
                {product.stack.map((s) => (
                  <span key={s} className="mono rounded-full border border-white/10 bg-white/[0.02] px-3 py-1 text-[11px] text-white/50">
                    {s}
                  </span>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ── Security ──────────────────────────────────────────────────────── */}
        {product.security && (
          <Reveal>
            <div className="mt-20 border-t border-white/10 pt-16">
              <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">Security</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">Built for production</h2>
              <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {product.security.map((s) => (
                  <div key={s.title} className="rounded-2xl border border-white/10 bg-white/[0.02] p-6">
                    <div className="mb-3 flex h-8 w-8 items-center justify-center rounded-full bg-orange-500/10">
                      <span className="text-orange-500 text-sm">✓</span>
                    </div>
                    <h3 className="font-display text-lg tracking-tight">{s.title}</h3>
                    <p className="mt-2 text-sm leading-relaxed text-white/55">{s.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ── Pricing ───────────────────────────────────────────────────────── */}
        {product.pricing && (
          <Reveal>
            <div className="mt-20 border-t border-white/10 pt-16">
              <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">Pricing</p>
              <h2 className="mt-3 font-display text-3xl tracking-tight sm:text-4xl">Simple, honest pricing</h2>
              {product.pricing.note && (
                <p className="mt-4 max-w-2xl text-white/60">{product.pricing.note}</p>
              )}
              <div className={`mt-10 grid gap-6 ${product.pricing.tiers.length === 2 ? 'sm:grid-cols-2' : 'sm:grid-cols-2 lg:grid-cols-3'}`}>
                {product.pricing.tiers.map((tier) => (
                  <div
                    key={tier.tier}
                    className={`rounded-2xl border p-8 ${
                      tier.featured
                        ? 'border-orange-500/50 bg-orange-500/[0.05]'
                        : 'border-white/10 bg-white/[0.02]'
                    }`}
                  >
                    {tier.featured && (
                      <p className="mono mb-4 text-[10px] uppercase tracking-widest text-orange-500">Most popular</p>
                    )}
                    <h3 className="font-display text-xl tracking-tight">{tier.tier}</h3>
                    <div className="mt-4 flex items-baseline gap-1">
                      <span className="font-display text-4xl tracking-tight">{tier.price}</span>
                      <span className="text-white/40 text-sm">{tier.period}</span>
                    </div>
                    {tier.perUnit && (
                      <p className="mono mt-1 text-[11px] text-white/40">{tier.perUnit}</p>
                    )}
                    <ul className="mt-6 space-y-3">
                      {tier.features.map((feat) => (
                        <li key={feat} className="flex items-start gap-2 text-sm text-white/70">
                          <span className="mt-0.5 shrink-0 text-orange-500">✓</span>
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
                          tier.featured
                            ? 'bg-orange-500 text-black hover:bg-orange-400'
                            : 'border border-white/20 text-white/70 hover:border-orange-500/50 hover:text-orange-500'
                        }`}
                      >
                        Get started <ExternalLink size={12} />
                      </a>
                    )}
                  </div>
                ))}
              </div>
            </div>
          </Reveal>
        )}

        {/* ── CTA ───────────────────────────────────────────────────────────── */}
        <Reveal>
          <div className="mt-20 flex flex-col items-start gap-4 rounded-2xl border border-orange-500/30 bg-orange-500/[0.04] p-10 sm:flex-row sm:items-center sm:justify-between">
            <div>
              <h3 className="font-display text-2xl tracking-tight sm:text-3xl">Want something like this built?</h3>
              <p className="mt-2 max-w-lg text-white/60">
                This is exactly the kind of product I build for clients — scoped, shipped, and built to last.
              </p>
            </div>
            <Magnetic>
              <Link
                to="/contact"
                className="inline-flex items-center gap-2 whitespace-nowrap rounded-full bg-orange-500 px-6 py-3 mono text-xs uppercase tracking-widest text-black hover:bg-orange-400"
              >
                Start a project <ArrowUpRight size={14} />
              </Link>
            </Magnetic>
          </div>
        </Reveal>

      </div>
    </div>
  );
}
