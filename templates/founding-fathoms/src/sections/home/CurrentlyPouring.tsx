import { useBrewery } from '../../app/BreweryContext';
import { Reveal } from '../../components/Reveal';
import { Eyebrow } from '../../components/ui';
import { onTap } from '../../lib/content';

/** The live board: every beer on draft as a card in a strip that scrolls sideways. */
export function CurrentlyPouring() {
  const brewery = useBrewery();
  const { pouring } = brewery.home;
  const beers = onTap(brewery);
  return (
    <section aria-labelledby="pouring-title" className="border-t border-cream/5 bg-navy py-16 md:py-20">
      <div className="mx-auto mb-8 flex max-w-7xl flex-col justify-between gap-4 px-4 sm:flex-row sm:items-end md:px-6">
        <Reveal>
          <Eyebrow>{pouring.eyebrow}</Eyebrow>
          <h2 id="pouring-title" className="font-display text-5xl tracking-wide text-cream">
            {pouring.heading}
          </h2>
        </Reveal>
        <p className="max-w-xs text-sm text-mist sm:text-right">
          {beers.length} on draft. {pouring.note}
        </p>
      </div>

      {/* Focusable, so the strip can be scrolled from the keyboard. */}
      <div role="region" aria-label="Beers on draft" tabIndex={0} className="tap-scroll relative overflow-x-auto px-4 pb-4 md:px-6">
        <ul className="flex snap-x gap-4">
          {beers.map((beer) => (
            <li key={beer.id} className="w-[260px] shrink-0 snap-start">
              <article className="clip-card h-full border border-cream/15 bg-panel p-5 transition-colors hover:border-brass/60">
                <p className="mb-3 flex items-start justify-between gap-2">
                  <span className="text-[11px] uppercase tracking-[0.2em] text-brass">{beer.style}</span>
                  <span className="font-display text-2xl leading-none text-brass">
                    {beer.abv}%<span className="sr-only"> ABV</span>
                  </span>
                </p>
                <h3 className="mb-2 font-display text-2xl tracking-wide text-cream">{beer.name}</h3>
                <p className="text-sm leading-relaxed text-mist">{beer.note}</p>
                <p className="mt-4 border-t border-cream/10 pt-3 text-[11px] uppercase tracking-wider text-mist">
                  IBU {beer.ibu} · {beer.group}
                </p>
              </article>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
