import { useState, useMemo } from 'react';
import { ShoppingBag, Filter } from 'lucide-react';
import { templates, templateCategories } from '../data/templates';
import Reveal from '../components/Reveal';
import Magnetic from '../components/Magnetic';
import CheckoutModal from '../components/CheckoutModal';
import usePageMeta from '../hooks/usePageMeta';

export default function Templates() {
  usePageMeta(
    'Templates — Allen Code Co.',
    'Premium Next.js + Tailwind templates for SaaS landing pages, dev portfolios, dashboards, and agency sites. Buy once, deploy today.'
  );
  const [activeCategory, setActiveCategory] = useState('All');
  const [checkoutItem, setCheckoutItem] = useState(null);

  const filtered = useMemo(
    () => (activeCategory === 'All' ? templates : templates.filter((t) => t.category === activeCategory)),
    [activeCategory]
  );

  function buyTemplate(template) {
    setCheckoutItem({
      mode: 'template',
      title: template.name,
      description: `Full source code, license, and lifetime updates for ${template.name}.`,
      price: template.price,
    });
  }

  return (
    <div className="px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">The Store</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">
            Premium templates. Buy once, ship today.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/60">
            Every template is built the same way I build client work — Next.js, Tailwind, and production-grade
            structure. No bloated theme options, just clean code you actually own.
          </p>
        </Reveal>

        <Reveal delay={0.05}>
          <div className="mt-10 flex flex-wrap items-center gap-2">
            <span className="mono mr-2 inline-flex items-center gap-1 text-[11px] uppercase tracking-widest text-white/40">
              <Filter size={13} /> Filter
            </span>
            {['All', ...templateCategories].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`mono rounded-full border px-4 py-2 text-[11px] uppercase tracking-widest transition-colors ${
                  activeCategory === cat
                    ? 'border-orange-500 bg-orange-500 text-black'
                    : 'border-white/15 text-white/60 hover:border-orange-500/50 hover:text-white'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </Reveal>

        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <Reveal key={t.id} delay={i * 0.05}>
              <div className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-orange-500/50">
                <div className="aspect-[16/10] overflow-hidden border-b border-white/10 bg-black">
                  <img
                    data-aiwp-slot={t.slot}
                    src={t.image}
                    alt={`${t.name} preview`}
                    className="h-full w-full object-cover opacity-80 transition-transform duration-700 group-hover:scale-105 group-hover:opacity-100"
                  />
                </div>
                <div className="flex flex-1 flex-col p-6">
                  <p className="mono text-[10px] uppercase tracking-[0.25em] text-orange-500">{t.category}</p>
                  <h3 className="mt-2 font-display text-xl tracking-tight">{t.name}</h3>
                  <div className="mt-3 flex flex-wrap gap-1.5">
                    {t.tags.map((tag) => (
                      <span key={tag} className="mono rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] text-white/50">
                        {tag}
                      </span>
                    ))}
                  </div>
                  <div className="mt-6 flex items-center justify-between">
                    <span className="font-display text-2xl text-orange-500">${t.price}</span>
                    <Magnetic>
                      <button
                        onClick={() => buyTemplate(t)}
                        className="inline-flex items-center gap-2 rounded-full bg-orange-500 px-4 py-2 mono text-[11px] uppercase tracking-widest text-black hover:bg-orange-400"
                      >
                        <ShoppingBag size={13} /> Buy now
                      </button>
                    </Magnetic>
                  </div>
                </div>
              </div>
            </Reveal>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-16 text-center text-white/40">No templates in this category yet — check back soon.</p>
        )}
      </div>

      <CheckoutModal item={checkoutItem} onClose={() => setCheckoutItem(null)} />
    </div>
  );
}