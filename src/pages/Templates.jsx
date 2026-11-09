import { useState, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight, Filter } from 'lucide-react';
import { templates, templateCategories } from '../data/templates';
import Reveal from '../components/Reveal';
import MediaLoop from '../components/MediaLoop';
import usePageMeta from '../hooks/usePageMeta';

function TemplateCard({ template }) {
  // The loop plays while the card is hovered or focused; touch screens show the poster.
  const [active, setActive] = useState(false);
  const title = template.name.split(' — ')[0];

  return (
    <div
      data-template={template.id}
      onMouseEnter={() => setActive(true)}
      onMouseLeave={() => setActive(false)}
      onFocus={() => setActive(true)}
      onBlur={() => setActive(false)}
      className="group flex h-full flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/[0.02] transition-colors hover:border-orange-500/50"
    >
      <MediaLoop
        src={template.previewVideo}
        poster={template.poster}
        alt={`${title}, a concept preview of the ${template.category.toLowerCase()} template`}
        active={active}
        className="aspect-[16/10] border-b border-white/10 bg-black"
      />
      <div className="flex flex-1 flex-col p-6">
        <p className="mono text-[10px] uppercase tracking-[0.25em] text-orange-500">{template.category}</p>
        <h3 className="mt-2 font-display text-xl tracking-tight">{template.name}</h3>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {template.tags.map((tag) => (
            <span key={tag} className="mono rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] text-white/50">
              {tag}
            </span>
          ))}
        </div>
        {template.status === 'concept' && (
          <p className="mono mt-5 text-[10px] uppercase tracking-[0.2em] text-white/45">Concept preview, coming soon</p>
        )}
        <div className="mt-auto pt-6">
          <Link
            to={`/contact?template=${template.id}`}
            className="mono inline-flex items-center gap-2 rounded-full border border-orange-500/60 px-4 py-2 text-[11px] uppercase tracking-widest text-orange-500 hover:bg-orange-500 hover:text-black"
          >
            Ask about this template <ArrowUpRight size={13} />
          </Link>
        </div>
      </div>
    </div>
  );
}

export default function Templates() {
  usePageMeta(
    'Templates — Allen Code Co.',
    'Website templates for products, portfolios, families and events. Pick a starting point and I build it out with your words, photos and dates.'
  );
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(
    () => (activeCategory === 'All' ? templates : templates.filter((t) => t.category === activeCategory)),
    [activeCategory]
  );

  return (
    <div className="px-6 py-20 lg:px-10 lg:py-28">
      <div className="mx-auto max-w-7xl">
        <Reveal>
          <p className="mono text-xs uppercase tracking-[0.3em] text-orange-500">Templates</p>
          <h1 className="mt-4 max-w-3xl font-display text-5xl leading-[0.95] tracking-tight sm:text-7xl">
            Start from a design. I&apos;ll make it yours.
          </h1>
          <p className="mt-6 max-w-2xl text-lg text-white/60">
            Pick a starting point and I&apos;ll build it out with your words, your photos and your dates. Every
            template here is a concept preview: ask about one and we&apos;ll start your project from it.
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
              <TemplateCard template={t} />
            </Reveal>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-16 text-center text-white/40">No templates in this category yet — check back soon.</p>
        )}
      </div>
    </div>
  );
}
