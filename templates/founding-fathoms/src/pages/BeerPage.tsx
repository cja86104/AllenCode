import { Link } from 'react-router';
import { usePageTitle, useBrewery } from '../app/BreweryContext';
import { Reveal } from '../components/Reveal';
import { Eyebrow, PageHeading } from '../components/ui';
import { averageAbv, beerToGo, draftGroups, onTap, price } from '../lib/content';

/** The full draft list by style, the four-packs to go, and a word on freshness. */
export function BeerPage() {
  const brewery = useBrewery();
  const { beer } = brewery;
  usePageTitle('Beer');
  const packs = beerToGo(brewery);
  const pouring = onTap(brewery);

  return (
    <>
      <div className="mx-auto max-w-7xl px-4 pb-16 pt-16 md:px-6 md:pt-20">
        <PageHeading eyebrow="The board" title="Beer">
          <p>{beer.intro}</p>
        </PageHeading>

        <div className="space-y-14">
          {draftGroups(brewery).map(({ group, beers }, index) => (
            <Reveal key={group}>
              <section aria-labelledby={`beer-group-${index}`}>
                <div className="mb-4 flex items-baseline justify-between border-b border-brass/40 pb-2">
                  <h2 id={`beer-group-${index}`} className="font-display text-4xl tracking-wide text-cream">
                    {group}
                  </h2>
                  <p className="text-xs uppercase tracking-[0.2em] text-mist">{beers.length} on the list</p>
                </div>
                <ul className="grid gap-x-10 md:grid-cols-2">
                  {beers.map((item) => (
                    <li key={item.id} className="flex items-baseline gap-3 border-b border-cream/10 py-3">
                      <div className="min-w-0 flex-1">
                        <h3 className="font-display text-xl tracking-wide text-cream">
                          {item.name}
                          {item.onTap ? (
                            <span className="ml-2 align-middle font-sans text-[11px] font-semibold uppercase tracking-[0.15em] text-brass">
                              On tap
                            </span>
                          ) : null}
                        </h3>
                        <p className="mt-0.5 text-sm text-mist">
                          {item.style} · {item.note}
                        </p>
                      </div>
                      <p className="shrink-0 text-right font-display tracking-wide">
                        <span className="text-lg text-brass">
                          {item.abv}%<span className="sr-only"> ABV</span>
                        </span>
                        <span className="ml-2 text-sm text-mist">IBU {item.ibu}</span>
                      </p>
                    </li>
                  ))}
                </ul>
              </section>
            </Reveal>
          ))}
        </div>
      </div>

      <div aria-hidden="true" className="diagonal-divider bg-navy" />
      <section aria-labelledby="to-go-title" className="bg-cream py-16 text-navy md:py-20">
        <div className="mx-auto max-w-7xl px-4 md:px-6">
          <div className="mb-10 gap-6 md:flex md:items-end md:justify-between">
            <div>
              <Eyebrow ground="light">{beer.releases.eyebrow}</Eyebrow>
              <h2 id="to-go-title" className="font-display text-5xl tracking-wide">
                {beer.releases.heading}
              </h2>
            </div>
            <p className="mt-3 max-w-sm text-sm text-slate md:mt-0 md:text-right">{beer.releases.note}</p>
          </div>

          <ul className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
            {packs.map((pack) => (
              <li key={pack.id} className="clip-card flex flex-col border-2 border-navy/10 bg-cream-deep p-5">
                <p
                  className={`mb-3 w-fit px-2 py-1 text-[11px] font-bold uppercase tracking-wider ${
                    pack.limited ? 'bg-navy text-brass' : 'bg-brass text-navy'
                  }`}
                >
                  {pack.limited ? 'Limited · Can Club first' : 'In the cold box'}
                </p>
                <h3 className="font-display text-2xl tracking-wide">{pack.name}</h3>
                {pack.pack ? <p className="mt-1 text-sm text-slate">{pack.pack}</p> : null}
                <p className="mt-2 flex-1 text-sm text-slate">{pack.description}</p>
                <p className="mt-5 font-display text-3xl text-brass-ink">{price(pack.price)}</p>
              </li>
            ))}
          </ul>
          <p className="mt-10">
            <Link
              to="/shop"
              className="clip-btn inline-flex min-h-[2.75rem] items-center bg-navy px-6 py-3 text-sm font-bold uppercase tracking-wider text-cream transition-colors hover:bg-panel"
            >
              Order for pickup
            </Link>
          </p>
        </div>
      </section>
      <div aria-hidden="true" className="diagonal-divider diagonal-divider--to-navy bg-cream" />

      <section aria-labelledby="freshness-title" className="mx-auto max-w-7xl px-4 py-16 md:px-6">
        <div className="gap-8 border border-brass/30 bg-panel p-8 md:flex md:items-center md:justify-between md:p-12">
          <div className="max-w-lg">
            <h2 id="freshness-title" className="mb-3 font-display text-4xl tracking-wide">
              {beer.freshness.heading}
            </h2>
            <p className="text-sm leading-relaxed text-mist">{beer.freshness.body}</p>
          </div>
          <div className="mt-8 -rotate-2 border-2 border-brass bg-navy px-8 py-6 text-center shadow-2xl md:mt-0">
            <p className="text-[11px] uppercase tracking-[0.3em] text-mist">Average strength on draft</p>
            <p className="font-display text-7xl leading-none text-brass">
              {averageAbv(pouring)}%<span className="sr-only"> ABV</span>
            </p>
            <p className="mt-1 text-sm text-mist">across the {pouring.length} beers on tap</p>
          </div>
        </div>
      </section>
    </>
  );
}
