// @ts-check
import { useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowUpRight } from 'lucide-react';
import { templates, templateCategories } from '../data/templates.js';
import Reveal from '../components/Reveal';
import MediaLoop from '../components/MediaLoop.jsx';
import PageHeader, { DISPLAY, PANEL_HOVER } from '../components/PageHeader.jsx';
import usePageMeta from '../hooks/usePageMeta.js';

/**
 * One template as a file: its loop plays on its own whenever the card is on screen (Chris,
 * 2026-11-09: constant, not only on hover), with the poster for reduced motion. No price and no buy
 * button; every template leads to the brief.
 *
 * @param {{ template: (typeof templates)[number] }} props
 */
function TemplateCard({ template }) {
  const title = template.name.split(' — ')[0];
  return (
    <article data-template={template.id} className={`group flex h-full flex-col overflow-hidden ${PANEL_HOVER}`}>
      <p aria-hidden="true" className="mono flex items-center justify-between border-b border-white/10 px-5 py-2.5 text-[11px] tracking-widest text-white/55">
        <span>{template.id}.html</span>
        <span className="h-1.5 w-1.5 rounded-full bg-white/25 transition-colors group-hover:bg-ember" />
      </p>
      <MediaLoop
        src={template.previewVideo}
        poster={template.poster}
        alt={`${title}, a concept preview of the ${template.category.toLowerCase()} template`}
        className="aspect-[16/10] border-b border-white/10 bg-black"
      />
      <div className="flex flex-1 flex-col p-6">
        <p className="mono text-[10px] uppercase tracking-[0.25em] text-ember">{template.category}</p>
        <h2 className={`${DISPLAY} mt-2 text-2xl`}>{template.name}</h2>
        <div className="mt-3 flex flex-wrap gap-1.5">
          {template.tags.map((tag) => (
            <span key={tag} className="mono rounded-full border border-white/10 px-2.5 py-0.5 text-[10px] text-white/55">
              {tag}
            </span>
          ))}
        </div>
        {template.status === 'concept' && (
          <p className="mono mt-5 text-[10px] uppercase tracking-[0.2em] text-white/50">Concept preview, coming soon</p>
        )}
        <div className="mt-auto pt-6">
          <Link
            to={`/contact?template=${template.id}`}
            viewTransition
            className="mono inline-flex items-center gap-2 rounded-full border border-ember/60 px-4 py-2 text-[11px] uppercase tracking-widest text-ember transition-colors hover:bg-ember hover:text-night"
          >
            Ask about this template <ArrowUpRight size={13} aria-hidden="true" />
          </Link>
        </div>
      </div>
    </article>
  );
}

export default function Templates() {
  usePageMeta(
    'Templates — Allen Code Co.',
    'Website templates for products, portfolios, families and events. Pick a starting point and I build it out with your words, photos and dates.',
  );
  const [activeCategory, setActiveCategory] = useState('All');

  const filtered = useMemo(
    () => (activeCategory === 'All' ? templates : templates.filter((t) => t.category === activeCategory)),
    [activeCategory],
  );

  return (
    <div className="px-6 pb-24 lg:px-10">
      <div className="mx-auto max-w-7xl">
        <PageHeader
          path="templates"
          eyebrow="Templates"
          title="Start from a design. I'll make it yours."
          lede="Pick a starting point and I'll build it out with your words, your photos and your dates. Every template here is a concept preview: ask about one and we'll start your project from it."
        />

        <div role="group" aria-label="Filter templates" className="flex flex-wrap items-center gap-2">
          {['All', ...templateCategories].map((cat) => (
            <button
              key={cat}
              type="button"
              aria-pressed={activeCategory === cat}
              onClick={() => setActiveCategory(cat)}
              className={`mono rounded-full border px-4 py-2 text-[11px] uppercase tracking-widest transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-ember ${
                activeCategory === cat
                  ? 'border-ember bg-ember text-night'
                  : 'border-white/15 bg-night/80 text-white/65 hover:border-ember/50 hover:text-white'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {filtered.map((t, i) => (
            <Reveal key={t.id} delay={(i % 3) * 0.05} instant={i < 3}>
              <TemplateCard template={t} />
            </Reveal>
          ))}
        </div>

        {filtered.length === 0 && (
          <p className="mt-16 text-center text-white/50">No templates in this category yet — check back soon.</p>
        )}
      </div>
    </div>
  );
}
